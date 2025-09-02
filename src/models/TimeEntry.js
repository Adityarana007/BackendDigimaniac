const mongoose = require('mongoose');

const timeEntrySchema = new mongoose.Schema({
  userId: {
    type: Number,
    required: true,
    ref: 'User'
  },
  clockIn: {
    type: Date,
    required: true,
    default: Date.now
  },
  clockOut: {
    type: Date,
    default: null
  },
  totalHours: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['active', 'completed'],
    default: 'active'
  },
  notes: {
    type: String,
    maxlength: 500
  },
  location: {
    type: {
      latitude: Number,
      longitude: Number,
      address: String
    },
    default: null
  },
  deviceInfo: {
    type: {
      deviceId: String,
      userAgent: String,
      ipAddress: String
    },
    default: null
  }
}, {
  timestamps: true,
  // Add indexes for better query performance
  indexes: [
    { userId: 1, status: 1 },
    { userId: 1, clockIn: -1 },
    { status: 1 }
  ]
});

// Virtual for calculating duration
timeEntrySchema.virtual('duration').get(function() {
  if (!this.clockOut) return null;
  return this.clockOut - this.clockIn;
});

// Method to check if user is currently clocked in
timeEntrySchema.statics.isUserClockedIn = async function(userId) {
  const activeEntry = await this.findOne({
    userId: userId,
    status: 'active',
    clockOut: null
  });
  return activeEntry;
};

// Method to get user's active time entry
timeEntrySchema.statics.getActiveEntry = async function(userId) {
  return await this.findOne({
    userId: userId,
    status: 'active',
    clockOut: null
  });
};

// Method to get user's time entries for a date range
timeEntrySchema.statics.getUserEntries = async function(userId, startDate, endDate) {
  return await this.find({
    userId: userId,
    clockIn: {
      $gte: startDate,
      $lte: endDate
    }
  }).sort({ clockIn: -1 });
};

// Pre-save middleware to calculate total hours when clocking out
timeEntrySchema.pre('save', function(next) {
  if (this.clockOut && this.isModified('clockOut')) {
    const durationMs = this.clockOut - this.clockIn;
    this.totalHours = Math.round((durationMs / (1000 * 60 * 60)) * 100) / 100; // Round to 2 decimal places
    this.status = 'completed';
  }
  next();
});

module.exports = mongoose.model('TimeEntry', timeEntrySchema);
