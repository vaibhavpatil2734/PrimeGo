const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary with API keys from .env
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Log Cloudinary configuration status (without exposing secrets)
const isCloudinaryConfigured = () => {
  return !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);
};

if (!isCloudinaryConfigured()) {
  console.warn('⚠️  Cloudinary credentials are not properly configured!');
  console.warn('Please ensure CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET are set in .env');
} else {
  console.log('✅ Cloudinary configured successfully');
}

// Create Cloudinary storage engine for Multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'made4uu/products',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [{ width: 1200, height: 1200, crop: 'limit', quality: 'auto' }],
    public_id: (req, file) => {
      // Generate unique public_id using timestamp and original filename
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      return `${file.fieldname}-${uniqueSuffix}`;
    }
  }
});

// Custom file filter for images
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.'), false);
  }
};

// Create multer upload middleware
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 2 * 1024 * 1024 // 2MB limit
  },
  fileFilter: fileFilter
});

// Export a function to test Cloudinary connection
const testCloudinaryConnection = async () => {
  try {
    const result = await cloudinary.api.ping();
    console.log('Cloudinary API ping successful:', result);
    return { success: true, result };
  } catch (error) {
    console.error('Cloudinary API ping failed:', error);
    return { success: false, error };
  }
};

module.exports = {
  cloudinary,
  upload,
  isCloudinaryConfigured,
  testCloudinaryConnection
};
