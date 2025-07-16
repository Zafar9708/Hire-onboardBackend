

// const transporter = require('../config/email');

// const sendInterviewEmail = async (to, subject, body, meetingLink) => {
//     try {
//         const mailOptions = {
//             from: process.env.EMAIL_USER,
//             to,
//             subject,
//             html: `
//                 <div style="font-family: Arial, sans-serif; line-height: 1.6;">
//                     ${body.replace(/\n/g, '<br>')}
//                     <br><br>
//                     ${meetingLink ? `<p><strong>Meeting Link:</strong> <a href="${meetingLink}">${meetingLink}</a></p>` : ''}
//                     <br>
//                       ${feedbackLink ? `<p>Please submit your feedback after the interview: <a href="${feedbackLink}">Feedback Form</a></p>` : ''}
//                     <p>Best regards,<br>Interview Team</p>
//                 </div>
//             `
//         };

//         await transporter.sendMail(mailOptions);
//         console.log(`Email sent to ${to}`);
//         return true;
//     } catch (error) {
//         console.error('Error sending email:', error);
//         throw error;
//     }
// };

// const sendJobCreationEmail = async (to, jobName, jobTitle, createdBy, department) => {
//     try {
//         const mailOptions = {
//             from: process.env.EMAIL_USER,
//             to,
//             subject: `New Job Created: ${jobName} - ${jobTitle}`,
//             html: `
//                 <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; line-height: 1.6;">
//                     <h2 style="color: #2c3e50;">New Job Created</h2>
//                     <p>A new job has been created in the system with the following details:</p>
                    
//                     <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
//                         <tr>
//                             <td style="padding: 8px; border: 1px solid #ddd; width: 30%;"><strong>Job ID:</strong></td>
//                             <td style="padding: 8px; border: 1px solid #ddd;">${jobName}</td>
//                         </tr>
//                         <tr>
//                             <td style="padding: 8px; border: 1px solid #ddd;"><strong>Job Title:</strong></td>
//                             <td style="padding: 8px; border: 1px solid #ddd;">${jobTitle}</td>
//                         </tr>
//                         <tr>
//                             <td style="padding: 8px; border: 1px solid #ddd;"><strong>Department:</strong></td>
//                             <td style="padding: 8px; border: 1px solid #ddd;">${department}</td>
//                         </tr>
//                         <tr>
//                             <td style="padding: 8px; border: 1px solid #ddd;"><strong>Created By:</strong></td>
//                             <td style="padding: 8px; border: 1px solid #ddd;">${createdBy}</td>
//                         </tr>
//                     </table>
                    
//                     <p style="margin-top: 20px;">You can view the job details in the system.</p>
                    
//                     <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
//                         <p>Best regards,</p>
//                         <p>Your Recruitment Team</p>
//                     </div>
//                 </div>
//             `
//         };

//         await transporter.sendMail(mailOptions);
//         console.log(`Job creation email sent to ${to}`);
//         return true;
//     } catch (error) {
//         console.error('Error sending job creation email:', error);
//         throw error;
//     }
// };

// const sendSalesPersonNotification = async (to, jobDetails) => {
//     try {
//         const mailOptions = {
//             from: process.env.EMAIL_USER,
//             to,
//             subject: `New Job Assignment: ${jobDetails.jobTitle}`,
//             html: `
//                 <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; line-height: 1.6;">
//                     <h2 style="color: #2c3e50;">New Job Assignment</h2>
//                     <p>Dear ${jobDetails.salesPersonName},</p>
//                     <p>You have been assigned as the salesperson for a new job:</p>
                    
