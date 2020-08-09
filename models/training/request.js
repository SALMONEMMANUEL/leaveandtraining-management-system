var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var TrainingSchema = new Schema({
     applicantID: {type: Schema.Types.ObjectId, ref: 'User', required: true},
    title: {type: String, required: true},
    place: {type: String, required: true},
    startDate: {type: Date, required: true},
    endDate: {type: Date, required: true},
    appliedDate: {type: Date, default : new Date , required: true},
    period: {type: Number, required: true, min: 1,max:100},
    reason: {type: String, required: true},
    adminResponse: {type: String, default: 'N/A'},

});


module.exports = mongoose.model('Trequest', TrainingSchema);