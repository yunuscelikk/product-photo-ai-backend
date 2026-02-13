const jwt = require('jsonwebtoken');
const { User } = require('../models');

module.exports = async (req,res,next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({error: 'Token needed'});
        }

        const token = authHeader.split(' ')[1];

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findByPk(decoded.userId);
        if(!user) {
            return res.status(401).json({error: "User not found"});
        }

        req.user = {
            id: user.id,
            email: user.email,
            subscriptionType: user.subscriptionType
        };

        next();
    } catch (error) {
        if(error.name === 'JsonWebTokenError') {
            return res.status(401).json({error: "Invalid token"});
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({error: "Token expired"});
        }
        res.status(500).json({error: "Authorization Error"});
    }
};