// controllers/organisationController.js
const { validationResult } = require('express-validator'); // reserved if you later add body checks
const Organisation = require('../models/Organisation');
const User = require('../models/User');

// Managers create orgs; creator becomes a member & gets manager role for that org
exports.createOrganisation = async (req, res) => {
  try {
    const { name } = req.body;

    const org = new Organisation({
      name,
      createdBy: req.user.id,
      members: [req.user.id],
    });

    const user = await User.findById(req.user.id);
    user.roles.push({ organisationId: org._id, role: 'manager' });

    org.generateJoinCode();
    await org.save();
    await user.save();

    return res.status(201).json({ message: 'Organisation created', organisation: org });
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
};

// Managers regenerate join codes for their org
exports.generateJoinCode = async (req, res) => {
  try {
    const { organisationId } = req.params;
    const org = await Organisation.findById(organisationId);
    if (!org) return res.status(404).json({ message: 'Organisation not found' });

    org.generateJoinCode();
    await org.save();

    return res.json({ message: 'Join code regenerated', joinCode: org.joinCode });
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
};

// Registered users join an org using a join code
exports.joinOrganisation = async (req, res) => {
  try {
    const { joinCode } = req.body;
    const org = await Organisation.findOne({ joinCode });
    if (!org) return res.status(400).json({ message: 'Invalid join code' });

    const userId = req.user.id;

    // already a member?
    if (org.members.map(String).includes(userId)) {
      return res.status(400).json({ message: 'Already joined' });
    }

    org.members.push(userId);

    const user = await User.findById(userId);
    const alreadyRole = user.roles.some(
      (r) => r.role === 'user' && String(r.organisationId) === String(org._id)
    );
    if (!alreadyRole) {
      user.roles.push({ organisationId: org._id, role: 'user' });
    }

    await org.save();
    await user.save();

    return res.json({ message: 'Joined organisation', organisation: org });
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
};