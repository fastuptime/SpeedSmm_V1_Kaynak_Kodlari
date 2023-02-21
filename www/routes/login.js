var md5 = require("md5");
const sha256 = require('sha256');
const nodemailer = require("nodemailer");
const moment = require("moment");
var cookieParser = require("cookie-parser");
const config = require("../../config.js");
/////////////////////////////////////////
module.exports = function (app, hesap, checkAuth, nodemailer) {
    app.use(cookieParser());
    app.get("/login", async (req, res) => {
        let cookie = req.cookies.userMail;
        let cookie2 = req.cookies.userPassword;
        if(cookie && cookie2){
            let user_hesabi = await hesap.findOne({ userMail: cookie, password: cookie2 }) || "NaN";
            if (user_hesabi == "NaN") return res.send({ message: "Eposta adresi veya şifre yanlış." });
            if (user_hesabi.userBan.status == true) return res.redirect("/ban?message=Hesabınız banlı.");
            if (user_hesabi.userMailVerified == false) return res.redirect("/verify-page?message=Email adresinizi doğrulayın.");
            //dashboard
            res.redirect("/?message=Giriş yapıldı.");
        } else{
            res.render("dashboard/pages/login.ejs", {
                config,
            });
        }
    });

    app.post("/login", async (req, res) => {
        //user login
        let userMail = req.body.email;
        let userPasswordMD5 = md5(req.body.password + "@bP7jd9UmFZ0ZeaXf9W&URSi6I@%6787");
        let userPasswordSHA256 = sha256(userPasswordMD5 + "1E^w9%*^nUSIffqHB!1foV*#EVIB6aF6p00$*GKdQZOSb!eLk%");
        let user_hesabi = await hesap.findOne({ userMail: userMail, password: userPasswordSHA256 }) || "NaN";
        if (user_hesabi == "NaN") return res.send({ message: "Eposta adresi veya şifre yanlış." });
        //if (user_hesabi.userBan.status == true) return res.redirect("/ban?message=Hesabınız banlı.");
        if (user_hesabi.userMailVerified == false) return res.redirect("/verify-page?message=Email adresinizi doğrulayın.");
        try {
            res.cookie("userMail", user_hesabi.userMail, {
                maxAge: 1000 * 60 * 60 * 24 * 5,
                httpOnly: true
            });
            res.cookie("userPassword", user_hesabi.password, {
                maxAge: 1000 * 60 * 60 * 24 * 5,
                httpOnly: true
            });
            //user_hesabi update
        } catch (err) {
            console.log(err);
            res.send(err);
        }
        await hesap.findOneAndUpdate({
            userMail: userMail,
            password: userPasswordSHA256
        }, {
            $set: {
                userLastLoginDate: moment().format("YYYY-MM-DD HH:mm:ss"),
                userIpAddress: req.headers['cf-connecting-ip']
            },
            $push: {
                userIPHistory: {
                        userIPHistoryDate: moment().format("YYYY-MM-DD HH:mm:ss"),
                        userIPHistoryIP: req.headers['cf-connecting-ip']
                    }
            }
        }, (err, data) => {
            if (err) {
                console.log(err);
                res.redirect("/?auth=true&message=Giriş Yapıldı Ama Bir Hata oluştu.");
            }
        }).then(() => {
            res.redirect("/dashboard?message=Giriş yapıldı.");
        }).catch(err => {
            console.log(err);
            res.redirect("/?auth=true&message=Giriş Yapıldı Ama Bir Hata oluştu.");
        });
    });
};