
// controllers/vendorController.js
const Vendor = require("../models/Vendor");
const Product = require("../models/Product");
const Order = require("../models/Order");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const User = require('../models/User');

const uploadDir = path.join(__dirname, "../public/uploads");
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
      cb(null, uploadDir); // Save images to /public/uploads
  },
  filename: (req, file, cb) => {
      cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
  },
});

const upload = multer({ storage });


// Vendor Registration
// Vendor Registration
const registerVendor = async (req, res) => {
    try {
      const { name, email, password, phone, storeName, storeAddress, latitude, longitude, category } = req.body;
  
    
  
      const existingVendor = await Vendor.findOne({ email });
      if (existingVendor) return res.status(400).json({ message: "Vendor already exists" });
  
      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);
  
      // Create new vendor object
      const newVendor = new Vendor({
        name,
        email,
        password: hashedPassword,
        phone,
        storeName,
        storeAddress,
        category, // Add category here
        location: {
          type: "Point", // GeoJSON format
          coordinates: [longitude, latitude], // [longitude, latitude]
        },
      });
  
      await newVendor.save();
  
      res.status(201).json({ message: "Vendor registered successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  };
  
  


// Vendor Login
const loginVendor = async (req, res) => {
    try {
      const { email, password } = req.body;
  
      // Find the vendor by email
      const vendor = await Vendor.findOne({ email });
      if (!vendor) {
        return res.status(404).json({ message: "Vendor not found" });
      }
  
      // Check if the vendor is approved
      if (!vendor.approvedByAdmin) {
        return res.status(403).json({ message: "Your account is pending approval. Please contact the admin." });
      }
  
      // Check if the password is correct
      const isMatch = await bcrypt.compare(password, vendor.password);
      if (!isMatch) {
        return res.status(400).json({ message: "Invalid credentials" });
      }
  
      // Generate a JWT token
      const token = jwt.sign({ id: vendor._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
  
      // Return the token and vendor details
      res.json({ token, user: { ...vendor.toObject(), userType: 'vendor' } });
    } catch (error) {
      console.error("Login error:", error);
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
      const { name, price, description,category,id } = req.body;

      // Check if an image is uploaded
      let imageUrl = "";
      if (req.file) {
          imageUrl = `/uploads/${req.file.filename}`; // Save relative path
      }

      // Create product with image URL
      const newProduct = new Product({ 
          name, 
          price, 
          category,
          description, 
          vendor: id, 
          image: imageUrl 
      });

      await newProduct.save();
      res.status(201).json({ message: "Product added", product: newProduct });

  } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
  }
};
const uploadImageMiddleware = upload.single("image");


// Get Vendor Products (with query param)
const getVendorProducts = async (req, res) => {
  try {
    const { vendorId } = req.params; // Extract vendor ID from query params

    if (!vendorId) {
      return res.status(400).json({ error: "Vendor ID is required" });
    }

    // Check if the vendor exists
    const vendorExists = await Vendor.findById(vendorId);
    if (!vendorExists) {
      return res.status(404).json({ error: "Vendor not found" });
    }

    // Fetch products for the vendor
    const products = await Product.find({ vendor: vendorId });

    res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching vendor products:", error);
    res.status(500).json({ error: "Internal server error" });
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

const getproduct = async(req,res)=>{
  try {

    const product=await Product.findById(req.params.productId);
    res.json({ message: "product fetched", product });
    
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
}
const getVendorStats = async (req, res) => {
  try {
    const { vendorId } = req.params;

    // 1. Find vendor by ID
    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      return res.status(404).json({ error: 'Vendor not found' });
    }

    // 2. Get the total number of orders for the vendor
    const totalOrders = await Order.countDocuments({ vendor: vendorId });

    // 3. Get the total number of products for the vendor
    const totalProducts = await Product.countDocuments({ vendor: vendorId });

    // 4. Get the total number of users on the platform
    const totalUsers = await User.countDocuments();

    // 5. Calculate total revenue for the vendor (sum of all amounts in the orders)
    const orders = await Order.find({ vendor: vendorId });
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);

    // 6. Calculate the average rating for the vendor
    const ratedOrders = orders.filter(order => order.rating > 0);  // Filter orders that have a rating
    const totalRating = ratedOrders.reduce((sum, order) => sum + order.rating, 0);
    const averageRating = ratedOrders.length > 0 ? totalRating / ratedOrders.length : 0;

    // Return the vendor stats as a response
    return res.status(200).json({
      totalOrders,
      totalProducts,
      totalUsers,
      totalRevenue,
      averageRating
    });
  } catch (error) {
    console.error('Error fetching vendor stats:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

 

module.exports = {getVendorStats, getproduct,uploadImageMiddleware , registerVendor, loginVendor, updateStoreDetails, addProduct, getVendorProducts, updateProduct, deleteProduct, getVendorOrders, updateOrderStatus };
