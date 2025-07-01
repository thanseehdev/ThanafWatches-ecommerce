const mongoose = require("mongoose")
const Schema = mongoose.Schema;

const walletSchema = new Schema({
    userid: { type: Schema.Types.ObjectId },
    walletB: {
      type: Number,
    },
    invited: [
      {
        type: Schema.Types.ObjectId,
        ref: 'user',
      },
    ],
  });

  const Wallet = mongoose.model("wallet",walletSchema);

  module.exports = Wallet