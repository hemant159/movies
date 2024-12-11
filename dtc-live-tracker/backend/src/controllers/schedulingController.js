import CrewMember from '../models/CrewMember.js';
import Bus from '../models/Bus.js';
import DutySchedule from '../models/DutySchedule.js';

export const createLinkedDutySchedule = async (req, res) => {
  try {
    const { schedule_id, shift_start, shift_end } = req.body;

    // Fetch available crew members
    const crewMembers = await CrewMember.find({
      availability: {
        $elemMatch: {
          start: { $lte: new Date(shift_start) },
          end: { $gte: new Date(shift_end) },
        },
      },
    });

    // Fetch available buses
    const buses = await Bus.find({});

    // Simple assignment logic
    const assignments = crewMembers.map((crew, index) => ({
      crew_member: crew._id,
      bus: buses[index % buses.length]._id,
    }));

    const dutySchedule = new DutySchedule({
      schedule_id,
      type: 'linked',
      crew_members: assignments.map((a) => a.crew_member),
      bus_assignments: assignments.map((a) => a.bus),
      shift_start,
      shift_end,
    });

    await dutySchedule.save();

    res.status(201).json(dutySchedule);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create linked duty schedule' });
  }
};