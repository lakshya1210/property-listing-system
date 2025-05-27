# Property Listing Backend System

A robust backend system for managing property listings built with Node.js, Express, MongoDB, and Redis.

## Features

- **Property Management**
  - CRUD operations for properties
  - Support for both rental and sale properties
  - Property verification system
  - Rating and review system
  - Custom color themes for listings

- **Advanced Search & Filtering**
  - Filter by property type, price range, location
  - Search by amenities and features
  - Sort by various parameters
  - Pagination support

- **Performance Optimization**
  - Redis caching for improved response times
  - Cache invalidation on data updates
  - 1-hour cache expiration
  - Error handling for cache failures

- **User Management**
  - Authentication system
  - User favorites
  - Personalized recommendations
  - User roles and permissions

## Tech Stack

- Node.js
- Express.js
- MongoDB (Database)
- Redis (Caching)
- JSON Web Tokens (Authentication)

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- Redis
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd property-listing-backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/property-listing
REDIS_URL=redis://localhost:6379
JWT_SECRET=your_jwt_secret
```

4. Start the server:
```bash
npm start
```

## API Endpoints

### Properties

- `GET /api/properties` - Get all properties (with pagination)
- `GET /api/properties/:id` - Get a specific property
- `POST /api/properties` - Create a new property
- `PUT /api/properties/:id` - Update a property
- `DELETE /api/properties/:id` - Delete a property

### Search & Filter

- `GET /api/properties/search` - Search properties with filters
- `GET /api/properties/type/:type` - Get properties by type
- `GET /api/properties/location/:location` - Get properties by location

### User Management

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/users/favorites` - Get user's favorite properties
- `POST /api/users/favorites/:propertyId` - Add property to favorites

## Data Model

### Property Schema
```javascript
{
  title: String,
  type: String,
  price: Number,
  location: String,
  amenities: [String],
  isVerified: Boolean,
  rating: Number,
  colorTheme: String,
  // ... other fields
}
```

## Caching

The system uses Redis for caching with the following features:
- 1-hour cache expiration for property queries
- Automatic cache invalidation on data updates
- Fallback to database on cache miss
- Error handling for Redis connection issues

## Error Handling

The API implements comprehensive error handling for:
- Invalid requests
- Database operations
- Cache operations
- Authentication/Authorization
- Validation errors

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 