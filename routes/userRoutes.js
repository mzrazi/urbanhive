const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware'); // For protected routes

// Authentication
router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);

// Profile Management
router.get('/profile', userController.getUserProfile);
router.put('/profile/update', userController.updateUserProfile);
router.put('/profile/change-password', userController.changeUserPassword);

// Cart Management
router.post('/cart/add', userController.addToCart);
router.delete('/cart/remove', userController.removeFromCart);
router.put('/cart/update', userController.updateCartItem);
router.put('/cart/clear', userController.clearCart);
router.get('/cart/:userid', userController.getCart);
router.post("/cart/details", userController.getFullCartDetails);
router.post("/create-order",userController.createOrder)
router.post("/save-order",userController.saveOrder)

router.get("/nearby", userController.getNearbyVendors);
// Order Management
router.put('/order-rating', userController.OrderRating);
router.get('/order-history/:userId', userController.getOrderHistory);
router.put('/order/cancel/:orderId', userController.cancelOrder);

module.exports = router;