//                     <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
//                         <tr>
//                             <td style="padding: 8px; border: 1px solid #ddd; width: 30%;"><strong>Job ID:</strong></td>
//                             <td style="padding: 8px; border: 1px solid #ddd;">${jobDetails.jobName}</td>
//                         </tr>
//                         <tr>
//                             <td style="padding: 8px; border: 1px solid #ddd;"><strong>Job Title:</strong></td>
//                             <td style="padding: 8px; border: 1px solid #ddd;">${jobDetails.jobTitle}</td>
//                         </tr>
//                         <tr>
//                             <td style="padding: 8px; border: 1px solid #ddd;"><strong>Department:</strong></td>
//                             <td style="padding: 8px; border: 1px solid #ddd;">${jobDetails.department}</td>
//                         </tr>
//                         <tr>
//                             <td style="padding: 8px; border: 1px solid #ddd;"><strong>Assigned By:</strong></td>
//                             <td style="padding: 8px; border: 1px solid #ddd;">${jobDetails.creatorName}</td>
//                         </tr>
//                     </table>
                    
//                     <p style="margin-top: 20px;">Please review the job details in the system and take necessary actions.</p>
                    
//                     <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
//                         <p>Best regards,</p>
//                         <p>Your Recruitment Team</p>
//                     </div>
//                 </div>
//             `
//         };

//         await transporter.sendMail(mailOptions);
//         console.log(`Salesperson notification sent to ${to}`);
//         return true;
//     } catch (error) {
//         console.error('Error sending salesperson notification:', error);
//         throw error;
//     }
// };

// const sendFeedbackEmail = async (to, interview, feedback, interviewer) => {
//     try {
//         const mailOptions = {
//             from: process.env.EMAIL_USER,
//             to,
//             subject: `Interview Feedback for ${interview.candidate.name}`,
//             html: `
//                 <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; line-height: 1.6;">
//                     <h2 style="color: #2c3e50;">Interview Feedback Submitted</h2>
                    
//                     <h3 style="color: #3a5169;">Interview Details</h3>
//                     <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
//                         <tr>
//                             <td style="padding: 8px; border: 1px solid #ddd; width: 30%;"><strong>Candidate:</strong></td>
//                             <td style="padding: 8px; border: 1px solid #ddd;">${interview.candidate.name}</td>
//                         </tr>
//                         <tr>
//                             <td style="padding: 8px; border: 1px solid #ddd;"><strong>Interview Date:</strong></td>
//                             <td style="padding: 8px; border: 1px solid #ddd;">${new Date(interview.date).toLocaleDateString()}</td>
//                         </tr>
//                         <tr>
//                             <td style="padding: 8px; border: 1px solid #ddd;"><strong>Interviewer:</strong></td>
//                             <td style="padding: 8px; border: 1px solid #ddd;">${interviewer.name}</td>
//                         </tr>
//                     </table>
                    
//                     <h3 style="color: #3a5169;">Feedback Details</h3>
//                     <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
//                         <tr>
//                             <td style="padding: 8px; border: 1px solid #ddd; width: 30%;"><strong>Status:</strong></td>
//                             <td style="padding: 8px; border: 1px solid #ddd;">${feedback.status}</td>
//                         </tr>
//                         <tr>
//                             <td style="padding: 8px; border: 1px solid #ddd;"><strong>Technical Skills:</strong></td>
//                             <td style="padding: 8px; border: 1px solid #ddd;">${feedback.technicalSkills}/5</td>
//                         </tr>
//                         <tr>
//                             <td style="padding: 8px; border: 1px solid #ddd;"><strong>Communication:</strong></td>
//                             <td style="padding: 8px; border: 1px solid #ddd;">${feedback.communicationSkills}/5</td>
//                         </tr>
//                         <tr>
//                             <td style="padding: 8px; border: 1px solid #ddd;"><strong>Problem Solving:</strong></td>
//                             <td style="padding: 8px; border: 1px solid #ddd;">${feedback.problemSolving}/5</td>
//                         </tr>
//                         <tr>
//                             <td style="padding: 8px; border: 1px solid #ddd;"><strong>Cultural Fit:</strong></td>
//                             <td style="padding: 8px; border: 1px solid #ddd;">${feedback.culturalFit}/5</td>
//                         </tr>
//                     </table>
                    
