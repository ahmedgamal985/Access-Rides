const express = require('express');
const router = express.Router();

// Mock data for demonstration
let rides = [
  {
    id: 'ride_1',
    passengerId: 'user_1',
    driverId: 'driver_1',
    pickupLocation: '123 Main Street, Downtown',
    destination: '456 Oak Avenue, Uptown',
    status: 'completed',
    fare: 15.50,
    rideType: 'access-rides',
    specialRequirements: ['wheelchair_accessible', 'voice_guidance'],
    createdAt: new Date('2024-01-15T10:30:00Z'),
    completedAt: new Date('2024-01-15T11:00:00Z'),
  },
  {
    id: 'ride_2',
    passengerId: 'user_2',
    driverId: 'driver_2',
    pickupLocation: '789 Pine Road, Midtown',
    destination: '321 Elm Street, Suburbs',
    status: 'in_progress',
    fare: 22.75,
    rideType: 'access-rides',
    specialRequirements: ['sign_language_support'],
    createdAt: new Date(),
    estimatedArrival: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes from now
  }
];

let drivers = [
  {
    id: 'driver_1',
    name: 'Ahmed Hassan',
    phone: '+1234567890',
    rating: 4.8,
    totalRides: 1250,
    vehicle: {
      make: 'Toyota',
      model: 'Camry',
      year: 2022,
      color: 'Silver',
      plateNumber: 'ABC-123',
      accessibilityFeatures: ['wheelchair_ramp', 'voice_guidance', 'sign_language_support']
    },
    location: {
      latitude: 40.7128,
      longitude: -74.0060,
      lastUpdated: new Date()
    },
    isAvailable: true,
    languages: ['English', 'Arabic', 'Sign Language'],
  },
  {
    id: 'driver_2',
    name: 'Sarah Johnson',
    phone: '+1234567891',
    rating: 4.9,
    totalRides: 890,
    vehicle: {
      make: 'Honda',
      model: 'Accord',
      year: 2021,
      color: 'Blue',
      plateNumber: 'XYZ-789',
      accessibilityFeatures: ['wheelchair_ramp', 'voice_guidance']
    },
    location: {
      latitude: 40.7589,
      longitude: -73.9851,
      lastUpdated: new Date()
    },
    isAvailable: true,
    languages: ['English', 'Spanish', 'Sign Language'],
  }
];

// Book a new ride
router.post('/book', async (req, res) => {
  try {
    const {
      passengerId,
      pickupLocation,
      destination,
      fare,
      rideType = 'access-rides',
      specialRequirements = [],
      estimatedFare
    } = req.body;

    // Validate required fields
    if (!passengerId || !pickupLocation || !destination) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'passengerId, pickupLocation, and destination are required'
      });
    }

    // Find available driver
    const availableDriver = drivers.find(driver => 
      driver.isAvailable && 
      driver.vehicle.accessibilityFeatures.some(feature => 
        specialRequirements.includes(feature)
      )
    );

    if (!availableDriver) {
      return res.status(404).json({
        error: 'No available drivers',
        message: 'No drivers available with the required accessibility features'
      });
    }

    // Create new ride
    const newRide = {
      id: `ride_${Date.now()}`,
      passengerId,
      driverId: availableDriver.id,
      pickupLocation,
      destination,
      status: 'requested',
      fare: estimatedFare || fare || 0,
      rideType,
      specialRequirements,
      createdAt: new Date(),
      estimatedArrival: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes from now
    };

    rides.push(newRide);

    // Update driver availability
    availableDriver.isAvailable = false;

    res.status(201).json({
      success: true,
      ride: newRide,
      driver: {
        id: availableDriver.id,
        name: availableDriver.name,
        rating: availableDriver.rating,
        vehicle: availableDriver.vehicle,
        estimatedArrival: newRide.estimatedArrival,
        languages: availableDriver.languages
      }
    });

  } catch (error) {
    console.error('Error booking ride:', error);
    res.status(500).json({
      error: 'Failed to book ride',
      message: error.message
    });
  }
});

// Get ride status
router.get('/:rideId/status', async (req, res) => {
  try {
    const { rideId } = req.params;
    const ride = rides.find(r => r.id === rideId);

    if (!ride) {
      return res.status(404).json({
        error: 'Ride not found',
        message: 'The specified ride does not exist'
      });
    }

    const driver = drivers.find(d => d.id === ride.driverId);

    res.json({
      success: true,
      ride: {
        ...ride,
        driver: driver ? {
          name: driver.name,
          phone: driver.phone,
          rating: driver.rating,
          vehicle: driver.vehicle,
          location: driver.location
        } : null
      }
    });

  } catch (error) {
    console.error('Error getting ride status:', error);
    res.status(500).json({
      error: 'Failed to get ride status',
      message: error.message
    });
  }
});

