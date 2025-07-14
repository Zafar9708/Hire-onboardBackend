// Add this to your routes file (e.g., routes/emailRoutes.js)
const express = require('express');
const router = express.Router();
const { sendSalesPersonNotification } = require('../services/emailService');

router.post('/send-welcome-email', async (req, res) => {
    try {
        const { email, name, role } = req.body;
        
        await sendSalesPersonNotification(
            email,
            {
                jobName: 'N/A',
                jobTitle: 'Welcome to the Team',
                department: role
            },
            'System Administrator'
        );
        
        res.status(200).json({ message: 'Welcome email sent successfully' });
    } catch (error) {
        console.error('Error sending welcome email:', error);
        res.status(500).json({ error: 'Failed to send welcome email' });
    }
});

module.exports = router;