const express = require("express");
const mongoose = require("mongoose");
const keys = require("./key");
const path = require("path");
const csrf = require("csurf");
const flash = require("connect-flash");
const session = require("express-session");
const MongoStore = require("connect-mongodb-session")(session);
const exphbs = require("express-handlebars");
const homeRoutes = require("./routes/home");
const addRoutes = require("./routes/add");
const cartRoutes = require("./routes/cart");
const coursesRoutes = require("./routes/courses");
const ordersRoutes = require("./routes/orders");
const authRoutes = require("./routes/auth");
const varMiddleware = require("./middleware/variables");
const userMiddleware = require("./middleware/user");

const app = express();
const dataBaseURL = "mongodb+srv://Aldoran:1q2w3e3e2w1q4r@cluster0-w7nfz.mongodb.net/shop";

const hbs = exphbs.create({
    defaultLayout: "main",
    extname: "hbs",
    helpers: require("./utils/hbs-helpers"),
});

const store = new MongoStore({
    collection: "sessions",
    uri: keys.dataBaseURL,
});

app.engine("hbs", hbs.engine);
app.set("view engine", "hbs");
app.set("views", "views");

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({extended: true}));
app.use(session({
    secret: keys.secret,
    resave: false,
    saveUninitialized: false,
    store: store,
}));
app.use(csrf());
app.use(flash());
app.use(varMiddleware);
app.use(userMiddleware);

app.use("/", homeRoutes);
app.use("/add", addRoutes);
app.use("/courses", coursesRoutes);
app.use("/cart", cartRoutes);
app.use("/orders", ordersRoutes);
app.use("/auth", authRoutes);

const PORT = process.env.PORT || 3000;

async function start() {
    try {
        await mongoose.connect(dataBaseURL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false,
        });
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`)
        });
    } catch (e) {
        console.log(e);
    }
}

start();