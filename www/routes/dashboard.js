const md5 = require("md5");
const sha256 = require("sha256");
var axios = require('axios');
var FormData = require('form-data');
const fs = require('fs');
const config = require("../../config.js");
module.exports = function (app, checkAuth, checkBan, hesap, siparis, navbar) {
    app.get("/dashboard", checkAuth, checkBan, async (req, res) => {
        let hesap_data = await hesap.findOne({ userMail: req.cookies.userMail, password: req.cookies.userPassword }) || "NaN";
        let last_10_ip_history = hesap_data.userIPHistory;
        last_10_ip_history = last_10_ip_history.slice(Math.max(last_10_ip_history.length - 10, 0))
        res.render("dashboard/pages/index.ejs", {
            account: hesap_data,
            bildirim: hesap_data.bildirim,
            toplam_siparis: hesap_data.shoppingHistory,
            config,
            navbar,
            last_10_ip_history_array: last_10_ip_history.reverse(),
        });
    });

    app.get("/services", async (req, res) => {
        let hesap_data = await hesap.findOne({ userMail: req.cookies.userMail, password: req.cookies.userPassword }) || "NaN";
        let liste = await fs.readFileSync("./services_yeni.json", "utf8");
        let listemiz = JSON.parse(liste).slice(0, 400);
        listemiz.sort((a, b) => {
            if(a.rate - b.rate) {
                //name includes "Takipçi"
                if(a.name.includes("Takipçi")) return -1 && a.rate - b.rate;
                if(b.name.includes("Takipçi")) return 1;
            }
        });
        if(hesap_data === "NaN") {
            res.redirect("/?error=true&message=Hesabınız yok.");
        } else {
        //json
            res.render("dashboard/pages/pages_dash/services.ejs", {
                account: hesap_data,
                bildirim: hesap_data.bildirim,
                toplam_siparis: hesap_data.shoppingHistory,
                liste: listemiz,
                sayfalar: Math.ceil(JSON.parse(liste).length / 400),
                urun_sayisi: JSON.parse(liste).length,
                sayfa: 1,
                config,
                navbar,
            });
        }
    });

    app.get("/services/:sayfa", async (req, res) => {
        let hesap_data = await hesap.findOne({ userMail: req.cookies.userMail, password: req.cookies.userPassword }) || "NaN";
        let sayfa = req.params.sayfa;
        let liste = await fs.readFileSync("./services_yeni.json", "utf8");
        let gosterilecek = JSON.parse(liste).slice((sayfa - 1) * 400, (sayfa - 1) * 400 + 400);
        if(hesap_data === "NaN") {
            res.redirect("/?error=true&message=Hesabınız yok.");
        } else {
        //json
            res.render("dashboard/pages/pages_dash/services.ejs", {
                account: hesap_data,
                bildirim: hesap_data.bildirim,
                toplam_siparis: hesap_data.shoppingHistory,
                liste: gosterilecek,
                sayfalar: Math.ceil(JSON.parse(liste).length / 400),
                urun_sayisi: JSON.parse(liste).length,
                sayfa: sayfa,
                config,
                navbar,
            });
        }
    });

    app.get("/services_search/:kelime", async (req, res) => {
        let hesap_data = await hesap.findOne({ userMail: req.cookies.userMail, password: req.cookies.userPassword }) || "NaN";
        let sayfa = req.params.sayfa;
        let liste = await fs.readFileSync("./services_yeni.json", "utf8");
        let gosterilecek = JSON.parse(liste);
        if(!req.params.kelime) return res.redirect("/services?error_kelime_yok=true");
        gosterilecek.sort((a, b) => {
            if(a.rate - b.rate) {
                //tolowercase
                if(a.name.toLowerCase().includes(req.params.kelime.toLowerCase())) return -1 && a.rate - b.rate;
                if(b.name.toLowerCase().includes(req.params.kelime.toLowerCase())) return 1;
            }
        });
        if(hesap_data === "NaN") {
            res.render("dashboard/pages/services_no_login.ejs", {
                liste: gosterilecek.slice(0, 400),
                sayfalar: Math.ceil(JSON.parse(liste).length / 400),
                urun_sayisi: JSON.parse(liste).length,
                sayfa: sayfa, 
            });
        } else {
        //json
            res.render("dashboard/pages/services.ejs", {
                account: hesap_data,
                bildirim: hesap_data.bildirim,
                toplam_siparis: hesap_data.shoppingHistory,
                liste: gosterilecek.slice(0, 400),
                sayfalar: Math.ceil(JSON.parse(liste).length / 400),
                urun_sayisi: JSON.parse(liste).length,
                sayfa: sayfa,
            });
        }
    });


    app.get("/my_orders", checkAuth, checkBan, async (req, res) => {
        let hesap_data = await hesap.findOne({ userMail: req.cookies.userMail, password: req.cookies.userPassword }) || "NaN";
        if(hesap_data === "NaN") return res.redirect("/dashboard");
        res.render("dashboard/pages/pages_dash/my_orders.ejs", {
            account: hesap_data,
            bildirim: hesap_data.bildirim,
            toplam_siparis: hesap_data.shoppingHistory,
            liste: await siparis.find({ ownerID: hesap_data._id }).sort({ _id: -1 }),
            config,
            navbar
        });
    });
};