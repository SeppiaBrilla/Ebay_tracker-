const Telegram_bot = require('node-telegram-bot-api');
const fs = require('fs'); 
let eBay = require("ebay-node-api");
require('dotenv').config()

if(!process.env.EbayAppID)
    throw(".env file missing")

let ebay = new eBay({
  clientID: process.env.EbayAppID,
  clientSecret: process.env.EbayCertID,
  headers: {
    // optional
    "X-EBAY-C-MARKETPLACE-ID": process.env.EbaySiteID 
  }
});

const token = process.env.TelegramKey;

const bot = new Telegram_bot(token,{polling : true})

var new_observers = {};

(async() =>{
    console.log("starting...")
    while(true){
        await sender();
        await sleep(3000);
    }
})();

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

bot.onText(/\/nuovo/, (msg, match) => {
    let chatID = msg.chat.id;
    bot.sendMessage(chatID, "Ciao, stai creando un nuovo observer di prezzo. Ora usa i comando:\n /nome per impostare cosa cercare, \n /prezzo per impostare il prezzo ideale, \n /tolleranza per impsotare una tolleranza di prezzo, \n /tempo per impostare ogni quanto controllare,\n /file per impostare se vuoi o meno ricevere il file con tutte le ricerche\n e /fatto per completare la configurazione");
    bot.sendMessage(chatID, "se invece vuoi cancellare l'operazione usa /cancella");
    new_observers[chatID] = {};
    new_observers[chatID]['id'] = chatID; 
    new_observers[chatID]['file'] = true;
});


bot.onText(/\/nome (.+)/, (msg, match) => {
    let chatID = msg.chat.id;
    try{
        let name = match[1];
        if(! chatID in new_observers){
            bot.sendMessage(chatID, "prima di poter dare un nome ad un observer devi crearlo, usa /nuovo per poterlo fare");
            return;
        }
        new_observers[chatID]['name'] = name;
        bot.sendMessage(chatID, "nome impostato a: '" + name + "', se vuoi cambiarlo usa /nome");
    }catch{
        bot.sendMessage(chatID, "errore nella lettura del messaggio, prova ad usare /help per avere istruzioni su come usarmi");
    }
});


bot.onText(/\/prezzo (.+)/, (msg, match) => {
    let chatID = msg.chat.id;
    try{
        price = match[1];
        if(!chatID in new_observers){
            bot.sendMessage(chatID, "prima di poter dare un prezzo ad un observer devi crearlo, usa /nuovo per poterlo fare");
            return
        }
        new_observers[chatID]['price'] = price;
        bot.sendMessage(chatID, "prezzo impostato a: '" + price + "', se vuoi cambiarlo usa /prezzo");
    }catch{
        bot.sendMessage(chatID, "errore nella lettura del messaggio, prova ad usare /help per avere istruzioni su come usarmi");
    }
});

bot.onText(/\/tolleranza (.+)/, (msg, match) => {
    let chatID = msg.chat.id;
    try{
        tollerance = match[1];
        if(!chatID in new_observers){
            bot.sendMessage(chatID, "prima di poter dare una tolleranza ad un observer devi crearlo, usa /nuovo per poterlo fare");
            return;
        }
        new_observers[chatID]['tollerance'] = tollerance;
        bot.sendMessage(chatID, "tolleranza impostata a: '" + tollerance + "'%, se vuoi cambiarla usa /tolleranza");
    }catch{
        bot.sendMessage(chatID, "errore nella lettura del messaggio, prova ad usare /help per avere istruzioni su come usarmi");
    }
});

bot.onText(/\/tempo (.+)/, (msg, match) => {
    let chatID = msg.chat.id;
    try{
        time = match[1];
        if(! chatID in new_observers){
            bot.sendMessage(chatID, "prima di poter impostare un tempo di un observer devi crearlo, usa /nuovo per poterlo fare")
            return
        }
        new_observers[chatID]['time'] = time
        bot.sendMessage(chatID, "tempo impostato a: '" +  time + "' minuti, se vuoi cambiarlo usa /tempo")
    }catch{
        bot.sendMessage(chatID, "errore nella lettura del messaggio, prova ad usare /help per avere istruzioni su come usarmi");
    }
});

