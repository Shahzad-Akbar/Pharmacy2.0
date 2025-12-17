import Product from '../models/product.model.js';
import { v2 as cloudinary } from "cloudinary";

// Create new product
export const createProduct = async (req, res) => {
    try {
        const { name, description, mrp, price, category, discount, stock, requiresPrescription, manufacturer, expiryDate } = req.body;
        let { image } = req.body;

        if (image) {
			const uploadedResponse = await cloudinary.uploader.upload(image);
			image = uploadedResponse.secure_url;
		}

        const newProduct = new Product({
            name,
            description,
            price,
            mrp,
            category,
            image,
            discount,
            stock,
            requiresPrescription,
            manufacturer,
            expiryDate,
        });

        const savedProduct = await newProduct.save();
        res.status(201).json(savedProduct);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get all products
export const getProducts = async (req, res) => {
    try {
        const { category, search, minPrice, maxPrice } = req.query;
        let query = {};

        // if(!category && !search && !minPrice && !maxPrice){
        //     return res.status(401).json({message: "Please provide some valid filter like category, search, minPrice, maxPrice"});
        // }

        if (category) query.category = category;
        if (search) query.name = { $regex: search, $options: 'i' };
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = minPrice;
            if (maxPrice) query.price.$lte = maxPrice;
        }

        const products = await Product.find(query);
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get single product
export const getProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ error: "Product not found" });
        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update product
export const updateProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ error: "Product not found" });

        let {image} = req.body;
        if (req.body.image && req.body.image !== product.image) {
            const uploadResponse = await cloudinary.uploader.upload(req.body.image);
            image = uploadResponse.secure_url;
        }

        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            { ...req.body, image },
            { new: true }
        );

        res.status(200).json(updatedProduct);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete product
export const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ error: "Product not found" });

        await Product.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Product deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};