const {Router} = require("express");
const bcrypt = require("bcryptjs");
const {validationResult} = require("express-validator");
const {registerValidators} = require("../utils/validators");
const crypto = require("crypto");
const router = Router();
const User = require("../models/user");

router.get("/login", async (req, res) => {
    res.render("auth/login", {
        title: "Authorization",
        isLogin: true,
        loginError: req.flash("loginError"),
        registerError: req.flash("registerError"),
        error: req.flash("error"),
    });
});

router.get("/logout", async (req, res) => {
    req.session.destroy(() => {
        res.redirect("/auth/login#login");
    });
});

router.post("/login", async (req, res) => {
    try {
        const {email, password} = req.body;
        const candidate = await User.findOne({email});

        if (candidate) {
            const isSame = await bcrypt.compare(password, candidate.password);
            if (isSame) {
                req.session.user = candidate;
                req.session.isAuthenticated = true;
                req.session.save(err => {
                    if (err) {
                        throw err;
                    }
                    res.redirect("/");
                });
            } else {
                req.flash("loginError", "Wrong pass!");
                res.redirect("/auth/login#login");
            }
        } else {
            req.flash("loginError", "User not found!");
            res.redirect("/auth/login#login");
        }
    } catch (e) {
        console.log(e);
    }

});

router.post("/register",
    registerValidators,
    async (req, res) => {
        try {
            const {email, password, name} = req.body;

            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                req.flash("registerError", errors.array()[0].msg);
                return res.status(422).redirect("/auth/login#register");

            }

            const hashPass = await bcrypt.hash(password, 10);
            const user = new User({
                email: email, name, password: hashPass, card: {items: []}
            });
            await user.save();
            res.redirect("/auth/login#login");

        } catch (e) {
            console.log(e);
        }

    });

router.get("/reset", (req, res) => {
    res.render(
        "auth/reset",
        {
            title: "Forgot password",
            error: req.flash("error"),
        }
    )
});

router.post("/reset", (req, res) => {
    try {
        crypto.randomBytes(32, async (err, buffer) => {
            if (!err) {
                const token = buffer.toString("hex");
                const candidate = await User.findOne({
                    email: req.body.email
                });
                if (candidate) {
                    candidate.resetToken = token;
                    candidate.resetTokenExp = Date.now() + 3600 * 1000;
                    await candidate.save();
                    //TODO: send email
                    res.redirect("auth/login")
                } else {
                    req.flash("error", "Email does not exist!");
                    res.redirect("auth/reset");
                }
            } else {
                throw err;
            }
        });
    } catch (e) {
        console.log(e);
    }
});

router.get("/password/:token", async (req, res) => {
    try {
        if (!req.params.token) {
            return res.redirect("auth/login");
        }

        const user = await User.findOne({
            resetToken: req.params.token,
            resetTokenExp: {$gt: Date.now()}
        });

        if (!user) {
            return res.redirect("auth/login");
        } else {
            res.render(
                "auth/password",
                {
                    title: "Change password",
                    error: req.flash("error"),
                    userId: user._id.toString(),
                    token: req.params.token,
                }
            )
        }

        res.render(
            "auth/reset",
            {
                title: "Forgot password",
                error: req.flash("error"),
            }
        )
    } catch (e) {
        console.log(e);
    }
});

router.post("/password", async (req, res) => {
    try {
        const user = await User.findOne({
            _id: req.body.userId,
            resetToken: req.body.token,
            resetTokenExp: {$gt: Date.now()}
        });

        if (user) {
            user.password = await bcrypt.hash(req.body.password, 10);
            user.resetToken = undefined;
            user.resetTokenExp = undefined;
            await user.save();
            res.redirect("auth/login");
        } else {
            res.redirect("auth/login");
            req.flash("error", "Token expired!");
        }
    } catch (e) {
        console.log(e)
    }
});

module.exports = router;