

// const templates = require('../data/templates.json'); 
// const Counter = require('../models/Counter');
// const Job = require('../models/Job');
// const jobForm = require('../models/jobForm');
// const User = require('../models/User');

// const getJobTemplates = (req, res) => {
//   try {
//     console.log('Templates loaded:', templates);
//     res.status(200).json(templates);
//   } catch (error) {
//     res.status(500).json({ message: 'Error fetching the job templates' });
//   }
// };

// const getLocation=async(req,res)=>{
//     try{
//         const location=await jobForm.distinct("location")
//     if(!location){
//         return res.status(400).json({
//             success:false,
//             message:"No Location found"
//         })
//     }
//     }catch(error){
//         res.status(400).json({
//             success:false,
//             message:"Failed to fetch location"
//         })
        
//     }
    
// }

// const addLocation = async (req, res) => {
//     try {
//         const { location } = req.body;
//         if (!location) {
//             return res.status(400).json({ error: 'Location is required' });
//         }

//         res.status(201).json({ message: 'Location will be available for selection' });
//     } catch (error) {
//         res.status(500).json({ error: 'Failed to add location' });
//     }
// };

// const postJob = async (req, res) => {
//     try {
//         const { jobTitle, department, experience, jobDesc } = req.body;

//         const jobCount = await Job.countDocuments();
//         const nextJobNumber = jobCount + 1;
//         const jobName = `WR${String(nextJobNumber).padStart(2, '0')}`;

//         const job = new Job({
//             jobName,
//             jobTitle,
//             department,
//             experience,
//             jobDesc,
//             userId: req.user._id
//         });
//         const savedJob = await job.save();

//         const {
//             jobType, location, openings, targetHireDate, currency,
//             amount, allowReapply, reapplyDate, markPriority, hiringFlow,
//             BusinessUnit, Client, salesPerson,
//             recruitingPerson
//         } = req.body;

//         if (BusinessUnit === 'external' && !Client) {
//             return res.status(400).json({ error: "Client is required when BusinessUnit is external" });
//         }

//         const jobFormInstance = new jobForm({
//             jobType,
//             location,
//             openings,
//             targetHireDate,
//             currency,
//             amount,
//             allowReapply,
//             reapplyDate,
//             markPriority,
//             hiringFlow,
//             BusinessUnit,
//             Client: BusinessUnit === 'external' ? Client : undefined,
//             salesPerson,
//             recruitingPerson
//         });

//         const savedJobForm = await jobFormInstance.save();

//         savedJob.jobFormId = savedJobForm._id;
//         await savedJob.save();

//         res.status(201).json({
//             message: 'Job and JobForm created successfully',
//             job: savedJob,
//             jobForm: savedJobForm,
//         });
//     } catch (error) {
//         console.error('Error:', error);
//         res.status(500).json({ error: 'Failed to create job and jobForm' });
//     }
// };


// const getAllJobs = async (req, res) => {
//     try {
//         const jobs = await Job.find().populate('jobFormId');

//         if (!jobs || jobs.length === 0) {
//             return res.status(404).json({ error: 'No jobs found' });
//         }

//         res.status(200).json({
//             message: 'Jobs and associated JobForms fetched successfully',
//             jobs,
//         });
//     } catch (error) {
//         console.error('🔥 Error:', error);
//         res.status(500).json({ error: 'Failed to fetch jobs and jobForms' });
//     }
// }
// const getAllJobsByStatus = async (req, res) => {
//     try {
//         const {status} = req.params

//         const query ={
//           status:status
//         }
//         const jobs = await Job.find(query).populate('jobFormId');

//         if (!jobs || jobs.length === 0) {
//             return res.status(404).json({ error: 'No jobs found' });
//         }

//         res.status(200).json({
//             message: 'Jobs and associated JobForms fetched successfully',
//             jobs,
//         });
//     } catch (error) {
//         console.error('🔥 Error:', error);
//         res.status(500).json({ error: 'Failed to fetch jobs and jobForms' });
//     }
// }

