
const monogoose = require('mongoose');
const uniqueValidator = require("mongoose-unique-validator");
var hesaplar = monogoose.createConnection('mongodb://localhost:27017/speedsmm', {
  useNewUrlParser: true,
  autoIndex: false
});
const bakiye_yatirma_onay_kodSchema = new monogoose.Schema({
    OwnerID: { type: String, required: true, index: true }, //Yatıracak Kisi ID
    key: { type: String, required: true, index: true }, //İşlem tamamlandığında size gönderilecek veri, Number veya String olabilir
    miktar: { type: Number, required: true }, //Yatıracağı Miktar
    banka: { type: String, required: true }, //wise ininal papara payeer shipy
    ban_status: { type: String, required: true }, //Ban Durumu
    para_birimi: { type: String, required: true }, //Ödeme yapılacak para birimi. (TRY, EUR, USD, GBP)
    tarih: { type: String, required: true }, //tarihi
});

bakiye_yatirma_onay_kodSchema.plugin(uniqueValidator);
module.exports = hesaplar.model("smm_onaykod_bakiye", bakiye_yatirma_onay_kodSchema);