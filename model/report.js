const mongoose = require("mongoose")

const reportSchema = new mongoose.Schema({
    reportId: {type: String, default: null, unique: true},
    createdAt: {type: Date, default: null},
    createdBy: {type: String, default: null},
    department: {type: String, default: null},
    numGroups: {type: Number, default: 0},
    labels: {type: [String], default: null},
    groups: {type: [[String]], default: null}
})

module.exports = mongoose.model("report", reportSchema, 'Reports');

/*
[ 
    ["Defect 1", "Defect 2"] , 
    ["Defect 3", "Defect 4"] ,
    ["Defect 5", "Defect 6"] , 
    ["Defect 7", "Defect 8"]
]
*/