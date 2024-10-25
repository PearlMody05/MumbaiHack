const {mongoose,Schema,rqString}=require('./setup');

const OtpSchema = new Schema({
    userId:{
        type: Schema.Types.ObjectId,
        ref: 'User',
        unique: true,  // Assuming each user has one OTP at a time
        required: true
    },
    code:rqString,
    expiry:{
        type:Date,
        required: true
    }
})

const Otp = mongoose.model('Otp',OtpSchema);
module.exports = Otp;