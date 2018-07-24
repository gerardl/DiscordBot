const BotModule = require('../bot-module');
const TriviaQuestion = require('./trivia-question');
const http = require('follow-redirects').http

// Dirty prototype of a trivia game in discord.
// TODO: make this not suck.

module.exports = class TriviaGame extends BotModule {
    constructor() {
        super();

        this.players = [];
        this.startTime = new Date();
        this.QuizStates = {
            NotStarted: 1,
            JoiningPhase: 2,
            GameStarted: 3,
            QuestionAsked: 4,
            QuestionCorrect: 5
        };
        this.currentQuestion = null;
        this.currentQuizState = this.QuizStates.NotStarted;
    }

    resetGame() {
        this.startTime = new Date();
        this.currentQuizState = this.QuizStates.NotStarted;
        this.players = [];
    };

    addPlayer(player) {
        if (this.players.includes(player)) return false;
        player.points = 0;
        this.players.push(player);
        return true;
    }

    printPlayers() {
        let playersString = "";
        this.players.forEach(player => { playersString += " " + player.username });
        return playersString;
    }

    printScores() {
        let playersString = "";
        this.players.forEach(player => { playersString += " " + player.username + ": " + player.points; });
        return playersString;
    }

    addPoints(playerId, points) {
        for (let i = 0; i < this.players.length; i++) {
            if (this.players[i].id === playerId) {
                this.players[i].points = this.players[i].points || 0;
                this.players[i].points += points;
                return;
            }
        }
    }

    handleChatMessage(message, client) {
        if (client.user.id === message.author.id) return;

        let messageLower = message.content.toLowerCase();
        // trivia loop
        if (this.currentQuizState === this.QuizStates.NotStarted && messageLower === '!trivia') {
            message.channel.send("Welcome to Discord Discount Trivia.  If you want to join this thing type !trivia join.  When everyone has joined, type !trivia start");
            this.resetGame();
            this.currentQuizState = this.QuizStates.JoiningPhase;
            // join game
        } else if (this.currentQuizState === this.QuizStates.JoiningPhase && messageLower === '!trivia join') {
            var added = this.addPlayer(message.author);

            if (added)
                message.channel.send(message.author.username + " has joined.");
            else
                message.channel.send(message.author.username + " is already entered.");
            // start game
        } else if (this.currentQuizState === this.QuizStates.JoiningPhase && messageLower === '!trivia start') {
            if (this.players.length === 0) {
                message.channel.send("you don't have any players yet, you lonely sad person, you.");
                return;
            }

            message.channel.send("Trivia game starting.  Type !answer youranswer to respond.  Answers will be A, B, C, or D and are case-insensitive.");
            message.channel.send("Players: " + this.printPlayers());
            this.currentQuizState = this.QuizStates.GameStarted;
            this.getQuestion(message);
            // interrogate answers
        } else if (this.currentQuizState === this.QuizStates.QuestionAsked && messageLower.includes('!answer')) {
            let playerResponse = messageLower.split("!answer")[1].trim();

            if (this.currentQuestion.isCorrect(playerResponse)) {
                message.reply('You got the answer correct!  You rock!');
                    this.addPoints(message.author.id, 10);
                    message.channel.send(this.printScores());
                    this.currentQuizState = this.QuizStates.QuestionCorrect;
                    this.getQuestion(message);
            } else {
                message.reply("You are kind of an idiot, huh?  That's totally wrong.");
            }
        }
        // quit a game
        if (this.currentQuizState !== this.QuizStates.NotStarted && messageLower === '!trivia quit') {
            message.channel.send(message.author + " has ended the game");
            this.resetGame();
        }
    }

    getQuestion(message) {
        var options = {
            host: 'www.opentdb.com',
            path: '/api.php?amount=1&type=multiple&encode=url3986',
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        };

        let callback = (response) => {
            var str = '';

            //another chunk of data has been recieved, so append it to `str`
            response.on('data', function (chunk) {
                str += chunk;
            });

            //the whole response has been recieved, so we just print it out here
            response.on('end', () => {
                let parsed = '';

                try {
                    parsed = JSON.parse(str);
                    this.handleQuestionResponse(parsed, message);
                } catch (e) {
                    message.channel.send("sorry, but there was a problem getting a question.");
                }
                
            });

            response.on('error', function (e) {
                message.channel.send("sorry, but there was a problem getting a question.");
                console.log(e);
            });
        }

        http.request(options, callback).end();  
    };

    handleQuestionResponse(parsed, message) {
        this.currentQuestion = new TriviaQuestion(parsed);
        let forString = this.currentQuestion;
        message.channel.send(`This question is in the category ${this.currentQuestion.category} and is considered ${this.currentQuestion.difficulty} difficulty.`);
        message.channel.send(`${this.currentQuestion.question} ${this.currentQuestion.choicesString()}.`);
        this.currentQuizState = this.QuizStates.QuestionAsked;
    };
}
