require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(express.static("public")); 

// Database Connection
connectDB();

// Routes
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/vendors", require("./routes/vendorRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));

// Server Port
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
