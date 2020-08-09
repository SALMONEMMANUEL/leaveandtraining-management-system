var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var LeaveSchema = new Schema({
    // _id:mongoose.Schema.Types.ObjectId,
     applicantID: {type: Schema.Types.ObjectId, ref: 'User', required: true},
    title: {type: String, required: true},
    // department: {type: Schema.Types.ObjectId, ref: 'Department', required: true},
    type: {type: String, required: true},
    startDate: {type: Date, required: true},
    endDate: {type: Date, required: true},
    appliedDate: {type: Date, default : new Date , required: true},
    period: {type: Number, required: true, min: 1,max:100},
    reason: {type: String, required: true},
    salary:{
        type:Number,
        required:true
    },
    payable:{
        type:String,
       
    },
    address:{
        type:String,
        required:true
    },
    bankType:{
        type:String,
    
    },
    bankLocation:{
        type:String,
    
    },
    HeadofdepartResponse: {type: String, default: 'R/A'},
    managerResponse: {type: String, default: 'R/A'},
    adminResponse: {type: String, default: 'N/A'},
    reasons: {type: String, default: 'N/A'},

});


module.exports = mongoose.model('Leave', LeaveSchema);