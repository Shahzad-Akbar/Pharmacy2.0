import Order from '../models/order.model.js';

// Create new order
export const createOrder = async (req, res) => {
    try {
        const { 
            items, 
            total, 
            shippingAddress, 
            paymentMethod,
            deliveryCharge,
            paymentScreenshot,
            prescription,
            notes,
            estimatedDeliveryDate 
        } = req.body;

        // Validate shipping address
        if (!shippingAddress.name || !shippingAddress.phone || !shippingAddress.address || 
            !shippingAddress.city || !shippingAddress.state || !shippingAddress.pincode) {
            return res.status(400).json({ error: "All shipping address fields are required" });
        }

        const order = new Order({
            user: req.user._id,
            items,
            total,
            shippingAddress,
            paymentMethod,
            deliveryCharge: deliveryCharge || 0,
            paymentScreenshot,
            prescription,
            notes,
            estimatedDeliveryDate
        });

        await order.save();
        res.status(201).json(order);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get all orders (admin)
export const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find()
            .populate('user', 'name email')
            .populate('items.product', 'name price image');
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get user orders
export const getUserOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id })
            .populate('items.product', 'name price image images');
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update order status
export const updateOrderStatus = async (req, res) => {
    try {
        const { status, tracking } = req.body;
        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { 
                status,
                tracking,
                actualDeliveryDate: status === 'delivered' ? new Date() : undefined
            },
            { new: true }
        );
        if (!order) {
            return res.status(404).json({ error: "Order not found" });
        }
        res.status(200).json(order);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update payment status
export const updatePaymentStatus = async (req, res) => {
    try {
        const { paymentStatus } = req.body;
        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { paymentStatus },
            { new: true }
        );
        if (!order) {
            return res.status(404).json({ error: "Order not found" });
        }
        res.status(200).json(order);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update order
export const updateOrder = async (req, res) => {
    try {
        const { 
            items, 
            total, 
            shippingAddress, 
            paymentMethod,
            deliveryCharge,
            notes,
            estimatedDeliveryDate 
        } = req.body;

        const order = await Order.findById(req.params.id);
        
        if (!order) {
            return res.status(404).json({ error: "Order not found" });
        }

        // Check if user owns the order or is admin
        if (order.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: "Not authorized" });
        }

        // Only allow updates if order is pending
        if (order.status !== 'pending' && order.status !== 'processing') {
            return res.status(400).json({ error: "Can only update pending orders" });
        }

        // Update order fields
        if (items) order.items = items;
        if (total) order.total = total;
        if (shippingAddress) order.shippingAddress = shippingAddress;
        if (paymentMethod) order.paymentMethod = paymentMethod;
        if (deliveryCharge !== undefined) order.deliveryCharge = deliveryCharge;
        if (notes) order.notes = notes;
        if (estimatedDeliveryDate) order.estimatedDeliveryDate = estimatedDeliveryDate;

        await order.save();
        await order.populate('items.product');
        
        res.status(200).json(order);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Cancel order
export const cancelOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        
        if (!order) {
            return res.status(404).json({ error: "Order not found" });
        }

        // Check if user owns the order or is admin
        if (order.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: "Not authorized" });
        }

        // Only allow cancellation if order is pending or processing
        if (!['pending', 'processing'].includes(order.status)) {
            return res.status(400).json({ error: "Cannot cancel order at this stage" });
        }

        order.status = 'cancelled';
        await order.save();
        
        res.status(200).json(order);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete order (admin only)
export const deleteOrder = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: "Access denied. Admin only." });
        }
        const orderId = req.params.id;
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ error: "Order not found" });
        }
        await Order.findByIdAndDelete(orderId);
        res.status(200).json({ message: "Order deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