//                     <h4 style="color: #3a5169;">Overall Feedback</h4>
//                     <p style="background: #f5f5f5; padding: 10px; border-radius: 4px;">${feedback.overallFeedback}</p>
                    
//                     ${feedback.additionalComments ? `
//                     <h4 style="color: #3a5169;">Additional Comments</h4>
//                     <p style="background: #f5f5f5; padding: 10px; border-radius: 4px;">${feedback.additionalComments}</p>
//                     ` : ''}
                    
//                     <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
//                         <p>Best regards,</p>
//                         <p>Interview Team</p>
//                     </div>
//                 </div>
//             `
//         };

//         await transporter.sendMail(mailOptions);
//         console.log(`Feedback email sent to ${to}`);
//         return true;
//     } catch (error) {
//         console.error('Error sending feedback email:', error);
//         throw error;
//     }
// };

// module.exports = { sendInterviewEmail, sendJobCreationEmail, sendSalesPersonNotification, sendFeedbackEmail };

//-----------

const transporter = require('../config/email');

const sendInterviewEmail = async (to, subject, body, meetingLink, feedbackLink, recipientName, emailType = 'technical') => {
    try {
        // Determine the appropriate signature based on email type
        let signature = 'Wrocus HR Team';
        if (emailType === 'technical') {
            signature = 'Tech Team';
        } else if (emailType === 'final') {
            signature = 'Hiring Team';
        }

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to,
            subject,
            html: `
                <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                    ${body.replace(/\n/g, '<br>')}
                    ${meetingLink ? `<p><strong>Meeting Link:</strong> <a href="${meetingLink}">${meetingLink}</a></p>` : ''}
                    ${feedbackLink && feedbackLink !== 'N/A' ? `
                    <p><strong>Feedback Link:</strong> <a href="${feedbackLink}">Submit Feedback</a></p>
                    ` : ''}
                    <p>Best regards,<br>${signature}</p>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        throw error;
    }
};

const sendJobCreationEmail = async (to, jobName, jobTitle, createdBy, department) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to,
            subject: `New Job Created: ${jobName} - ${jobTitle}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; line-height: 1.6;">
                    <h2 style="color: #2c3e50;">New Job Created</h2>
                    <p>A new job has been created in the system with the following details:</p>
                    
                    <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                        <tr>
                            <td style="padding: 8px; border: 1px solid #ddd; width: 30%;"><strong>Job ID:</strong></td>
                            <td style="padding: 8px; border: 1px solid #ddd;">${jobName}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Job Title:</strong></td>
                            <td style="padding: 8px; border: 1px solid #ddd;">${jobTitle}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Department:</strong></td>
                            <td style="padding: 8px; border: 1px solid #ddd;">${department}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Created By:</strong></td>
                            <td style="padding: 8px; border: 1px solid #ddd;">${createdBy}</td>
                        </tr>
                    </table>
                    
                    <p style="margin-top: 20px;">You can view the job details in the system.</p>
                    
                    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                        <p>Best regards,</p>
                        <p>Your Recruitment Team</p>
                    </div>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log(`Job creation email sent to ${to}`);
        return true;
    } catch (error) {
        console.error('Error sending job creation email:', error);
        throw error;
    }
};

