const express = require('express');
const router = express.Router();
const Group = require('../models/Group');

// Create a new group
router.post('/', async (req, res) => {
  try {
    console.log('Received group data:', req.body);
    
    // Check if user already has a group
    const existingGroup = await Group.findOne({
      'leader.registrationNumber': req.body.leader.registrationNumber
    });

    if (existingGroup) {
      return res.status(400).json({ 
        message: 'User already has a group. Please delete the existing group first.' 
      });
    }

    const group = new Group(req.body);
    console.log('Created group model:', group);
    const savedGroup = await group.save();
    console.log('Saved group to database:', savedGroup);
    res.status(201).json(savedGroup);
  } catch (error) {
    console.error('Error saving group:', error);
    res.status(400).json({ message: error.message });
  }
});

// Get all groups
router.get('/', async (req, res) => {
  try {
    const groups = await Group.find();
    res.json(groups);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get latest group by leader's registration number
router.get('/leader/:registrationNumber', async (req, res) => {
  try {
    const group = await Group.findOne({ 
      'leader.registrationNumber': req.params.registrationNumber 
    });
    
    if (!group) {
      return res.status(404).json({ message: 'No group found for this user' });
    }
    
    res.json(group);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get group by member's registration number
router.get('/member/:registrationNumber', async (req, res) => {
  try {
    const group = await Group.findOne({
      'members.registrationNumber': req.params.registrationNumber
    });
    
    if (!group) {
      return res.status(404).json({ message: 'No group found for this user' });
    }
    
    res.json(group);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update group status
router.patch('/:id/status', async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }
    group.status = req.body.status;
    await group.save();
    res.json(group);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Allotment endpoint: Accepts admin's room availability, fetches all groups, sorts by avg rank, allots rooms by preference, and returns final allotment
router.post('/allotment', async (req, res) => {
  try {
    const { availability } = req.body; // { [roomType]: count }
    if (!availability || typeof availability !== 'object') {
      return res.status(400).json({ message: 'Availability data required' });
    }

    // Fetch all groups
    const groups = await Group.find();

    // Compute average rank and store with group
    const groupWithAvg = groups.map((g) => {
      const ranks = [g.leader.rank, ...g.members.map(m => m.rank)];
      const avgRank = ranks.reduce((a, b) => a + b, 0) / ranks.length;
      return { group: g, avgRank };
    });

    // Sort by avgRank ascending (best rank first)
    groupWithAvg.sort((a, b) => a.avgRank - b.avgRank);

    // Clone availability to mutate
    const roomCounts = { ...availability };
    const allotment = [];

    // Allot rooms
    for (const { group, avgRank } of groupWithAvg) {
      let allottedRoom = null;
      if (group.roomPreferences && group.roomPreferences.length > 0) {
        for (const pref of group.roomPreferences) {
          if (roomCounts[pref.value] && roomCounts[pref.value] > 0) {
            allottedRoom = pref.value;
            roomCounts[pref.value] -= 1;
            break;
          }
        }
      }
      allotment.push({
        groupId: group._id,
        leaderRegNo: group.leader.registrationNumber,
        avgRank: Math.round(avgRank * 100) / 100,
        allottedRoom: allottedRoom,
        memberRegNos: group.members.map(m => m.registrationNumber),
      });
    }

    res.json({ allotment });
  } catch (error) {
    console.error('Allotment error:', error);
    res.status(500).json({ message: 'Allotment failed', error: error.message });
  }
});

module.exports = router; 