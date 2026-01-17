require("dotenv").config();

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Book = require("./models/book.js");
const path = require("path");
const session = require("express-session");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js"); 
app.use(express.static(path.join(__dirname, "/public")));
const Review = require("./models/review.js");
const methodOverride = require("method-override");

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
app.use(methodOverride("_method"));

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
app.get("/books", wrapAsync(async(req, res) => {
    const allBooks = await Book.find({});
    res.render("books/index.ejs", {allBooks});
}));

//Show Route
app.get("/books/:id", wrapAsync(async (req, res) => {
    let {id} = req.params;
    const book = await Book.findById(id).populate("reviews");
    res.render("books/show.ejs", { book });
}));

//Cart Route
app.get("/cart", wrapAsync(async (req, res) => {
  const cart = req.session.cart;

  const populatedItems = [];
  for (let item of cart.items) {
    const book = await Book.findById(item.book);
    if (book) {
      populatedItems.push({
        book,
        quantity: item.quantity
      });
    }
  }
  res.render("cart/index", { cart: { items: populatedItems } });
}));


//Add Cart Route
app.post("/cart/add/:id", wrapAsync(async (req, res) => {
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
}));


//Clear Cart
app.post("/cart/clear", (req, res) => {
  req.session.cart = { items: [] };
  res.redirect("/cart");
});

//increase quantity
app.post("/cart/increase/:id", wrapAsync(async (req, res) => {
  const bookId = req.params.id;
  const cart = req.session.cart;

  const item = cart.items.find(i => i.book === bookId);
  if (item) item.quantity++;

  req.session.cart = cart;
  res.redirect("/cart");
}));

// decrease quantity
app.post("/cart/decrease/:id", wrapAsync(async (req, res) => {
  const bookId = req.params.id;
  const cart = req.session.cart;

  const item = cart.items.find(i => i.book === bookId);
  if (item) {
  item.quantity--;
  if (item.quantity <= 0) {
    cart.items = cart.items.filter(i => i.book !== bookId);
  }
}

  req.session.cart = cart;
  res.redirect("/cart");
}));

// remove item
app.post("/cart/remove/:id", wrapAsync(async (req, res) => {
  const bookId = req.params.id;
  const cart = req.session.cart;

  cart.items = cart.items.filter(i => i.book !== bookId);
  req.session.cart = cart;

  res.redirect("/cart");
}));

//Reviews
//Post Route
app.post("/books/:id/reviews", async(req, res) => {
  let book = await Book.findById(req.params.id);
  let newReview = new Review(req.body.review);

  book.reviews.push(newReview);

  await newReview.save();
  await book.save();

  res.redirect(`/books/${book._id}`);
});

// Delete Review Route
app.delete("/books/:id/reviews/:reviewId",
  wrapAsync(async(req, res) => {
    let {id, reviewId} = req.params;

    await Book.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
    await Review.findByIdAndDelete(reviewId);

    res.redirect(`/books/${id}`);
  })
);

app.use((req, res, next) => {
  next(new ExpressError(404, "Page Not Found!"));
});

app.use((err, req, res, next) => {
  let {statusCode=500, message="Something went wrong!"} = err;
  res.status(statusCode).send(message);
});

app.listen(8080, () => {
    console.log("server is listening to port 8080");
});