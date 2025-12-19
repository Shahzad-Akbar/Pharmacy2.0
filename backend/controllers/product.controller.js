import Product from '../models/product.model.js';
import { v2 as cloudinary } from "cloudinary";

// Create new product
export const createProduct = async (req, res) => {
    try {
        const { name, description, mrp, price, category, discount, stock, requiresPrescription, manufacturer, expiryDate, composition } = req.body;
        let { images } = req.body; // Changed from image to images

        let uploadedImageUrls = [];
        if (images && images.length > 0) {
			for (const image of images) {
				const uploadedResponse = await cloudinary.uploader.upload(image);
				uploadedImageUrls.push(uploadedResponse.secure_url);
			}
		}

        const newProduct = new Product({
            name,
            description,
            price,
            mrp,
            category,
            images: uploadedImageUrls, // Save array of URLs
            composition,
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
        const { category, search, minPrice, maxPrice, published } = req.query;
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
        if (published === 'true') {
            query.isPublished = true;
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

// Get single product for public (user-facing) detail page
// Only returns the product if it is published
export const getPublicProduct = async (req, res) => {
    try {
        const product = await Product.findOne({ _id: req.params.id, isPublished: true });
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

        const { images, ...rest } = req.body;
        let updatedImages = product.images;

        if (images && Array.isArray(images)) {
            // This is a simple update logic. You might want to implement a more
            // sophisticated one (e.g., deleting old images from Cloudinary).
            const uploadedImageUrls = [];
            for (const image of images) {
                // Check if it's a new base64 image to upload or an existing URL
                if (image.startsWith('data:image')) {
                    const uploadResponse = await cloudinary.uploader.upload(image);
                    uploadedImageUrls.push(uploadResponse.secure_url);
                } else {
                    uploadedImageUrls.push(image); // Keep existing URL
                }
            }
            updatedImages = uploadedImageUrls;
        }

        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            { ...rest, images: updatedImages },
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
