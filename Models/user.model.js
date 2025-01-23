import mongoose,{Schema} from "mongoose";

const userSchema=new Schema({
    email:{
        type:String,
        required:true,
        lowercase:true
    },
    username:{
        type:String,
        required:true,
        unique:true,
    },
    fullName:{
        type:String,
        //required:true,
    },
    refreshToken: {
        type: String
    },
    publicKey:{
        type:String,
        required:true,
    },
    address:{
        type:String,
        required:true,
    },
    privateKey:{
        type:String,
        required:true,
    },
},
{
    timestamps:true
})

export const User = mongoose.model("User", userSchema)