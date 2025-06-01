require('dotenv').config();
const express = require("express");
const cors = require('cors');
const connectDB = require("./db");

const userRoutes = require("./routes/user");
const uploadRoute = require('./routes/upload');
const resourceRoutes = require('./routes/resources');
const subjectRoutes = require('./routes/subjects');
const app = express();
connectDB();

app.use(express.json());
app.use(cors({
  origin: 'http://localhost:5173' 
}));

app.use("/api", userRoutes);
app.use('/api/upload', uploadRoute);
app.use('/api/resources', resourceRoutes);
app.use('/api', subjectRoutes);
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
}); 
