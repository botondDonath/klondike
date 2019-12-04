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
            const cardHeader = document.createElement('DIV');
            cardHeader.classList.add('card-header');
            cardHeader.textContent = `${suit} ${rank}`;
            card.appendChild(cardHeader);
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
        let unflippedCards = unflippedDeck.getElementsByClassName('unflipped card');
        console.log(unflippedDeck);

        let zIndexFlippedCards = 0;
        for (let unflippedCard of unflippedCards) {
            unflippedCard.addEventListener('click', function (event) {
                console.log(unflippedDeck);

                let flippedCard = event.currentTarget;
                flippedCard.style.zIndex = (zIndexFlippedCards++).toString();
                //remove flipped card from unflipped deck
                flippedCard.remove();
                console.log(flippedCard);
                console.log(unflippedDeck);

                flippedDeck.appendChild(flippedCard);
                console.log(flippedDeck);
                flippedCard.classList.remove('unflipped');
                let suit = flippedCard.dataset.suit;
                let rank = flippedCard.dataset.rank;
                const cardHeader = document.createElement('DIV');
                cardHeader.classList.add('card-header');
                cardHeader.textContent = `${suit} ${rank}`;
            })
        }
    }
};





