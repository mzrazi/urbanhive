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
router.delete('/cart/remove/:productId', userController.removeFromCart);
router.put('/cart/update/:productId', userController.updateCartItem);
router.get('/cart', userController.getCart);

// Order Management
router.post('/order/place', userController.placeOrder);
router.get('/order/history', userController.getOrderHistory);
router.put('/order/cancel/:orderId', userController.cancelOrder);

module.exports = router;
