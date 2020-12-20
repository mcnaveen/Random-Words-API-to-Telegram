require('dotenv').config()
var cheerio = require('cheerio');
var request = require('request');
var nlp = require('compromise');
var htmlspecialchars = require('htmlspecialchars');
var nlpPronounce = require('compromise-pronounce');
nlp.extend(nlpPronounce);
const { Telegraf } = require('telegraf');
const bot = new Telegraf(process.env.BOT_TOKEN);
const randomUseragent = require('random-useragent');
var rua = randomUseragent.getRandom();
var wordOfDay = [];
  
  // use Cheerio to make request
  request({
    method: 'GET',
    url: 'https://randomword.com/',
    proxy: proxyGenerator(),
    headers: {
        'User-Agent': rua // optional headers
     }
  }, function(err, response, body, callback) {
      if (err) return console.error(err);
      
      // get the HTML body
      $ = cheerio.load(body);

      if(wordOfDay.length > 0){
        wordOfDay = [];
      }

      var post = $('.section #shared_section');
      var word = post.find('#random_word').eq(0).text().replace('\r\n\t\t\t\t\t', '').replace('\r\n\t\t\t\t', '').replace('\n\t\t\t\t\t','').replace('\n\t\t\t\t','');
      var definition = post.find('#random_word_definition').eq(0).text().replace('\n', '');
      var pronounceword = word;
      var doc = nlp (pronounceword);
      var pronounces = doc.terms().pronounce().map(o=> o.pronounce).toString();
      var pronounce = pronounces.replace(",", "");
        
      var word = decodeURI(word.charAt(0).toUpperCase() + word.slice(1));
      var definition = decodeURI(definition.charAt(0).toUpperCase() + definition.slice(1));
      var pronunciation = decodeURI(pronounce.charAt(0).toUpperCase() + pronounce.slice(1));

      var wordPush = '✍️ Word: ' + word + '\n\n📚 Definition: ' +  definition + '\n\n🗣️ Pronunciation: ' +  pronunciation ;

      bot.telegram.sendMessage(process.env.CHANNEL_ID, wordPush).catch( function(error){ console.error(error); } );

      console.log("User-Agent:", rua);
        
      // return a JSON object as a response
      //res.send(JSON.stringify(wordOfDay, null, 4));

  });

// Random Proxy
function proxyGenerator() {
  let ip_addresses = [];
  let port_numbers = [];
  let proxy;

  request("https://sslproxies.org/", function(error, response, html) {
    if (!error && response.statusCode == 200) {
      const $ = cheerio.load(html);

      $("td:nth-child(1)").each(function(index, value) {
        ip_addresses[index] = $(this).text();
      });

      $("td:nth-child(2)").each(function(index, value) {
        port_numbers[index] = $(this).text();
      });
    } else {
      console.log("Error loading proxy, please try again");
    }

    ip_addresses.join(", ");
    port_numbers.join(", ");

  });
}
