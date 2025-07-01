const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const walletHistorySchema = new Schema({
    userid: {
      type: Schema.Types.ObjectId,
    },
    Transaction: [
      {
        amount: { type: Number },
        reason: { type: String },
        type: { type: String },
        date: { type: Date },
      },
    ],
  });

const WalletHistory = mongoose.model("walletHistory", walletHistorySchema);
module.exports = WalletHistory;