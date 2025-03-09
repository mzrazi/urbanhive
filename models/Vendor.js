const mongoose = require("mongoose");
const vendorSchema = new mongoose.Schema
({ 
	name: { type: String, required: true, trim: true }, 
	email: { type: String, required: true, unique: true, lowercase: true }, 
	password: { type: String, required: true, minlength: 6 }, 
	phone: { type: String, required: true }, 
	storeName: { type: String, required: true }, 
	storeAddress: { type: String, required: true }, 
	products: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }], 
	createdAt: { type: Date, default: Date.now }, 
}); 
module.exports = mongoose.model("Vendor", vendorSchema);
