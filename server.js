// server.js
require('dotenv').config();

const fs = require('fs');
const https = require('https');
const mongoose = require('mongoose');
const app = require('./app'); // your Express app exported from app.js

const PORT = process.env.PORT || 5000;

// ---- SSL options (self-signed certs you generated) ----
const options = {
  key:  fs.readFileSync('ssl/key.pem'),
  cert: fs.readFileSync('ssl/cert.pem'),
};

// Optional (keeps Mongoose happy with older queries)
mongoose.set('strictQuery', true);

// ---- Connect to MongoDB, then start HTTPS server ----
mongoose
  .connect(process.env.MONGO_URI) // make sure .env has MONGO_URI
  .then(() => {
    console.log('✅ MongoDB connected');
    https.createServer(options, app).listen(PORT, () => {
      console.log(`✅ Server running at https://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });