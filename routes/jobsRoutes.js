

const express = require('express');
const router = express.Router();
const Job = require('../models/Job');
const JobForm = require('../models/jobForm');
const { protect } = require('../middleware/authMiddleware');
const Counter = require('../models/Counter'); 
const { getJobTemplates, postJob, getAllJobs, getJobDetailById, changeJobStatusById, getAllJobsByStatus,updateJob,deleteJob,deleteJobById,getLocation,addLocation } = require('../controllers/jobController');


// Add these to your job routes
// router.get('/job-forms/locations', getLocation);
// router.post('/job-forms/locations', addLocation);
router.post('/', protect, postJob);
router.put('/:id',protect, updateJob);
router.delete('/',protect,deleteJob);
router.delete('/:id',protect,deleteJobById),
router.patch('/:id/status', changeJobStatusById);
router.get('/', protect, getAllJobs);
router.get('/byStatus/:status', protect, getAllJobsByStatus);

router.get('/byId/:id', getJobDetailById); 

router.get('/jobTemplates',protect,getJobTemplates)





module.exports = router;