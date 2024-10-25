const mongoose= require('mongoose');
const Schema = mongoose.Schema;
const rqString = {
    type:String,
    required :true
}
const rqDate = {
    type:Date,
    required:true
}
module.exports={
    mongoose,
    Schema,
    rqString,
    rqDate
}