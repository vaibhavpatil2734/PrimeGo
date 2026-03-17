const mongoose = require('mongoose');

const contactInfoSchema = new mongoose.Schema({
  customId: {
    type: String,
    required: true,
    unique: true
  },
  address: {
    type: String,
    required: true,
    default: '123 E-commerce Street, New York, NY 10001'
  },
  email: {
    type: String,
    required: true,
    default: 'support@made4uu.com'
  },
  phone: {
    type: String,
    required: true,
    default: '+1 (555) 123-4567'
  },
  hours: {
    type: String,
    required: true,
    default: 'Mon - Fri: 9:00 AM - 6:00 PM\nSat - Sun: 10:00 AM - 4:00 PM'
  }
}, {
  timestamps: true
});

// Singleton pattern via customId
const ContactInfo = mongoose.models.ContactInfo || mongoose.model('ContactInfo', contactInfoSchema);

module.exports = ContactInfo;

