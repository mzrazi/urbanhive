const express = require('express');
const { 
  getVendors, updateVendorStatus, deleteVendor,
  getComplaints, resolveComplaint, deleteComplaint,
  getOrders, updateOrderStatus, deleteOrder,
  getUsers, blockUnblockUser, deleteUser,
  getProducts, addProduct, updateProduct, deleteProduct,
  getReviews, deleteReview,
  getDashboardStats,
  adminLogin
}  = require('../controllers/adminController.js');
const router = express.Router();

router.post('/login',adminLogin)

// 📌 Vendor Routes
router.get('/vendors', getVendors);
router.put('/vendors/:id', updateVendorStatus);
// router.delete('/vendors/:id', deleteVendor);

// 📌 Complaint Routes
router.get('/complaints', getComplaints);
router.patch('/complaints/:id', resolveComplaint);
router.delete('/complaints/:id', deleteComplaint);

// 📌 Order Routes
router.get('/orders', getOrders);
router.put('/orders/:id', updateOrderStatus);
router.delete('/orders/:id', deleteOrder);

// 📌 User Routes
router.get('/users', getUsers);
router.put('/users/:id/block', blockUnblockUser);
router.delete('/users/:id', deleteUser);

// 📌 Product Routes
router.get('/products', getProducts);
// router.post('/products', addProduct);
router.patch('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);

// 📌 Review Routes
router.get('/reviews', getReviews);
router.delete('/reviews/:id', deleteReview);

// 📌 Dashboard Stats Route
router.get('/dashboard-stats', getDashboardStats);

module.exports = router;
