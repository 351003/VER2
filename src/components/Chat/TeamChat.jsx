import React, { useState, useRef, useEffect, useCallback } from "react";
import { Card, Input, Button, Avatar, List, Space, Typography, Divider, Tooltip, message as antdMsg } from "antd";
import { SendOutlined, UserOutlined, PaperClipOutlined, SmileOutlined } from "@ant-design/icons";
import io from "socket.io-client";

const { TextArea } = Input;
const { Text } = Typography;

const API_BASE = "http://localhost:3370"; // ✅ backend port
const SOCKET_URL = "http://localhost:3370"; // ✅ socket chạy cùng backend
const STORAGE_TOKEN_KEY = "tokenLogin"; // ✅ token bạn đang dùng

const TeamChat = ({ team, currentUser, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const [typingUsers, setTypingUsers] = useState([]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // ✅ Load history từ backend (v1)
  const fetchMessages = useCallback(async () => {
    try {
      const token = localStorage.getItem(STORAGE_TOKEN_KEY) || sessionStorage.getItem(STORAGE_TOKEN_KEY);
      if (!token) return; // chưa login thì thôi

      // Bạn cần backend có endpoint trả JSON. Ví dụ:
      // GET /api/v1/chat/history?teamId=...
      const res = await fetch(`${API_BASE}/api/v1/chat/history?teamId=${team.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || `Fetch messages failed ${res.status}`);
      }

      const data = await res.json();

      // data = { success: true, data: [...] }
      const formatted = (data?.data || []).map((chat) => ({
        id: chat._id,
        content: chat.content,
        sender: {
          id: chat.user_id,
          name: chat.fullName || chat.infoUser?.fullName || "Unknown",
          avatar: null,
        },
        timestamp: chat.createdAt || new Date().toISOString(),
        type: "text",
        images: chat.images || [],
      }));

      setMessages(formatted);
    } catch (err) {
      console.error("Error fetching messages:", err);
    }
  }, [team.id]);

  useEffect(() => {
    const token = localStorage.getItem(STORAGE_TOKEN_KEY) || sessionStorage.getItem(STORAGE_TOKEN_KEY);
    if (!token || !currentUser?.id) return;
    const s = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      auth: { token },
      query: { userId: currentUser.id, teamId: team.id },
    });

    socketRef.current = s;

    s.on("connect", () => {
      console.log("✅ Socket connected:", s.id);
      // nếu backend có room theo team:
      s.emit("JOIN_ROOM", { roomId: `team_${team.id}` });
    });

    s.on("connect_error", (err) => {
      console.error("❌ Socket connect_error:", err.message);
      antdMsg.error(err.message || "Socket connect failed");
    });
    s.on("SERVER_RETURN_MESSAGE", (data) => {
      console.log("📥 SERVER_RETURN_MESSAGE:", data);

      setMessages((prev) => {
        // nếu server trả tempId → thay message tạm bằng message thật
        if (data?.tempId) {
          const idx = prev.findIndex((m) => m._tempId === data.tempId);
          if (idx !== -1) {
            const copy = [...prev];
            copy[idx] = {
              id: data._id || Date.now(),
              content: data.content,
              sender: { id: data.userId, name: data.fullName, avatar: null },
              timestamp: data.createdAt || new Date().toISOString(),
              type: "text",
              images: data.images || [],
            };
            return copy;
          }
        }

        // fallback add new
        return [
          ...prev,
          {
            id: data._id || Date.now(),
            content: data.content,
            sender: { id: data.userId, name: data.fullName, avatar: null },
            timestamp: data.createdAt || new Date().toISOString(),
            type: "text",
            images: data.images || [],
          },
        ];
      });
    });


    // typing
    s.on("SERVER_RETURN_TYPING", (data) => {
      // data: { userId, fullName, type }
      if (!data?.userId || String(data.userId) === String(currentUser.id)) return;

      if (data.type === "typing") {
        setTypingUsers((prev) => {
          const exists = prev.some((u) => String(u.userId) === String(data.userId));
          if (exists) return prev;
          return [...prev, { userId: data.userId, fullName: data.fullName }];
        });

        // auto remove after 3s
        setTimeout(() => {
          setTypingUsers((prev) => prev.filter((u) => String(u.userId) !== String(data.userId)));
        }, 3000);
      } else {
        setTypingUsers((prev) => prev.filter((u) => String(u.userId) !== String(data.userId)));
      }
    });

    // load lịch sử khi mở chat
    fetchMessages();

    return () => {
      try {
        s.emit("LEAVE_ROOM", { roomId: `team_${team.id}` });
      } catch { }
      s.disconnect();
      socketRef.current = null;
    };
  }, [team.id, currentUser?.id, fetchMessages]);

  const handleSendMessage = () => {
    const s = socketRef.current;
    const text = newMessage.trim();

    console.log("📤 SEND:", { text, connected: s?.connected, socketId: s?.id });

    if (!text || !s?.connected) return;

    // ✅ 1) Optimistic: hiện ngay trên UI
    const tempId = `temp_${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      {
        id: tempId,
        content: text,
        sender: {
          id: currentUser.id || currentUser._id,
          name: currentUser.fullName || currentUser.email || "Me",
          avatar: currentUser.avatar || null,
        },
        timestamp: new Date().toISOString(),
        type: "text",
        images: [],
        _tempId: tempId,
      },
    ]);

    // ✅ 2) emit lên server kèm tempId để dedupe
    s.emit("CLIENT_SEND_MESSAGE", {
      content: text,
      images: [],
      teamId: team.id, // phải là ObjectId string
      room_chat_id: team.id,
      roomId: `team_${team.id}`,
      tempId,
    });

    setNewMessage("");
  };

  const isComposingRef = useRef(false);
  const handlePressEnter = (e) => {
    // Nếu đang gõ tiếng Việt (IME) thì bỏ qua
    if (isComposingRef.current) return;

    // Shift+Enter thì xuống dòng
    if (e.shiftKey) return;

    e.preventDefault();
    handleSendMessage();
  };

  // typing handler (debounce)
  const handleTyping = (e) => {
    const value = e.target.value;
    setNewMessage(value);

    const s = socketRef.current;
    if (!s?.connected) return;

    s.emit("CLIENT_SEND_TYPING", "typing"); // ✅ backend của bạn đang nhận (type) là string

    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      s.emit("CLIENT_SEND_TYPING", "stop");
    }, 1200);
  };

  const handleAttachment = (e) => {
    const s = socketRef.current;
    if (!s?.connected) return;

    const files = Array.from(e.target.files || []);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const buffer = event.target.result;
        s.emit("CLIENT_SEND_MESSAGE", {
          content: "",
          images: [buffer],
          room_chat_id: team.id,
          teamId: team.id,
        });
      };
      reader.readAsArrayBuffer(file);
    });

    e.target.value = "";
  };

  const formatTime = (ts) =>
    new Date(ts).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });

  const renderMessageContent = (message) => (
    <div>
      {message.content && (
        <div style={{ marginBottom: message.images?.length ? 8 : 0 }}>{message.content}</div>
      )}
      {message.images?.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {message.images.map((img, index) => (
            <img
              key={index}
              src={img}
              alt={`attachment-${index}`}
              style={{ maxWidth: 200, maxHeight: 200, borderRadius: 8 }}
            />
          ))}
        </div>
      )}
    </div>
  );

  return (
    <Card
      title={
        <Space>
          <Avatar size="small" src={team.avatar} icon={<UserOutlined />} />
          <span>{team.name} - Team Chat</span>
          {typingUsers.length > 0 && (
            <Text type="secondary" style={{ fontSize: 12, marginLeft: 10 }}>
              {typingUsers.map((u) => u.fullName).join(", ")} đang nhập...
            </Text>
          )}
        </Space>
      }
      extra={
        <Button type="text" onClick={onClose}>
          Đóng
        </Button>
      }
      style={{ height: 600, display: "flex", flexDirection: "column" }}
      bodyStyle={{ flex: 1, display: "flex", flexDirection: "column", padding: 0 }}
    >
      <div style={{ flex: 1, overflowY: "auto", padding: 16 }}>
        <List
          dataSource={messages}
          renderItem={(m) => (
            <List.Item style={{ border: "none", padding: "8px 0" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  flexDirection: String(m.sender.id) === String(currentUser.id) ? "row-reverse" : "row",
                  width: "100%",
                }}
              >
                <Avatar
                  size="small"
                  src={m.sender.avatar}
                  icon={<UserOutlined />}
                  style={{
                    margin: String(m.sender.id) === String(currentUser.id) ? "0 0 0 8px" : "0 8px 0 0",
                  }}
                />
                <div
                  style={{
                    maxWidth: "70%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: String(m.sender.id) === String(currentUser.id) ? "flex-end" : "flex-start",
                  }}
                >
                  <div
                    style={{
                      background: String(m.sender.id) === String(currentUser.id) ? "#1890ff" : "#f0f0f0",
                      color: String(m.sender.id) === String(currentUser.id) ? "white" : "black",
                      padding: "8px 12px",
                      borderRadius: 12,
                      wordWrap: "break-word",
                    }}
                  >
                    {renderMessageContent(m)}
                  </div>
                  <Text type="secondary" style={{ fontSize: 11, marginTop: 4 }}>
                    {m.sender.name} • {formatTime(m.timestamp)}
                  </Text>
                </div>
              </div>
            </List.Item>
          )}
        />
        <div ref={messagesEndRef} />
      </div>

      <Divider style={{ margin: 0 }} />

      <div style={{ padding: 16 }}>
        <Space.Compact style={{ width: "100%" }}>
          <TextArea
            value={newMessage}
            onChange={handleTyping}
            placeholder="Nhập tin nhắn..."
            autoSize={{ minRows: 1, maxRows: 4 }}
            style={{ resize: "none" }}
            onPressEnter={handlePressEnter}
            onCompositionStart={() => (isComposingRef.current = true)}
            onCompositionEnd={() => (isComposingRef.current = false)}
          />
          <Tooltip title="Gửi tin nhắn">
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
            />
          </Tooltip>
        </Space.Compact>

        <div style={{ marginTop: 8, display: "flex", justifyContent: "space-between" }}>
          <Space size="small">
            <input type="file" id="file-upload" multiple style={{ display: "none" }} onChange={handleAttachment} />
            <Button type="text" icon={<PaperClipOutlined />} size="small" onClick={() => document.getElementById("file-upload")?.click()}>
              Đính kèm
            </Button>
            <Button type="text" icon={<SmileOutlined />} size="small">
              Emoji
            </Button>
          </Space>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Enter để gửi, Shift + Enter để xuống dòng
          </Text>
        </div>
      </div>
    </Card>
  );
};

export default TeamChat;
