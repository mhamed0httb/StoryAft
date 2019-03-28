const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

//var db = mongoose.connect('mongodb://mhamed:azerty123456@ds111410.mlab.com:11410/carwash');
db = mongoose.connect('mongodb://localhost:27017/storyaft');

var User = require('./models/User');

const app = express();
var port = process.env.PORT || 3000;

authRouter = require('./routes/AuthRoutes')(User);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use('/api/auth', authRouter);

app.get('/', (req, res) => {
    res.send('Welcome to my API');
});

app.listen(port, () => {
    console.log("Running on PORT " + port);
});