// const db = require('../data/db');
// const bcrypt = require('../middlewares/bcryptMiddleware');
// const jwt = require('jsonwebtoken');
const adminModel = require('../model/adminModel');
// const { get } = require('../routes/adminRoutes');

const bcrypt = require('bcrypt');

// Debug: Immediately check if import worked
console.log('=== ADMIN CONTROLLER LOADED ===');
console.log('adminModel exists?', !!adminModel);
if (adminModel) {
  console.log('adminModel methods:', Object.keys(adminModel));
  console.log('loginModelByCred available?', !!adminModel.loginModelByCred);
} else {
  console.log('ERROR: adminModel is null or undefined!');
}

// ================ ADMIN FUNCTIONS =================
// Admin login

const loginControl = async (req, res, next) => {

  console.log('loginControl called with body:', req.body);
  
  // Try to get identifier from either email or username field
  const { email, username, password } = req.body;
  const identifier = email || username;
  
  console.log('Calling loginModelByCred with:', { identifier, password });
  
  try {
    const token = await adminModel.loginModelByCred(identifier, password);
 // If token is null, login failed
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid email/username or password' 
      });
    }
    
    // Login successful - return token
    res.status(200).json({ 
      success: true, 
      message: 'Login successful',
      token: token,
      // Optional: include user info
      user: {
        // You might want to decode the token or get user info from DB
        // to include in response
      }
    });
  } catch (error) {
    console.error('Error in loginControl:', error.message);
    console.error('Full error:', error);

    // Handle specific database errors
    if (error.code === 'ER_PARSE_ERROR') {
      return res.status(500).json({ 
        success: false, 
        message: 'Database query error' 
      });
    }

    res.status(500).json({ 
      success: false, 
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
}
};

const testToken = (req, res) => {
  res.status(200).json({
    success: true,    
        message: 'Token is valid!',
    user: req.user, // This comes from your JWT middleware
    timestamp: new Date().toISOString()  });
}

// Middleware to check if username or email already exists

const checkUsernameOrEmailExist = async (req, res, next) => {
  const data = { email: req.body.email, username: req.body.username, password: req.body.password };
  
  console.log('checkUsernameOrEmailExist called with:', data);
  
  // Check email first
  if (data.email) {
    adminModel.validateEmail(data.email, (emailError, emailResults) => {
      if (emailError) {
        console.error("Error checking email:", emailError);
        return res.status(500).json({
          success: false,
          error: { message: "Error checking email existence" }
        });
      }
      
      if (emailResults && emailResults.length > 0) {
        return res.status(409).json({
          success: false,
          error: { message: "Email already exists" }
        });
      }
      
      // Email is available, now check username if provided
      if (data.username) {
        adminModel.validateUsername(data.username, (usernameError, usernameResults) => {
          if (usernameError) {
            console.error("Error checking username:", usernameError);
            return res.status(500).json({
              success: false,
              error: { message: "Error checking username existence" }
            });
          }
          
          if (usernameResults && usernameResults.length > 0) {
            return res.status(409).json({
              success: false,
              error: { message: "Username already exists" }
            });
          }
          
          // Both are available
          next();
        });
      } else {
        // No username to check
        next();
      }
    });
  } else {
    // No email provided - maybe just checking username
    if (data.username) {
      adminModel.validateUsername(data.username, (usernameError, usernameResults) => {
        if (usernameError) {
          console.error("Error checking username:", usernameError);
          return res.status(500).json({
            success: false,
            error: { message: "Error checking username existence" }
          });
        }
        
        if (usernameResults && usernameResults.length > 0) {
          return res.status(409).json({
            success: false,
            error: { message: "Username already exists" }
          });
        }
        
        next();
      });
    } else {
      // Neither email nor username provided
      return res.status(400).json({
        success: false,
        error: { message: "Email or username required" }
      });
    }
  }
};

    
const postUser = async (req, res, next) => { 

  console.log('\n=== POST USER CONTROLLER ===');
  console.log('Request body:', req.body);
    try {
        const { email, username, password, role = 'admin' } = req.body;
        
        // Validate required fields
        if (!email || !username || !password) {
            return res.status(400).json({
                success: false,
                error: { message: "Email, username, and password are required" }
            });
        }
        
        // Hash the password - now 'await' is valid in async function
        const hash = await bcrypt.hash(password, 10);
        console.log('Hashed password:', hash);
        console.log('Hash length:', hash.length);
        
        // Create user with hashed password
        const result = await adminModel.createUser(username, email, role, hash);
        console.log('User created successfully');

        res.status(201).json({
            success: true,
            message: "User created successfully",
            data: {
                insertId: result.insertId,
                email: email,
                username: username,
                role: role
            }
        });
        
    } catch (error) {
        console.error("Error creating user:", error);
        res.status(500).json({
            success: false,
            error: { message: "Error creating user", details: error.message }
        });
    }
};

const getAllUsers = async (req, res) => {
    try {
        const results = await adminModel.readAllUsers();
        res.status(200).json(results);
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ error: error.message });
    }
};  

