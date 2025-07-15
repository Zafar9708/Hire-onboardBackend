
const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');
const path=require('path')



const dotenv = require('dotenv');
const cors = require('cors');
const bodyParser = require('body-parser');
const errorHandler = require('./middleware/errorHandler');
const jobRoutes = require('./routes/jobsRoutes');
const departmentRoutes = require('./routes/departmentRoutes');
const authRoutes = require('./routes/authRoutes');
const companyRoutes = require('./routes/companyRoutes');
const jobFormRoutes = require('./routes/jobFormRoutes');
const resumeRoutes = require('./routes/resumeRoutes');
const candidateRoutes = require('./routes/candidateRoutes');
const interviewRoutes = require('./routes/interviewRoutes');
const offlineInterviewRoutes = require('./routes/offlineInterviewRoutes');
const candidateStageRoutes = require('./routes/candidateStageRoutes');
const remarkRoutes = require('./routes/remarks');
const jobStatusRoutes = require('./routes/jobStatus');
const employeeRoutes=require('./routes/employeeRoutes')
const stageRoutes = require('./routes/stageRoutes');
const emailRoutes=require('./routes/emailRoutes')
const feedbackRoutes = require('./routes/feedbackRoutes');
const noteRoutes = require('./routes/noteRoutes');
const candidateNoteRoutes = require('./routes/candidateNoteRoutes');
const candidateCommentsRoutes = require('./routes/candidateComments');



dotenv.config();

const app = express();

app.use(cors());
// app.use(bodyParser.json());
app.use(errorHandler);

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));



app.use('/api/candidates', candidateRoutes);
app.use('/user', authRoutes);
app.use('/company', companyRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/jobform', jobFormRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/resumes', resumeRoutes);
app.use('/api/stages', stageRoutes);
app.use('/api', emailRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/candidate-notes', candidateNoteRoutes);
app.use('/api/candidate-comments', candidateCommentsRoutes);

//for interviews
app.use('/api', interviewRoutes);


//for offline interviews
app.use('/api/offline-interviews', offlineInterviewRoutes);


// for candidate stage
app.use('/api/stages', candidateStageRoutes);

//for remarks 
app.use('/api/remarks', remarkRoutes);

app.use('/api/job-status', jobStatusRoutes);
app.use('/api/feedback', feedbackRoutes);


app.use(cors({
  origin: 'https://hire-onboard.vercel.app', 
  credentials: true
}));






app.get('/', (req, res) => {
    res.send('🚀 API is running...');
});


//for employee

app.use('/api/employees',employeeRoutes)


//for google refresh tokens 


app.get('/auth/google/callback', async (req, res) => {
  const code = req.query.code;

  if (!code) return res.status(400).send('No code provided.');

  try {
    const tokenResponse = await axios.post(
      'https://oauth2.googleapis.com/token',
      new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: process.env.GOOGLE_REDIRECT_URI,
        grant_type: 'authorization_code',
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    const tokens = tokenResponse.data;
    console.log('Tokens:', tokens);

    res.send(`<pre>Tokens received:\n${JSON.stringify(tokens, null, 2)}</pre>`);
  } catch (error) {
    console.error('Token exchange failed:', error.response?.data || error.message);
    res.status(500).send('Failed to exchange code for tokens.');
  }
});



  mongoose.connect(process.env.MONGO_URI)
  .then(() => {
      console.log('✅ MongoDB connected');
      const PORT = process.env.PORT || 8000;
      app.listen(PORT, () => {
          console.log(`Server running on port ${PORT}`);
      });
  })
  .catch(err => {
      console.error('MongoDB connection error:', err.message);
      process.exit(1); 
  });
