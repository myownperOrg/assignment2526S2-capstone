const bcrypt = require("bcrypt");

const saltRounds = 10;


  const comparePassword = (req, res, next) => {
    // Check password

    console.log("\n=== bcryptMiddleware.comparePassword START ===");
    console.log("req.body.password:", req.body.password);
    console.log("res.locals.hash:", res.locals.hash);
    console.log("res.locals keys:", Object.keys(res.locals));
    
    if (!res.locals.hash) {
        console.error("ERROR: No hash in res.locals!");
        console.log("Full res.locals:", res.locals);
        return res.status(500).json({ 
            message: "Internal server error - no hash found",
            locals: res.locals 
        });
    }

    const callback = (err, isMatch) => {
      if (err) {
        console.error("Error bcrypt:", err);
        res.status(500).json(err);
      } else {
        if (isMatch) {
          next();
        } else {
          res.status(401).json({
            message: "Wrong password",
          });
        }
      }
    };
    bcrypt.compare(req.body.password, res.locals.hash, callback);
  }

  const hashPassword = (req, res, next) => {
    const callback = (err, hash) => {
      if (err) {
        console.error("Error bcrypt:", err);
        res.status(500).json(err);
      } else {
        res.locals.hash = hash;
        next();
      }
    };

    bcrypt.hash(req.body.password, saltRounds, callback);
  }


module.exports= {
      hashPassword: hashPassword,
      comparePassword: comparePassword
}