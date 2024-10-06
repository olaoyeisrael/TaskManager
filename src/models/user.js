const mongoose = require('mongoose')
const validator = require('validator')
const bcyrpt = require('bcrypt')
const jwt = require('jsonwebtoken')
const Task = require('./task')


const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Email is invalid')
            }
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 7,
        trim: true,
        validate(value) {
            if (value.toLowerCase().includes('password')) {
                throw new Error('Password cannot contain "password"')
            }
        }
    },
    age: {
        type: Number,
        default: 0,
        validate(value) {
            if (value < 0) {
                throw new Error('Age must be a postive number')
            }
        }
    },
    tokens:[{
        token: {
            type: String,
            required: true
        }

    }],
    avatar:{
        type: Buffer
    }
},{
    timestamps: true
})

userSchema.virtual('tasks',{
    ref: 'Task',
    localField: '_id',
    foreignField: 'owner'

})

// Being used to generate token for authentication
userSchema.methods.generateAuthToken = async function () {
    const user = this
    const token = jwt.sign({_id : user._id.toString()}, process.env.JWT_SECRET)
    user.tokens = user.tokens.concat({token: token})
    await user.save()
    return token
}

// Used to validate the email and password being entered by user
userSchema.statics.findByCredentials = async(email, password)=>{
    const user = await User.findOne({email})
    if (!user){
        throw new Error('Unable to login')
    }
    const isMatch = await bcyrpt.compare(password, user.password)

    if (!isMatch){
        throw new Error('Unable to login')
    }
    return user
}


// This will help you delete what you don't want to be sent back to the user
userSchema.methods.toJSON = function (){
    const user = this
    const userObject  = user.toObject()

    delete userObject.password
    delete userObject.tokens
    delete userObject.avatar

    return userObject
}


// Hash password before saving it
userSchema.pre('save', async function(next) {
    const user = this

    if (user.isModified('password')){
        user.password = await bcyrpt.hash(user.password, 8)

    }
    next()
    
})

// Delete user tasks when user is removed
userSchema.pre('remove', async function (next) {
    const user  = this
    await Task.deleteMany({ owner : user._id})
    next()
    
})

const User = mongoose.model('User', userSchema)

module.exports = User;