const getUserByUserid = async (req, res) => {
    const userid = req.params.userid;
    try {
        const results = await adminModel.readUserByUserid(userid);
        if (!results) {
            return res.status(404).json({ error: "User not found" });
        }
        res.status(200).json(results);
    } catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).json({ error: error.message });
    }
};


const putUserByUserid = async (req, res) => {
    const userid = req.params.userid;
    const data = {
        email: req.body.email,
        password: req.body.password
    };
    const callback = (error, results, fields) => {
    if (error) {
        console.error("Error updating user:", error);
        res.status(500).json({ error: error.message });
    } else {
        res.status(200).json({
            success: true,
            data: results
        });
    }
    };
    adminModel.updateUserByUserid(userid, data, callback);
};

const delUserByUserid = async (req, res) => {
    const userid = req.params.userid;
    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error deleting user:", error);
            res.status(500).json({ error: error.message });
        } else {
            res.status(204).send();
        }
    };
    adminModel.dropUserByUserid(userid, callback);
};

// const postUser = (req, res) => {
//     const data = {
//         username: req.body.username,
//         email: req.body.email,
//         role: req.body.role,
//         password: req.body.password
//     };

//     const callback = (error, results, fields) => {
//         if (error) {
//             console.error("Error creating user:", error);
//             res.status(500).json(error);
//         } else {
//             res.status(201).json({
//                 success: true,
//                 data: results,
//                 insertedId: results.insertId
//             });
//         }
//     };
//     adminModel.insertUser(data, callback);
// };

// ================ TRAVEL LISTING FUNCTIONS =================
// Create new travel listing
const postTravelListing = (req, res) => {
    const data = {
        title: req.body.title,
        description: req.body.description,
        country: req.body.country,
        travelPeriod: req.body.travelPeriod,
        price: req.body.price,
        imageURL: req.body.imageURL,
        dateInserted: new Date()
    };

    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error creating travel listing:", error);
            res.status(500).json(error);
        } else {
            res.status(201).json({
                success: true,
                data: results,
                insertedId: results.insertId
            });
        }
    };

    adminModel.insertTravelListing(data, callback);
};

// Get all listings (admin view)
// const getTravelListings = (req, res, next) => {
//     const callback = (error, results, fields) => {
//       if (error) {
//         console.error(error); 
//         res.status(500).json(error);
//       } else {
//         res.status(200).json(results);
//       }
//     };
//     adminModel.selectTravelListings(callback);
// };

// Get single listing
// const getTravelListingByTravelId = (req, res) => {
//     const travelID = req.params.travelID;

//     console.log('🔍 Looking for travel listing with ID:', travelID);
//     console.log('ID type:', typeof travelID);

//     const callback = (error, results, fields) => {
//         if (error) {
//             console.error("Error fetching travel listing:", error);
//             res.status(500).json(error);
//         } else {
//             console.log('📊 Query results:', results);
//             console.log('Results count:', results.length);
            
//             if (results.length === 0) {
//                 res.status(404).json({
//                     success: false,
//                     message: 'Travel listing not found',
//                     searchedId: travelID,
//                     suggestion: 'Try getting all IDs first with /api/admin/travel-listings-ids'
//                 });
//             } else {
//                 res.status(200).json({
//                     success: true,
//                     count: results.length,
//                     data: results[0]  // Return first item instead of array
//                 });
//             }
//         }
//     };
//     adminModel.selectTravelListingByTravelId(travelID, callback);
// };

// Update listing
const putTravelListingByTravelId = (req, res) => {
  
    const travelID = req.params.travelID;
    const data = {
        title: req.body.title,
        description: req.body.description,
        country: req.body.country,
        travelPeriod: req.body.travelPeriod,
        price: req.body.price,
        imageURL: req.body.imageURL,
        dateInserted: new Date()
    };

    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error updating travel listing:", error);
            res.status(500).json(error);
        } else {
            res.status(200).json({
                success: true,
                data: results
            });
        }
    };
    adminModel.updateTravelListingbyTravelId(travelID, data, callback);
};

