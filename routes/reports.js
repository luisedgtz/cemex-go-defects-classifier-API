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
        const reports = await Report.find({}).sort({createdAt: -1});
        res.status(200).json(reports);
    } catch (e) {
        console.log(e);
        res.status(500).send("There was an error getting reports");
    }
});

router.post("/new", async (req, res) => {
    try {
        // Get report input
        //const { fileLink, createdBy, department, numGroups, labels, groups} = req.body;
        const { user, numGroups, labels, groups, pieData} = req.body;

        console.log(req.body.labels)

        //Get current date when this function was called
        const now = new Date();
            
        // Create unique report Id. (We can be sure that its unique because its specific to the user and second it was created)
        //const reportId = `${createdBy}:${now.getTime()}`
        var username = user.name.substring(0,2) + user.lastname.substring(0,2)

        const reportId = `${username.toUpperCase()}:${now.getTime()}`

        // Validate user input
        if (!(user && numGroups && labels && groups && pieData)) {
            return res.status(400).send("There is missing information");
        }

        const report = await Report.create({
            reportId: reportId,
            createdAt: now, 
            createdBy: user.username,
            numGroups: numGroups,
            labels: labels,
            groups: groups,
            pieData: pieData
        });

        return res.status(201).send("Succesfully created report");
        //res.status(201).json("Hola");
    } catch (e) {
        console.log(e)
        res.status(500).send("Something went wrong");
    }
});

router.get("/byDate", async (req, res) => {
    try {
        // Get input
        const { minDate, maxDate} = req.query;

        // Validate user input
        if (!(minDate && maxDate)) {
            return res.status(400).send("All input is required");
        }

        var from = new Date(minDate)
        var to = new Date(maxDate)

        to.setDate(to.getDate() + 1)

        const reportsByDate = await Report.find({
            createdAt: {
                $gt: from,
                $lt: to
            }
        }).sort({createdAt: -1}); 

        res.status(200).json(reportsByDate);
        
    } catch (e) {
        console.log(e)
        res.status(500).send("Something went wrong");
    }
});

router.get("/byUser", async (req, res) => {
    try {
        //Get input
        const {username} = req.query

        if (!username) {
            return res.status(400).send("All input is required")
        }

        const reportsByUser = await Report.find({
            createdBy: username
        }).sort({createdAt: -1})

        res.status(200).json(reportsByUser)
    } catch (e) {
        console.log(e)
        res.status(500).send("There was an error")
    }
})

router.get("/byUserDate", async (req, res) => {
    try {
        //Get input
        const {username, minDate, maxDate} = req.query

        //Validate user input
        if (!(username && minDate && maxDate)) {
            return res.status(400).send("All input is required")
        }

        var from = new Date(minDate)
        var to = new Date(maxDate)

        to.setDate(to.getDate() + 1)

        const reportsByUserDate = await Report.find({
            createdBy: username,
            createdAt: {
                $gt: from,
                $lt: to
            }
        }).sort({createdAt: -1});

        res.status(200).json(reportsByUserDate);

    } catch (e) {
        console.log(e)
        res.status(500).send("There was an error")
    }
})

router.post('/script', async (req, res) => {
    const { defects_array, cluster_number } = req.body

    try {
        console.log("Received request to /script endpoint")
        const response = await axios.post('http://127.0.0.1:5000/classify', {
            "defects_array": defects_array,
            "cluster_number": cluster_number
        })
        res.status(200).json(response.data);

    } catch(error) {
        console.log(error)
    }
});

router.delete("/delete", async (req, res) => {
    try {
        const {reportId} = req.query

        if (!reportId) {
            return res.status(400).send("Missing report id")
        }

        const report = await Report.deleteOne({reportId})

        if (report.deletedCount === 1) {
            return res.status(204).send("Report deleted")
        } else {
            return res.status(409).send("No reports exists with that id")
        }
    } catch (e) {
        console.log(e)
    }
})

module.exports = router
