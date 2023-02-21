const fetch = require("node-fetch");
const nodemailer = require("nodemailer");
module.exports = function (app, hesap) {
    app.get("/verify", (req, res) => {
        let token = req.query.token;
        let email = req.query.email;
         hesap.findOne({
            userMail: email,
            userMailVerifiedCode: token,
            userMailVerified: false
        }, (err, data) => {
            if (err) {
                console.log(err);
            }
            if (data) {
             hesap.findOneAndUpdate({userMail: email, userMailVerifiedCode: token}, {
                    $set: {
                        userMailVerified: true
                    }
                },{
                new: true,
                upsert: true,
                rawResult: true 
              }, (err, data) => {
                    if (err) {
                        console.log(err);
                        res.redirect("/?success=true&message=Email adresiniz doğrulanamadı." + err);
                    }
                    if (data) {
                        res.redirect("/?success=true&message=Email adresiniz doğrulandı.");
                    }
                });
            } else {
                res.redirect("/?error=true&message=Email adresiniz doğrulanamadı. Lütfen tekrar deneyin.");
            }
        });
    });

    app.get("/verify-page", (req, res) => {
        if(!req.cookies.userMail) return res.redirect("/register?message=Lütfen Kayıt Olun.");
        if(!req.cookies.userPassword) return res.redirect("/register?message=Lütfen Kayıt Olun.");
        res.render("login/verify-page");
    });

    app.get("/new-verify-code", (req, res) => {
        if (req.cookies.userMail && req.cookies.userPassword) {
            hesap.findOne({
                userMail: req.cookies.userMail,
                password: req.cookies.userPassword
            }, (err, data) => {
                if (err) {
                    console.log(err);
                }
                if (data) {
                    // MAİL GÖNDERME SERVİSİ KAPALI BİR SİSTEM O YÜZDEN KOYULMADI.
                    hesap.findOneAndUpdate({userMail: req.cookies.userMail}, {
                        $set: {
                            userMailVerified: true
                        }
                    },{
                        new: true,
                        upsert: true,
                        rawResult: true
                    });
                    res.redirect("/verify-page?success=true&message=Doğrulama kodu başarıyla gönderildi.");
                }
            });
        } else {
            res.redirect("/login?error_type=true&error=true&message=Lütfen önce giriş yapınız.");
        }
    });
};

