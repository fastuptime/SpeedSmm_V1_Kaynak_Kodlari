const moment = require('moment');
const { default: axios } = require('axios');
const crypto = require("crypto-random-string");
const querystring = require('querystring');
const { SHA1 } = require('crypto-js')
const Base64 = require('crypto-js/enc-base64');
var FormData = require('form-data');
const config = require("../../config.js");
let api_agi = require("../../servis_listes.json");
module.exports = function (app, checkAuth, checkBan, checkAuthAdmin, hesap, bildirim, balanceLoad, genel_log, genel_pcs, client, navbar_admin) {

    app.get("/mod_dash", checkAuth, checkAuthAdmin, async (req, res) => {
        let hesap_data = await hesap.findOne({ userMail: req.cookies.userMail, password: req.cookies.userPassword }) || "NaN";
        if(hesap_data === "NaN") return res.redirect("/login");
        let accs = await hesap.find({}).sort({ _id: -1 });
        let banneds = accs.filter(x => x.userBan.status === true);
        //total_logins
        let total_logins = 0;
        await accs.forEach(x => {
            total_logins = Number(total_logins) + Number(x.userIPHistory.length);
        });
        let last_20_acs = accs.slice(0, 20);
        res.render("dashboard/pages/pages_dash/admin/statistics_admin.ejs", {
            account: hesap_data,
            bildirim,
            navbar: navbar_admin,
            config,
            accs,
            banneds,
            last_acs: accs[0],
            total_logins,
            last_20_acs
        })
    });

    app.get("/balance_load_admin", checkAuth, checkAuthAdmin, async (req, res) => {
        let hesap_data = await hesap.findOne({ userMail: req.cookies.userMail, password: req.cookies.userPassword }) || "NaN";
        if(hesap_data === "NaN") return res.redirect("/login");
        //hesap userBalanceHistory 
        let balance_loads = [];
        var total_balance_load = 0;
        await hesap.find({}).sort({ _id: -1 }).then(async (accs) => {
            await accs.forEach(async (x) => {
                let userbal = [];
                if(x.userMail == "yigitalan1000@gmail.com") return;
                await x.userBalanceHistory.forEach(async (y) => {
                    if(y.userBalanceHistoryAmount <= 0) return;
                    userbal.push(y);
                });
                if(userbal.length > 0) {
                    userbal.forEach(async (z) => {
                        total_balance_load = Number(total_balance_load) + Number(z.userBalanceHistoryAmount);
                        balance_loads.push({
                            mail: x.userMail,
                            name: x.userName,
                            amount: z.userBalanceHistoryAmount,
                            date: z.userBalanceHistoryDate,
                        });
                    });
                }
            });
        });
        res.render("dashboard/pages/pages_dash/admin/balance_load_admin.ejs", {
            account: hesap_data,
            bildirim,
            navbar: navbar_admin,
            config,
            balance_loads,
            total_balance_load
        })
    });

    app.get("/api_balance", checkAuth, checkAuthAdmin, async (req, res) => {
        let hesap_data = await hesap.findOne({ userMail: req.cookies.userMail, password: req.cookies.userPassword }) || "NaN";
        if(hesap_data === "NaN") return res.redirect("/login");
        let api_bakiyes = [];
        ////////////////////////////////
        function randomColor() {
            //hex color generator
            let letters = '0123456789ABCDEF';
            let color = '#';
            for (let i = 0; i < 6; i++) {
                color += letters[Math.floor(Math.random() * 16)];
            }
            return color;
        }
        ////////////////////////////////
        await api_agi.forEach(async (x) => {
            var data_servis = new FormData();
            data_servis.append('key', x.key);	// API Anahtarı
            data_servis.append('action', 'balance');
            //////////////////////////////////////////
            var config_servis = {
                method: 'post',
                url: x.url, // API Adresi
                headers: { 
                    ...data_servis.getHeaders()
                },
                data : data_servis
            };

            await axios(config_servis).then(async function (response) {
                /*
                {
                    "balance": "100.84292",
                    "currency": "USD"
                }
                */
                let yanit = JSON.stringify(response.data);
                console.log(yanit);
                //yanit error
                let balance = JSON.parse(yanit).balance;
                let currency = JSON.parse(yanit).currency;
                let arry = {
                    name: x.name,
                    bakiye: balance,
                    kisaltmasi: x.kisaltmasi,
                    currency: currency,
                    url: x.url.replace("/api/v2", "") || x.url.replace("/api/v1", "") || x.url.replace("/api/v3", "") || x.url.replace("/api/v4", "") || x.url.replace("/api/v5", "") || x.url.replace("/api", ""),
                    color: randomColor()
                };
                await api_bakiyes.push(arry);
            });
        });
        setTimeout(() => {
            res.render("dashboard/pages/pages_dash/admin/api_balance.ejs", {
                account: hesap_data,
                bildirim,
                navbar: navbar_admin,
                config,
                api_bakiyes
            });
        }, 1000);
    });

};