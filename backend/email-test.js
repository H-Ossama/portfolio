require('dotenv').config();
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Debug: Print environment variables
console.log('Environment check:', {
    emailUser: 'ossamahattan@gmail.com',
    emailPassExists: !!process.env.EMAIL_PASSWORD,
    emailPassLength: process.env.EMAIL_PASSWORD ? process.env.EMAIL_PASSWORD.length : 0
});

// Create transporter with detailed logging
const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // Use TLS
    auth: {
        user: 'ossamahattan@gmail.com',
        pass: process.env.EMAIL_PASSWORD
    },
    debug: true, // Enable debug logs
    logger: true  // Log to console
});

// Test email configuration
transporter.verify((error, success) => {
    if (error) {
        console.error('Email configuration error:', error);
    } else {
        console.log('Server is ready to send emails');
    }
});

// Simple test endpoint
app.post('/api/test-email', async (req, res) => {
    try {
        const testMailOptions = {
            from: 'ossamahattan@gmail.com',
            to: 'ossamahattan@gmail.com',
            subject: 'Test Email',
            text: 'This is a test email to verify the configuration'
        };

        console.log('Attempting to send test email...');
        const info = await transporter.sendMail(testMailOptions);
        console.log('Test email sent successfully:', info);
        
        res.json({
            success: true,
            messageId: info.messageId,
            response: info.response
        });
    } catch (error) {
        console.error('Failed to send test email:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            details: {
                code: error.code,
                command: error.command,
                response: error.response
            }
        });
    }
});

// Main contact endpoint
app.post('/api/contact', async (req, res) => {
    console.log('Received contact form data:', req.body);
    
    try {
        const { name, email, company, projectType, projectPriority, requirements, message } = req.body;

        const mailOptions = {
            from: 'ossamahattan@gmail.com',
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

        console.log('Attempting to send contact form email...');
        const info = await transporter.sendMail(mailOptions);
        console.log('Contact form email sent successfully:', info);
        
        res.json({
            success: true,
            message: 'Message sent successfully!',
            messageId: info.messageId
        });
    } catch (error) {
        console.error('Failed to send contact form email:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to send message',
            details: {
                message: error.message,
                code: error.code,
                command: error.command,
                response: error.response
            }
        });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({
        error: 'Server error',
        message: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});

app.listen(PORT, () => {
    console.log(`Test email server running on port ${PORT}`);
});