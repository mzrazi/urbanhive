const express = require("express");
const { registerVendor, loginVendor, updateStoreDetails, addProduct, getVendorProducts, updateProduct, deleteProduct, getVendorOrders, updateOrderStatus } = require("../controllers/vendorController");


const router = express.Router();

// Vendor authentication
router.post("/register", registerVendor);
router.post("/login", loginVendor);

// Vendor store management
router.put("/update", updateStoreDetails);

// Product management
router.post("/product", addProduct);
router.get("/products", getVendorProducts);
router.put("/product/:id", updateProduct);
router.delete("/product/:id", deleteProduct);

// Order management
router.get("/orders", getVendorOrders);
router.put("/order/:id", updateOrderStatus);

module.exports = router;
