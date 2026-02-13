const { User } = require('../models');

exports.getProfile = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, {
            attributes: {exclude: ['password'] }
        });

        res.json({
            success: true,
            data: user
        });
    } catch (error) {
        res.status(500).json({error: "Profile cant fetch"});
    }
};

exports.getQuota = async (req,res) => {
    try {
        const user = await User.findByPk(req.user.id);

        const now = new Date();
        const hoursSinceReset = (now - new Date(user.lastQuotaReset)) / (1000 * 60 * 60);

        if (hoursSinceReset >= 24) {
            await User.update({
                dailyUsed: 0,
                lastQuotaReset: now
            });
            user.dailyUsed = 0;
        }

        const remaining = user.dailyQuota - user.dailyUsed;
        const resetIn = Math.ceil(24 - hoursSinceReset);

        res.json({
            success: true,
            data: {
                plan: user.subscriptionType,
                dailyLimit: user.dailyQuota,
                dailyUsed: user.dailyUsed,
                remaining: remaining > 0 ? remaining : 0,
                resetIn: `${resetIn} hour`
            }
        });
    } catch (error) {
        res.status(500).json({error: "Quota information cant found"});
    }
};