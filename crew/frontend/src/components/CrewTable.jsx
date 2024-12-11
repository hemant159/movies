import React from 'react';
import { Table, Button } from 'antd';

const CrewTable = ({ crews, onChangeShiftClick, onSwapBusClick }) => {
  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Shift',
      dataIndex: 'shift',
      key: 'shift',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
    },
    {
      title: 'Assigned Bus',
      dataIndex: 'assignedBus',
      key: 'assignedBus',
      render: (bus) => (bus ? bus.vehicle_id : 'Not Assigned'),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <>
          <Button 
            type="primary" 
            onClick={() => onChangeShiftClick(record)}
          >
            Change Shift
          </Button>
          <Button 
            type="default" 
            style={{ marginLeft: '10px' }} 
            onClick={() => onSwapBusClick(record)}
          >
            Swap Bus
          </Button>
        </>
      ),
    },
  ];

  return (
    <div className="table-container">
      <Table 
        dataSource={crews} 
        columns={columns} 
        rowKey="_id" 
        pagination={{ pageSize: 20 }} 
        scroll={{ y: 'calc(100vh - 200px)' }} 
      />
    </div>
  );
};

export default CrewTable;
