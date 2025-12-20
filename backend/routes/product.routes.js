import express from 'express';
import { 
    createProduct, 
    getProducts, 
    getProduct, 
    getPublicProduct,
    updateProduct, 
    deleteProduct 
} from '../controllers/product.controller.js';
import { protectRoute } from '../middleware/protectRoute.js';

const router = express.Router();

router.post('/create-product', protectRoute, createProduct);
router.get('/get-products', getProducts);
// Public endpoint for user product details (only published items)
router.get('/public/:id', getPublicProduct);
router.get('/:id', getProduct);
router.put('/:id', protectRoute, updateProduct);
router.delete('/:id', protectRoute, deleteProduct);

export default router;
