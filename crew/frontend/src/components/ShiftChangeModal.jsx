import React, { useState } from 'react';
import { Modal, Select, message } from 'antd';
import { changeCrewShift } from '../services/api';

const { Option } = Select;

const ShiftChangeModal = ({ visible, crew, onClose, refreshList }) => {
  const [newShift, setNewShift] = useState(null);

  const handleOk = async () => {
    try {
      await changeCrewShift(crew._id, newShift);
      message.success('Shift changed successfully!');
      refreshList();
      onClose();
    } catch (error) {
      message.error('Error changing shift');
    }
  };

  return (
    <Modal 
      title="Change Shift" 
      visible={visible} 
      onOk={handleOk} 
      onCancel={onClose}
    >
      <Select 
        style={{ width: '100%' }} 
        onChange={(value) => setNewShift(value)} 
        defaultValue={crew?.shift}
      >
        <Option value="morning">Morning</Option>
        <Option value="afternoon">Afternoon</Option>
        <Option value="evening">Evening</Option>
      </Select>
    </Modal>
  );
};

export default ShiftChangeModal;
