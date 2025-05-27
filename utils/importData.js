const fs = require('fs');
const csv = require('csv-parser');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Property = require('../models/property');

// Load environment variables
dotenv.config();

async function importData() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/property-listing');
        console.log('Connected to MongoDB');

        const results = [];
        
        // Read CSV file
        await new Promise((resolve, reject) => {
            fs.createReadStream('db424fd9fb74_1748258398689.csv')
                .pipe(csv())
                .on('data', (data) => results.push(data))
                .on('end', resolve)
                .on('error', reject);
        });

        // Transform data and insert into MongoDB
        const properties = results.map(row => ({
            title: row.title,
            type: row.type,
            price: parseFloat(row.price),
            state: row.state,
            city: row.city,
            areaSqFt: parseFloat(row.areaSqFt),
            bedrooms: parseInt(row.bedrooms),
            bathrooms: parseInt(row.bathrooms),
            amenities: row.amenities ? row.amenities.split('|') : [],
            furnished: row.furnished,
            availableFrom: new Date(row.availableFrom),
            listedBy: row.listedBy,
            tags: row.tags ? row.tags.split('|') : [],
            colorTheme: row.colorTheme,
            rating: parseFloat(row.rating),
            isVerified: row.isVerified === 'True',
            listingType: row.listingType,
            createdBy: '6835f64d462dfc41a0617c8d' // Admin user ID
        }));

        // Insert properties into MongoDB
        await Property.insertMany(properties);
        console.log(`Successfully imported ${properties.length} properties`);

        // Close MongoDB connection
        await mongoose.connection.close();
        console.log('MongoDB connection closed');
    } catch (error) {
        console.error('Error importing data:', error);
        process.exit(1);
    }
}

// Run the import
importData();
