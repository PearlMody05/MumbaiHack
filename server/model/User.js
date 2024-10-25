const {mongoose,Schema,rqString} = require('./setup')
const UserSchema = new Schema({
    name: rqString,
    email:{
        ...rqString,
        match:/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/
    },
    password:rqString,
    isVerified:{
        type:Boolean,
        default:false
    }

})
const User = mongoose.model("User",UserSchema);
module.exports=User;