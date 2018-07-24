'use strict';
var http = require('http');
var port = process.env.PORT || 1337;

http.createServer(function (req, res) {
   res.writeHead(200, { 'Content-Type': 'text/plain' });
   res.end('Hello World\n');
}).listen(port);

/*
  Discord Bot Server
*/
'use strict';
var botServer = function () {
    // Import the discord.js module
    const Discord = require('discord.js');
    // Create an instance of a Discord Client
    const client = new Discord.Client();
    // The token of your bot - https://discordapp.com/developers/applications/me
    const token = 'TOKENHERE';

    const http = require('follow-redirects').http

    const TriviaGame = require('./lib/trivia/trivia-game');
    var triviaGame = new TriviaGame();
    const CraftingHelper = require('./lib/crafting/crafting-helper');
    var craftingHelper = new CraftingHelper();
    
    // The ready event is vital, it means that your bot will only start reacting to information
    // from Discord _after_ ready is emitted
    client.on('ready', () => {
        console.log('discord ready fired');
        
    });

    client.on('message', message => {
        triviaGame.handleChatMessage(message, client);
        craftingHelper.handleChatMessage(message, client);
    });
    
    // Log our bot in
    client.login(token);
}();