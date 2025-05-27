const express = require('express');
const auth = require('../middlewares/auth');
const Property = require('../models/property');
const router = express.Router();

// Add property to favorites
router.post('/:propertyId', auth, async (req, res) => {
    try {
        const property = await Property.findById(req.params.propertyId);
        
        if (!property) {
            return res.status(404).json({ error: 'Property not found' });
        }

        if (req.user.favorites.includes(property._id)) {
            return res.status(400).json({ error: 'Property already in favorites' });
        }

        req.user.favorites.push(property._id);
        await req.user.save();
        
        res.json(req.user.favorites);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get user's favorite properties
router.get('/', auth, async (req, res) => {
    try {
        await req.user.populate('favorites');
        res.json(req.user.favorites);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Remove property from favorites
router.delete('/:propertyId', auth, async (req, res) => {
    try {
        const propertyIndex = req.user.favorites.indexOf(req.params.propertyId);
        
        if (propertyIndex === -1) {
            return res.status(404).json({ error: 'Property not found in favorites' });
        }

        req.user.favorites.splice(propertyIndex, 1);
        await req.user.save();
        
        res.json(req.user.favorites);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router; 