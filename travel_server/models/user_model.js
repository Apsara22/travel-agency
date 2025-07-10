import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required: true,
    },
    // ... other fields ...
 address: {
    text: String,
    components: { // Optional but recommended
      ward: String,
      local_level: String,
      district: String,
      province: String
    },
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
     email:{
        type:String,
        required: true,
        unique: true,
    },
    password:{
        type:String,
        required: true,
    }
}, {timestamps: true})

const User = mongoose.model('User', userSchema)

export default User