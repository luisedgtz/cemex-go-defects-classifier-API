const axios = require("axios")

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
const { response } = require("express");

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
        //const { fileLink, createdBy, department, numGroups, labels, groups} = req.body;
        const { department, numGroups, labels, groups} = req.body;  //de momento todavia no tomamos el createdBy ni el department

        //Get current date when this function was called
        const now = new Date();
            
        // Create unique report Id. (We can be sure that its unique because its specific to the user and second it was created)
        //const reportId = `${createdBy}:${now.getTime()}`
        const reportId = `${"ADMIN"}:${now.getTime()}`

        // Validate user input
        if (!(department && numGroups && labels && groups)) {
            res.status(400).send("All input is required");
        }

        const report = await Report.create({
            reportId: reportId,
            createdAt: now, 
            createdBy: "DEV",
            department: department,
            numGroups: numGroups,
            labels: labels,
            groups: groups
        });

        res.status(201).json(report);
        //res.status(201).json("Hola");

        
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

router.post('/script', async (req, res) => {
    const { defects_array, cluster_number } = req.body


    try {
        console.log("Received request to /script endpoint")
        const response = await axios.post('http://127.0.0.1:5000/classify', {
            "defects_array": defects_array,
            "cluster_number": cluster_number
        })
        //console.log(response.data.length)
        //console.log(response.data[0][1])

        res.status(201).json(response.data);

    } catch(error) {
        console.log(error)
    }

    
    // let dataToSend;

    //console.log( req.body.defects_array)


    // spawn new child process to call the python script
    //make the second parameter be the data array sent in the req body

    // const python = spawn('python', ['./scripts/process.py', JSON.stringify(req.body.defects_array)]);


    
    // // collect data from script
    // python.stdout.on('data', function (data) {
    //     console.log('Pipe data from python script ...');
    //     dataToSend = data.toString();
    // });

    // // in close event we are sure that stream from child process is closed
    // python.on('close', (code) => {
    //     console.log(`child process close all stdio with code ${code}`);
    //     // send data to browser
    //     res.send(dataToSend)
    // });
    
});

module.exports = router