// const getJobDetailById = async (req, res) => {
//     try {
//         const jobId = req.params.id;
//         const job = await Job.findById(jobId).populate('jobFormId');

//         if (!job) {
//             return res.status(404).json({ error: 'Job not found' });
//         }

//         res.status(200).json({
//             message: 'Job and associated JobForm fetched successfully',
//             job,
//         });
//     } catch (error) {
//         console.error('Error:', error);
//         res.status(500).json({ error: 'Failed to fetch job and jobForm' });
//     }
// }

// const changeJobStatusById = async (req, res) => {
//     try {
//         const jobId = req.params.id;
//         const { status, statusReason } = req.body;

//         const validStatuses = ['Active', 'On Hold', 'Closed Own', 'Closed Lost', 'Archived'];
//         if (status && !validStatuses.includes(status)) {
//             return res.status(400).json({ error: 'Invalid status value' });
//         }

//         // Update only the Job document, not the jobForm
//         const updatedJob = await Job.findByIdAndUpdate(
//             jobId,
//             {
//                 status,
//                 statusReason: statusReason || ''
//             },
//             { new: true }
//         ).populate('jobFormId');

//         if (!updatedJob) {
//             return res.status(404).json({ error: 'Job not found' });
//         }

//         res.status(200).json({
//             message: 'Job status updated successfully',
//             job: updatedJob
//         });
//     } catch (error) {
//         console.error('Error updating job status:', error);
//         res.status(500).json({ error: 'Failed to update job status' });
//     }
// }

// const updateJob = async (req, res) => {
//     try {
//         const { id } = req.params;
//         const job = await Job.findById(id).populate('jobFormId');

//         if (!job) {
//             return res.status(404).json({ error: "Job not found" });
//         }

        
//         const { jobTitle, department, experience, jobDesc } = req.body;
//         if (jobTitle) job.jobTitle = jobTitle;
//         if (department) job.department = department;
//         if (experience) job.experience = experience;
//         if (jobDesc) job.jobDesc = jobDesc;

//         const {
//             jobType, location, openings, targetHireDate, currency,
//             amount, allowReapply, reapplyDate, markPriority, hiringFlow,
//             BusinessUnit, Client, salesPerson, recruitingPerson
//         } = req.body;

//         if (BusinessUnit === 'external' && !Client) {
//             return res.status(400).json({ error: "Client is required when BusinessUnit is external" });
//         }

        
//         const jobFormData = await jobForm.findById(job.jobFormId);
//         if (jobFormData) {
//             jobFormData.jobType = jobType ?? jobFormData.jobType;
//             jobFormData.location = location ?? jobFormData.location;
//             jobFormData.openings = openings ?? jobFormData.openings;
//             jobFormData.targetHireDate = targetHireDate ?? jobFormData.targetHireDate;
//             jobFormData.currency = currency ?? jobFormData.currency;
//             jobFormData.amount = amount ?? jobFormData.amount;
//             jobFormData.allowReapply = allowReapply ?? jobFormData.allowReapply;
//             jobFormData.reapplyDate = reapplyDate ?? jobFormData.reapplyDate;
//             jobFormData.markPriority = markPriority ?? jobFormData.markPriority;
//             jobFormData.hiringFlow = hiringFlow ?? jobFormData.hiringFlow;
//             jobFormData.BusinessUnit = BusinessUnit ?? jobFormData.BusinessUnit;
//             jobFormData.Client = BusinessUnit === 'external' ? Client : undefined;
//             jobFormData.salesPerson = salesPerson ?? jobFormData.salesPerson;
//             jobFormData.recruitingPerson = recruitingPerson ?? jobFormData.recruitingPerson;

//             await jobFormData.save();
//         }

//         await job.save();

//         return res.status(200).json({
//             message: 'Job and JobForm updated successfully',
//             job,
//             jobForm: jobFormData
//         });

