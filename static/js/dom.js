import {util} from "./util.js";

export const dom = {
    init: function () {
        this.deck.init();
    },
    deck: {
        init: function () {
            const deck = this.generate();
            this.display(deck);
        },
        generate: function () {
            let deck = [];
            const suits = ['spades', 'clubs', 'hearts', 'diamonds'];
            for (const suit of suits) {
                for (let rank = 1; rank <= 13; rank++) {
                    const card = this.createCard(suit, rank);
                    deck.push(card);
                }
            }
            util.shuffle(deck);
            return deck
        },
        createCard: function (suit, rank) {
            let card = document.getElementById('card-template');
            card = document.importNode(card, true);
            const cardContainer = document.createElement('DIV');
            cardContainer.innerHTML = card.innerHTML;
            card = cardContainer.querySelector('.card');
            card.classList.add('card', 'unflipped');
            card.dataset.suit = suit;
            card.dataset.rank = rank.toString();
            card.querySelector('.suit-label').classList.add(suit);
            card.querySelector('.rank-label').textContent = rank;
            return card;
        },
        display: function (deck) {
            let columns = document.querySelectorAll('.column');
            columns = Array.from(columns);
            for (let firstCol = 0; firstCol < 7; firstCol++) {
                for (let col = firstCol; col < 7; col++) {
                    const card = deck.pop();
                    card.classList.toggle('unflipped', col !== firstCol);
                    columns[col].appendChild(card);
                }
            }
            const unflippedPile = document.getElementById('unflipped');
            let zIndex = 1;
            for (const card of deck) {
                card.style.zIndex = (zIndex++).toString();
                unflippedPile.appendChild(card);
            }
        }
    }
};