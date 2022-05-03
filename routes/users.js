require("dotenv").config();
//require("../config/database").connect();
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../model/user");

const auth = require("../middleware/auth");

router.post("/register", async (req, res) => {
    try {
        // Get user input
        const { username,  password , email, name, lastname} = req.body;
    
        // Validate user input
        if (!(email && password && username && name && lastname)) {
            res.status(400).send("All input is required");
        }

        // check if user already exist
        // Validate if user exist in our database
        const oldUser = await User.findOne({ email });

        if (oldUser) {
            return res.status(409).send("User Already Exist. Please Login");
        }

        //Encrypt user password
        encryptedPassword = await bcrypt.hash(password, 10);
    
        // Create user in our database
        const user = await User.create({
            username,
            email: email.toLowerCase(), // sanitize: convert email to lowercase
            password: encryptedPassword,
            name,
            lastname
        });
    
        // Create token
        const token = jwt.sign(
            { user_id: user._id, email },
            process.env.TOKEN_KEY,
            {
            expiresIn: "2h",
            }
        );
        // save user token
        user.token = token;
    
        // return new user
        res.status(201).json(user);
    } catch (e) {
        console.log(e);
    }
});

router.post("/login", async (req, res) => {
    try {
        // Get user input
        const { email, password } = req.body;

        //Validate user input
        if(!(email && password)) {
            res.status(400).send("All input is required");
        }

        //Validate if user exist in our database
        const user = await User.findOne({email});

        if (user && (await bcrypt.compare(password, user.password))) {
            //Create token
            const token = jwt.sign(
                { user_id: user._id, email },
                process.env.TOKEN_KEY,
                {
                    expiresIn: "2h",
                }
            );

            //Save user token
            user.token = token;

            // user
            res.status(200).json(user);
        }
        else {
            res.status(400).send("Invalid Credentials");
        }
    } catch (e) {
        console.log(e)
    }
});



module.exports = router