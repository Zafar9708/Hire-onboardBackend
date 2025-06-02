

const transporter = require('../config/email');

const sendInterviewEmail = async (to, subject, body, meetingLink) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to,
            subject,
            html: `
                <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                    ${body.replace(/\n/g, '<br>')}
                    <br><br>
                    ${meetingLink ? `<p><strong>Meeting Link:</strong> <a href="${meetingLink}">${meetingLink}</a></p>` : ''}
                    <br>
                    <p>Best regards,<br>Interview Team</p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log(`Email sent to ${to}`);
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
};

module.exports = { sendInterviewEmail };