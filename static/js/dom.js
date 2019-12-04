import {util} from "./util.js";

export const dom = {
    init: function () {
        this.deck.init();
        this.drag.init();
        this.flipCardFromUnflippedDeck();
        this.unflipTheFlippedDeck();
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
    flipCardFromUnflippedDeck: function () {
        let unflippedDeck = document.getElementById('unflipped');
        let flippedDeck = document.getElementById('flipped');
        let zIndexFlippedCards = 0;
        unflippedDeck.addEventListener('click', function () {
            if (unflippedDeck.querySelector('.card')) {
                let flippedCard = unflippedDeck.lastChild;
                flippedCard.style.zIndex = (zIndexFlippedCards++).toString();
                util.flipCard(flippedDeck, flippedCard);
            }
        });
    },
    unflipTheFlippedDeck: function () {
        let unflippedDeck = document.getElementById('unflipped');
        unflippedDeck.addEventListener('dblclick', function () {
            if (!unflippedDeck.querySelector('.card')) {
                let flippedDeck = document.getElementById('flipped');
                let flippedCards = flippedDeck.getElementsByClassName('card flipped');
                let zIndex = 0;
                for (let i = flippedCards.length - 1; i >= 0; i--) {
                    let unflippedCard = flippedCards[i];
                    unflippedDeck.appendChild(unflippedCard);
                    unflippedCard.style.zIndex = (zIndex--).toString();
                    unflippedCard.classList.replace('flipped', 'unflipped');
                }
            }
        })
    },
    drag: {
        init: function () {
            const drag = this;
            Array.from(document.getElementsByClassName('card'))
                .forEach(function (card) {
                    card.onmousedown = drag.starter.main.bind(drag.starter);
                });
        },
        starter: {
            prepareTargets: function (card) {
                const dragData = {
                    color: card.dataset.color,
                    rank: parseInt(card.dataset.rank)
                };
                Array.from(document.querySelectorAll('.column .card:not(.unflipped):not(.dragged)'))
                    .filter(card => {
                        return card.dataset.color !== dragData.color && parseInt(card.dataset.rank) === dragData.rank + 1;
                    })
                    .forEach(target => {
                        target.classList.add('target');
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
            prepareDocument: function (clone, event) {
                this.mover.mouse.coords = event;
                document.onmousemove = this.mover.main.bind(clone);
                document.onmouseup = this.ender.main.bind(this.ender);
                document.body.appendChild(clone);
            },
            prepareCard: function (card) {
                card.classList.add('dragged');
                card.style.opacity = '0';
            },
            main: function (event) {
                event.preventDefault();
                const card = event.target;
                if (!card.classList.contains('unflipped')) {
                    this.prepareTargets(card);
                    const clone = this.createClone(card);
                    this.prepareDocument.call(dom.drag, clone, event);
                    this.prepareCard(card);
                }
            },
        },
        mover: {
            mouse: {
                x: null,
                y: null,
                set coords(mouseEvent) {
                    this.x = mouseEvent.clientX;
                    this.y = mouseEvent.clientY;
                },
                getVector: function (mouseEvent) {
                    const oldX = this.x;
                    const oldY = this.y;
                    this.coords = mouseEvent;
                    return {
                        dx: this.x - oldX,
                        dy: this.y - oldY
                    }
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
            glide: function (clone, event) {
                const vector = this.mouse.getVector(event);
                const cloneRect = clone.getBoundingClientRect();
                clone.style.left = (cloneRect.x + vector.dx) + 'px';
                clone.style.top = (cloneRect.y + vector.dy) + 'px';
            },
            handleContact: function (clone) {
                const targetCardBelow = this.detectTarget(clone);
                if (targetCardBelow && !targetCardBelow.classList.contains('active')) {
                    targetCardBelow.classList.add('active');
                    clone.classList.add('over');
                } else if (!targetCardBelow && clone.classList.contains('over')) {
                    document.querySelector('.active').classList.remove('active');
                    clone.classList.remove('over');
                }
            },
            main: function (event) {
                event.preventDefault();
                dom.drag.mover.glide(this, event);
                dom.drag.mover.handleContact(this);
            },

        },
        ender: {
            disableMouseEvents: function () {
                document.onmousemove = null;
                document.onmouseup = null;
            },
            destroyClones: function () {
                Array.from(document.getElementsByClassName('card-clone'))
                    .forEach(clone => {
                        clone.remove();
                    })
            },
            resetDraggedCards: function () {
                Array.from(document.getElementsByClassName('dragged'))
                    .forEach(card => {
                        card.style.opacity = '100%';
                        card.classList.remove('dragged');
                    })
            },
            resetTargetCards: function () {
                Array.from(document.querySelectorAll('.target'))
                    .forEach(target => {
                        target.classList.remove('target', 'active');
                    })
            },
            dropCards: function (target) {
                document.querySelectorAll('.dragged')
                    .forEach(card => {
                        target.parentNode.appendChild(card);
                    });
            },
            main: function () {
                this.disableMouseEvents();
                this.destroyClones();
                const activeTargetCard = document.querySelector('.active');
                if (activeTargetCard) {
                    this.dropCards(activeTargetCard);
                }
                this.resetDraggedCards();
                this.resetTargetCards();
            },
        }
    }
};