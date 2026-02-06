
const jwt = require('jsonwebtoken');
const config = require('../../config');
var authorizer = {

    verifyToken: function (req, res, next) {

        var token = req.headers["authorization"]; //"Bearer <jwt>"

        console.log(token);

        if (token && token.includes("Bearer")) {
            token = token.split(" ")[1];//jwt string
            jwt.verify(token, config.secretKey, function (err, payload) {

                if (err) {
                    res.status(401);
                    res.type('json');
                    res.send(`{"Message":"You are not authorized"}`);

                } else {
                    req.userid=payload.userid;
                    req.username = payload.username;
                    req.role=payload.role;

                    next();
                }

            });


        } else { //no proper JWT 

            res.status(401);
            res.type('json');
            res.send(`{"Message":"You are not authorized"}`);

        }

    }


};

module.exports=authorizer;