import telebot
from tracker import *
import os
from dotenv import load_dotenv

load_dotenv()

KEY = os.getenv('TelegramKey')
bot = telebot.TeleBot(KEY)

new_observers = {}

@bot.message_handler(commands=['nuovo'])
def New(message):
    bot.send_message(message.chat.id, "Ciao, stai creando un nuovo observer di prezzo. Ora usa i comando:\n /nome per impostare cosa cercare, \n /prezzo per impostare il prezzo ideale, \n /tolleranza per impsotare una tolleranza di prezzo, \n /tempo per impostare ogni quanto controllare, \n e /fatto per completare la configurazione")
    bot.send_message(message.chat.id, "se invece vuoi cancellare l'operazione usa /cancella")
    new_observers[message.chat.id] = {}
    new_observers[message.chat.id]['id'] = message.chat.id 


@bot.message_handler(commands=['nome'])
def Name(message):
    try:
        name = message.text.split()[1]
        if not message.chat.id in new_observers:
            bot.send_message(message.chat.id, "prima di poter dare un nome ad un observer devi crearlo, usa /nuovo per poterlo fare")
            return
        new_observers[message.chat.id]['name'] = name
        bot.send_message(message.chat.id, f"nome impostato a: '{name}', se vuoi cambiarlo usa /nome")
    except:
        bot.send_message(message.chat.id, "errore nella lettura del messaggio, prova ad usare /help per avere istruzioni su come usarmi")


@bot.message_handler(commands=['prezzo'])
def price(message):
    try:
        price = message.text.split()[1]
        if not message.chat.id in new_observers:
            bot.send_message(message.chat.id, "prima di poter dare un prezzo ad un observer devi crearlo, usa /nuovo per poterlo fare")
            return
        new_observers[message.chat.id]['price'] = price
        bot.send_message(message.chat.id, f"prezzo impostato a: '{price}', se vuoi cambiarlo usa /prezzo")
    except:
        bot.send_message(message.chat.id, "errore nella lettura del messaggio, prova ad usare /help per avere istruzioni su come usarmi")


@bot.message_handler(commands=['tolleranza'])
def tollerance(message):
    try:
        tollerance = message.text.split()[1]
        if not message.chat.id in new_observers:
            bot.send_message(message.chat.id, "prima di poter dare una tolleranza ad un observer devi crearlo, usa /nuovo per poterlo fare")
            return
        new_observers[message.chat.id]['tollerance'] = tollerance
        bot.send_message(message.chat.id, f"tolleranza impostata a: '{tollerance}', se vuoi cambiarla usa /tolleranza")
    except:
        bot.send_message(message.chat.id, "errore nella lettura del messaggio, prova ad usare /help per avere istruzioni su come usarmi")


@bot.message_handler(commands=['tempo'])
def time(message):
    try:
        time = message.text.split()[1]
        if not message.chat.id in new_observers:
            bot.send_message(message.chat.id, "prima di poter impostare un tempo di un observer devi crearlo, usa /nuovo per poterlo fare")
            return
        new_observers[message.chat.id]['time'] = time
        bot.send_message(message.chat.id, f"tempo impostato a: '{time}', se vuoi cambiarlo usa /tolleranza")
    except:
        bot.send_message(message.chat.id, "errore nella lettura del messaggio, prova ad usare /help per avere istruzioni su come usarmi")


@bot.message_handler(commands=['fatto'])
def done(message):
    if not find_file(os.getcwd(), "saved_researches"):
        os.mkdir("saved_researches")
    
    name = new_observers[message.chat.id]['name']
    try:
        with open(f'saved_researches/{name}_{message.chat.id}.json', 'w') as outfile:
            new_observers[message.chat.id]['last_time'] = 0
            json.dump(new_observers[message.chat.id], outfile)
            bot.send_message(message.chat.id, "observer creato correttamente")
            new_observers[message.chat.id] = None
            return
    except:
        bot.send_message(message.chat.id, "errore nella creazione, riprova più tardi")


@bot.message_handler(commands=['cancella'])
def done(message):
    try:
        name = message.text.split()[1]
        if not find_file('saved_researches', f'{name}_{message.chat.id}.json'):
            bot.send_message(message.chat.id, "observer non trovato")
            return

        os.remove(os.path.join('saved_researches', f'{name}_{message.chat.id}.json'))
        bot.send_message(message.chat.id, "observer rimosso con successo")

    except:
        bot.send_message(message.chat.id, "errore nella lettura del messaggio, prova ad usare /help per avere istruzioni su come usarmi")

@bot.message_handler(commands=['lista'])
def lists(message):
    text = "i tuoi observer attvi sono:"
    id = str(message.chat.id)
    for file in os.listdir('saved_researches'):

        if id in file:
            text += "\n" + file.split('_')[0]
    
    bot.send_message(message.chat.id, text)

@bot.message_handler(commands=['esegui'])
def exec(message):
    # try:
        name = message.text.split()[1]
        print(os.path.join('saved_researches',f'{name}_{message.chat.id}.json'))
        with open(os.path.join('saved_researches',f'{name}_{message.chat.id}.json')) as research:
            research_data = json.load(research)
            minimum = None
            maximum = None
            name = research_data['name']
            file_name = f'{name}_{message.chat.id}.json'
            print(EbayRequest(name, int(research_data['price']), int(research_data['tollerance']), file_name, minimum, maximum))
            print(os.path.join('temp',file_name))
            bot.send_document(message.chat.id, open(os.path.join('temp',file_name),'rb'))

    # except:
    #     bot.send_message(message.chat.id, "errore nella lettura del messaggio, prova ad usare /help per avere istruzioni su come usarmi")


bot.polling()