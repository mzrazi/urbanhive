const User = require('../models/User');
const Order = require('../models/Order');
const Product = require('../models/Product');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Vendor = require("../models/Vendor");
const Razorpay = require("razorpay");
const crypto = require('crypto');



const razorpay = new Razorpay({
  key_id: 'rzp_test_6i5nQKZQNF4RNj',
  key_secret: 'bu5DwShi4kj3oGx29dk14VW7'
});



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

  const getFullCartDetails = async (req, res) => {
    try {
      const { userid, lat, lng } = req.body;
      
     
  
      // Fetch user details
      const user = await User.findById(userid).populate("cart.product");
      
      
      if (!user)   return res.status(404).json({ message: "User  not found" });
      

      
      const vendorid = user.cart[0]?.product.vendor.toString();
      // Fetch vendor details
      const vendor = await Vendor.findById(vendorid);
     
      
      if (!vendor || !vendor.location) return res.status(404).json({ message: "Vendor location not found" });
  
      // Calculate Distance
      const distance = calculateDistance(lat, lng, vendor.location.lat, vendor.location.lng);
  
      // Calculate Delivery Charge
      let deliveryCharge = 30;
      if (distance > 10) {
        deliveryCharge += Math.ceil((distance - 10) / 2) * 10;
      }
  
      // Calculate Subtotal & Discount
      const subtotal = user.cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
      let discount = subtotal > 500 ? 50 : subtotal > 300 ? 30 : 10;
  
      // Send all cart data in one response
      res.json({
        cart: user.cart,
        subtotal,
        discount,
        deliveryCharge,
        grandTotal: subtotal + deliveryCharge - discount,
      });
    } catch (error) {
      console.log(error);
      
      res.status(500).json({ message: "Server error", error: error.message });
    }
  };
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of Earth in KM
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in KM
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
const clearCart = async (req, res) => {
  try {
    const { userid } = req.body; // Get user ID from request body
    const user = await User.findById(userid);

    if (!user) return res.status(404).json({ message: "User not found" });

    user.cart = []; // Clear the cart array
    await user.save();

    res.json({ message: "Cart cleared successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
 

const removeFromCart = async (req, res) => {
  try {
    const { userid, productId } = req.body;

    // Fetch user and check if exists
    const user = await User.findById(userid);
    if (!user) return res.status(404).json({ message: "User not found" });

    console.log("Before Removing:", user.cart);

    // Ensure productId is converted to a string
    const productIdStr = productId.toString();

    // Remove the item from cart where the `product` field matches
    user.cart = user.cart.filter((item) => item.product.toString() !== productIdStr);

    await user.save();

    console.log("After Removing:", user.cart);

    res.json({ message: "Removed from cart", cart: user.cart });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
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
    const {userId}=req.params;

    const orders = await Order.find({ user: userId })
    .populate('user', 'name email phone')  
    .populate('vendor', 'name email phone address')
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

    // Fetch orders for each vendor and calculate the average rating
    const vendorsWithRatings = await Promise.all(
      vendors.map(async (vendor) => {
        // Find all orders of this vendor
        const orders = await Order.find({ vendor: vendor._id });

        // Filter out orders with a rating of 0
        const ratedOrders = orders.filter(order => order.rating > 0);

        // Calculate the average rating from the rated orders
        const totalRating = ratedOrders.reduce((sum, order) => sum + order.rating, 0);
        const averageRating = ratedOrders.length > 0 ? totalRating / ratedOrders.length : 0;

        // Append the average rating to the vendor data
        return { ...vendor.toObject(), averageRating };
      })
    );

    // Send the vendors with their average ratings to the frontend
    res.status(200).json(vendorsWithRatings);
  } catch (error) {
    console.error("Error fetching vendors:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};





const createOrder = async (req, res) => {
  try {
    const { userId, vendorId, products, totalAmount } = req.body;

    // Create Razorpay order
    const options = {
      amount: totalAmount * 100,  // Amount in paise (1 INR = 100 paise)
      currency: "INR", // Currency in INR
      receipt: `receipt_${Date.now()}`, // Unique receipt number for the order
      payment_capture: 1,  // 1 means automatic capture of payment after successful transaction
    };

    const razorpayOrder = await razorpay.orders.create(options);
    console.log(razorpayOrder.id);
    

    

    // Store order data temporarily or create a record in your database
    // You can save this order in your database, but this step is optional as you already have the order ID
    const order = new Order({
      user: userId,
      vendor: vendorId,
      products,
      totalAmount,
      orderStatus: "Pending", // You can update this status as payment progresses
      razorpayOrderId: razorpayOrder.id,
    });
   
    

    await order.save(); // Save the order in your database

    // Send the Razorpay order ID and payment key to frontend
    res.json({
      razorpayOrderId: razorpayOrder.id,
      razorpayPaymentKey: 'rzp_test_6i5nQKZQNF4RNj', // This key will be used to complete payment on frontend
    });
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    res.status(500).json({ error: "Failed to create Razorpay order" });
  }
};


const saveOrder = async (req, res) => {
  try {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;
    console.log(razorpay_payment_id, razorpay_order_id, razorpay_signature);
    

    // Verify payment signature
    const generatedSignature = crypto
      .createHmac("sha256", razorpay.key_secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({ error: "Payment verification failed" });
    }

    // If the payment is verified, save the order status in your database
    const order = await Order.findOne({ razorpayOrderId: razorpay_order_id });
    console.log(order);
    
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    order.paymentStatus = "Successful";
    order.paymentDetails = {
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
    };
   
    await order.save();

    const user = await User.findById(order.user);
    if (user) {
      // console.log("called",user);
      
      // Assuming the cart is stored in user.cart (you may adjust this based on your schema)
      user.cart = [];
      await user.save();
    }

    // Respond with the saved order data
    res.json(order);
  } catch (error) {
   console.log("Error saving order:", error);
    res.status(500).json({ error: "Failed to save the order" });
  }
};

// In your backend controller (e.g., OrderController.js)
const OrderRating = async (req, res) => {
  try {
    const { orderId, rating } = req.body; // Receive orderId and rating from the request body
    
    // Find the order by its ID and update the rating
    const order = await Order.findByIdAndUpdate(
      orderId,
      { rating: rating },
      { new: true } // To return the updated order
    );
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};











// Export all functions
module.exports = {
  saveOrder,
  createOrder,
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
  updateCartItem,
  clearCart,getFullCartDetails
  ,OrderRating 
};