bot.onText(/\/file (.+)/, (msg, match) => {
    let chatID = msg.chat.id;
    try{
        if(!chatID in new_observers){
            bot.sendMessage(chatID, "prima di poter impostare un tempo di un observer devi crearlo, usa /nuovo per poterlo fare")
            return
        }
        if(match[1] == 'si'){
            new_observers[chatID]['file'] = true;
            bot.sendMessage(chatID, "perfetto, riceverai il file json con tutti i risultati trovati, usa '/file no' per cambiare questa impostazione");
        }
        else if(match[1] == 'no'){
            new_observers[chatID]['file'] = false;
            bot.sendMessage(chatID, "perfetto, non riceverai il file json con tutti i risultati trovati, usa '/file si' per cambiare questa impostazione");
        }
        else{
            bot.sendMessage(chatID,'non hai scelto nè si nè no, per favore usa il comando correttamente');
        }
    }catch(e){
        console.log(e)
        bot.sendMessage(chatID, "errore nella lettura del messaggio, prova ad usare /help per avere istruzioni su come usarmi");
    }
});

bot.onText(/\/fatto/, (msg, match) => {
    let chatID = msg.chat.id;
    if (!fs.existsSync("saved_researches")){
        fs.mkdirSync("saved_researches");
    }
    try{
        let name = new_observers[chatID]['name']
        new_observers[chatID]['last_time'] = '0'
        fs.writeFileSync("saved_researches/" + name + "_" + chatID + ".json", JSON.stringify(new_observers[chatID]))
        bot.sendMessage(chatID, "observer creato correttamente")
        new_observers[chatID] = null
    }catch{
        bot.sendMessage(chatID, "errore nella lettura del messaggio, prova ad usare /help per avere istruzioni su come usarmi");
    }
});

bot.onText(/\/elimina (.+)/, (msg, match) => {
    let chatID = msg.chat.id;
    try{
        let name = match[1] ? match[1] : ""
        if(name != ""){
            fs.unlink("./saved_researches/"+ name +"_" + chatID + ".json",()=>{})
            bot.sendMessage(chatID, "observer rimosso con successo")
        }
    }catch{
        bot.sendMessage(chatID, "errore nella lettura del messaggio, prova ad usare /help per avere istruzioni su come usarmi");
    }
});

bot.onText(/\/cancella/, (msg, match) => {
    let chatID = msg.chat.id;
    try{
        new_observers[chatID] = null;
        bot.sendMessage(chatID, "operazione /nuovo cancellata")
    }catch{
        bot.sendMessage(chatID, "errore nella lettura del messaggio, prova ad usare /help per avere istruzioni su come usarmi");
    }
});

bot.onText(/\/lista/, (msg, match) => {
    let chatID = msg.chat.id;
    let text = "i tuoi observer attvi sono:"
    let files = fs.readdirSync('./saved_researches/');
    for(let i = 0; i < files.length; i++){
        if(files[i].includes(chatID))
            text += "\n" +files[i].split('_')[0]
    }
    bot.sendMessage(chatID, text)
});

bot.onText(/\/esegui (.+)/, (msg, match) => {
    let chatID = msg.chat.id;
    try{
        search(match[1], chatID)
    }catch(e){
        console.log(e)
        bot.sendMessage(chatID, "errore nella lettura del messaggio, prova ad usare /help per avere istruzioni su come usarmi")
    }
});

bot.onText(/\/help/, (msg, match) => {
    let chatID = msg.chat.id;
    bot.sendMessage(chatID, `per creare un nuovo obserever usa /nuovo e segui le istruzioni,
per eliminare un observer usa /elimina seguito dal nome dell'observer,
per vedere tutti i tuoi observer attivi usa /lista,
per eseguire immediatamente un observer usa /esegui seguito dal nome dell'observer
attenzione: 
    -tutti i comandi per impostare un nuovo observer (a parte /fatto) hanno bisogno di un argomento successivo
    -la tolleranza è il discostamento dal prezzo impostato (in %)
    -il tempo è ogni quanto eseguire e notificare la ricerca (in minuti)
    -per impostare se ricevere i file json con tutti i prodotti trovati usa /file seguito da si o no
    -questo bot è stato fatto senza dare troppo peso a possibili errori dell'utente quindi si rompe facile, non sfidarlo`)
});

