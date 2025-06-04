const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user"); // User model

// Signup route
router.post("/signup", (req, res, next) => {
  bcrypt.hash(req.body.password, 10) // hash password with salt rounds = 10
    .then(hash => {
      const newUser = new User({
        email: req.body.email,
        password: hash
      });

      newUser.save()
        .then(result => {
          res.status(201).json({
            message: "User Created",
            result: result
          });
        })
        .catch(err => {
          // Check if error is duplicate key (email already exists)
          if (err.code === 11000) {
            return res.status(409).json({ message: "Email already registered" });
          }
          res.status(500).json({ error: err });
        });
    })
    .catch(err => {
      res.status(500).json({ error: err });
    });
});

// Login route
router.post("/login", (req, res, next) => {
  User.findOne({ email: req.body.email })
    .then(user => {
      if (!user) {
        // User not found - send invalid credentials message
        return res.status(401).json({ message: "Invalid Authentication Credentials!" });
      }

      bcrypt.compare(req.body.password, user.password)
        .then(isMatch => {
          if (!isMatch) {
            // Password incorrect - send invalid credentials message
            return res.status(401).json({ message: "Invalid Authentication Credentials!" });
          }

          const token = jwt.sign(
            { email: user.email, userId: user._id }, // payload with userId
            "A_very_long_string_for_our_secret", // secret key (should be stored in environment variable)
            { expiresIn: "1h" }
          );

          res.status(200).json({
            message: "Auth successful",
            token: token,
            expiresIn: 3600, // in seconds (1 hour)
            userId: user._id // <-- this sends userId to client
          });
        })
        .catch(err => {
          // On bcrypt compare error, send invalid credentials message
          return res.status(401).json({ message: "Invalid Authentication Credentials!" });
        });
    })
    .catch(err => {
      res.status(500).json({ error: err });
    });
});

module.exports = router;
