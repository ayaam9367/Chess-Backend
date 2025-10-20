const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const ObjectId = mongoose.Types.ObjectId

const userSchema = new mongoose.Schema({
    name  : {
        type : String,
    },
    email : {
        type : String,
    },
    username : {
        type : String,
    },
    phoneNo : {
        type : Number,
    },
    countryCode : {
        type : Number,
    },
    password : {
        type : String,
    },
    socialLinks : {
        type : []
    },
    profilePic : {
        type : String,
    },
    profileDescription : {
        type : String
    },
    isDeleted : {
        type : Boolean,
    },
    createLogs : {
        type : [
            {
                createdAt : {
                    type : Number,
                    default : Date.now
                }
            }
        ]
    },

    updateLogs : {
        type : [
            {
                updatedAt : {
                    type : Number,
                    default : Date.now
                },
                data : {
                    type : Object
                }
            }
        ]
    }
}, { timestamps: true });

userSchema.methods.getJWTToken = function(){
    const token = jwt.sign({id : this._id}, process.env.JWT_PRIVATE_KEY, {
        expiresIn : `${process.env.JWT_EXPIRES_IN}`
    });

    return token;
}

module.exports = mongoose.model("UserModel", userSchema);