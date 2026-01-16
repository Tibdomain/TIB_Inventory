require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const RouterPath = require('./router');
const assemblyRoutes = require('./assembly');
const { router2: authRouter, authenticateToken } = require('./auth');





app.use(bodyParser.json());
app.use(express.json());

// Enable CORS for all routes
app.use(cors({
    origin: ['https://inventory-tib-1.onrender.com', 'http://localhost:3000', 'http://localhost:3001'],
    methods: 'GET, HEAD, PUT, PATCH, POST, DELETE',
    credentials: true
}));





app.get('/test', (req, res) => {
    console.log('Test route hit');
    res.json({ message: 'Server is working' });
});

app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});


app.use('/', RouterPath);
app.use(assemblyRoutes); 
app.use('/api/auth', authRouter);

app.get('/api/data', authenticateToken, (req, res) => {
    res.json({ message: 'This is protected data', user: req.user });
  });




// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});


