const bcrypt =  require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

const generateToken = (userId) => {
    return jwt.sign({userId}, process.env.JWT_SECRET, {
        expiresIn: '7d'
    });
};

exports.register = async (req,res) => {
    try{
        const {email,password,name} = req.body;

        if(!email || !password) {
            return res.status(400).json({error: 'Email and password required'});
        }

        const existingUser = await User.findOne({where: {email}});
        if(existingUser) {
            return res.status(400).json({error: 'Email is already in use'});
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            email,
            password: hashedPassword,
            name: name || null
        });

        const token = generateToken(user.id);

        res.status(201).json({
            success: true,
            data: {
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    subscriptionType: user.subscriptionType,
                    dailyQuota: user.dailyQuota
                }
            }
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({error: 'Register failed'});
    }
};

