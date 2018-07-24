const BotModule = require('../bot-module');

// Start of a future crafting helper module

module.exports = class CraftingHelper extends BotModule {
    constructor() {
        super();
    }

    handleChatMessage(message, client) {
        if (client.user.id === message.author.id) return;
        let messageLower = message.content.toLowerCase();

        if (messageLower.includes('!craft')) {
            // get the item itself, which is like !craft "X" -amount, etc
            let itemParameter = messageLower.match(/!craft "(.*?)"/i)[1];
            let numberToCraft = 1;

            let amountParameter = messageLower.match(/-amount ([0-9]+)/);
            message.channel.send("raw message: " + messageLower);
            if (amountParameter) {
                message.channel.send(amountParameter);
                numberToCraft = +amountParameter[1]; // unary plus to convert to number
            }

            message.channel.send(`You are wanting to craft ${itemParameter} x${numberToCraft}.`);
        } 
    }
}

// move to new file
// some base class
class CraftingItem {
    constructor() {
        this.ingredients = [];
    }
}

class Staff extends CraftingItem {
    constructor() {
        super();
    }
}

