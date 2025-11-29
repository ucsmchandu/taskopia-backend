const mongoose = require('mongoose')

const OwnerProfileSchema = new mongoose.Schema({
    firebaseUid: {
        type: String,
        required: true,
        unique:true
    },
    userProfilePhotoUrl: {
        type: String,
        required: true,
    },
    businessProfilePhotoUrl: {
        type: String,
        required: true
    },
    firstName: {
        type: String,
        required: true,
        trim: true,
        maxLength: [50, 'First name cannot exceed 50 characters'],
        minLength: [3, 'First name cannot less than 3 characters']
    },
    lastName: {
        type: String,
        required: true,
        trim: true,
        maxLength: [50, 'Last name cannot exceed 50 characters'],
    },
    businessName: {
        type: String,
        required: true,
        trim: true
    },
    phone: {
        type: String,
        required: true,
        trim: true,
        unique:true,
        trim:true,
        match: [/^(?:\+91)?[9876]\d{9}$/, 'Please enter valid phone number']
    },
    gmail: {
        type: String,
        required: true,
        trim: true,
        unique:true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter valid email ']
    },
    adminVerify: {
        type: Boolean,
        default: false,
    },
    rating: {
        average:{
            type:Number,
            min:0,
            max:5,
            default:0
        },
        count:{
            type:Number,
            default:0
        }
    },
    reviews:[{
        user:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'UserProfile'
        },
        comment:String,
        createdAt:{ type:Date,default:Date.now }
    }],
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
        address: {
            type: String,
            required: true,
            trim: true,
            minLength: [5, 'Address must be at least 5 characters']
        },
        landMark: {
            type: String,
            required: true,
            trim: true,
            maxLength: [100, 'Land mark cannot exceed 100 characters']
        }

    }],
    status: {
        type: String,
        enum: ['active', 'inactive', 'suspended', 'permanentlyBlocked'],
        default: 'active'
    },
    description: {
        type: String,
        required: true,
        minLength: [5, 'Description is at least 5 characters'],
        maxLength: [150, 'Description cannot exceed 150 characters']
    }
},{timestamps:true});

const OwnerUserProfile=mongoose.model('OwnerUserProfile',OwnerProfileSchema);
module.exports=OwnerUserProfile;
