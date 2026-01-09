require("dotenv").config();

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Book = require("./models/book.js");
const path = require("path");
const session = require("express-session");
const ejsMate = require("ejs-mate");
app.use(express.static(path.join(__dirname, "/public")));

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
app.engine("ejs", ejsMate);

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
}));

app.use((req, res, next) => {
  if (!req.session.cart) {
    req.session.cart = { items: [] };
  }
  next();
});


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
app.get("/cart", async (req, res) => {
  const cart = req.session.cart;

  // populate books manually
  for (let item of cart.items) {
    item.book = await Book.findById(item.book);
  }

  res.render("cart/index", { cart });
});

//Add Cart Route
app.post("/cart/add/:id", async (req, res) => {
  const bookId = req.params.id;
  const cart = req.session.cart;

  const existingItem = cart.items.find(
    item => item.book.toString() === bookId
  );

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.items.push({ book: bookId, quantity: 1 });
  }

  req.session.cart = cart;
  res.redirect("/books");
});


//Clear Cart
app.post("/cart/clear", (req, res) => {
  req.session.cart = { items: [] };
  res.redirect("/cart");
});


//increase quantity
app.post("/cart/increase/:id", async (req, res) => {
  const bookId = req.params.id;
  const cart = req.session.cart;

  const item = cart.items.find(i => i.book._id.toString() === bookId);
  if (item) item.quantity++;

  req.session.cart = cart;
  res.redirect("/cart");
});

// decrease quantity
app.post("/cart/decrease/:id", async (req, res) => {
  const bookId = req.params.id;
  const cart = req.session.cart;

  const item = cart.items.find(i => i.book._id.toString() === bookId);
  if (item) {
    item.quantity--;
    if (item.quantity <= 0) {
      cart.items = cart.items.filter(i => i.book._id.toString() !== bookId);
    }
  }

  req.session.cart = cart;
  res.redirect("/cart");
});

// remove item
app.post("/cart/remove/:id", async (req, res) => {
  const bookId = req.params.id;
  const cart = req.session.cart;

  cart.items = cart.items.filter(i => i.book._id.toString() !== bookId);
  req.session.cart = cart;

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