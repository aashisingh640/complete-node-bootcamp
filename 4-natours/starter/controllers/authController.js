const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');
const appError = require('./../utils/appError');

function getToken(id) {
    return jwt.sign({ id: id }, process.env.JWT_SECRET_TOKEN, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });
}

async function protect(req, res, next) {
    try {

        let token = '';

        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split('Bearer ')[1];
        }

        if (!token) {
            return next(new appError('You are not logged in. Please login again.', 401));
        }
        
        const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET_TOKEN);
        
        if (!decoded) {
            return next(new appError('You are not logged in. Please login again.', 401));
        }
        
        const freshUser = await User.findById(decoded.id);
        
        if (!freshUser) {
            return next(new appError('Your account has been deleted.', 401));
        }
        
        if (freshUser.changedPasswordAfter(decoded.iat)) {
            return next(new appError('Your password has been changed recently. Please login again.', 401));
        }

        req.user = freshUser;

        next();

    } catch(err) {
        console.log(err);
        if (err.name === 'TokenExpiredError') {
            return next(new appError('Your token has expired. Please login again.', 401)); 
        }
        return next(new appError('You are not logged in. Please login again.', 401)); 
    }
}

async function signUp(req, res) {

    try {

        const newUser = await User.create({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
            passwordConfirm: req.body.passwordConfirm,
        });

        if (!newUser) return;

        const token = getToken(newUser._id);
        
        return res.status(201).json({ 
            success: true,
            token,
            data: {
                users: newUser
            }
        })

    } catch (err) {
        return res.status(400).json({ 
            success: false,
            message: err
        })
    }

}

async function login(req, res, next) {

    try {

        const { email, password } = req.body;

        if (!email || !password) {
            return next(new appError('Please provide email and password', 400));
        }

        const user = await User.findOne({ email }).select('+password');

        if (!user || !(await user.correctPassword(password, user.password))) {
            return next(new appError('Incorrect email or passwrd', 401))
        }
        
        const token = getToken(user._id);
        return res.json({ 
            success: true,
            token
        })

    } catch (err) {
        return res.status(400).json({ 
            success: false,
            message: err
        })
    }

}

module.exports = { protect, signUp, login };