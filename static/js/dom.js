import {util} from "./util.js";

export const dom = {
    init: function () {
        this.deck.init();
    },
    deck: {
        init: function () {
            const deck = this.generate();
            for (const card of deck) {
                const cardElement = this.createCard();
                cardElement.dataset.suit = card.suit;
                cardElement.dataset.rank = card.rank;
                deck[deck.indexOf(card)] = cardElement;
            }
        },
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
        },
        createCard: function () {
            const card = document.createElement('DIV');
            card.classList.add('card');
            return card;
        }
    }
};