from ebaysdk.finding import Connection as finding 
from bs4 import BeautifulSoup
import json
import os

folder = 'temp'

def find_file(directory, file_name):
    for file in os.listdir(directory):
        if(file == file_name):
            return True
    return False

def EbayRequest(to_search, price, toll, file_name, out_min, out_max):
    # try:
        data = None
        with open('ebay-config.json') as config_file:
            data = json.load(config_file)

        keywords = to_search
        price_tag = price
        price_toll = toll
        api = finding(appid= data["appID"], siteid= data["siteID"], config_file = None)
        api_request = {'keywords': keywords}
        response = api.execute('findItemsAdvanced', api_request)
        soup = BeautifulSoup(response.content,'lxml')
        totalentries = int(soup.find('totalentries').text)
        items = soup.find_all('item')
        products = []
        for item in items:
            
            cat = item.categoryname.string.lower()
            title = item.title.string.lower().strip()
            price = float(item.currentprice.string)
            url = item.viewitemurl.string.lower()
            if price_tag - perc(price_tag, price_toll) < price and price < price_tag + perc(price_tag, price_toll):
                products.append({'cat': cat, 'title':title, 'price':price, 'url': url})

        out_min = min(products, key = lambda x: x['price'])
        out_max = max(products, key = lambda x: x['price'])
        if not find_file(os.getcwd(), folder):
            os.mkdir(folder)
        
        with open(os.path.join(folder,file_name), 'w') as outfile:
            json.dump(products, outfile)

    #     return 0
    # except:
    #     return 1

def perc(base,percentage):
    return (base / 100) * percentage
