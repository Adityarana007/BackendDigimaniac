const express = require('express');
const router = express.Router();
const TimeEntry = require('../models/TimeEntry');
const User = require('../models/User');
const auth = require('../middlewares/authMiddleware');

// Clock In API
router.post('/clock-in', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { notes, location, deviceInfo } = req.body;

    // Check if user still exists
    const user = await User.findOne({ userId });
    if (!user) {
      return res.status(200).json({
        error: "User not found",
        statusCode: 200,
        success: false
      });
    }

    // Check if user is already clocked in
    const activeEntry = await TimeEntry.isUserClockedIn(userId);
    if (activeEntry) {
      return res.status(200).json({
        error: "You are already clocked in. Please clock out first.",
        statusCode: 200,
        success: false,
        activeEntry: {
          id: activeEntry._id,
          clockIn: activeEntry.clockIn,
          status: activeEntry.status
        }
      });
    }

    // Create new time entry (notes are optional)
    const timeEntry = new TimeEntry({
      userId: userId,
      clockIn: new Date(), // UTC timestamp
      notes: notes || null, // Optional field
      location: location || null,
      deviceInfo: {
        deviceId: deviceInfo?.deviceId || null,
        userAgent: req.headers['user-agent'] || null,
        ipAddress: req.ip || req.connection.remoteAddress || null
      }
    });

    await timeEntry.save();

    // Return success response
    return res.status(200).json({
      message: "Successfully clocked in",
      statusCode: 200,
      success: true,
      timeEntry: {
        id: timeEntry._id,
        userId: timeEntry.userId,
        clockIn: timeEntry.clockIn,
        status: timeEntry.status,
        notes: timeEntry.notes,
        location: timeEntry.location
      }
    });

  } catch (error) {
    console.error('Error in clock-in:', error);
    return res.status(200).json({
      error: "Internal server error",
      statusCode: 200,
      success: false
    });
  }
});

// Clock Out API
router.post('/clock-out', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { notes } = req.body;

    // Check if user still exists
    const user = await User.findOne({ userId });
    if (!user) {
      return res.status(200).json({
        error: "User not found",
        statusCode: 200,
        success: false
      });
    }

    // Find active time entry
    const activeEntry = await TimeEntry.getActiveEntry(userId);
    if (!activeEntry) {
      return res.status(200).json({
        error: "No active clock-in session found. Please clock in first.",
        statusCode: 200,
        success: false
      });
    }

    // Update time entry with clock out time (notes are optional)
    activeEntry.clockOut = new Date(); // UTC timestamp
    if (notes) {
      activeEntry.notes = activeEntry.notes ? `${activeEntry.notes}; ${notes}` : notes;
    }

    await activeEntry.save();

    // Return success response
    return res.status(200).json({
      message: "Successfully clocked out",
      statusCode: 200,
      success: true,
      timeEntry: {
        id: activeEntry._id,
        userId: activeEntry.userId,
        clockIn: activeEntry.clockIn,
        clockOut: activeEntry.clockOut,
        totalHours: activeEntry.totalHours,
        status: activeEntry.status,
        notes: activeEntry.notes
      }
    });

  } catch (error) {
    console.error('Error in clock-out:', error);
    return res.status(200).json({
      error: "Internal server error",
      statusCode: 200,
      success: false
    });
  }
});

// Get current status (clocked in or not)
router.get('/status', auth, async (req, res) => {
  try {
    const userId = req.user.userId;

    // Check if user still exists
    const user = await User.findOne({ userId });
    if (!user) {
      return res.status(200).json({
        error: "User not found",
        statusCode: 200,
        success: false
      });
    }

    // Get active time entry
    const activeEntry = await TimeEntry.getActiveEntry(userId);

    return res.status(200).json({
      statusCode: 200,
      success: true,
      isClockedIn: !!activeEntry,
      currentSession: activeEntry ? {
        id: activeEntry._id,
        clockIn: activeEntry.clockIn,
        notes: activeEntry.notes,
        location: activeEntry.location
      } : null
    });

  } catch (error) {
    console.error('Error getting status:', error);
    return res.status(200).json({
      error: "Internal server error",
      statusCode: 200,
      success: false
    });
  }
});

// Get time entries for a user (with optional date range)
router.get('/entries', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { startDate, endDate, limit = 50, page = 1 } = req.query;

    // Check if user still exists
    const user = await User.findOne({ userId });
    if (!user) {
      return res.status(200).json({
        error: "User not found",
        statusCode: 200,
        success: false
      });
    }

    // Build query
    let query = { userId: userId };
    
    if (startDate && endDate) {
      query.clockIn = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get time entries
    const timeEntries = await TimeEntry.find(query)
      .sort({ clockIn: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    // Get total count for pagination
    const totalCount = await TimeEntry.countDocuments(query);

    return res.status(200).json({
      statusCode: 200,
      success: true,
      timeEntries: timeEntries.map(entry => ({
        id: entry._id,
        userId: entry.userId,
        clockIn: entry.clockIn,
        clockOut: entry.clockOut,
        totalHours: entry.totalHours,
        status: entry.status,
        notes: entry.notes,
        location: entry.location,
        createdAt: entry.createdAt,
        updatedAt: entry.updatedAt
      })),
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / parseInt(limit)),
        totalCount: totalCount,
        limit: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Error getting time entries:', error);
    return res.status(200).json({
      error: "Internal server error",
      statusCode: 200,
      success: false
    });
  }
});

// Get today's time entry summary
router.get('/today', auth, async (req, res) => {
  try {
    const userId = req.user.userId;

    // Check if user still exists
    const user = await User.findOne({ userId });
    if (!user) {
      return res.status(200).json({
        error: "User not found",
        statusCode: 200,
        success: false
      });
    }

    // Get today's date range (UTC)
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);

    // Get today's entries
    const todayEntries = await TimeEntry.getUserEntries(userId, startOfDay, endOfDay);

    // Calculate summary
    const totalHours = todayEntries
      .filter(entry => entry.clockOut)
      .reduce((sum, entry) => sum + (entry.totalHours || 0), 0);

    const activeEntry = todayEntries.find(entry => entry.status === 'active');

    return res.status(200).json({
      statusCode: 200,
      success: true,
      summary: {
        date: startOfDay,
        totalEntries: todayEntries.length,
        totalHours: Math.round(totalHours * 100) / 100,
        isCurrentlyClockedIn: !!activeEntry,
        activeSession: activeEntry ? {
          id: activeEntry._id,
          clockIn: activeEntry.clockIn
        } : null
      },
      entries: todayEntries.map(entry => ({
        id: entry._id,
        clockIn: entry.clockIn,
        clockOut: entry.clockOut,
        totalHours: entry.totalHours,
        status: entry.status,
        notes: entry.notes
      }))
    });

  } catch (error) {
    console.error('Error getting today summary:', error);
    return res.status(200).json({
      error: "Internal server error",
      statusCode: 200,
      success: false
    });
  }
});

module.exports = router;
