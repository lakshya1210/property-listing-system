const express = require('express');
const Property = require('../models/property');
const auth = require('../middlewares/auth');
const app = require('../app');
const router = express.Router();

// Cache middleware
const cacheProperties = async (req, res, next) => {
    try {
        if (!app.redisClient) {
            return next();
        }

        const cacheKey = `properties:${JSON.stringify(req.query)}`;
        const cachedData = await app.redisClient.get(cacheKey);
        
        if (cachedData) {
            res.json(JSON.parse(cachedData));
            return;
        }
        
        req.cacheKey = cacheKey;
        next();
    } catch (error) {
        // If Redis fails, continue without caching
        next();
    }
};

// Create property
router.post('/', auth, async (req, res) => {
    try {
        const property = new Property({
            ...req.body,
            createdBy: req.user._id
        });
        await property.save();
        res.status(201).json(property);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get all properties with filtering
router.get('/', cacheProperties, async (req, res) => {
    try {
        const query = {};
        const sort = {};

        // Type filter
        if (req.query.type) {
            query.type = req.query.type;
        }

        // Price range
        if (req.query.minPrice || req.query.maxPrice) {
            query.price = {};
            if (req.query.minPrice) query.price.$gte = Number(req.query.minPrice);
            if (req.query.maxPrice) query.price.$lte = Number(req.query.maxPrice);
        }

        // Location filters
        if (req.query.city) query.city = new RegExp(req.query.city, 'i');
        if (req.query.state) query.state = new RegExp(req.query.state, 'i');

        // Bedrooms and bathrooms
        if (req.query.bedrooms) query.bedrooms = Number(req.query.bedrooms);
        if (req.query.bathrooms) query.bathrooms = Number(req.query.bathrooms);

        // Area range
        if (req.query.minArea || req.query.maxArea) {
            query.areaSqFt = {};
            if (req.query.minArea) query.areaSqFt.$gte = Number(req.query.minArea);
            if (req.query.maxArea) query.areaSqFt.$lte = Number(req.query.maxArea);
        }

        // Furnished status
        if (req.query.furnished) {
            query.furnished = req.query.furnished;
        }

        // Listing type (rent/sale)
        if (req.query.listingType) {
            query.listingType = req.query.listingType;
        }

        // Rating range
        if (req.query.minRating) {
            query.rating = { $gte: Number(req.query.minRating) };
        }

        // Amenities filter
        if (req.query.amenities) {
            const amenitiesList = req.query.amenities.split(',');
            query.amenities = { $all: amenitiesList };
        }

        // Tags filter
        if (req.query.tags) {
            const tagsList = req.query.tags.split(',');
            query.tags = { $all: tagsList };
        }

        // Sorting
        if (req.query.sortBy) {
            const parts = req.query.sortBy.split(':');
            sort[parts[0]] = parts[1] === 'desc' ? -1 : 1;
        } else {
            // Default sort by createdAt
            sort.createdAt = -1;
        }

        // Pagination
        const limit = parseInt(req.query.limit) || 10;
        const skip = parseInt(req.query.skip) || 0;

        const properties = await Property.find(query)
            .sort(sort)
            .limit(limit)
            .skip(skip)
            .populate('createdBy', 'name email');

        // Cache results if Redis is available
        if (app.redisClient && req.cacheKey) {
            await app.redisClient.set(req.cacheKey, JSON.stringify(properties), {
                EX: 3600 // Cache for 1 hour
            });
        }

        res.json(properties);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get property by ID
router.get('/:id', async (req, res) => {
    try {
        const property = await Property.findById(req.params.id)
            .populate('createdBy', 'name email');
        
        if (!property) {
            return res.status(404).json({ error: 'Property not found' });
        }
        
        res.json(property);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update property
router.patch('/:id', auth, async (req, res) => {
    try {
        const property = await Property.findOne({
            _id: req.params.id,
            createdBy: req.user._id
        });

        if (!property) {
            return res.status(404).json({ error: 'Property not found or unauthorized' });
        }

        const updates = Object.keys(req.body);
        const allowedUpdates = [
            'title', 'type', 'price', 'state', 'city', 'areaSqFt',
            'bedrooms', 'bathrooms', 'amenities', 'furnished',
            'availableFrom', 'tags', 'rating', 'listingType'
        ];
        
        const isValidOperation = updates.every(update => allowedUpdates.includes(update));

        if (!isValidOperation) {
            return res.status(400).json({ error: 'Invalid updates!' });
        }

        updates.forEach(update => property[update] = req.body[update]);
        await property.save();
        
        // Invalidate cache if Redis is available
        if (app.redisClient) {
            await app.redisClient.del('properties:*');
        }
        
        res.json(property);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Delete property
router.delete('/:id', auth, async (req, res) => {
    try {
        const property = await Property.findOneAndDelete({
            _id: req.params.id,
            createdBy: req.user._id
        });

        if (!property) {
            return res.status(404).json({ error: 'Property not found or unauthorized' });
        }

        // Invalidate cache if Redis is available
        if (app.redisClient) {
            await app.redisClient.del('properties:*');
        }

        res.json(property);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router; 