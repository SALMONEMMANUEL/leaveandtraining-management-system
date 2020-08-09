const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const departmentName = new Schema({
    type: {
        type: String,
        required: true,
        unique : true
    }
    

});

departmentName.index({ type : true })

module.exports = mongoose.model("department", departmentName, "department");