//     } catch (error) {
//         console.error('Update Error:', error);
//         return res.status(500).json({ error: 'Failed to update job and jobForm' });
//     }
// };

// const deleteJob = async (req, res) => {
//     try {
//       const jobId = req.params.id;
  
//       const deletedJob = await Job.findByIdAndDelete(jobId);
//       if (!deletedJob) {
//         return res.status(404).json({ success: false, message: "Job not found" });
//       }
  
//       return res.status(200).json({
//         success: true,
//         message: "Job deleted successfully",
//       });
//     } catch (error) {
//       console.error("Error deleting job:", error);
//       return res.status(500).json({
//         success: false,
//         message: "Internal server error",
//       });
//     }
//   };


//  const deleteJobById=async(req,res)=>{
//     const jobId=req.params.id
//     const deletedJob=await Job.findByIdAndDelete(jobId)
//     if(!deletedJob){
//         return res.status(400).json({
//             success:false,
//             message:`Job not found  with this ${jobId} not found`
//         })
//     }
//     return res.status(200).json({
//         success:true,
//         message:"Job Deleted Successfully"
//     })

//  }  


  

// module.exports = {
//   getJobTemplates,
//   postJob,
//   getAllJobs,
//   getAllJobsByStatus,
//   getJobDetailById,
//   changeJobStatusById,
//   updateJob,
//   deleteJob,
//   deleteJobById,
//   getLocation,
//   addLocation
// };




const templates = require('../data/templates.json'); 
const Counter = require('../models/Counter');
const Job = require('../models/Job');
const jobForm = require('../models/jobForm');
const User = require('../models/User');
const Employee=require('../models/Employee')
const { sendJobCreationEmail, sendSalesPersonNotification } = require('../services/emailService');

const getJobTemplates = (req, res) => {
  try {
    console.log('Templates loaded:', templates);
    res.status(200).json(templates);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching the job templates' });
  }
};

const getLocation=async(req,res)=>{
    try{
        const location=await jobForm.distinct("location")
    if(!location){
        return res.status(400).json({
            success:false,
            message:"No Location found"
        })
    }
    }catch(error){
        res.status(400).json({
            success:false,
            message:"Failed to fetch location"
        })
        
    }
    
}

