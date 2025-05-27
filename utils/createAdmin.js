const mongoose = require('mongoose');
const User = require('../models/user');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

async function createAdminUser() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/property-listing');
        console.log('Connected to MongoDB');

        // Create admin user
        const adminUser = new User({
            name: 'Admin User',
            email: 'admin@example.com',
            password: 'admin123',
            // You might want to add additional admin-specific fields here
        });

        await adminUser.save();
        console.log('Admin user created successfully');
        console.log('Admin ID:', adminUser._id.toString());
        console.log('Please copy this ID and update it in importData.js');

        await mongoose.connection.close();
        console.log('MongoDB connection closed');

    } catch (error) {
        console.error('Error creating admin user:', error);
        if (mongoose.connection.readyState === 1) {
            await mongoose.connection.close();
        }
        process.exit(1);
    }
}

// Run the script
createAdminUser(); 