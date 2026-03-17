const mongoose = require('mongoose');
const ContactInfo = require('../models/contactInfo.model');

// Get site contact information (create if not exists)
const getContactInfo = async (req, res) => {
  console.log('[contactInfo.controller.js] 📥 GET /api/contact-info - Request received');
  try {
    let contactInfo = await ContactInfo.findOne({ customId: 'site-contact-info' });
    console.log('[contactInfo.controller.js] 📤 GET - Found:', !!contactInfo);

    if (!contactInfo) {
      console.log('[contactInfo.controller.js] Creating default contact info');
      contactInfo = new ContactInfo({
        customId: 'site-contact-info',
        address: '123 E-commerce Street, New York, NY 10001',
        email: 'support@made4uu.com',
        phone: '+1 (555) 123-4567',
        hours: 'Mon - Fri: 9:00 AM - 6:00 PM\nSat - Sun: 10:00 AM - 4:00 PM'
      });
      await contactInfo.save();
      console.log('[contactInfo.controller.js] Default created and saved');
    }

    console.log('[contactInfo.controller.js] ✅ GET - Response sent:', contactInfo);
    res.json({
      success: true,
      data: contactInfo
    });
  } catch (error) {
    console.error('[contactInfo.controller.js] Get contact info error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Update site contact information
const updateContactInfo = async (req, res) => {
  console.log('[contactInfo.controller.js] 📥 PATCH /api/contact-info - Request received, body:', req.body);
  try {
    const { address, email, phone, hours } = req.body;

    console.log('[contactInfo.controller.js] Starting Mongo update...');
    const contactInfo = await ContactInfo.findOneAndUpdate(
      { customId: 'site-contact-info' },
      { 
        address, 
        email, 
        phone, 
        hours
      },
      { 
        new: true, 
        upsert: true, 
        runValidators: true 
      }
    );
    console.log('[contactInfo.controller.js] 📤 PATCH - Update result:', contactInfo);

    console.log('[contactInfo.controller.js] ✅ PATCH - Success response sent');
    res.json({
      success: true,
      message: 'Contact information updated successfully',
      data: contactInfo
    });
  } catch (error) {
    console.error('[contactInfo.controller.js] ❌ PATCH error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

module.exports = {
  getContactInfo,
  updateContactInfo
};

