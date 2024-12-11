import mongoose from 'mongoose';

const DutyScheduleSchema = new mongoose.Schema({
  schedule_id: { type: String, required: true, unique: true },
  type: { type: String, enum: ['linked', 'unlinked'], required: true },
  crew_members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'CrewMember' }],
  bus_assignments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Bus' }],
  shift_start: Date,
  shift_end: Date,
});

export default mongoose.model('DutySchedule', DutyScheduleSchema);
