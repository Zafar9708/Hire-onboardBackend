const Location=require('../models/Location')


exports.getAllLocations = async (req, res) => {
  try {
    const locations = await Location.find().sort({ name: 1 });
    res.status(200).json({
      success: true,
      data: locations
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch locations',
      error: err.message
    });
  }
};

exports.createLocation = async (req, res) => {
  try {
    const { name } = req.body;
    
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Location name is required'
      });
    }
    
    const existingLocation = await Location.findOne({ 
      name: { $regex: new RegExp(`^${name.trim()}$`, 'i') } 
    });
    
    if (existingLocation) {
      return res.status(400).json({
        success: false,
        message: 'Location already exists'
      });
    }
    
    const newLocation = new Location({
      name: name.trim(),
      isCustom: true
    });
    
    await newLocation.save();
    
    res.status(201).json({
      success: true,
      data: newLocation,
      message: 'Location added successfully'
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to create location',
      error: err.message
    });
  }
};