import React from 'react';
import { Card, Statistic } from 'antd';

const StatCard = ({ title, value, icon, color, change }) => {
  return (
    <Card>
      <Statistic
        title={title}
        value={value}
        prefix={icon}
        valueStyle={{ color }}
        suffix={change && (
          <span style={{ 
            fontSize: 14, 
            color: change.startsWith('+') ? '#52c41a' : '#f5222d' 
          }}>
            {change}
          </span>
        )}
      />
    </Card>
  );
};

export default StatCard;