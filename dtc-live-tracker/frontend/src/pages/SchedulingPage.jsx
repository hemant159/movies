import React, { useState } from 'react';
import axios from 'axios';

const SchedulingPage = () => {
  const [shiftStart, setShiftStart] = useState('');
  const [shiftEnd, setShiftEnd] = useState('');
  const [scheduleId, setScheduleId] = useState('');

  const handleCreateSchedule = async () => {
    try {
      await axios.post('http://localhost:5000/api/scheduling/linked', {
        schedule_id: scheduleId,
        shift_start: shiftStart,
        shift_end: shiftEnd,
      });
      alert('Schedule created successfully');
    } catch (error) {
      console.error('Error creating schedule:', error);
      alert('Failed to create schedule');
    }
  };

  return (
    <div>
      <h1>Create Linked Duty Schedule</h1>
      <input
        type="text"
        placeholder="Schedule ID"
        value={scheduleId}
        onChange={(e) => setScheduleId(e.target.value)}
      />
      <input
        type="datetime-local"
        value={shiftStart}
        onChange={(e) => setShiftStart(e.target.value)}
      />
      <input
        type="datetime-local"
        value={shiftEnd}
        onChange={(e) => setShiftEnd(e.target.value)}
      />
      <button onClick={handleCreateSchedule}>Create Schedule</button>
    </div>
  );
};

export default SchedulingPage;
