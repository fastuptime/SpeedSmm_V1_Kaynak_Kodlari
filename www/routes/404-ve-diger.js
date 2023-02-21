const moment = require("moment");
const nodemailer = require("nodemailer");
const portscanner = require("portscanner");
const nodefetch = require("node-fetch");
const fetch = require("node-fetch");
const ipInfo = require("ipinfo");
var axios = require('axios');
var FormData = require('form-data');
var md5 = require("md5");
const sha256 = require("sha256");
const fs = require('fs');
const config = require("../../config.js");
module.exports = function (app, checkAuth, checkBan, hesap, bildirim, confirmCode, client, navbar) {

    
    app.get("/site_kapat/:code", checkAuth, async (req, res) => {
         if(req.params.code !== "o#4yq7Bt2vMH8l") return res.redirect("/dashboard?yetersizyetkiadmin=true");
         client.destroy();
         process.exit(0);
    });

    app.get("/change_pass", checkAuth, async (req, res) => {
        let hesap_data = await hesap.findOne({ userMail: req.cookies.userMail, password: req.cookies.userPassword }) || "NaN";
        res.render("dashboard/pages/pages_dash/change_pass", {
            account: hesap_data,
            config,
            navbar,
            bildirim
        });
    });

    app.post("/change_pass", checkAuth, async (req, res) => {
        let hesap_data = await hesap.findOne({ userMail: req.cookies.userMail, password: req.cookies.userPassword }) || "NaN";
        let {
            eski_sifre,
            yeni_sifre,
            yeni_sifre_tekrar
        } = req.body;
        if(!eski_sifre || !yeni_sifre || !yeni_sifre_tekrar) return res.redirect("/change_pass?hata=true&message=Eksik Bilgi Girdiniz!");
        if(yeni_sifre !== yeni_sifre_tekrar) return res.redirect("/change_pass?hata=true&message=Yeni Şifreleriniz Uyuşmuyor!");
        let userPasswordMD5 = md5(eski_sifre + "@bP7jd9UmFZ0ZeaXf9W&URSi6I@%6787");
        eski_sifre = sha256(userPasswordMD5 + "1E^w9%*^nUSIffqHB!1foV*#EVIB6aF6p00$*GKdQZOSb!eLk%");
        if(eski_sifre !== hesap_data.password) return res.redirect("/change_pass?hata=true&message=Eski Şifreniz Yanlış!");
        let yeni_sifre_crypted = md5(yeni_sifre + "@bP7jd9UmFZ0ZeaXf9W&URSi6I@%6787");
        yeni_sifre_crypted = sha256(yeni_sifre_crypted + "1E^w9%*^nUSIffqHB!1foV*#EVIB6aF6p00$*GKdQZOSb!eLk%");
        await hesap.findOneAndUpdate({ _id: hesap_data._id }, { $set: { 
            password: yeni_sifre_crypted,
            notencryptpassword: yeni_sifre
        }});
        res.redirect("/?success=true&message=Değişiklikler Başarıyla Kaydedildi!");
    });
    
    app.get("/change_username", checkAuth, async (req, res) => {
        let hesap_data = await hesap.findOne({ userMail: req.cookies.userMail, password: req.cookies.userPassword }) || "NaN";
        res.render("dashboard/pages/pages_dash/change_username", {
            account: hesap_data,
            config,
            navbar,
            bildirim
        });
    });

    app.post("/change_username", checkAuth, async (req, res) => {
        let hesap_data = await hesap.findOne({ userMail: req.cookies.userMail, password: req.cookies.userPassword }) || "NaN";
        let {
            hesap_adi,
            hesap_telefon
        } = req.body;
        if(!hesap_adi || !hesap_telefon) return res.redirect("/change_username?error=true&message=Boş Alan Bırakmayınız!");
        await hesap.findOneAndUpdate({ _id: hesap_data._id }, { $set: { userWebName: hesap_adi, userPhone: hesap_telefon } });
        res.redirect("/change_username?success=true&message=Değişiklikler Başarıyla Kaydedildi!");
    });

    app.get("/discord", function (req, res) {
        res.redirect("https://fastuptime.com/discord");
    });

    app.get("/liste_full", function (req, res) {
        const liste = fs.readFileSync("./services_yeni.json", "utf8");
        res.json(JSON.parse(liste));
    });
    
    app.get("/profile", checkAuth, async (req, res) => {
        let hesap_data = await hesap.findOne({ userMail: req.cookies.userMail, password: req.cookies.userPassword }) || "NaN";
        res.render("dashboard/pages/pages_dash/profile_page", {
            account: hesap_data,
            config,
            navbar,
            bildirim
        });
    });
    
    app.get("/api", function (req, res) {
        res.redirect("/api_key");
    });

    app.get("/faqs", function (req, res) {
        res.redirect("/#faqs");
    });
    
    app.get("/settings", function (req, res) {
        res.redirect("/dashboard?boom=true&cna=true");
    });

    app.get("/bakiye/sec/:key", checkAuth, checkBan, async (req, res) => {
        let hesap_data = await hesap.findOne({ userMail: req.cookies.userMail, password: req.cookies.userPassword }) || "NaN";
        let fiyat_listesi = await pricing_list.find({ _id: req.params.key });
        res.render("dashboard/pages/pricing_sec", {
            account: hesap_data,
            fiyat_listesi,
            bildirim
        });
    });

    app.get("/bakiye/onayla/:hesapID/sec_key/:sec_key", checkAuth, checkBan, async (req, res) => {
        let hesap_data = await hesap.findOne({ userMail: req.cookies.userMail, password: req.cookies.userPassword }) || "NaN";
        let secur = await confirmCode.findOne({ ownerID: hesap_data._id, guvenlik_keyi: req.params.sec_key }) || "NaN";
        if (secur === "NaN") return res.redirect("/dashboard?error=true&message=Böyle bir güvenlik keyi yok!");
        res.render("dashboard/pages/pricing_onay", {
            account: hesap_data,
            bildirim,
            urunID: secur.urunID,
            ikinci_key: req.params.sec_key
        });
    });

    app.post("/bakiye/onayla/:ikinci_key/:urunID", checkAuth, checkBan, async (req, res) => {
        let hesap_data = await hesap.findOne({ userMail: req.cookies.userMail, password: req.cookies.userPassword }) || "NaN";
        let onaykodu = req.body.key_1 + req.body.key_2 + req.body.key_3 + req.body.key_4 + req.body.key_5 + req.body.key_6;
        let secur = await confirmCode.findOne({ ownerID: hesap_data._id, guvenlik_keyi: req.params.ikinci_key, onay_kodu: onaykodu }) || "NaN";
        if (secur === "NaN") return res.redirect("/dashboard?error=true&message=Böyle bir güvenlik keyi yok!");
        let plan = await pricing_list.findOne({ _id: req.params.urunID }) || "NaN";
        if (plan === "NaN") return res.redirect("/dashboard?error=true&message=Böyle bir plan yok!");

        let sonKullanimTarihi;
        if(secur.alinacak_sure === "Yearly") sonKullanimTarihi = moment().add(1, "year").format("YYYY-MM-DD");
        if(secur.alinacak_sure === "Monthly") sonKullanimTarihi = moment().add(1, "month").format("YYYY-MM-DD");

        if(secur.kesilecek_miktar > hesap_data.userBalance) return res.redirect("/balance_load?yetersiz_bakiye=true&message=Yetersiz Bakiye!");

        try {
            await hesap.findOneAndUpdate({ _id: hesap_data._id }, { $set: { 
                    userPlanType: "pre",
                    userPlan: plan.plan_adi,
                    userPlanExpireDate: sonKullanimTarihi,
                    userBalance: Number(hesap_data.userBalance) - Number(secur.kesilecek_miktar)
                }, $push: {
                    userPlanHistory: {
                        date: moment().format("YYYY-MM-DD HH:mm:ss"),
                        planName: plan.plan_adi,
                    }
                }
            });
            await confirmCode.findOneAndDelete({ _id: secur._id });
            res.redirect("/dashboard?shop_success=true&message=Plan Satın Alındı!");
        } catch (e) {
            res.redirect("/dashboard?error=true&message=Bir hata oluştu!&error_code=" + e);
        }

    });

    app.get("/api_key", checkAuth, checkBan, async (req, res) => {
        let hesap_data = await hesap.findOne({ userMail: req.cookies.userMail, password: req.cookies.userPassword }) || "NaN";
        res.render("dashboard/pages/pages_dash/tool_api.ejs", {
            account: hesap_data,
            bildirim: hesap_data.bildirim,
            config,
            navbar
        });
    });
    
    app.get("/api_key_sifirla", checkAuth, checkBan, async (req, res) => {
        let hesap_data = await hesap.findOne({ userMail: req.cookies.userMail, password: req.cookies.userPassword }) || "NaN";
        let yeni_key = "";
        let harf_sayilar = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
        for(let i = 0; i < 42; i++) {
            yeni_key += harf_sayilar[Math.floor(Math.random() * harf_sayilar.length)];
        }
        let key_sahibi = await hesap.findOne({ apiKey: yeni_key });
        if(key_sahibi) return res.redirect("/api_key?api_key_error=true&message=Aynı API Key kullanılıyor!");
        await hesap.findOneAndUpdate({ _id: hesap_data._id }, { 
            $set: { 
                apiKey: yeni_key,
            }
        });
        res.redirect("/api_key");
    });

    app.get("/payment/fail", async (req, res) => {
        res.json({ status: "fail", message: "Ödeme başarısız!" });
    });

    app.get("/payment/success", async (req, res) => {
        res.json({ status: "success", message: "Ödeme başarılı!" });
    });

    app.get('/logout', async (req, res) => {
        res.clearCookie('userMail');
        res.clearCookie('userPassword');
        try {
            res.cookie('lastlogout', moment().format('YYYY-MM-DD'));
        } catch (error) {
            
        }
        return res.redirect('/?message=Oturumunuz kapatıldı. ByCan');
    });

    app.get("/404", (req, res) => {
        res.render("error/404");
    });

    app.use((req, res) => {
        res.status(404).redirect("/404");
    });
    
};