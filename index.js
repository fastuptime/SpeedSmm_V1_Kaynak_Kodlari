const express = require('express');
const app = express();
const monogoose = require('mongoose');
const moment = require('moment')
const ejs = require("ejs");
const path = require('path');
var md5 = require("md5");
const nodemailer = require("nodemailer");
const { glob } = require("glob");
const { promisify } = require("util");
const globPromise = promisify(glob);
const Discord = require('discord.js');
const { Client, Collection, Intents, WebhookClient, MessageEmbed } = require("discord.js");
const config = require("./config.js");
const client = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MEMBERS,
        Intents.FLAGS.GUILD_BANS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.DIRECT_MESSAGES,
        Intents.FLAGS.GUILD_VOICE_STATES,
        Intents.FLAGS.GUILD_PRESENCES,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
        Intents.FLAGS.GUILD_MESSAGE_TYPING,
        Intents.FLAGS.DIRECT_MESSAGE_REACTIONS,
        Intents.FLAGS.DIRECT_MESSAGE_TYPING,
    ],
    messageCacheLifetime: 60,
    fetchAllMembers: true,
    messageCacheMaxSize: 10,
    restTimeOffset: 0,
    restWsBridgetimeout: 100,
    shards: "auto",
    allowedMentions: {
        parse: ["roles", "users", "everyone"],
        repliedUser: true,
    },
    partials: ["MESSAGE", "CHANNEL", "REACTION"],
    intents: 32767,
});
const bodyParser = require("body-parser");
const passport = require(`passport`);
const Strategy = require(`passport-discord`).Strategy;
const session = require(`express-session`);
const MemoryStore = require(`memorystore`)(session);
const request = require("request");
const fs = require('fs');
var axios = require('axios');
var FormData = require('form-data');
const navbar = require("./navbar.js")(app);
const navbar_admin = require("./navbar_admin.js")(app);
///////////////WEBHOOKs//////////////////
const genel_log = new WebhookClient({ url: "WEBHOOOKKKK URL" });
const genel_pcs = new WebhookClient({ url: "WEBHOOOKKKK URL" });
/////////////////////////////////////////
var cookieParser = require("cookie-parser");
/////////////////////////////////////////

let admins = [
  "fastuptime@gmail.com"
];

let checkAuthAdmin = (req, res, next) => {
  if (req.cookies.userMail && req.cookies.userPassword) {
    hesap.findOne({
      userMail: req.cookies.userMail,
      password: req.cookies.userPassword
    }, (err, data) => {
      if (err) {
        console.log(err);
      }
      if (data) {
        if (data.userMailVerified == true) {
          if (admins.includes(data.userMail)) {
            next();
          } else res.redirect("/?message=Bu sayfaya erişim yetkiniz yok.");
        } else {
          res.redirect("/?message=Email adresinizi doğrulayın.");
        }
      } else {
        res.redirect("/login?message=Eposta adresi veya şifre yanlış.");
      }
    }
    );
  } else {
    res.redirect("/login");
  }
};
/////////////////////////////////////////
const hesap = require('./www/mongoDB/models/hesap.js');
const confirmCode = require('./www/mongoDB/models/confirmCode.js');
const balanceLoad = require('./www/mongoDB/models/bakiye_yukle.js');
let siparis = require('./www/mongoDB/models/siparis_default.js');
/////////////////////////////////////////
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
/////////////////////////////////////////
app.use(cookieParser());
// Middleware

const bildirim = [
    {
        baslik: "Destek Olun",
        aciklama: "Bize destek olmak için ücüretli bir plan alın!",
        link: "/pricing",
    },
    {
        baslik: "Discord",
        aciklama: "Discord sunucumuza davetlisiniz!",
        link: "/discord",
    }
];

let checkAuth = (req, res, next) => {
  if (req.cookies.userMail && req.cookies.userPassword) {
    hesap.findOne({
      userMail: req.cookies.userMail,
      password: req.cookies.userPassword
    }, (err, data) => {
      if (err) {
        console.log(err);
      }
      if (data) {
        if (data.userMailVerified == true) {
          next();
        } else {
          res.redirect("/?error=true&message=Email adresinizi doğrulayın.");
        }
      } else {
        res.redirect("/login?error=true&message=Eposta adresi veya şifre yanlış.");
      }
    }
    );
  } else {
    res.redirect("/login");
  }
};

let checkBan = (req, res, next) => {
  if (req.cookies.userMail && req.cookies.userPassword) {
    hesap.findOne({
      userMail: req.cookies.userMail,
      password: req.cookies.userPassword
    }, (err, data) => {
      if (err) {
        console.log(err);
      }
      if (data) {
        if (data.userBan.status == true) {
          res.redirect("/ban?message=Hesabınız engellenmiştir.");
        } else {
          next();
        }
      } else {
        res.redirect("/login?message=Eposta adresi veya şifre yanlış.");
      }
    }
    );
  } else {
    res.redirect("/login");
  }
};


//////////////////////////////////////////
app.use(session({
    store: new MemoryStore({ checkPeriod: 86400000 }),
    secret: `mYr5E2dS4lRgO062f6su0uhqxwEHygh}WQ-lLrWHVi"!sR:])9]{+E$tWxz[r1H-TfQ>n1c/a3b~e.Pz=&R5m&'N9:D4ZcM:3WST)o(C7LOtAgYUQekK#"m0r-Y/t0HLpe$99#'1|skDlglzDj~~]btG%[/?4%`,
    resave: false,
    saveUninitialized: false,
}));


