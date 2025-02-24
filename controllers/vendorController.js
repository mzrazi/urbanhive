
// controllers/vendorController.js
const Vendor = require("../models/Vendor");
const Product = require("../models/Product");
const Order = require("../models/Order");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Vendor Registration
const registerVendor = async (req, res) => {
    try {
        const { name, email, password, phone, storeName, storeAddress } = req.body;
        const existingVendor = await Vendor.findOne({ email });
        if (existingVendor) return res.status(400).json({ message: "Vendor already exists" });

        const hashedPassword = await bcrypt.hash(password, 10);
        const newVendor = new Vendor({ name, email, password: hashedPassword, phone, storeName, storeAddress });
        await newVendor.save();

        res.status(201).json({ message: "Vendor registered successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

// Vendor Login
const loginVendor = async (req, res) => {
    try {
        const { email, password } = req.body;
        const vendor = await Vendor.findOne({ email });
        if (!vendor) return res.status(404).json({ message: "Vendor not found" });

        const isMatch = await bcrypt.compare(password, vendor.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

        const token = jwt.sign({ id: vendor._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
        res.json({ token, vendor });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

// Update Store Details
const updateStoreDetails = async (req, res) => {
    try {
        const vendor = await Vendor.findByIdAndUpdate(req.user.id, req.body, { new: true });
        res.json({ message: "Store details updated", vendor });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

// Add Product
const addProduct = async (req, res) => {
    try {
        const { name, price, description, stock } = req.body;
        const newProduct = new Product({ name, price, description, stock, vendor: req.user.id });
        await newProduct.save();
        res.status(201).json({ message: "Product added", product: newProduct });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

// Get Vendor Products
const getVendorProducts = async (req, res) => {
    try {
        const products = await Product.find({ vendor: req.user.id });
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

// Update Product
const updateProduct = async (req, res) => {
    try {
        const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json({ message: "Product updated", product: updatedProduct });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

// Delete Product
const deleteProduct = async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.json({ message: "Product deleted" });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

// Get Vendor Orders
const getVendorOrders = async (req, res) => {
    try {
        const orders = await Order.find({ vendor: req.user.id }).populate("products");
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

// Update Order Status
const updateOrderStatus = async (req, res) => {
    try {
        const updatedOrder = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json({ message: "Order status updated", order: updatedOrder });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

module.exports = { registerVendor, loginVendor, updateStoreDetails, addProduct, getVendorProducts, updateProduct, deleteProduct, getVendorOrders, updateOrderStatus };
