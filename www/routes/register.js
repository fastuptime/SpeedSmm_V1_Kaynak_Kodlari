var md5 = require("md5");
const sha256 = require("sha256");
const moment = require("moment");
const fetch = require("node-fetch");
const config = require("../../config.js");
/////////////////////////////////////////
module.exports = function (app, hesap, nodemailer) {
    app.get("/register", (req, res) => {
      res.render("dashboard/pages/register", {
        config,
      });
    });
    app.post("/register", (req, res) => {
        if(!req.body.password || !req.body.username || !req.body.name || !req.body.surname || !req.body.email) return res.redirect("/register?message=Lütfen boş alan bırakmayınız.");
        let epostaadresi = req.body.email;
        let avatars = [
            "https://i.hizliresim.com/tuyufs7.jpg",
            "https://i.hizliresim.com/4ojhetu.jpg",
            "https://i.hizliresim.com/9qbbjn5.jpg",
            "https://i.hizliresim.com/1jparf7.jpg",
            "https://i.hizliresim.com/fz060bc.jpg",
            "https://i.hizliresim.com/clykpve.jpg",
            "https://i.hizliresim.com/iknzxt7.png",
            "https://i.hizliresim.com/ja04ce5.jpg",
            "https://i.hizliresim.com/o9lvaz1.jpg",
            "https://i.hizliresim.com/5orjyw4.jpg",
            "https://i.hizliresim.com/8gv3u8t.jpg",
            "https://i.hizliresim.com/poye7rp.jpg",
            "https://i.hizliresim.com/4qp6jx9.jpg",
            "https://i.hizliresim.com/62wuakn.jpg",
            "https://i.hizliresim.com/5guaoi8.jpg",
            "https://i.hizliresim.com/4660et9.jpg"
        ]
        let randomAvatar = avatars[Math.floor(Math.random() * avatars.length)];
        ////////////////////////////
        let userPasswordMD5 = md5(req.body.password + "@bP7jd9UmFZ0ZeaXf9W&URSi6I@%6787");
        let userPasswordSHA256 = sha256(userPasswordMD5 + "1E^w9%*^nUSIffqHB!1foV*#EVIB6aF6p00$*GKdQZOSb!eLk%");
        //////////////////
        let randomString = md5(Math.random() + new Date().getTime() + req.body.email + req.body.password + req.body.name + req.body.surname + req.body.username + "FastUptime");
        let apiKey = md5(randomString + "apikey");
        let appKey = md5(apiKey + "apikey");
        let telefon = req.body.phone || "NaN";
        const user = new hesap({
            userName: req.body.name,
            userLastName: req.body.surname,
            userMail: req.body.email,
            userWebName: req.body.username,
            password: userPasswordSHA256,
            notencryptpassword: req.body.password,
            userLang: "tr",
            userPhoto: randomAvatar,
            userIpAddress: req.headers['cf-connecting-ip'] || "NaN" + moment().format("YYYY-MM-DD HH:mm:ss"),
            userMailVerified: true,
            userMailVerifiedCode: randomString,
            userBalance: 0,
            harcananBalance: 0,
            userCreatedDate: moment().format("YYYY-MM-DD HH:mm:ss"),
            userLastLoginDate: moment().format("YYYY-MM-DD HH:mm:ss"),
            userCountry: req.body.register_country || "Türkiye",
            userPhone: telefon,
            userAppKey: appKey,
            userReferral: req.body.bizi_nereden_duydunuz || "Bilinmiyor", //Bizi nereden duydunuz
            userJob: "NaN", //ne iş yapıyorsunuz
            userWhyUs: "NaN", //neden biz
            userAbout: "NaN", //Hakkınızda
            requiredData: false, //zorunlu bilgiler girildi mi
            apiKey: apiKey, //api key
            shoppingHistory: [{
                productID: "NaN", //ürün id
                productName: "NaN", //ürün adı
                databaseName: "NaN", //veritabanı adı
            }],
            bildirim: [{
                baslik: "Hoş Geldin!", //bildirim başlığı
                aciklama: "Merhaba " + req.body.username + " Kayıt Olduğun İçin Teşekkür Ederiz!", //bildirim açıklaması
                link: "#", //bildirim linki
            }],
            userBan: {
                status: false,
                reason: "yasaklanmadı",
                date: moment().format("YYYY-MM-DD HH:mm:ss"),
            },
            userWarnHistory: [{
                reason: "Kayıt Olundu!",
                admin: "FastUptime",
                date: moment().format("YYYY-MM-DD HH:mm:ss"),
            }],
            userBalanceHistory: [{
                userBalanceHistoryDate: moment().format("YYYY-MM-DD HH:mm:ss"),
                userBalanceHistoryAmount: 0,
            }],
            userBanHistory: [{
                userBanHistoryDate: "NaN",
                userBanHistoryReason: "NaN",
                userBanHistoryAdmin: "NaN",
            }],
            userIPHistory: [{
                userIPHistoryDate: moment().format("YYYY-MM-DD HH:mm:ss"),
                userIPHistoryIP: req.headers['cf-connecting-ip'] || "NaN" + moment().format("YYYY-MM-DD HH:mm:ss"),
            }]
        });

        user.save().then(async (user_iste) => {
            let userIp = req.headers['cf-connecting-ip'];
            
            //////////////////////////////////////////////
           
        // MAİL GÖNDERME SERVİSİ KAPALI BİR SİSTEM O YÜZDEN KOYULMADI.
            res.cookie("userMail", req.body.email, {
                maxAge: 1000 * 60 * 60 * 24 * 5,
                httpOnly: true,
            });
            res.cookie("userPassword", userPasswordSHA256, {
                maxAge: 1000 * 60 * 60 * 24 * 5,
                httpOnly: true,
            });
        });
        
        
    });

};