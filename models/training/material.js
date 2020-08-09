const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const requestSchema = new Schema({
    attachment: {
        type: String,
        required: true
    },
    date: {
        type: String,
        required: true
    },

});



module.exports = mongoose.model('Material', requestSchema);