const User = require('./../models/userModel');
const appError = require('./../utils/appError');

async function getAllUsers(req, res) {
    try {

        const users = await User.find();
        
        return res.json({
            success: true,
            result: users.length,
            data: {
                users
            }
        })
    } catch (err) {
        console.log(err);
        return res.status(500).json({ 
            success: false,
            message: err.message || err
        })
    }
}

function getUser(req, res) {
    const id = +req.params.id;

    const user = users.find(user => user.id === id);

    if (!user) {
        return res.status(404).json({ 
            success: false,
            message: 'user not found with the given id'
        })
    }

    res.json({ 
        success: true,
        data: {
            user
        }
    })
}

function createNewUser(req, res) {

    const newID = users[users.length - 1].id + 1;

    const newUser = Object.assign({ id: newID }, req.body);

    users.push(newUser);

    fs.writeFile(filePath, JSON.stringify(users), err => {
        if (err) {
            return res.status(500).json({ 
                success: false,
                message: error
            })
        }
        res.status(201).json({ 
            success: true,
            data: {
                user: newUser
            }
        })
    })

}

function updateUser(req, res) {

    const id = +req.params.id;
    
    const index = users.findIndex(user => user.id === id);

    if (index === -1) {
        return res.status(404).json({ 
            success: false,
            message: 'user not found with the given id'
        })
    }

    const user = users[index];

    const updatedUser = Object.assign(user, req.body);

    users[index] = updatedUser;

    fs.writeFile(filePath, JSON.stringify(users), err => {
        if (err) {
            return res.status(500).json({ 
                success: false,
                message: error
            })
        }
        res.status(200).json({ 
            success: true,
            data: {
                users: updatedUser
            }
        })
    })

}

function deleteUser(req, res) {

    const id = +req.params.id;

    const index = users.findIndex(user => user.id === id);

    if (index === -1) {
        return res.status(404).json({ 
            success: false,
            message: 'user not found with the given id'
        })
    }

    users.splice(index, 1);

    fs.writeFile(filePath, JSON.stringify(users), err => {
        if (err) {
            return res.status(500).json({ 
                success: false,
                message: error
            })
        }
        res.status(204).json({
            success: true,
            data: null
        })
    })

}

module.exports = { getAllUsers, getUser, updateUser, createNewUser, deleteUser };