const sendSalesPersonNotification = async (to, jobDetails) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to,
            subject: `New Job Assignment: ${jobDetails.jobTitle}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; line-height: 1.6;">
                    <h2 style="color: #2c3e50;">New Job Assignment</h2>
                    <p>Dear ${jobDetails.salesPersonName},</p>
                    <p>You have been assigned as the salesperson for a new job:</p>
                    
                    <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                        <tr>
                            <td style="padding: 8px; border: 1px solid #ddd; width: 30%;"><strong>Job ID:</strong></td>
                            <td style="padding: 8px; border: 1px solid #ddd;">${jobDetails.jobName}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Job Title:</strong></td>
                            <td style="padding: 8px; border: 1px solid #ddd;">${jobDetails.jobTitle}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Department:</strong></td>
                            <td style="padding: 8px; border: 1px solid #ddd;">${jobDetails.department}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Assigned By:</strong></td>
                            <td style="padding: 8px; border: 1px solid #ddd;">${jobDetails.userName}</td>
                        </tr>
                    </table>
                    
                    <p style="margin-top: 20px;">Please review the job details in the system and take necessary actions.</p>
                    
                    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                        <p>Best regards,</p>
                        <p>Your Recruitment Team</p>
                    </div>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log(`Salesperson notification sent to ${to}`);
        return true;
    } catch (error) {
        console.error('Error sending salesperson notification:', error);
        throw error;
    }
};

const sendFeedbackEmail = async (to, interview, feedback, interviewer) => {
    try {
        const frontendURL = process.env.FRONTEND_URL;

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to,
            subject: `Interview Feedback for ${interview.candidate.name}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; line-height: 1.6;">
                    <h2 style="color: #2c3e50;">Interview Feedback Submitted</h2>
                    
                    <h3 style="color: #3a5169;">Interview Details</h3>
                    <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                        <tr>
                            <td style="padding: 8px; border: 1px solid #ddd; width: 30%;"><strong>Candidate:</strong></td>
                            <td style="padding: 8px; border: 1px solid #ddd;">${interview.candidate.name}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Interview Date:</strong></td>
                            <td style="padding: 8px; border: 1px solid #ddd;">${new Date(interview.date).toLocaleDateString()}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Interviewer:</strong></td>
                            <td style="padding: 8px; border: 1px solid #ddd;">${interviewer.name}</td>
                        </tr>
                    </table>
                    
                    <h3 style="color: #3a5169;">Feedback Details</h3>
                    <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                        <tr>
                            <td style="padding: 8px; border: 1px solid #ddd; width: 30%;"><strong>Status:</strong></td>
                            <td style="padding: 8px; border: 1px solid #ddd;">${feedback.status}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Technical Skills:</strong></td>
                            <td style="padding: 8px; border: 1px solid #ddd;">${feedback.technicalSkills}/5</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Communication:</strong></td>
                            <td style="padding: 8px; border: 1px solid #ddd;">${feedback.communicationSkills}/5</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Problem Solving:</strong></td>
                            <td style="padding: 8px; border: 1px solid #ddd;">${feedback.problemSolving}/5</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Cultural Fit:</strong></td>
                            <td style="padding: 8px; border: 1px solid #ddd;">${feedback.culturalFit}/5</td>
                        </tr>
                    </table>

                    <h4 style="color: #3a5169;">Overall Feedback</h4>
                    <p style="background: #f5f5f5; padding: 10px; border-radius: 4px;">${feedback.overallFeedback}</p>

                    ${feedback.additionalComments ? `
                        <h4 style="color: #3a5169;">Additional Comments</h4>
                        <p style="background: #f5f5f5; padding: 10px; border-radius: 4px;">${feedback.additionalComments}</p>
                    ` : ''}

                    ${frontendURL ? `
                        <h3 style="color: #3a5169;">Candidate Feedback Page</h3>
                        <p style="padding: 10px;">
                            <a href="${frontendURL}/feedback/${feedback.jobId}/${feedback.candidateId}" target="_blank" style="color: #1a73e8;">
                                Click here to view candidate feedback summary
                            </a>
                        </p>
                    ` : ''}

                    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                        <p>Best regards,</p>
                        <p>Interview Team</p>
                    </div>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log(`✅ Feedback email sent to ${to}`);
        return true;
    } catch (error) {
        console.error('Error sending feedback email:', error);
        throw error;
    }
};


module.exports = { 
    sendInterviewEmail, 
    sendJobCreationEmail, 
    sendSalesPersonNotification, 
    sendFeedbackEmail 
};