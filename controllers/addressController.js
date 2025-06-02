const Address = require('../models/Address');

exports.createAddress = async (req, res) => {
  try {
    const { name, address, building, floor, meetingRooms } = req.body;
    
    const newAddress = new Address({
      name,
      address,
      building,
      floor,
      meetingRooms
    });

    await newAddress.save();
    res.status(201).json(newAddress);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllAddresses = async (req, res) => {
  try {
    const addresses = await Address.find({ active: true });
    res.json(addresses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAvailableMeetingRooms = async (req, res) => {
  try {
    const { date, startTime, duration } = req.query;
    
    const addresses = await Address.find({
      'meetingRooms.available': true
    });

    res.json(addresses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};