const addLocation = async (req, res) => {
    try {
        const { location } = req.body;
        if (!location) {
            return res.status(400).json({ error: 'Location is required' });
        }

        res.status(201).json({ message: 'Location will be available for selection' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to add location' });
    }
};

const postJob = async (req, res) => {
    try {
        const { jobTitle, department, experience, jobDesc } = req.body;

        const jobCount = await Job.countDocuments();
        const nextJobNumber = jobCount + 1;
        const jobName = `WR${String(nextJobNumber).padStart(2, '0')}`;

        const job = new Job({
            jobName,
            jobTitle,
            department,
            experience,
            jobDesc,
            userId: req.user._id
        });
        const savedJob = await job.save();

        const {
            jobType, location, openings, targetHireDate, currency,
            amount, allowReapply, reapplyDate, markPriority, hiringFlow,
            BusinessUnit, Client, salesPerson,
            recruitingPerson
        } = req.body;

        if (BusinessUnit === 'external' && !Client) {
            return res.status(400).json({ error: "Client is required when BusinessUnit is external" });
        }

        if (BusinessUnit === 'external' && !salesPerson) {
            return res.status(400).json({ error: "Sales Person is required when BusinessUnit is external" });
        }

        // Get salesperson details
        let salesPersonDetails = null;
        if (BusinessUnit === 'external' && salesPerson) {
            salesPersonDetails = await Employee.findById(salesPerson).select('name email');
            if (!salesPersonDetails) {
                return res.status(400).json({ error: "Selected salesperson not found" });
            }
        }

        const jobFormInstance = new jobForm({
            jobType,
            location,
            openings,
            targetHireDate,
            currency,
            amount,
            allowReapply,
            reapplyDate,
            markPriority,
            hiringFlow,
            BusinessUnit,
            Client: BusinessUnit === 'external' ? Client : undefined,
            salesPerson: BusinessUnit === 'external' ? salesPerson : undefined,
            salesPersonName: BusinessUnit === 'external' ? salesPersonDetails?.name : undefined,
            salesPersonEmail: BusinessUnit === 'external' ? salesPersonDetails?.email : undefined,
            recruitingPerson
        });

        const savedJobForm = await jobFormInstance.save();

        savedJob.jobFormId = savedJobForm._id;
        await savedJob.save();

        // Send email to salesperson if assigned (only for external BusinessUnit)
        if (BusinessUnit === 'external' && salesPersonDetails?.email) {
            try {
                const creator = await User.findById(req.user._id).select('name');
                
                await sendSalesPersonNotification(
                    salesPersonDetails.email,
                    {
                        jobName: savedJob.jobName,
                        jobTitle: savedJob.jobTitle,
                        department: savedJob.department,
                        salesPersonName: salesPersonDetails.name,
                        creatorName: creator.name
                    }
                );
            } catch (emailError) {
                console.error('Failed to send salesperson notification:', emailError);
            }
        }

        res.status(201).json({
            message: 'Job and JobForm created successfully',
            job: savedJob,
            jobForm: savedJobForm,
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to create job and jobForm' });
    }
};


const getAllJobs = async (req, res) => {
    try {
        const jobs = await Job.find().populate('jobFormId');

        if (!jobs || jobs.length === 0) {
            return res.status(404).json({ error: 'No jobs found' });
        }

        res.status(200).json({
            message: 'Jobs and associated JobForms fetched successfully',
            jobs,
        });
    } catch (error) {
        console.error('🔥 Error:', error);
        res.status(500).json({ error: 'Failed to fetch jobs and jobForms' });
    }
}
const getAllJobsByStatus = async (req, res) => {
    try {
        const {status} = req.params

        const query ={
          status:status
        }
        const jobs = await Job.find(query).populate('jobFormId');

        if (!jobs || jobs.length === 0) {
            return res.status(404).json({ error: 'No jobs found' });
        }

        res.status(200).json({
            message: 'Jobs and associated JobForms fetched successfully',
            jobs,
        });
    } catch (error) {
        console.error('🔥 Error:', error);
        res.status(500).json({ error: 'Failed to fetch jobs and jobForms' });
    }
}

const getJobDetailById = async (req, res) => {
    try {
        const jobId = req.params.id;
        const job = await Job.findById(jobId).populate('jobFormId');

        if (!job) {
            return res.status(404).json({ error: 'Job not found' });
        }

        res.status(200).json({
            message: 'Job and associated JobForm fetched successfully',
            job,
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to fetch job and jobForm' });
    }
}

const changeJobStatusById = async (req, res) => {
    try {
        const jobId = req.params.id;
        const { status, statusReason } = req.body;

        const validStatuses = ['Active', 'On Hold', 'Closed Own', 'Closed Lost', 'Archived'];
        if (status && !validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Invalid status value' });
        }

        // Update only the Job document, not the jobForm
        const updatedJob = await Job.findByIdAndUpdate(
            jobId,
            {
                status,
                statusReason: statusReason || ''
            },
            { new: true }
        ).populate('jobFormId');

        if (!updatedJob) {
            return res.status(404).json({ error: 'Job not found' });
        }

        res.status(200).json({
            message: 'Job status updated successfully',
            job: updatedJob
        });
    } catch (error) {
        console.error('Error updating job status:', error);
        res.status(500).json({ error: 'Failed to update job status' });
    }
}

const updateJob = async (req, res) => {
    try {
        const { id } = req.params;
        const job = await Job.findById(id).populate('jobFormId');

        if (!job) {
            return res.status(404).json({ error: "Job not found" });
        }

        const { jobTitle, department, experience, jobDesc } = req.body;
        if (jobTitle) job.jobTitle = jobTitle;
        if (department) job.department = department;
        if (experience) job.experience = experience;
        if (jobDesc) job.jobDesc = jobDesc;

        const {
            jobType, location, openings, targetHireDate, currency,
            amount, allowReapply, reapplyDate, markPriority, hiringFlow,
            BusinessUnit, Client, salesPerson, recruitingPerson
        } = req.body;

        if (BusinessUnit === 'external' && !Client) {
            return res.status(400).json({ error: "Client is required when BusinessUnit is external" });
        }

        const jobFormData = await jobForm.findById(job.jobFormId);
        if (jobFormData) {
            const previousSalesPerson = jobFormData.salesPerson;
            
            jobFormData.jobType = jobType ?? jobFormData.jobType;
            jobFormData.location = location ?? jobFormData.location;
            jobFormData.openings = openings ?? jobFormData.openings;
            jobFormData.targetHireDate = targetHireDate ?? jobFormData.targetHireDate;
            jobFormData.currency = currency ?? jobFormData.currency;
            jobFormData.amount = amount ?? jobFormData.amount;
            jobFormData.allowReapply = allowReapply ?? jobFormData.allowReapply;
            jobFormData.reapplyDate = reapplyDate ?? jobFormData.reapplyDate;
            jobFormData.markPriority = markPriority ?? jobFormData.markPriority;
            jobFormData.hiringFlow = hiringFlow ?? jobFormData.hiringFlow;
            jobFormData.BusinessUnit = BusinessUnit ?? jobFormData.BusinessUnit;
            jobFormData.Client = BusinessUnit === 'external' ? Client : undefined;
            jobFormData.salesPerson = salesPerson ?? jobFormData.salesPerson;
            jobFormData.recruitingPerson = recruitingPerson ?? jobFormData.recruitingPerson;

            await jobFormData.save();

            // Check if salesperson was changed and send email
            if (salesPerson && salesPerson !== previousSalesPerson) {
                try {
                    const salesPersonUser = await User.findById(salesPerson);
                    const updater = await User.findById(req.user._id);
                    
                    if (salesPersonUser && salesPersonUser.email) {
                        await sendSalesPersonNotification(
                            salesPersonUser.email,
                            {
                                jobName: job.jobName,
                                jobTitle: job.jobTitle,
                                department: job.department
                            },
                            updater.name
                        );
                    }
                } catch (emailError) {
                    console.error('Failed to send salesperson notification:', emailError);
                    // Don't fail the whole request if email fails
                }
            }
        }

        await job.save();

        return res.status(200).json({
            message: 'Job and JobForm updated successfully',
            job,
            jobForm: jobFormData
        });

    } catch (error) {
        console.error('Update Error:', error);
        return res.status(500).json({ error: 'Failed to update job and jobForm' });
    }
};


const deleteJob = async (req, res) => {
    try {
      const jobId = req.params.id;
  
      const deletedJob = await Job.findByIdAndDelete(jobId);
      if (!deletedJob) {
        return res.status(404).json({ success: false, message: "Job not found" });
      }
  
      return res.status(200).json({
        success: true,
        message: "Job deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting job:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  };


 const deleteJobById=async(req,res)=>{
    const jobId=req.params.id
    const deletedJob=await Job.findByIdAndDelete(jobId)
    if(!deletedJob){
        return res.status(400).json({
            success:false,
            message:`Job not found  with this ${jobId} not found`
        })
    }
    return res.status(200).json({
        success:true,
        message:"Job Deleted Successfully"
    })

 }  


  

module.exports = {
  getJobTemplates,
  postJob,
  getAllJobs,
  getAllJobsByStatus,
  getJobDetailById,
  changeJobStatusById,
  updateJob,
  deleteJob,
  deleteJobById,
  getLocation,
  addLocation
};


