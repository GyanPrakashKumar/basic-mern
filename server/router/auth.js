const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/userSchema');
const bcrypt = require('bcryptjs');
const router = express.Router();

require('../db/config.js');

router.get('/', (req, res) => {
    res.send('Hello from the other side auth.js!')
});

/*
// Using Promises
router.post('/register', (req, res) => {
    const { name, email, phone, work, password, cpassword, date } = req.body;
    if (!name || !email || !phone || !work || !password || !cpassword || !date) {
        return res.status(422).json({ error: "Please fill all the fields" });
    }
    User.findOne({ email: email })
        .then((userExist) => {
            if (userExist) {
                return res.status(422).json({ error: "Email already exists" });
            }
            const user = new User({ name, email, phone, work, password, cpassword, date });
            user.save().then(() => {
                res.status(201).json({ message: "User registered successfully" });
            }).catch((err) => res.status(500).json({ error: "Failed to register" }));
        })
        .catch((err) => { 
            console.log(err); 
        });        
});
*/
// Using Async/Await
router.post('/register', async (req, res) => {
    const { name, email, phone, work, password, cpassword, date } = req.body;
    if (!name || !email || !phone || !work || !password || !cpassword || !date) {
        return res.status(422).json({ error: "Please fill all the fields" });
    }
    try {
        const userExist = await User.findOne({ email: email });

        const user = new User({ name, email, phone, work, password, cpassword, date });

        if (userExist) {
            return res.status(422).json({ error: "Email already exists" });
        }

        await user.save();
        res.status(201).json({ message: "User registered successfully" });
    } catch (err) {
        console.log(err);
    }
});

// Login Route
router.post('/signin', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: "Please fill all the fields" });
        }
        const userDetails = await User.findOne({ email: email });
        
        if (userDetails) {
            const isPassMatch = await bcrypt.compare(password, userDetails.password);
            const token = await userDetails.generateAuthToken();

            res.cookie("JWTtoken", token, {
                expires: new Date(Date.now() + 25892000000),
                httpOnly: true
            });

            if (isPassMatch) {
                res.status(201).json({ message: "You're signed in ????" });
            } else {
                res.status(400).json({ error: "Invalid credentials ????" });
            }
        }
    } catch (error) {
        console.log(error);
    }    
});

module.exports = router;