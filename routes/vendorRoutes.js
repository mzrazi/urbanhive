const express = require("express");
const { registerVendor, loginVendor, updateStoreDetails, addProduct, getVendorProducts, updateProduct, deleteProduct, getVendorOrders, updateOrderStatus, uploadImageMiddleware, getproduct, getVendorStats } = require("../controllers/vendorController");


const router = express.Router();

// Vendor authentication
router.post("/register", registerVendor);
router.post("/login", loginVendor);
router.get("/dashboard/:vendorId",getVendorStats)

// Vendor store management
router.put("/update", updateStoreDetails);

// Product management
router.post("/add-Product", uploadImageMiddleware, addProduct);
router.get("/products/:vendorId", getVendorProducts);
router.get("/getproduct/:productId",getproduct)
router.put("/update-product/:id", updateProduct);
router.delete("/delete-product/:id", deleteProduct);

// Order management
router.get("/get-orders/:id", getVendorOrders);
router.put("/order/:id", updateOrderStatus);

module.exports = router;
