const mongoose = require("mongoose")
const Schema = mongoose.Schema;

const leave = new Schema({

    type : {
        type : String,
        required : true,
        unique : true
    },
    appdate:{
        type:Date,
        required:true
    },
    period : {
        type : Number,
        required : true
    }
})

leave.index({ type : true })

module.exports = mongoose.model("leave", leave, "leave");