const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const cartItemSchema = new Schema({
    book: {
        type: Schema.Types.ObjectId,
        ref: "Book",
        required: true
    },
    quantity: {
        type: Number,
        default:1,
        min: 1
    },
    price: {
        type: Number,
        required: true
    }
});

const cartSchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true
        },
        items: [cartItemSchema]
    },
    {timestamps: true}
);

module.exports = mongoose.model('Cart', cartSchema);