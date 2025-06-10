const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (user) => {
  return jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: '1d',
  });
};

exports.registerUser = async (req, res) => {
  const { username, email, password, confirm_password } = req.body;

  if (password !== confirm_password) {
    return res.status(400).json({ error: 'Passwords must match.' });
  }

  try {
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Email or username already exists.' });
    }

    const user = await User.create({ username, email, password });

    res.status(201).json({ message: 'User created successfully.' });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const token = generateToken(user);
    res.json({
      access_token: token,
      refresh_token: 'mocked_refresh_token_for_demo', 
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getUserDetails = async (req, res) => {
  const user = req.user;
  res.json({
    username: user.username,
    email: user.email
  });
};
exports.getAllUser = async (req, res) => {
  const result = await User.find()

  console.log("sfhbsjbnj,s",result)
  // throw new Error("lndskc");
  
  res.json({
    user: result,
    // email: user.email
  });
}