// Update ride status
router.patch('/:rideId/status', async (req, res) => {
  try {
    const { rideId } = req.params;
    const { status, location } = req.body;

    const ride = rides.find(r => r.id === rideId);
    if (!ride) {
      return res.status(404).json({
        error: 'Ride not found',
        message: 'The specified ride does not exist'
      });
    }

    // Update ride status
    ride.status = status;
    ride.updatedAt = new Date();

    // Update driver location if provided
    if (location && ride.driverId) {
      const driver = drivers.find(d => d.id === ride.driverId);
      if (driver) {
        driver.location = {
          ...location,
          lastUpdated: new Date()
        };
      }
    }

    // Handle status-specific logic
    if (status === 'completed') {
      ride.completedAt = new Date();
      const driver = drivers.find(d => d.id === ride.driverId);
      if (driver) {
        driver.isAvailable = true;
      }
    }

    res.json({
      success: true,
      ride: ride
    });

  } catch (error) {
    console.error('Error updating ride status:', error);
    res.status(500).json({
      error: 'Failed to update ride status',
      message: error.message
    });
  }
});

// Cancel ride
router.post('/:rideId/cancel', async (req, res) => {
  try {
    const { rideId } = req.params;
    const { reason } = req.body;

    const ride = rides.find(r => r.id === rideId);
    if (!ride) {
      return res.status(404).json({
        error: 'Ride not found',
        message: 'The specified ride does not exist'
      });
    }

    if (ride.status === 'completed' || ride.status === 'cancelled') {
      return res.status(400).json({
        error: 'Cannot cancel ride',
        message: `Ride is already ${ride.status}`
      });
    }

    // Update ride status
    ride.status = 'cancelled';
    ride.cancelledAt = new Date();
    ride.cancellationReason = reason;

    // Make driver available again
    const driver = drivers.find(d => d.id === ride.driverId);
    if (driver) {
      driver.isAvailable = true;
    }

    res.json({
      success: true,
      ride: ride
    });

  } catch (error) {
    console.error('Error cancelling ride:', error);
    res.status(500).json({
      error: 'Failed to cancel ride',
      message: error.message
    });
  }
});

// Get user's ride history
router.get('/user/:userId/history', async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 10, offset = 0 } = req.query;

    const userRides = rides
      .filter(ride => ride.passengerId === userId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(offset, offset + parseInt(limit));

    res.json({
      success: true,
      rides: userRides,
      total: rides.filter(ride => ride.passengerId === userId).length,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

  } catch (error) {
    console.error('Error getting ride history:', error);
    res.status(500).json({
      error: 'Failed to get ride history',
      message: error.message
    });
  }
});

// Get nearby drivers
router.get('/drivers/nearby', async (req, res) => {
  try {
    const { latitude, longitude, radius = 5000 } = req.query; // radius in meters

    if (!latitude || !longitude) {
      return res.status(400).json({
        error: 'Missing coordinates',
        message: 'latitude and longitude are required'
      });
    }

    const userLat = parseFloat(latitude);
    const userLng = parseFloat(longitude);
    const searchRadius = parseInt(radius);

    // Calculate distance between two points (simplified)
    const calculateDistance = (lat1, lng1, lat2, lng2) => {
      const R = 6371000; // Earth's radius in meters
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLng = (lng2 - lng1) * Math.PI / 180;
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLng/2) * Math.sin(dLng/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      return R * c;
    };

    const nearbyDrivers = drivers
      .filter(driver => driver.isAvailable)
      .map(driver => {
        const distance = calculateDistance(
          userLat, userLng,
          driver.location.latitude, driver.location.longitude
        );
        return { ...driver, distance };
      })
      .filter(driver => driver.distance <= searchRadius)
      .sort((a, b) => a.distance - b.distance);

    res.json({
      success: true,
      drivers: nearbyDrivers,
      count: nearbyDrivers.length
    });

  } catch (error) {
    console.error('Error getting nearby drivers:', error);
    res.status(500).json({
      error: 'Failed to get nearby drivers',
      message: error.message
    });
  }
});

// Rate a completed ride
router.post('/:rideId/rate', async (req, res) => {
  try {
    const { rideId } = req.params;
    const { rating, feedback } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        error: 'Invalid rating',
        message: 'Rating must be between 1 and 5'
      });
    }

    const ride = rides.find(r => r.id === rideId);
    if (!ride) {
      return res.status(404).json({
        error: 'Ride not found',
        message: 'The specified ride does not exist'
      });
    }

    if (ride.status !== 'completed') {
      return res.status(400).json({
        error: 'Cannot rate ride',
        message: 'Can only rate completed rides'
      });
    }

    // Update ride with rating
    ride.rating = rating;
    ride.feedback = feedback;
    ride.ratedAt = new Date();

    // Update driver's average rating
    const driver = drivers.find(d => d.id === ride.driverId);
    if (driver) {
      const driverRides = rides.filter(r => r.driverId === driver.id && r.rating);
      const totalRating = driverRides.reduce((sum, r) => sum + r.rating, 0);
      driver.rating = totalRating / driverRides.length;
    }

    res.json({
      success: true,
      ride: ride
    });

  } catch (error) {
    console.error('Error rating ride:', error);
    res.status(500).json({
      error: 'Failed to rate ride',
      message: error.message
    });
  }
});

module.exports = router;

