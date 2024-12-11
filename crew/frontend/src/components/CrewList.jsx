import React from 'react';
import { List, Card, Button, Tag } from 'antd';

const CrewList = ({ crews, onChangeShiftClick, onSwapBusClick }) => {
  return (
    <List
      grid={{ gutter: 16, column: 3 }}
      dataSource={crews}
      renderItem={(crew) => (
        <List.Item>
          <Card title={crew.name} bordered={true}>
            <p><strong>Shift:</strong> <Tag color="blue">{crew.shift}</Tag></p>
            <p><strong>Status:</strong> 
              <Tag color={crew.status === 'assigned' ? 'green' : crew.status === 'resting' ? 'orange' : 'blue'}>
                {crew.status}
              </Tag>
            </p>
            <p><strong>Assigned Bus:</strong> {crew.assignedBus ? crew.assignedBus.vehicle_id : 'Not Assigned'}</p>
            <p><strong>Rest Until:</strong> {crew.restUntil ? new Date(crew.restUntil).toLocaleString() : 'N/A'}</p>

            <Button 
              type="primary" 
              onClick={() => onChangeShiftClick(crew)} 
              style={{ marginRight: 8 }}
            >
              Change Shift
            </Button>

            <Button 
              type="default" 
              onClick={() => onSwapBusClick(crew)} 
            >
              Swap Bus
            </Button>
          </Card>
        </List.Item>
      )}
    />
  );
};

export default CrewList;
