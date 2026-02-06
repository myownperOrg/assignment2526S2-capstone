
const express = require('express');
const bodyParser = require('body-parser');

const publicController = require('./controller/publicController');
const adminController = require('./controller/adminController');
const authorizer=require('./authorization/verifyToken');
const { authenticateToken } = require('./middlewares/auth');
// const {validateIntID} = require('./authorization/validate');

// const userRoutes = require('./routes/userRoutes');
// const publicRoutes = requires('./routes/publicRoutes');
// const adminRoutes = requires('./routes/adminRoutes');


const validate=require('./authorization/validate');

const cors= require('cors');

const app = express();


console.log('adminController:', adminController);
console.log('typeof getAllUsers:', typeof adminController.getAllUsers);


app.use(cors({
  origin: ['http://localhost:3001', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.options('*', cors()); // include before other routes


// var urlencodedParser = bodyParser.urlencoded({ extended: false });
// app.use(urlencodedParser);//attach body-parser middleware
// app.use(bodyParser.json());//parse json data

// Replace with this:
app.use(express.json());  // Built-in Express JSON parser
app.use(express.urlencoded({ extended: true }));

// Then CORS
app.use(cors());


app.get('/', function (req, res) {
    res.send("This confirms your webserver is running");
});


//----User-Routes--------------

//GET /user/ - Admin/Protected route
app.get('/user', 
    // validate.validateIntID('userid'), 
    authorizer.verifyToken, 
    adminController.getAllUsers);

//GET /user/:userid - Admin/Protected route
app.get('/user/:userid', 
    // validate.validateIntID('userid'), 
    authorizer.verifyToken,
    adminController.getUserByUserid
);


//POST /user - Public route
app.post('/user', 
    validate.validateInsertion,
    adminController.postUser
);

//PUT /user/:userid - Admin/Protected route
app.put('/user/:userid', 
    validate.validateIntID('userid'),
    authorizer.verifyToken,
    adminController.putUserByUserid
);


//DELETE /user/:userid - Admin/Protected route
app.delete('/user/:userid', 
    validate.validateIntID('userid'),
    authorizer.verifyToken,
    adminController.delUserByUserid
);

// POST /user/login - Public route
app.post('/user/login', adminController.loginControl);


app.post('/user/register', 
    validate.validateInsertion,
    adminController.postUser
);


app.get('/test-token', authenticateToken, adminController.testToken);

//----Travel-Listings-Routes--------------

//GET /travel-listings/
// CORRECT: Just pass the controller function
app.get('/travel-listings', 
    publicController.getAllTravelListings);


// GET /travel-listings/search
app.get('/travel-listings/search', 
    publicController.findTravelListings
);

// GET /travel-listings/:travelID/itineraries
app.get('/travel-listings/:travelID/itineraries', 
    publicController.getItinerariesByTravelid  // Let Express handle it
);

// GET /travel-listings/:travelID
app.get('/travel-listings/:travelID', 
    publicController.getTravelListingByTravelid  // Just reference the controller method
);


console.log('validate:', validate);
console.log('validateInsertion:', validate.validateInsertion);
console.log('publicController:', publicController);
console.log('loginControl:', adminController.loginControl);


// Export the app for use in other files (like server.js)
module.exports = app;