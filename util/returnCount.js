const Return = require('../model/returnModel');

const countRequestedReturns = async () => {
    try {
        const count=await Return.find({status:'Requested'}).count()
        return count ? count : 0
    } catch (error) {
        console.error('Error fetching count of requested returns:', error);
        throw new Error('Server error');
    }
};

module.exports = {
    countRequestedReturns,
};

