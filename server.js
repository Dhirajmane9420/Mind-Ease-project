// server.js

const express = require('express');
const connectDB = require('./config/db');// We need to require our new db file
const cors = require('cors');

const app = express();

// Connect to the Database
connectDB();

const PORT = 3000;

app.use(cors()); // Use the cors middleware
app.use(express.json());

// We can keep this for later
app.use(express.json());

app.get('/', (req, res) => {
  res.send('API is running...');
});


app.use('/api/users', require('./routes/users'));

app.use('/api/appointments', require('./routes/appointments'));

app.use('/api/forum', require('./routes/forum'));

app.use('/api/messages', require('./routes/messages'));

app.use('/api/reports', require('./routes/reports'));

app.listen(PORT, () => {
  console.log(`Server is running successfully on http://localhost:${PORT}`);
});