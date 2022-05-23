const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
    username: {type: String, default: null, unique: true},
    password: {type: String},
    email: {type: String, unique: true},
    name: {type: String, default: null},
    lastname: {type: String, default: null},
    department: {type: String, default: null},
    role: {type: Number, default: 1},
    token: {type: String},
})

module.exports = mongoose.model("user", userSchema, 'Users');