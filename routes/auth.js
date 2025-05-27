const express = require('express');
const User = require('../models/user');
const auth = require('../middlewares/auth');
const router = express.Router();

// Register new user
router.post('/register', async (req, res) => {
    try {
        const user = new User(req.body);
        await user.save();
        const token = user.generateAuthToken();
        res.status(201).json({ user, token });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Login user
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        
        if (!user || !(await user.verifyPassword(password))) {
            throw new Error('Invalid login credentials');
        }

        const token = user.generateAuthToken();
        res.json({ user, token });
    } catch (error) {
        res.status(401).json({ error: error.message });
    }
});

// Get current user profile
router.get('/profile', auth, async (req, res) => {
    res.json(req.user);
});

// Update user profile
router.patch('/profile', auth, async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['name', 'email', 'password'];
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if (!isValidOperation) {
        return res.status(400).json({ error: 'Invalid updates!' });
    }

    try {
        updates.forEach(update => req.user[update] = req.body[update]);
        await req.user.save();
        res.json(req.user);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router; 