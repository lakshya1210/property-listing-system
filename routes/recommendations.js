const express = require('express');
const auth = require('../middlewares/auth');
const User = require('../models/user');
const Property = require('../models/property');
const router = express.Router();

// Recommend a property to another user
router.post('/', auth, async (req, res) => {
    try {
        const { recipientEmail, propertyId } = req.body;

        // Validate input
        if (!recipientEmail || !propertyId) {
            return res.status(400).json({ error: 'Email and property ID are required' });
        }

        // Find recipient
        const recipient = await User.findOne({ email: recipientEmail });
        if (!recipient) {
            return res.status(404).json({ error: 'Recipient not found' });
        }

        // Check if property exists
        const property = await Property.findById(propertyId);
        if (!property) {
            return res.status(404).json({ error: 'Property not found' });
        }

        // Check if recommendation already exists
        const existingRecommendation = recipient.recommendationsReceived.find(
            rec => rec.property.toString() === propertyId && rec.from.toString() === req.user._id.toString()
        );

        if (existingRecommendation) {
            return res.status(400).json({ error: 'You have already recommended this property to this user' });
        }

        // Add recommendation
        recipient.recommendationsReceived.push({
            property: propertyId,
            from: req.user._id,
            date: new Date()
        });

        await recipient.save();
        res.status(201).json({ message: 'Recommendation sent successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get recommendations received by the current user
router.get('/received', auth, async (req, res) => {
    try {
        await req.user.populate({
            path: 'recommendationsReceived',
            populate: [
                { path: 'property' },
                { path: 'from', select: 'name email' }
            ]
        });
        
        res.json(req.user.recommendationsReceived);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete a received recommendation
router.delete('/received/:recommendationId', auth, async (req, res) => {
    try {
        const recommendationIndex = req.user.recommendationsReceived.findIndex(
            rec => rec._id.toString() === req.params.recommendationId
        );

        if (recommendationIndex === -1) {
            return res.status(404).json({ error: 'Recommendation not found' });
        }

        req.user.recommendationsReceived.splice(recommendationIndex, 1);
        await req.user.save();
        
        res.json({ message: 'Recommendation deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router; 