const User = require('../models/User');
const Order = require('../models/Order');
const Product = require('../models/Product');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Vendor = require("../models/Vendor");



const registerUser = async (req, res) => {
    try {
      const { name, email, password, phone, address } = req.body; // Add additional fields
  
      // Check if user already exists
      const userExists = await User.findOne({ email });
      if (userExists) return res.status(400).json({ message: 'User already exists' });
  
      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);
  
      // Create new user with all fields
      const user = new User({ 
        name, 
        email, 
        password: hashedPassword, 
        phone, 
        address 
      });
  
      await user.save();
  
      res.status(201).json({ message: 'User registered successfully', user });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  };
  
// Login User
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    
    

    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

   
 const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.json({ token, user: { message:'login success',id: user._id, name: user.name, email: user.email,userType:'customer' } });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get User Profile
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update User Profile
const updateUserProfile = async (req, res) => {
  try {
    const { name, email } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.name = name || user.name;
    user.email = email || user.email;
    await user.save();

    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Change Password
const changeUserPassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Old password is incorrect' });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Cart Functions
const addToCart = async (req, res) => {
  try {
    const { userid }=req.body
  
    
    const user = await User.findById(userid);
    user.cart.push({ product: req.body.productId, quantity: 1 });

    await user.save();

    res.json({ message: 'Added to cart' });
  } catch (error) {
   
    
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const removeFromCart = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.cart = user.cart.filter((id) => id.toString() !== req.params.productId);
    await user.save();

    res.json({ message: 'Removed from cart' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getCart = async (req, res) => {
  try {
    const { userid } = req.params;

    const user = await User.findById(userid).populate({
      path: "cart.product", // Populate the product details inside the cart
      model: "Product", // Ensure it refers to the correct model
    });
    
    

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user.cart); // Now the cart will contain product details including vendorId
  } catch (error) {
   
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


const updateCartItem = async (req, res) => {
  try {
    const user = await User.findById(req.body.userid);
    
    
    if (!user) return res.status(404).json({ message: 'User not found' });
   
    const { productid, quantity } = req.body;


    // Check if product exists in cart
    const cartItem = user.cart.find((item) => item.product.toString() === productid.toString());

    
    
    if (!cartItem) return res.status(404).json({ message: 'Product not found in cart' });

    // Update quantity
    cartItem.quantity = quantity;
    await user.save();

    res.json({ message: 'Cart updated successfully', cart: user.cart });
  } catch (error) {
    console.log(error);
    
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Order Functions
const placeOrder = async (req, res) => {
  try {
    const order = new Order({ user: req.user.id, items: req.body.items });
    await order.save();

    res.json({ message: 'Order placed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getOrderHistory = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order || order.user.toString() !== req.user.id)
      return res.status(400).json({ message: 'Order not found' });

    order.status = 'Cancelled';
    await order.save();

    res.json({ message: 'Order cancelled' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

  const getNearbyVendors = async (req, res) => {
    try {
      const { lat, lng } = req.query;
  
      if (!lat || !lng) {
        return res.status(400).json({ error: "Latitude and Longitude are required" });
      }
  
      // Find vendors within a certain radius (e.g., 10 km)
      const vendors = await Vendor.find({
        location: {
          $near: {
            $geometry: {
              type: "Point",
              coordinates: [parseFloat(lng), parseFloat(lat)],
            },
            $maxDistance: 100000, // 10 km radius
          },
        },
      });

     
      
  
      res.status(200).json(vendors);
    } catch (error) {
      console.error("Error fetching vendors:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };


// Export all functions
module.exports = {
  getNearbyVendors,
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  changeUserPassword,
  addToCart,
  removeFromCart,
  getCart,
  placeOrder,
  getOrderHistory,
  cancelOrder,
  updateCartItem
};
