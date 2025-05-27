const express = require('express');
const mongoose = require('mongoose');
const redis = require('redis');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(express.json());

// Database connections
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

// Redis connection
const redisClient = redis.createClient({ url: process.env.REDIS_URL });

redisClient.on('connect', () => console.log('Redis connected'));
redisClient.on('error', err => console.error('Redis connection error:', err));

(async () => {
    await redisClient.connect();
})();

// Import routes
const propertyRoutes = require('./routes/properties');
const authRoutes = require('./routes/auth');
const favoriteRoutes = require('./routes/favorites');
const recommendationRoutes = require('./routes/recommendations');

// Use routes
app.use('/api/properties', propertyRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/recommendations', recommendationRoutes);

// Basic route
app.get('/', (req, res) => {
    res.send('Property Listing API');
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// Export both app and redisClient
module.exports = app;
module.exports.redisClient = redisClient; 