const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const requestSchema = new Schema({
    applicantID: {type: Schema.Types.ObjectId, ref: 'User', required: true},
    attachment: {
        type: String,
        required: true
    },
    date: {
        type: String,
        required: true
    },

});



module.exports = mongoose.model('Request', requestSchema);