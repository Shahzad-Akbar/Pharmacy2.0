import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import connectMongoDB from './config/connectMongoDB.js';
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import productRoutes from './routes/product.routes.js';
import cartRoutes from './routes/cart.routes.js';
import prescriptionRoutes from './routes/prescription.routes.js';
import orderRoutes from './routes/order.routes.js';
import storeSettingsRoutes from './routes/storeSettings.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import inventoryRoutes from './routes/inventory.routes.js';
import { v2 as cloudinary } from 'cloudinary';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Update CORS for production
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'https://applemedical.in',
  'https://www.applemedical.in',
  'http://localhost:3000'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    
    const isAllowed = allowedOrigins.some(allowed => 
      allowed && origin.startsWith(allowed.replace(/\/$/, "")))
      || allowedOrigins.indexOf(origin) !== -1;

    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());

// Health Check Route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/store-settings', storeSettingsRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/inventory', inventoryRoutes);

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Connect DB & Start server
connectMongoDB();
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
