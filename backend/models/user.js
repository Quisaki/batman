const mongoose = require('mongoose');                         // <-- Add mongoose import
const uniqueValidator = require('mongoose-unique-validator');  // <-- Import unique validator

const userSchema = mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

userSchema.plugin(uniqueValidator);  // <-- Apply plugin to schema

module.exports = mongoose.model('User', userSchema);           // <-- Model name capitalized (optional)
