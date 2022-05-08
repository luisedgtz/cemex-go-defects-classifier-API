const mongoose = require("mongoose")

const reportSchema = new mongoose.Schema({
    reportId: {type: String, default: null, unique: true},
    fileLink: {type: String, default: null, unique: false},
    createdAt: {type: Date, default: null},
    createdBy: {type: String, default: null},
    department: {type: String, default: null},
    numGroups: {type: Number, default: 0},
    labels: {type: [String]},
})

module.exports = mongoose.model("report", reportSchema, 'Reports');