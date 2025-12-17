import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  mrp: { type: Number, required: true, default: 0 }, 
  category: { type: String, required: true },
  image: {type: String, required: true},
  discount: {type: Number, default: 0},
  stock: { type: Number, default: 0 },
  isPublished: { type: Boolean, default: false },
  requiresPrescription: { type: Boolean, default: false },
  manufacturer: String,
  expiryDate: Date
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);

export default Product;