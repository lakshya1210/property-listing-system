const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    type: {
        type: String,
        required: true,
        enum: ['Apartment', 'Villa', 'Bungalow', 'Penthouse', 'Studio']
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    state: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    areaSqFt: {
        type: Number,
        required: true,
        min: 0
    },
    bedrooms: {
        type: Number,
        required: true,
        min: 0
    },
    bathrooms: {
        type: Number,
        required: true,
        min: 0
    },
    amenities: [{
        type: String,
        trim: true
    }],
    furnished: {
        type: String,
        enum: ['Furnished', 'Semi', 'Unfurnished'],
        required: true
    },
    availableFrom: {
        type: Date,
        required: true
    },
    listedBy: {
        type: String,
        required: true,
        enum: ['Owner', 'Agent', 'Builder']
    },
    tags: [{
        type: String,
        trim: true
    }],
    colorTheme: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 0,
        max: 5
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    listingType: {
        type: String,
        required: true,
        enum: ['rent', 'sale']
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

// Add indexes for common search fields
propertySchema.index({ type: 1, city: 1, listingType: 1 });
propertySchema.index({ price: 1 });
propertySchema.index({ areaSqFt: 1 });
propertySchema.index({ bedrooms: 1 });
propertySchema.index({ bathrooms: 1 });
propertySchema.index({ 'amenities': 1 });
propertySchema.index({ 'tags': 1 });

const Property = mongoose.model('Property', propertySchema);

module.exports = Property; 