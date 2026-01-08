const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const cartSchema = new Schema({
    items: [
        {
            book: {
                type: Schema.Types.ObjectId,
                ref: "Book",
                required: true
            },
            quantity: {
                type: Number,
                default: 1,
                min: 1
            }
        }
    ]
});

const Cart = mongoose.model("Cart", cartSchema);
module.exports = Cart;