const mongoose = require("mongoose")

const reportSchema = new mongoose.Schema({
    reportId: {type: String, default: null, unique: true},
    createdAt: {type: Date, default: null},
    createdBy: {type: String, default: null},
    numGroups: {type: Number, default: 0},
    labels: {type: [String], default: null},
    groups: {type: [[{}]], default: null},
    pieData: {type: [{}], default: null}
})

module.exports = mongoose.model("report", reportSchema, 'Reports');