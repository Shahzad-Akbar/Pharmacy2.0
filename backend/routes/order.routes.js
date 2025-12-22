import express from 'express';
import { 
    createOrder,
    getAllOrders,
    getUserOrders,
    updateOrderStatus,
    updatePaymentStatus,
    updateOrder,
    cancelOrder,
    deleteOrder
} from '../controllers/order.controller.js';
import { protectRoute } from '../middleware/protectRoute.js';

const router = express.Router();

router.post('/create', protectRoute, createOrder);
router.get('/admin/all', protectRoute, getAllOrders);
router.get('/user', protectRoute, getUserOrders);
router.put('/:id/status', protectRoute, updateOrderStatus);
router.put('/:id/payment', protectRoute, updatePaymentStatus);
router.put('/:id', protectRoute, updateOrder);
router.put('/:id/cancel', protectRoute, cancelOrder);
router.delete('/:id', protectRoute, deleteOrder);

export default router;
