import {util} from "./util.js";

export const dom = {
    init: function () {
        this.deck.init();
        this.drag.init();
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
            switch (rank) {
                case 1:
                    rank = 'A';
                    break;
                case 11:
                    rank = 'J';
                    break;
                case 12:
                    rank = 'Q';
                    break;
                case 13:
                    rank = 'K';
                    break;
            }
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
    },
    drag: {
        init: function () {
            const cards = Array.from(document.getElementsByClassName('card'));
            cards.forEach(function (card) {
                card.onmousedown = dom.drag.start;
            })
        },
        createClone: function (card) {
            const clone = card.cloneNode(true);
            clone.classList.replace('card', 'card-clone');
            clone.style.position = 'fixed';
            const position = card.getBoundingClientRect();
            clone.style.left = position.x + 'px';
            clone.style.top = position.y + 'px';
            return clone;
        },
        start: function (event) {
            event.preventDefault();
            const card = this;
            if (!card.classList.contains('unflipped')) {
                const clone = dom.drag.createClone(card);
                dom.drag.mouseData = event;
                document.onmousemove = dom.drag.move;
                document.onmouseup = dom.drag.end;
                document.body.appendChild(clone);
            }
        },
        move: function (event) {
            event.preventDefault();
            const clone = document.getElementsByClassName('card-clone')[0];
            let mouseX = dom.drag.mouse.x, mouseY = dom.drag.mouse.y;
            dom.drag.mouseData = event;
            let dx = dom.drag.mouse.x - mouseX, dy = dom.drag.mouse.y - mouseY;
            const clonePosition = clone.getBoundingClientRect();
            clone.style.left = (clonePosition.x + dx) + 'px';
            clone.style.top = (clonePosition.y + dy) + 'px';
        },
        end: function () {
            document.onmousemove = null;
            document.onmouseup = null;
            const clones = document.getElementsByClassName('card-clone');
            for (const clone of clones) {
                clone.remove();
            }
        },
        set mouseData(mouseEvent) {
            this.mouse.x = mouseEvent.clientX;
            this.mouse.y = mouseEvent.clientY;
        },
        mouse: {
            x: null,
            y: null
        }
    }
};