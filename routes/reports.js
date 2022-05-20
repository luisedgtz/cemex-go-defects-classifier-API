require("dotenv").config();
//require("../config/database").connect();
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const path = require('path');
const scriptFilename = path.join('../s', 'scripts', 'process.py');

const {spawn} = require('child_process')

const Report = require("../model/report");

const auth = require("../middleware/auth");

router.get("/all", async (req, res) => {
    try {
        //Search with empty filter to return all reports
        const reports = await Report.find({});

        res.status(200).json(reports);

    } catch (e) {
        console.log(e);
        res.status(500).send("Invalid Credentials");
    }
});

router.post("/new", async (req, res) => {
    try {
        // Get report input
        const { fileLink, createdBy, department, numGroups, labels} = req.body;

        //Get current date when this function was called
        const now = new Date();
        
        // Create unique report Id. (We can be sure that its unique because its specific to the user and second it was created)
        const reportId = `${createdBy}:${now.getTime()}`

        // Validate user input
        if (!(fileLink && createdBy && department && numGroups && labels)) {
            res.status(400).send("All input is required");
        }

        const report = await Report.create({
            reportId, 
            fileLink,
            createdAt: now, 
            createdBy,
            department,
            numGroups,
            labels
        });

        res.status(201).json(report);
        
    } catch (e) {
        console.log(e)
        res.status(500).send("Something went wrong");
    }
});

router.get("/byDate", async (req, res) => {
    try {
        // Get input
        const { minDate, maxDate} = req.body;

        // Validate user input
        if (!(minDate && maxDate)) {
            res.status(400).send("All input is required");
        }

        const reportsByDate = await Report.find({
            createdAt: {
                $gt: new Date(minDate),
                $lt: new Date(maxDate)
            }
        }); 

        res.status(200).json(reportsByDate);
        
    } catch (e) {
        console.log(e)
        res.status(500).send("Something went wrong");
    }
});

router.get('/script', (req, res) => {
    const { cluster_number, defects_array } = req.body 
    let dataToSend;

    // spawn new child process to call the python script
    //make the second parameter be the data array sent in the req body
    const python = spawn('python3', ['./scripts/process.py', JSON.stringify(defects_array), cluster_number]);
    
    // collect data from script
    python.stdout.on('data', function (data) {
        console.log('Pipe data from python script ...');
        dataToSend = data.toString();
    });

    // in close event we are sure that stream from child process is closed
    python.on('close', (code) => {
        console.log(`child process close all stdio with code ${code}`);
        // send data to browser
        res.send(dataToSend)
    });
    
});

module.exports = router
