const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const bookSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    author: String,
    authorImage: {
    type: String,
    default: "https://i.pinimg.com/736x/8a/f5/75/8af575926cd462281e58589821ddf6c9.jpg"
    },
    authorBio: {
    type: String,
    default: ""
    },
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
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: "Review",
        },
    ],
});

const Book = mongoose.model("Book", bookSchema);
module.exports = Book;

