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
                    target.addEventListener('cardEnter', dom.drag.cardEnter);
                    target.addEventListener('cardLeave', dom.drag.cardLeave);
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
                document.onmousemove = dom.drag.move;
                document.onmouseup = dom.drag.end;
                document.body.appendChild(clone);
                card.style.opacity = '70%';
            }
        },
        cardEnter: function () {
            this.style.opacity = '75%';
            this.classList.add('active');
        },
        cardLeave: function () {
            this.style.opacity = '100%';
            this.classList.remove('active');
        },
        detectTarget: function (clone) {
            const corners = util.getCorners(clone);
            for (const corner of corners) {
                let elemBelow = document.elementFromPoint(corner.x, corner.y);
                if (elemBelow && elemBelow.classList.contains('target') && !clone.classList.contains('over')) {
                    clone.classList.add('over');
                    const cardEnterEvent = new Event('cardEnter');
                    elemBelow.dispatchEvent(cardEnterEvent);
                    return true;
                } else if (elemBelow && elemBelow.classList.contains('active')) {
                    return true;
                }
            }
            return false;
        },
        deactivateTarget: function (clone) {
            clone.classList.remove('over');
            const activeTarget = document.querySelector('.active');
            const cardLeaveEvent = new Event('cardLeave');
            activeTarget.dispatchEvent(cardLeaveEvent);
        },
        move: function (event) {
            event.preventDefault();
            const clone = document.getElementsByClassName('card-clone')[0];

            const mouseX = dom.drag.mouse.x, mouseY = dom.drag.mouse.y;
            dom.drag.mouseData = event;
            const dx = dom.drag.mouse.x - mouseX, dy = dom.drag.mouse.y - mouseY;
            const cloneRect = clone.getBoundingClientRect();
            clone.style.left = (cloneRect.x + dx) + 'px';
            clone.style.top = (cloneRect.y + dy) + 'px';

            const noTargetBelow = !dom.drag.detectTarget(clone);
            if (noTargetBelow && clone.classList.contains('over')) {
                dom.drag.deactivateTarget(clone);
            }
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
                    target.style.opacity = '100%';
                    target.removeEventListener('cardEnter', dom.drag.cardEnter);
                    target.removeEventListener('cardLeave', dom.drag.cardLeave);
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