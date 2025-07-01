// utils/returnUtils.js

const Return = require('../models/Return'); // adjust the path according to your project structure

const countRequestedReturns = async () => {
    try {
        const result = await Return.aggregate([
            { $unwind: '$orderD' },
            { $match: { 'orderD.status': 'Requested' } },
            { $group: { _id: null, count: { $sum: 1 } } }
        ]);

        return result.length > 0 ? result[0].count : 0;
    } catch (error) {
        console.error('Error fetching count of requested returns:', error);
        throw new Error('Server error');
    }
};

module.exports = {
    countRequestedReturns,
};
