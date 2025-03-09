

const mongoose = require("mongoose");
const complaintSchema = new mongoose.Schema
({ 
user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, 
description: { type: String, required: true, trim: true }, 
status: { type: String, enum: ["Open", "In Progress", "Resolved"], default: "Open" }, 
createdAt: { type: Date, default: Date.now }, updatedAt: { type: Date }, 
}); 
module.exports = mongoose.model("Complaint", complaintSchema);
