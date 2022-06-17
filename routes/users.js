require("dotenv").config();
//require("../config/database").connect();
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../model/user");
const Report = require("../model/report");

const auth = require("../middleware/auth");
const { route } = require("./reports");
const config = process.env;


router.post("/register", async (req, res) => {
    try {
        // Get user input
        const { username,  password , email, name, lastname, role} = req.body;
    
        // Validate user input
        if (!(email && password && username && name && lastname)) {
            return res.status(400).send("All input is required");
        }

        // check if user already exist
        // Validate if user exist in our database
        const oldUser = await User.findOne({ email });

        if (oldUser) {
            return res.status(409).send("A user already exists with that email address");
        }

        //Encrypt user password
        encryptedPassword = await bcrypt.hash(password, 10);
    
        // Create user in our database
        const user = await User.create({
            username,
            email: email.toLowerCase(), // sanitize: convert email to lowercase
            password: encryptedPassword,
            name,
            lastname,
            role
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

router.delete("/deleteuser", async (req, res) => {
    try {
        const {email} = req.query

        if (!email) {
            return res.status(400).send("Missing email")
        }
        const user = await User.deleteOne({email})

        if (user.deletedCount === 1) {
            return res.status(204).send("User deleted")
        } else {
            return res.status(409).send("No user exists with that email")
        }
    } catch (e) {
        console.log(e)
    }
})

router.get("/getuserbytoken", auth, async (req, res) => {
    try {
        const decoded_user = jwt.verify(req.query.token, config.TOKEN_KEY);
        const user = await User.findOne({ email: decoded_user.email});

        if(!user){
            res.status(404).send(`user does not exist in this dojo`);
        }
        else{
            res.status(200).json(user);
        }
    } catch (error) {
        console.error("findUser error", error);
        
        return res.status(500).json({
            error: true,
            message: error.message,
        });
    }
});

router.get("/all", async (req, res) => {
    try {
        const users = await User.find({});

        res.status(200).json(users);

    } catch (e) {
        console.log(e);
        res.status(500).send("Invalid Credentials");
    }
});


module.exports = router