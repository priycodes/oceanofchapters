const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const bookSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    author: String,
    description: String,
    image: {
        type: String,
        default: "https://i.pinimg.com/736x/2b/67/60/2b6760353435b8ef1a3437385a381039.jpg",
        set: (v) => 
            v === ""
            ? "https://i.pinimg.com/736x/2b/67/60/2b6760353435b8ef1a3437385a381039.jpg"
            : v,
        },
        price: Number,
        releasedate: Date,
        country: String,
        genre: [String],
        pages: Number, 
});

const Book = mongoose.model("Book", bookSchema);
module.exports = Book;

