const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A user must have a name'],
        unique: [true, 'Name must be unique'],
        trim: true,
    },
    email: {
        type: String,
        required: [true, 'A user must have an email'],
        unique: [true, 'Email must be unique'],
        lowercase: true,
        validate: [validator.isEmail, 'Please provide a valid email']
    },
    photo: String,
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: 8,
        select: false
    },
    passwordConfirm: {
        type: String,
        required: [true, 'Please confirm the password'],
        //validation only works on SAVE.
        validate: {
            message: 'Password should be same',
            validator: function(value) {
                return value === this.password
            }
        }
    },
    passwordChangedAt: Date
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
})

//document middleware, works only before .save() or .create(), can have multiple middlewares for same state
userSchema.pre('save', async function (next) {

    //encrypt the password only if it is modified
    if (!this.isModified('password')) return next();

    //hash the password with cost of 12
    this.password = await bcrypt.hash(this.password, 12);

    //do not save the confirmed password in the database
    this.passwordConfirm = undefined;
    next();
})

//create an instance method which will be available on all documents of User
userSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
    return await bcrypt.compare(candidatePassword, userPassword);
}

userSchema.methods.changedPasswordAfter = function (JWTTimeStamp) {
    if (this.passwordChangedAt) {
        const changedTimeStamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
        return JWTTimeStamp < changedTimeStamp;
    }
    return false
}

const User = new mongoose.model('User', userSchema);

module.exports = User;