bot.onText(/\/start/, (msg, match) => {
    let chatID = msg.chat.id;
    bot.sendMessage(chatID, `per creare un nuovo obserever usa /nuovo e segui le istruzioni,
per eliminare un observer usa /elimina seguito dal nome dell'observer,
per vedere tutti i tuoi observer attivi usa /lista,
per eseguire immediatamente un observer usa /esegui seguito dal nome dell'observer
attenzione: 
    -tutti i comandi per impostare un nuovo observer (a parte /fatto) hanno bisogno di un argomento successivo
    -la tolleranza è il discostamento dal prezzo impostato (in %)
    -il tempo è ogni quanto eseguire e notificare la ricerca (in minuti)
    -per impostare se ricevere i file json con tutti i prodotti trovati usa /file seguito da si o no
    -questo bot è stato fatto senza dare troppo peso a possibili errori dell'utente quindi si rompe facile, non sfidarlo`)
});

function search(name, id){
    let rawdata = fs.readFileSync('saved_researches/' + name + '_' + id + '.json');
    let research = JSON.parse(rawdata);
    ebay.findItemsByKeywords(name)
    .then(
        data => {

            let response = data[0].searchResult[0].item
            let res = [];
            let minprice = parseFloat(research['price']) - (parseFloat(research['price']) * parseFloat(research['tollerance']) / 100)
            let maxprice = parseFloat(research['price']) + (parseFloat(research['price']) * parseFloat(research['tollerance']) / 100)
            for(let i = 0; i < response.length; i ++){
                let respi = response[i]["sellingStatus"][0]["currentPrice"][0]["__value__"];
                if(respi != null && respi < maxprice && respi > minprice)
                    res.push(response[i])
            }
            if(res.length < 1){
                bot.sendMessage(id,"nessun prodotto relativo alla ricerca " + name + " trovato!")
                return;
            }
            let keys = Object.keys(res);
            let min = minMax(res,'min')
            let max = minMax(res,'max')
            fs.writeFileSync("temp/" + name + "_" + id + ".json", JSON.stringify(res));
            text = "il prodotto con il prezzo minore è:\n" + min['title'] + "\n " + min["sellingStatus"][0]["currentPrice"][0]["__value__"] + "\n " + min['viewItemURL'] + "\nil prodotto con il prezzo maggiore è:\n " + max['title'] + "\n " + max["sellingStatus"][0]["currentPrice"][0]["__value__"] + "\n " + max['viewItemURL'];
            if(research['file']){
                text += "\necco invece tutti i prodotti trovati:";
                bot.sendMessage(id,text)
                bot.sendDocument(id,"temp/" + name + "_" + id + ".json")
            }else{
                bot.sendMessage(id,text);
            }
            fs.unlink("./temp/" + name + "_" + id + ".json",()=>{})
        },
        error => {
          console.log(error);
        }
    );

}

async function sender(){
    let files = fs.readdirSync('./saved_researches/');
    for(let i = 0; i < files.length; i++){
        let file = JSON.parse(fs.readFileSync("./saved_researches/" + files[i]));
        let newDate = new Date(Date.parse(file['last_time'])+ parseInt(file['time'])*60000);
        if(file['last_time'] == '0' || newDate <= Date.now())
        {
            file['last_time'] = (new Date()).toString();
            fs.writeFileSync("./saved_researches/" + files[i], JSON.stringify(file));
            await search(file['name'], file['id']);
        }
    }
}

function minMax(arr, type){
    let end;
    let conf1, conf2;
    if(type == 'min'){
        for(let i = 0; i < arr.length; i++){
            conf1 = end ? end["sellingStatus"][0]["currentPrice"][0]["__value__"]: null;
            conf2 = arr[i]["sellingStatus"][0]["currentPrice"][0]["__value__"]
            if(end == null || (conf1 != null && conf2!= null && conf2 < conf1))
                end = arr[i]
        }
    }else{
        for(let i = 0; i < arr.length; i++){
            conf1 = end ? end["sellingStatus"][0]["currentPrice"][0]["__value__"]: null;
            conf2 = arr[i]["sellingStatus"][0]["currentPrice"][0]["__value__"]
            if(end == null || (conf1 != null && conf2!= null && conf2 > conf1))
                end = arr[i]
        }
    }
    return end
}