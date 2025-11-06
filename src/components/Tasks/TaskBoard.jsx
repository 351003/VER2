import React from 'react';
import { Row, Col, Card, Empty } from 'antd';
import {
  DndContext,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  defaultDropAnimation,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import TaskCard from './TaskCard';

const dropAnimation = {
  ...defaultDropAnimation,
  dragSourceOpacity: 0.5,
};

const SortableTask = ({ task, onEdit, onDelete }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: task.id,
    data: {
      type: 'task',
      task,
    }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: isDragging ? 'grabbing' : 'grab',
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...attributes} 
      {...listeners}
    >
      <TaskCard
        task={task}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    </div>
  );
};

const TaskColumn = ({ 
  id, 
  title, 
  color, 
  tasks, 
  onEditTask, 
  onDeleteTask 
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isOver,
  } = useSortable({
    id: id,
    data: {
      type: 'column',
      column: { id, title }
    }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    border: isOver ? `2px dashed ${color}` : `2px solid ${color}20`,
    backgroundColor: isOver ? `${color}10` : '#fafafa',
  };

  return (
    <Col xs={24} sm={12} lg={6}>
      <div ref={setNodeRef} style={style}>
        <Card 
          size="small"
          title={
            <div 
              style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
              {...attributes}
              {...listeners}
            >
              <div 
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  backgroundColor: color,
                  marginRight: 8
                }}
              />
              <span>{title}</span>
              <span style={{ 
                marginLeft: 8, 
                backgroundColor: '#f0f0f0',
                borderRadius: '10px',
                padding: '2px 8px',
                fontSize: '12px'
              }}>
                {tasks.length}
              </span>
            </div>
          }
          style={{ 
            height: '100%',
            border: 'none',
          }}
          bodyStyle={{ 
            padding: '12px',
            minHeight: '400px',
            borderRadius: '0 0 8px 8px'
          }}
        >
          <SortableContext 
            items={tasks.map(t => t.id)} 
            strategy={verticalListSortingStrategy}
          >
            <div style={{ minHeight: '200px' }}>
              {tasks.length === 0 ? (
                <div 
                  style={{ 
                    height: '100px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    border: isOver ? '2px dashed #d9d9d9' : 'none',
                    borderRadius: '6px',
                    backgroundColor: isOver ? '#f0f8ff' : 'transparent'
                  }}
                >
                  <Empty 
                    image={Empty.PRESENTED_IMAGE_SIMPLE} 
                    description="Thả công việc vào đây"
                  />
                </div>
              ) : (
                tasks.map((task) => (
                  <SortableTask
                    key={task.id}
                    task={task}
                    onEdit={onEditTask}
                    onDelete={onDeleteTask}
                  />
                ))
              )}
            </div>
          </SortableContext>
        </Card>
      </div>
    </Col>
  );
};

const TaskBoard = ({ tasks, onEditTask, onDeleteTask, onTaskMove }) => {
  const [activeTask, setActiveTask] = React.useState(null);
  const [activeColumn, setActiveColumn] = React.useState(null);

  const columns = [
    {
      id: 'backlog',
      title: 'Tồn Đọng',
      color: '#faad14',
      tasks: tasks.filter(task => task.status === 'backlog')
    },
    {
      id: 'todo',
      title: 'Chưa Bắt Đầu',
      color: '#d9d9d9',
      tasks: tasks.filter(task => task.status === 'todo')
    },
    {
      id: 'in-progress',
      title: 'Đang Thực Hiện',
      color: '#1890ff',
      tasks: tasks.filter(task => task.status === 'in-progress')
    },
    {
      id: 'done',
      title: 'Hoàn Thành',
      color: '#52c41a',
      tasks: tasks.filter(task => task.status === 'done')
    }
  ];

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor)
  );

  const handleDragStart = (event) => {
    const { active } = event;
    const task = tasks.find(t => t.id === active.id);
    
    if (task) {
      setActiveTask(task);
    }
  };

  const handleDragOver = (event) => {
    const { active, over } = event;
    
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    // Find if over is a column
    const overColumn = columns.find(col => col.id === overId);
    if (overColumn) {
      setActiveColumn(overColumn.id);
    }
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    
    setActiveTask(null);
    setActiveColumn(null);

    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    // Find the active task
    const activeTask = tasks.find(task => task.id === activeId);
    if (!activeTask) return;

    let targetStatus = null;

    // Case 1: Dropping over another task
    const overTask = tasks.find(task => task.id === overId);
    if (overTask) {
      targetStatus = overTask.status;
    }
    
    // Case 2: Dropping over a column
    const overColumn = columns.find(col => col.id === overId);
    if (overColumn) {
      targetStatus = overColumn.id;
    }

    // Case 3: Dropping over empty space in a column (using activeColumn from drag over)
    if (!targetStatus && activeColumn) {
      targetStatus = activeColumn;
    }

    if (!targetStatus) return;

    // Only update if status changed
    if (activeTask.status !== targetStatus) {
      onTaskMove(activeId, targetStatus);
    }
  };

  const handleDragCancel = () => {
    setActiveTask(null);
    setActiveColumn(null);
  };

  // Get all task IDs for SortableContext
  const allTaskIds = columns.flatMap(col => col.tasks.map(task => task.id));

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <SortableContext items={allTaskIds}>
          <Row gutter={[16, 16]}>
            {columns.map(column => (
              <TaskColumn
                key={column.id}
                id={column.id}
                title={column.title}
                color={column.color}
                tasks={column.tasks}
                onEditTask={onEditTask}
                onDeleteTask={onDeleteTask}
              />
            ))}
          </Row>
        </SortableContext>

        <DragOverlay dropAnimation={dropAnimation}>
          {activeTask ? (
            <div style={{
              transform: 'rotate(5deg)',
              opacity: 0.8,
              cursor: 'grabbing',
            }}>
              <TaskCard
                task={activeTask}
                onEdit={onEditTask}
                onDelete={onDeleteTask}
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </>
  );
};

export default TaskBoard;