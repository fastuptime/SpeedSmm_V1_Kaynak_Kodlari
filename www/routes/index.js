const config = require("../../config.js");
module.exports = function (app, checkAuth, hesap) {
    app.get("/", async (req, res) => {
        let hesap_data = await hesap.findOne({ userMail: req.cookies.userMail, password: req.cookies.userPassword }) || "NaN";
        if(hesap_data === "NaN") {
            res.render("index-pages/index/index", {
                account: hesap_data,
                config
            });
        } else {
            if(hesap_data.userMail) {
                res.render("index-pages/index/index", {
                    account: hesap_data,
                    config
                });
            } else {
                res.redirect("/dashboard?login=true&message=Zaten Oturum Açık!");
            }
        }
    });

    app.get("/terms", async (req, res) => {
        let hesap_data = await hesap.findOne({ userMail: req.cookies.userMail, password: req.cookies.userPassword }) || "NaN";
        let url = config.site.url;
        url = url.replace("https://", "");
        res.render("index-pages/index/terms", {
            account: hesap_data,
            config,
            url
        });
    });
};