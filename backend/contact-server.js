require('dotenv').config();
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Create transporter with simple configuration
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    requireTLS: true,
    auth: {
        user: 'ossamahattan@gmail.com',
        pass: process.env.EMAIL_PASSWORD
    },
    tls: {
        ciphers: 'SSLv3'
    }
});

// Test email configuration
transporter.verify((error, success) => {
    if (error) {
        console.error('Email configuration error:', error);
    } else {
        console.log('Server is ready to send emails');
    }
});

// Contact form endpoint
app.post('/api/contact', async (req, res) => {
    console.log('Received form submission:', req.body);
    
    try {
        const { name, email, company, projectType, projectPriority, requirements, message } = req.body;

        const mailOptions = {
            from: {
                name: 'Portfolio Contact Form',
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

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully:', info);
        
        res.json({
            success: true,
            message: 'Message sent successfully!',
            messageId: info.messageId
        });
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to send message',
            details: error.message
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});