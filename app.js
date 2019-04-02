const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

//var db = mongoose.connect('mongodb://mhamed:azerty123456@ds111410.mlab.com:11410/carwash');
const { MongoURI } = require('./config/Keys');
const db = mongoose.connect(MongoURI, { useNewUrlParser: true }, (err) => {
    if (err) {
        console.log(err);
    } else {
        console.log('MongoDB Connected');
    }
});

/*
    MODELS
*/
var User = require('./models/User');
var Story = require('./models/Story');

/*
    APP & PORT
*/
const app = express();
var port = process.env.PORT || 3000;

/*
    ROUTES
*/
authRouter = require('./routes/AuthRoutes')(User);
storyRouter = require('./routes/StoryRoutes')(Story, User);
profileRouter = require('./routes/ProfileRoutes')(User);

/*
    SET '/uploads' directory to static (for public access)
*/
app.use('/uploads', express.static('uploads'));

/*
    BodyParser to parse JSON Request Body
*/
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

/*
    APP URL's
*/
app.use('/api/auth', authRouter);
app.use('/api/story', storyRouter);
app.use('/api/profile', profileRouter);

app.get('/', (req, res) => {
    res.send('Welcome to my API');
});

app.listen(port, () => {
    console.log("Running on PORT " + port);
});