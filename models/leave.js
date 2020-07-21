var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var LeaveSchema = new Schema({
    // _id:mongoose.Schema.Types.ObjectId,
     applicantID: {type: Schema.Types.ObjectId, ref: 'User', required: true},
    title: {type: String, required: true},
    // leavetypeID: {type: Schema.Types.ObjectId, ref: 'Leavetype', required: true},
    type: {type: String, required: true},
    startDate: {type: Date, required: true},
    endDate: {type: Date, required: true},
    appliedDate: {type: Date, default : new Date , required: true},
    period: {type: Number, required: true, min: 1,max:100},
    reason: {type: String, required: true},
    adminResponse: {type: String, default: 'N/A'},

});


module.exports = mongoose.model('Leave', LeaveSchema);