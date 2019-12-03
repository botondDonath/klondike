import {util} from "./util.js";

export const dom = {
    init: function () {
        let deck = this.deck.generate();
    },
    deck: {
        generate: function () {
            let deck = [];
            const suits = ['spades', 'clubs', 'hearts', 'diamonds'];
            for (const suit of suits) {
                for (let rank = 1; rank <= 13; rank++) {
                    deck.push({suit: suit, rank: rank})
                }
            }
            util.shuffle(deck);
            return deck
        }
    }
};