/*
    Mongo DB URI
*/
var localDbURI = 'mongodb://localhost:27017/storyaft';
var remoteDbURI = 'mongodb+srv://mhamed:azerty123@cluster0-xu7ru.mongodb.net/storyaft?retryWrites=true'

/*
    JSON Web Token secret key
*/
var jwtSecret = 'secretkey';

/*
    Server URL (for storing images full url)
*/
var localServerName = 'http://localhost:3000/';
var remoteServerName = '';


module.exports = {
    MongoURI: localDbURI,
    JwtSecret: jwtSecret,
    ServerName: localServerName
}; 