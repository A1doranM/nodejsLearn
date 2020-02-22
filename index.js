const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const exphbs = require("express-handlebars");
const homeRoutes = require("./routes/home");
const addRoutes = require("./routes/add");
const cartRoutes = require("./routes/cart");
const coursesRoutes = require("./routes/courses");
const ordersRoutes = require("./routes/orders");
const User = require("./models/user");

const app = express();
const dataBaseURL = "mongodb+srv://Aldoran:1q2w3e3e2w1q4r@cluster0-w7nfz.mongodb.net/shop";

const hbs = exphbs.create({
    defaultLayout: "main",
    extname: "hbs"
});

app.engine("hbs", hbs.engine);
app.set("view engine", "hbs");
app.set("views", "views");

app.use(async (req, res, next) => {
    try {
        const user = await User.findById("5e31916bc6a9f1011c0d9147");
        req.user = user;
        next();
    } catch (e) {
        console.log(e);
    }
});

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({extended: true}));

app.use("/", homeRoutes);
app.use("/add", addRoutes);
app.use("/courses", coursesRoutes);
app.use("/cart", cartRoutes);
app.use("/orders", ordersRoutes);

const PORT = process.env.PORT || 3000;

async function start() {
    try {
        await mongoose.connect(dataBaseURL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false,
        });
        const candidate = await User.findOne();
        if (!candidate) {
            const user = new User({
                email: "test@gmail.com",
                name: "Test 1",
                cart: {
                    items: []
                }
            });
            await user.save();
        }
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`)
        });
    } catch (e) {
        console.log(e);
    }
}

start();