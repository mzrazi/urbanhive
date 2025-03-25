const mongoose = require("mongoose");

const vendorSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6 },
  phone: { type: String, required: true },
  storeName: { type: String, required: true },
  storeAddress: { type: String, required: true },
  category:{ type: String, required: true },
  products: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
  
  // New location field to store shop coordinates (latitude and longitude)
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' }, // Required for GeoJSON
    coordinates: {
      type: [Number], // Array of numbers [longitude, latitude]
      required: true,
    },
  },
  
  // Field to track if the vendor is approved by admin
  approvedByAdmin: { type: Boolean, default: false }, // Default to false until approved
  
  createdAt: { type: Date, default: Date.now },
});

// Add geospatial index on the location field to enable geospatial queries
vendorSchema.index({ location: '2dsphere' });

module.exports = mongoose.model("Vendor", vendorSchema);
