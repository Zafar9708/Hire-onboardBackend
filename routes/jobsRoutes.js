

const express = require('express');
const router = express.Router();
const Job = require('../models/Job');
const JobForm = require('../models/jobForm');
const { protect } = require('../middleware/authMiddleware');
const Counter = require('../models/Counter'); 
const { getJobTemplates, postJob, getAllJobs, getJobDetailById, changeJobStatusById, getAllJobsByStatus,updateJob } = require('../controllers/jobController');

router.post('/', protect, postJob);
router.put('/:id',protect, updateJob);


router.get('/', protect, getAllJobs);
router.get('/byStatus/:status', protect, getAllJobsByStatus);

router.get('/byId/:id', getJobDetailById); 


router.patch('/:id', protect, changeJobStatusById);

router.get('/jobTemplates',protect,getJobTemplates)


// router.patch('/:id/archive', protect, async (req, res) => {
//     try {
//         const job = await Job.findOneAndUpdate(
//             { _id: req.params.id, userId: req.user._id },
//             { status: 'Archived' },
//             { new: true }
//         );

//         if (!job) {
//             return res.status(404).json({ error: 'Job not found or unauthorized' });
//         }

//         res.status(200).json({ job });
//     } catch (error) {
//         console.error('Error archiving job:', error);
//         res.status(500).json({ error: 'Failed to archive job' });
//     }
// });


// router.get('/', protect, async (req, res) => {
//     try {
//         const { archived } = req.query;
//         const filter = { userId: req.user._id };
        
//         if (archived === 'true') {
//             filter.status = 'Archived';
//         } else if (archived === 'false') {
//             filter.status = { $ne: 'Archived' };
//         }

//         const jobs = await Job.find(filter).populate('jobFormId');
//         res.status(200).json({ jobs });
//     } catch (error) {
//         console.error('Error:', error);
//         res.status(500).json({ error: 'Failed to fetch jobs' });
//     }
// });

module.exports = router;