// Delete listing
const delTravelListingByTravelId = (req, res) => {
    const travelID = req.params.travelID;
    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error deleting travel listing:", error);
            res.status(500).json(error);
        } else {
            res.status(204).send();
        }
    };
    adminModel.deleteTravelListingByTravelId(travelID, callback);
};

// ================ ITINERARY FUNCTIONS =================

// Select itinerary by travelID
const getItineraryByTravelId = (req, res) => {
  const travelID = req.params.travelID;
  const callback = (error, results, fields) => {
    if (error) {
      console.error("Error fetching itinerary:", error);
      res.status(500).json(error);
    } else {
      res.status(200).json(results);
    }
  };
  adminModel.selectItineraryByTravelId(travelID, callback);
};

// Get all itineraries
const getItineraries = (req, res) => {
  const callback = (error, results, fields) => {
    if (error) {
      console.error("Error fetching itineraries:", error);
      res.status(500).json(error);
    } else {
      res.status(200).json(results);
    }
  };
  adminModel.selectItineraries(callback);
};

// Get itinerary by itineraryID
const getItineraryByItineraryId = (req, res) => {
  const itineraryID = req.params.itineraryID;
  const callback = (error, results, fields) => {
    if (error) {
      console.error("Error fetching itinerary:", error);
      res.status(500).json(error);
    } else {
      res.status(200).json(results);
    }
  };
  adminModel.selectItineraryByItineraryId(itineraryID, callback);
};

// Create itinerary
const postItineraryByTravelId = (req, res) => {
  const travelID = req.params.travelID;


 console.log('🔍 === DEBUG START ===');
  console.log('🔍 travelID:', travelID, 'type:', typeof travelID);
  console.log('🔍 req.body:', req.body);
  console.log('🔍 req.body.day:', req.body.day, 'type:', typeof req.body.day);
  console.log('🔍 req.body.activity:', req.body.activity);


  const data = {
    day: req.body.day,
    activity: req.body.activity
  };
  const callback = (error, results, fields) => {
    if (error) {
      console.error("Error creating itinerary:", error);
      res.status(500).json(error);
    } else {
      res.status(201).json({
        success: true,
        data: {
          itineraryID: results.insertId,
          travelID: travelID,
          day: data.day,
          activity: data.activity
        }
      });
    }
  };
  adminModel.insertItineraryByTravelId(travelID, data, callback);
};

// Update itinerary
const putItineraryByItineraryId = (req, res) => {
  const itineraryID = req.params.itineraryID;
  const data = {
    travelID: req.body.travelID,
    day: req.body.day,
    activity: req.body.activity
  };
  const callback = (error, results, fields) => {
    if (error) {
      console.error("Error updating itinerary:", error);
      res.status(500).json(error);
    } else {
      res.status(200).json({
        success: true,  
        data: results
      });
    }
  };
  adminModel.updateItineraryByItineraryId(itineraryID, data, callback);
};

// Delete itinerary
const delItineraryByItineraryId = (req, res) => {
  const itineraryID = req.params.itineraryID;
  const callback = (error, results, fields) => {
    if (error) {
      console.error("Error deleting itinerary:", error);
      res.status(500).json(error);
    } else {
      res.status(204).send();
    }
  };
  adminModel.deleteItineraryByItineraryId(itineraryID, callback);
};


// Debugging function to log all model methods

const debugModelMethods = (req, res) => {
    console.log('🔍 Checking adminModel methods...');
    
    const allMethods = Object.keys(adminModel);
    const functionMethods = allMethods.filter(key => typeof adminModel[key] === 'function');
    
    const travelMethods = functionMethods.filter(method => 
        method.toLowerCase().includes('travel') || 
        method.toLowerCase().includes('listing')
    );
    
    res.json({
        success: true,
        totalMethods: functionMethods.length,
        allMethods: functionMethods,
        travelRelatedMethods: travelMethods,
        hint: "Look for methods like 'getTravelListingByTravelId', 'findTravelListingByTravelid', etc."
    });
};


module.exports = {
  loginControl,
  testToken,
  postUser,  
  checkUsernameOrEmailExist,

  getAllUsers,
  getUserByUserid,
  putUserByUserid,
  delUserByUserid,

  postTravelListing,
  // getTravelListings,
  // getTravelListingByTravelId
  putTravelListingByTravelId,
  delTravelListingByTravelId,

  getItineraryByTravelId,
  getItineraryByItineraryId,
  getItineraries,
  postItineraryByTravelId,
  delItineraryByItineraryId,
  putItineraryByItineraryId,

  debugModelMethods
};

