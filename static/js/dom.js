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
            card.dataset.color = ['spades', 'clubs'].includes(suit) ? 'black' : 'red';
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
            Array.from(document.getElementsByClassName('card'))
                .forEach(function (card) {
                    card.onmousedown = dom.drag.start;
                });
        },
        createClone: function (card) {
            const clone = card.cloneNode(true);
            clone.classList.replace('card', 'card-clone');
            clone.style.position = 'fixed';
            const cardRect = card.getBoundingClientRect();
            clone.style.left = cardRect.x + 'px';
            clone.style.top = cardRect.y + 'px';
            return clone;
        },
        prepareTargets: function (dragData) {
            Array.from(document.querySelectorAll('.column .card:not(.unflipped):not(.dragged)'))
                .filter(card => {
                    return card.dataset.color !== dragData.color && parseInt(card.dataset.rank) === dragData.rank + 1;
                })
                .forEach(target => {
                    target.classList.add('target');
                });
        },
        start: function (event) {
            event.preventDefault();
            const card = this;
            if (!card.classList.contains('unflipped')) {
                card.classList.add('dragged');
                dom.drag.prepareTargets({
                    color: card.dataset.color,
                    rank: parseInt(card.dataset.rank)
                });
                const clone = dom.drag.createClone(card);
                dom.drag.mouseData = event;
                document.onmousemove = dom.drag.move.bind(clone);
                document.onmouseup = dom.drag.end.bind(clone);
                document.body.appendChild(clone);
                card.style.opacity = '70%';
            }
        },
        detectTarget: function (clone) {
            let targetBelow;
            const corners = util.getCorners(clone);
            for (const corner of corners) {
                const elemBelow = document.elementFromPoint(corner.x, corner.y);
                if (elemBelow && elemBelow.classList.contains('target')) {
                    targetBelow = elemBelow;
                    break;
                }
            }
            return targetBelow;
        },
        handleCardMovement: function (clone) {
            const mouseX = dom.drag.mouse.x, mouseY = dom.drag.mouse.y;
            dom.drag.mouseData = event;
            const dx = dom.drag.mouse.x - mouseX, dy = dom.drag.mouse.y - mouseY;
            const cloneRect = clone.getBoundingClientRect();
            clone.style.left = (cloneRect.x + dx) + 'px';
            clone.style.top = (cloneRect.y + dy) + 'px';
        },
        handleCardPassage: function (clone) {
            const targetCardBelow = dom.drag.detectTarget(clone);
            if (targetCardBelow && !targetCardBelow.classList.contains('active')) {
                targetCardBelow.classList.add('active');
                clone.classList.add('over');
            } else if (!targetCardBelow && clone.classList.contains('over')) {
                document.querySelector('.active').classList.remove('active');
                clone.classList.remove('over');
            }
        },
        move: function (event) {
            event.preventDefault();
            dom.drag.handleCardMovement(this);
            dom.drag.handleCardPassage(this);
        },
        end: function () {
            document.onmousemove = null;
            document.onmouseup = null;
            const clones = document.getElementsByClassName('card-clone');
            for (const clone of clones) {
                clone.remove();
            }
            const draggedCards = document.getElementsByClassName('dragged');
            for (const card of draggedCards) {
                card.style.opacity = '100%';
                card.classList.remove('dragged');
            }
            Array.from(document.querySelectorAll('.target'))
                .forEach(target => {
                    target.classList.remove('target', 'active');
                })
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