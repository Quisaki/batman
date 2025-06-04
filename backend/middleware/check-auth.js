const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    // Extract the token from the Authorization header ("Bearer TOKEN")
    const token = req.headers.authorization.split(" ")[1];

    // Verify the token with your secret key
    const decodedToken = jwt.verify(token, "A_very_long_string_for_our_secret");

    // Add user data from the decoded token to the request object
    req.userData = {
      email: decodedToken.email,
      userId: decodedToken.userId
    };

    // Proceed to the next middleware or route handler
    next();
  } catch (error) {
    // Return 401 Unauthorized with custom message if token is missing or invalid
    res.status(401).json({ message: "You Are Not Authenticated!" });
  }
};
