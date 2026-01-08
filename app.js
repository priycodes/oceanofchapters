const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Book = require("./models/book.js");
const path = require("path");
const Cart = require("./models/cart.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/oceanofchapters";

main()
.then(() => {
    console.log("connected to DB");
})
.catch((err) => {
    console.log(err);
});

async function main() {
    await mongoose.connect(MONGO_URL);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended: true}));

app.get("/", (req, res) => {
    res.send("Hi, I am root");
});

//Index Route
app.get("/books",async(req, res) => {
    const allBooks = await Book.find({});
    res.render("books/index.ejs", {allBooks});
});

//Show Route
app.get("/books/:id", async (req, res) => {
    let {id} = req.params;
    const book = await Book.findById(id);
    res.render("books/show.ejs", { book });
});

//Cart Route
app.get("/cart", async(req, res) => {
    const cart = await Cart.findOne().populate("items.book");
    res.render("cart/index", { cart });
});

//Add Cart Route
app.post("/cart/add/:id", async(req, res) => {
    const bookId = req.params.id;

    let cart = await Cart.findOne({});

    if (!cart) {
        cart = new Cart({ items: [] });
    }

    const existingItem = cart.items.find(
        item => item.book.toString() === bookId
    );

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.items.push({ book: bookId, quantity: 1 });
    }

    await cart.save();
    res.redirect("/books");
});

//Clear Cart
app.post("/cart/clear", async (req, res) => {
  await Cart.deleteMany({});
  res.redirect("/cart");
});


app.get("/testBook", async(req, res) => {
    let sampleBook = new Book({
        title: "It Ends With Us",
        author: "Colleen Hoover",
        description: "It Ends with Us follows Lily Bloom...",
        price: 499,
        releasedate: new Date("2016-08-02"),
        country: "USA",
        genre: ["Fiction", "Romance"],
        pages: 376,
    });
    await sampleBook.save();
    console.log("sample was saved");
    res.send("successful testing");
});

app.listen(8080, () => {
    console.log("server is listening to port 8080");
});