app.use(passport.initialize());
app.use(passport.session());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
/////////////////////////////////////////
    setInterval(() => {
        ////////////////////////////////////
        let array = [];
        let array_api = [];

        let servis_listesi = require('./servis_listes.json');
        //////////////////////////////////////////
        let error_var = false;
        servis_listesi.forEach(servis => {
          console.log(servis.name + " servisi bağlanıyor...");
          var data_servis = new FormData();
          data_servis.append('key', servis.key);	// API Anahtarı
          data_servis.append('action', 'services');
          //////////////////////////////////////////
          var config_servis = {
            method: 'post',
            url: servis.url, // API Adresi
            headers: { 
                ...data_servis.getHeaders()
            },
            data : data_servis
          };

        axios(config_servis).then(function (response) {
            const dosya = JSON.stringify(response.data);
            let services = JSON.parse(dosya);
              services.forEach(element => {
                  let gelisi = element.rate;
                  let fiyat = element.rate;
                  let yuzde = Number(config.kar_orani);
                  var fiyat_35 = fiyat * yuzde / 100;
                  var yeni_fiyat_yuzdeli = Number(fiyat) + Number(fiyat_35); 
                  var yeni_fiyat = yeni_fiyat_yuzdeli.toFixed(2); 
                  //eğer yeni_fiyat 0.50 dan küçükse 0.50 yap
                  if(yeni_fiyat < 0.50) yeni_fiyat = 0.50;
                  else if(yeni_fiyat > 0.50 && yeni_fiyat < 1) yeni_fiyat = 1.00;
                  //console.log("Normal Fiyat: " + fiyat + " TL " + "Fiyatın %" + yuzde + ": " + fiyat_35 + " TL " + " Yeni Fiyat: " + yeni_fiyat  + " TL");
                  element.rate = yeni_fiyat;
                  let sil = element.service + " -";
                  let name = element.name.replace(sil, '');
                  element.name = name;
                  if(element.type != "Default") return;
                  let iceriyor_ise_gec = "Ücretsiz";
                  if(element.name.includes(iceriyor_ise_gec)) return;
                  let adi = element.name;
                  let c_adi = element.name;
                  element.name = adi.replace("TikTak", "TikTok");
                  element.category = c_adi.replace("TikTak", "TikTok");
                  if(Number(element.rate) >= 14000) return;
                  let yeni_elimen = {
                      service: element.service,
                      name: element.name,
                      type: element.type,
                      rate: element.rate,
                      min: element.min,
                      max: element.max,
                      dripfeed: element.dripfeed,
                      refill: element.refill,
                      cancel: element.cancel,
                      category: element.category,
                      alis_fiyat: gelisi,
                      aradaki_kar_miktari: yeni_fiyat - gelisi,
                      api_agi: servis.name,
                      takma_adi: servis.kisaltmasi,
                  };
                  array.push(yeni_elimen);
                  let yeni_elimen_api = {
                      service: element.service,
                      name: element.name,
                      type: element.type,
                      rate: element.rate,
                      min: element.min,
                      max: element.max,
                      dripfeed: element.dripfeed,
                      refill: element.refill,
                      cancel: element.cancel,
                      nickname: servis.kisaltmasi,
                  };
                  array_api.push(yeni_elimen_api);
            });

        }).catch(function (error) {
            error_var = true;
            console.log(error);
        });
        });
        setTimeout(function(){
          try {
            if(error_var == true) return;
            fs.writeFileSync('./services_yeni.json', JSON.stringify(array));
            fs.writeFileSync('./services_yeni_api.json', JSON.stringify(array_api));
          } catch (e) {
              console.log(e);
          }
        }, 20000);
        //////////////////////////////////////////
    }, 60000);
/////////////////////////////////////////
app.set('view engine', 'ejs');
app.set('views', './www');
app.use("/material", express.static(path.join(__dirname, "www/material")));
app.use("/anasayfa", express.static(path.join(__dirname, "www/index-pages/index")));
app.use("/dashboard-material", express.static(path.join(__dirname, "www/dashboard")));
app.use("/dash_assets", express.static(path.join(__dirname, "www/dashboard/")));
app.use('/robots.txt', function (req, res, next) {
    res.type('text/plain')
    res.send("User-agent: *\nAllow: /"); 
});
app.get('/robots.txt', function (req, res, next) {
    res.type('text/plain')
    res.send("User-agent: *\nAllow: /"); 
});
/////////////Post Routes Load/////////////
require("./www/routes/register.js")(app, hesap, nodemailer);
require("./www/routes/login.js")(app, hesap, checkAuth, nodemailer);
require("./www/routes/register-verify.js")(app, hesap);
require("./www/routes/index.js")(app, checkAuth, hesap);
require("./www/routes/dashboard.js")(app, checkAuth, checkBan, hesap, siparis, navbar);
require("./www/routes/yeni_siparis.js")(app, checkAuth, checkBan, checkAuthAdmin, hesap, siparis, navbar, navbar_admin);
require("./www/routes/balance_load.js")(app, checkAuth, checkBan, hesap, bildirim, balanceLoad, genel_log, genel_pcs, client, navbar);
require("./www/routes/admin_panel.js")(app, checkAuth, checkBan, checkAuthAdmin, hesap, bildirim, balanceLoad, genel_log, genel_pcs, client, navbar_admin);
require("./www/routes/api_agi.js")(app, checkAuth, checkBan, hesap, siparis);

require("./www/routes/404-ve-diger.js")(app, checkAuth, checkBan, hesap, bildirim, confirmCode, client, navbar);
/////////////////////////////////////////
/////////////////////////////////////////
//////////////////////////////////////
app.use('/robots.txt', function (req, res, next) {
        res.type('text/plain')
        res.send("User-agent: *\nAllow: /"); 
    });
app.listen(80, () => {
    console.log('Sunucu açıldı port: 80');
});
client.login("BOT TOKENNN").then(() => {
    console.log(`Logged in as ${client.user.tag}`);
}).catch(err => {
    console.log(err);
});