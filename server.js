const express = require('express');
require("dotenv").config();
const port = process.env.PORT;
const mongoose = require('mongoose');
const userRouter = require("./router/userRouter");
const adminRouter = require("./router/adminRouter");
const authRouter = require('./router/authRouter');
const path = require('path');
const session = require('express-session');
const nocache = require('nocache');
const app = express();
const cronJobs = require('./util/cronJob');

app.use(nocache());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "public/assets")));

cronJobs.setupCronJob();

app.use(session({
    secret: "nocache",
    resave: true,
    saveUninitialized: true
}));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use('/', authRouter);
app.use("/", userRouter);
app.use("/admin", adminRouter);
app.use((req, res, next) => {
    res.render('user/404.ejs');
});

mongoose.connect(process.env.MONGOURL, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => { console.log("MongoDB connected") })
    .catch((err) => { console.log("MongoDB not connected", err); });

app.listen(port, () => { console.log(`Server is running at http://localhost:${port}`) });
