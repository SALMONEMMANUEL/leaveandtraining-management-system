const mongoose = require('mongoose')
const Schema = mongoose.Schema;
const createLeaveSchema = new Schema({
    // _id:mongoose.Schema.Types.ObjectId,
leave:{
    type:String,
    required:true
   
} ,
code:{
    type:String,
    required:true

} ,
name:{
    type:String,
    required:true
    
},
appdate:{
    type:Date,
    required:true
}  ,
period:{
    type:Number,
    required:true
    
} 

})

module.exports = mongoose.model('Leavetype',createLeaveSchema)