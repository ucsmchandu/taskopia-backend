const mongoose = require('mongoose');

const AllyProfileSchema = new mongoose.Schema({
    firebaseUid: {
        type: String,
        required: true,
        unique: true
    },
    userProfilePhotoUrl: {
        type: String,
        required: true,
    },
    firstName: {
        type: String,
        required: true,
        maxLength: [50, 'First name cannot exceed 50 characters'],
        minLength: [3, 'First name cannot less than 3 characters']
    },
    lastName: {
        type: String,
        required: true,
        trim: true,
        maxLength: [50, 'Last name cannot exceed 50 characters'],
    },
    age: {
        type: Number,
        required: true,
        min: [18, 'User age must be greater than 18']
    },
    phone: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        match: [/^(?:\+91)?[9876]\d{9}$/, 'Please enter valid phone number']
    },
    gmail: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter valid email ']
    },
    rating: {
        average: {
            type: Number,
            min: 0,
            max: 5,
            default: 0
        },
        count: {
            type: Number,
            default: 0
        }
    },
    description: {
        type: String,
        required: true,
        minLength: [5, 'Description is at least 5 characters'],
        maxLength: [150, 'Description cannot exceed 150 characters']
    },
    addressDetails: [{
        state: {
            type: String,
            required: true,
            trim: true
        },
        city: {
            type: String,
            required: true,
            trim: true
        },
        pinCode: {
            type: String,
            required: true,
            trim: true,
            match: [/^\d{6}$/, 'Please enter a valid 6-digit PIN code']
        },
        coordinates: {
            latitude: {
                type: Number,
                min: [-90, 'Latitude must be between -90 and 90'],
                max: [90, 'Latitude must be between -90 and 90']
            },
            longitude: {
                type: Number,
                min: [-180, 'Longitude must be between -180 and 180'],
                max: [180, 'Longitude must be between -180 and 180']
            }
        },
    }],


}, { timestamps: true });

const AllyProfileModel = mongoose.model('AllyProfile', AllyProfileSchema);
module.exports = AllyProfileModel;