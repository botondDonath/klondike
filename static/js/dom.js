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


        let zIndexFlippedCards = 0;
            unflippedDeck.addEventListener('click', function (event) {
                if (unflippedDeck.hasChildNodes()) {
                    let flippedCard = unflippedDeck.lastChild;

                    flippedCard.style.zIndex = (zIndexFlippedCards++).toString();
                    //remove flipped card from unflipped deck
                    flippedCard.remove();
                    flippedCard.classList.remove('unflipped');
                    flippedCard.classList.add('flipped');
                    // console.log(flippedCard);
                    // console.log(unflippedDeck);

                    flippedDeck.appendChild(flippedCard);
                    // console.log(flippedDeck);
                    let suit = flippedCard.dataset.suit;
                    let rank = flippedCard.dataset.rank;
                    if (flippedCard.hasChildNodes() === false) {
                        const cardHeader = document.createElement('DIV');
                        cardHeader.classList.add('card-header');
                        cardHeader.textContent = `${suit} ${rank}`;
                        flippedCard.appendChild(cardHeader);
                    }
                }
            });



            // for (let unflippedCard of unflippedCards) {
            //     unflippedCard.addEventListener('click', function (event) {
            //     console.log('2');
            //         // console.log(unflippedDeck);
            //
            //         let flippedCard = event.currentTarget;
            //         flippedCard.style.zIndex = (zIndexFlippedCards++).toString();
            //         //remove flipped card from unflipped deck
            //         flippedCard.remove();
            //         flippedCard.classList.remove('unflipped');
            //         flippedCard.classList.add('flipped');
            //         // console.log(flippedCard);
            //         // console.log(unflippedDeck);
            //
            //         flippedDeck.appendChild(flippedCard);
            //         // console.log(flippedDeck);
            //         let suit = flippedCard.dataset.suit;
            //         let rank = flippedCard.dataset.rank;
            //         const cardHeader = document.createElement('DIV');
            //         cardHeader.classList.add('card-header');
            //         cardHeader.textContent = `${suit} ${rank}`;
            //     })
            // }


    },

    unflipTheFlippedDeck: function () {
        let unflippedCardsContainer = document.getElementById('unflipped');

        unflippedCardsContainer.addEventListener('dblclick', function () {

            if (unflippedCardsContainer.hasChildNodes() === false) {
                let flippedDeck = document.getElementById('flipped');
                let flippedCards = flippedDeck.getElementsByClassName('card flipped');
                // console.log(flippedDeck);
                // console.log(flippedCards);

                let zIndex = 0;
                for(let i = flippedCards.length-1;i >= 0;i--) {
                    let flippedCard = flippedCards[i];

                    flippedCard.parentNode.removeChild(flippedCard);
                    unflippedCardsContainer.appendChild(flippedCard);
                    flippedCard.style.zIndex = (zIndex--).toString();
                    flippedCard.textContent = '';
                    flippedCard.classList.remove('flipped');
                    flippedCard.classList.add('unflipped');
                }

                // console.log(flippedDeck);
                // console.log(unflippedCardsContainer);

            }
        })


    }

};





