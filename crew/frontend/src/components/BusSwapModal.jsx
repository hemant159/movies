import React from 'react';
import { Modal, message } from 'antd';
import { swapCrewBus } from '../services/api';

const BusSwapModal = ({ visible, crew, onClose, refreshList }) => {
  const handleOk = async () => {
    try {
      await swapCrewBus(crew._id, selectedCrewId);
      message.success('Bus swapped successfully!');
      refreshList();
      onClose();
    } catch (error) {
      message.error('Error swapping bus');
    }
  };

  return (
    <Modal title="Swap Bus" visible={visible} onOk={handleOk} onCancel={onClose}>
      <p>Swap Bus with another crew.</p>
    </Modal>
  );
};

export default BusSwapModal;
