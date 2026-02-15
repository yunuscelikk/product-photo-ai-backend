const { User } = require('../models');

module.exports = async (req, res, next) => {
    try {
        const user = await User.findByPk(req.user.id);

        if(!user) {
            return res.status(404).json({ error: 'User not found'});
        }

        const now = new Date();
        const lastReset = new Date(user.lastQuotaReset);
        const hoursSinceReset = (now - lastReset) / (1000 * 60 * 60);

        if(hoursSinceReset >= 24) {
            await user.update({
                dailyUsed: 0,
                lastQuotaReset: now
            });
            user.dailyUsed = 0;
        }

        if(user.dailyUsed >= user.dailyQuota) {
            const resetIn = Math.ceil(24 - hoursSinceReset);
            return res.status(429).json({
                error: 'Daily quota reached',
                quota: {
                    limit: user.dailyQuota,
                    used: user.dailyUsed,
                    remaining: 0,
                    resetIn: `${resetIn} hour`,
                    plan: user.subscriptionType
                }
            });
        }

        req.userModel = user;
        req.quota = {
            limit: user.dailyQuota,
            used: user.dailyUsed,
            remaining: user.dailyQuota - user.dailyUsed
        };

        next();
    } catch (error) {
        console.error('Quota middleware error', error);
        res.status(500).json({error: 'Quota control failed'});
    }
};