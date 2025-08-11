require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

// ensure DB tables are created
require('./models/db');

// middleware
app.use(cors());
app.use(express.json());

// routes
app.use('/', require('./routes/buyerRoutes'));
app.use('/', require('./routes/adminRoutes'));
app.use('/', require('./routes/supplierRoutes'));

// start server
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
