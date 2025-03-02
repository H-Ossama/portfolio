require('dotenv').config();
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('../public'));

console.log('Email Password:', process.env.EMAIL_PASSWORD); // For debugging

// Create reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // use SSL
    auth: {
        user: 'ossamahattan@gmail.com',
        pass: process.env.EMAIL_PASSWORD
    },
    debug: true // Enable debug logging
});

// Verify connection configuration
transporter.verify(function(error, success) {
    if (error) {
        console.log('SMTP Server connection error:', error);
    } else {
        console.log('SMTP Server is ready to take our messages');
    }
});

app.post('/api/contact', async (req, res) => {
    console.log('Received contact form submission:', req.body);
    
    try {
        const { name, email, company, projectType, projectPriority, requirements, message } = req.body;

        const mailOptions = {
            from: {
                name: "Portfolio Contact Form",
                address: 'ossamahattan@gmail.com'
            },
            to: 'ossamahattan@gmail.com',
            subject: `[IMPORTANT] New Project Inquiry from ${name}`,
            html: `
                <h2 style="color: #D4AF37;">New Project Inquiry</h2>
                <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px;">
                    <p><strong>From:</strong> ${name} (${email})</p>
                    <p><strong>Company:</strong> ${company || 'Not specified'}</p>
                    <p><strong>Project Type:</strong> ${projectType}</p>
                    <p><strong>Priority:</strong> ${projectPriority}</p>
                    <p><strong>Requirements:</strong> ${requirements ? requirements.join(', ') : 'None specified'}</p>
                    <h3>Message:</h3>
                    <p style="white-space: pre-wrap;">${message}</p>
                </div>
            `,
            replyTo: email
        };

        console.log('Attempting to send email with options:', mailOptions);

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully:', info);

        res.status(200).json({ 
            message: 'Message sent successfully!',
            messageId: info.messageId
        });
    } catch (error) {
        console.error('Detailed error sending email:', error);
        res.status(500).json({ 
            error: 'Failed to send message. Please try again.',
            details: error.message
        });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({
        error: 'Internal server error',
        details: err.message
    });
});

app.listen(PORT, () => {
    console.log(`Test server running on port ${PORT}`);
});