const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

// Define CORS options
const corsOptions = {
  origin: "http://localhost:8081", // Replace with your client domain
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE", // Allowed methods
  allowedHeaders: "Content-Type,Authorization", // Allowed headers
  credentials: true, // Allow credentials such as cookies
  optionsSuccessStatus: 204, // Status code for successful OPTIONS requests
};

// Use CORS with options
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from 'uploads' directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Database connection
mongoose
  .connect(process.env.DATABASE_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });

// Test Route
app.get("/test-upload", (req, res) => {
  res.sendFile(path.join(__dirname, "uploads", "testfile.mp4"));
});

// Routes
app.use("/api/users", require("./routes/users"));
app.use("/api/videos", require("./routes/videos"));
app.use("/api/tutors", require("./routes/tutors"));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

// Create HTTP server and setup Socket.IO
const server = http.createServer(app);
const io = socketIo(server);

// Socket.IO connection
io.on("connection", (socket) => {
  console.log("New client connected");

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

// Pass the Socket.IO instance to the app
app.set("socketio", io);

app.get("/", (req, res) => {
  res.json({ message: "Server running nicely" });
  console.log("Server running nicely");
});
// Start server
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
