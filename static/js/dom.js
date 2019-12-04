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
            const card = document.createElement('DIV');
            card.classList.add('card', 'unflipped');
            card.dataset.suit = suit;
            card.dataset.rank = rank.toString();
            util.createCardHeader(card);
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
    },
    flipCardFromUnflippedDeck: function() {
        let unflippedDeck = document.getElementById('unflipped');
        let flippedDeck = document.getElementById('flipped');
        let zIndexFlippedCards = 0;
        unflippedDeck.addEventListener('click', function (event) {
            if (unflippedDeck.hasChildNodes()) {
                let flippedCard = unflippedDeck.lastChild;
                flippedCard.style.zIndex = (zIndexFlippedCards++).toString();
                util.flipCard(flippedDeck, flippedCard);
                if (flippedCard.hasChildNodes() === false) {
                    util.createCardHeader(flippedCard);
                }
            }
        });
    },
    unflipTheFlippedDeck: function () {
        let unflippedCardsContainer = document.getElementById('unflipped');
        unflippedCardsContainer.addEventListener('dblclick', function () {
            if (unflippedCardsContainer.hasChildNodes() === false) {
                let flippedDeck = document.getElementById('flipped');
                let flippedCards = flippedDeck.getElementsByClassName('card flipped');

                let zIndex = 0;
                for (let i = flippedCards.length - 1; i >= 0; i--) {
                    let unflippedCard = flippedCards[i];
                    unflippedCard.parentNode.removeChild(unflippedCard);
                    unflippedCardsContainer.appendChild(unflippedCard);
                    unflippedCard.style.zIndex = (zIndex--).toString();
                    unflippedCard.textContent = '';
                    unflippedCard.classList.replace('flipped', 'unflipped');
                }
            }
        })
    }
};





