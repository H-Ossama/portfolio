const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    _id: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    company: {
        type: String,
        trim: true,
        maxlength: 100
    },
    projectType: {
        type: String,
        required: true,
        enum: ['Web Development', 'API Development', 'Database Architecture', 'Mobile App', 'Other']
    },
    timeline: {
        type: String,
        required: true,
        enum: ['short', 'medium', 'long']
    },
    message: {
        type: String,
        required: true,
        trim: true,
        maxlength: 2000
    },
    read: {
        type: Boolean,
        default: false
    },
    readAt: {
        type: Date
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    _id: false, // Disable auto-generation of ObjectId