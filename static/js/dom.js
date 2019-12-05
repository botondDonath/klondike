import {util} from "./util.js";

export const dom = {
    init: function () {
        this.deck.init();
        this.drag.init();
        this.flipper.init();
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
    flipper: {
        init: function () {
            this.handleCardsInColumns();
            this.flipCardFromUnflippedDeck();
            this.unflipTheFlippedDeck();
        },
        flipCardInUnflippedDeck: function (flippedDeck, flippedCard) {
            flippedCard.classList.replace('unflipped', 'flipped');
            flippedDeck.appendChild(flippedCard);
        },
        flipCardInColumn: function () {
            if (
                this.classList.contains('unflipped') &&
                !this.nextElementSibling &&
                this.parentNode !== document.getElementById('unflipped')
            ) {
                this.classList.remove('unflipped');
            }
        },
        handleCardsInColumns: function () {
            const flipCard = this.flipCardInColumn;
            document.querySelectorAll('.card')
                .forEach(function (card) {
                    card.addEventListener('click', flipCard.bind(card));
                });
        },
        flipCardFromUnflippedDeck: function () {
            let unflippedDeck = document.getElementById('unflipped');
            let flippedDeck = document.getElementById('flipped');
            let zIndexFlippedCards = 0;
            unflippedDeck.addEventListener('click', function () {
                if (unflippedDeck.querySelector('.card')) {
                    let flippedCard = unflippedDeck.lastChild;
                    flippedCard.style.zIndex = (zIndexFlippedCards++).toString();
                    dom.flipper.flipCardInUnflippedDeck(flippedDeck, flippedCard);
                    if (!unflippedDeck.querySelector('.card')) {
                        zIndexFlippedCards = 0;
                    }
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
            prepareEmptyColumnSlots: function () {
                Array.from(document.querySelectorAll('.column-wrapper .empty-slot'))
                    .filter(slot => !slot.nextElementSibling.hasChildNodes())
                    .forEach(target => {
                        target.classList.add('target');
                        target.nextElementSibling.classList.add('empty');
                    })
            },
            prepareTargetCards: function (dragData) {
                Array.from(document.querySelectorAll('.column .card:not(.unflipped):not(.dragged)'))
                    .filter(card =>
                        !card.nextElementSibling &&
                        card.dataset.color !== dragData.color &&
                        parseInt(card.dataset.rank) === dragData.rank + 1)
                    .forEach(target => {
                        target.classList.add('target');
                    });
            },
            prepareSortedPiles: function (dragData) {
                Array.from(document.querySelectorAll('.sorted-pile'))
                    .filter(pile => {
                        const topElement = pile.lastElementChild;
                        return ((
                            dragData.rank === 1 && topElement.classList.contains('empty-slot')) || (
                            topElement.dataset.suit === dragData.suit &&
                            parseInt(topElement.dataset.rank) === dragData.rank - 1
                        ))
                    })
                    .forEach(pile => {
                        pile.lastElementChild.classList.add('target');
                    });
            },
            prepareTargets: function (card) {
                const dragData = {
                    suit: card.dataset.suit,
                    color: card.dataset.color,
                    rank: parseInt(card.dataset.rank)
                };
                if (dragData.rank === 13) {
                    this.prepareEmptyColumnSlots();
                } else {
                    this.prepareTargetCards(dragData);
                }
                if (!card.nextElementSibling) {
                    this.prepareSortedPiles(dragData);
                }
            },
            createClone: function (card) {
                const clone = card.cloneNode(true);
                clone.classList.replace('card', 'card-clone');
                clone.querySelector('img').remove();
                return clone;
            },
            createCloneContainer: function (grabbedCard) {
                const cloneContainer = document.createElement('DIV');
                cloneContainer.id = 'clone-container';
                const cardRect = grabbedCard.getBoundingClientRect();
                cloneContainer.style.left = cardRect.x + 'px';
                cloneContainer.style.top = cardRect.y + 'px';
                let currentCard = grabbedCard;
                while (currentCard) {
                    const clone = this.createClone(currentCard);
                    cloneContainer.appendChild(clone);
                    currentCard = currentCard.nextElementSibling
                }
                return cloneContainer;
            },
            prepareDocument: function (cloneContainer, event) {
                this.mover.mouse.coords = event;
                document.onmousemove = this.mover.main.bind(cloneContainer);
                document.onmouseup = this.ender.main.bind(this.ender);
                document.body.appendChild(cloneContainer);
            },
            prepareCards: function (card) {
                let currentCard = card;
                while (currentCard) {
                    currentCard.classList.add('dragged');
                    currentCard = currentCard.nextElementSibling;
                }
            },
            main: function (event) {
                event.preventDefault();
                const grabbedCard = event.target;
                if (!grabbedCard.classList.contains('unflipped') && grabbedCard.classList.contains('card')) {
                    const cloneContainer = this.createCloneContainer(grabbedCard);
                    this.prepareTargets(grabbedCard);
                    this.prepareDocument.call(dom.drag, cloneContainer, event);
                    this.prepareCards(grabbedCard);
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
            detectTargets: function (corners) {
                const targets = [];
                corners.forEach(corner => {
                    const elemBelow = document.elementFromPoint(corner.x, corner.y);
                    if (elemBelow && elemBelow.classList.contains('target')) {
                        targets.push(elemBelow);
                    }
                });
                return targets;
            },
            glide: function (cloneContainer, event) {
                const vector = this.mouse.getVector(event);
                const cloneContainerRect = cloneContainer.getBoundingClientRect();
                cloneContainer.style.left = (cloneContainerRect.x + vector.dx) + 'px';
                cloneContainer.style.top = (cloneContainerRect.y + vector.dy) + 'px';
            },
            selectClosestTarget: function (targets) {
                let closestTarget, distance, minDistance;
                const mouse = this.mouse;
                for (const target of targets) {
                    const rect = target.getBoundingClientRect();
                    distance = Math.hypot(mouse.x - rect.x, mouse.y - rect.y);
                    if (!minDistance) {
                        minDistance = distance;
                        closestTarget = target;
                    } else if (distance < minDistance) {
                        minDistance = distance;
                        closestTarget = target;
                    }
                }
                return closestTarget;
            },
            handleContact: function (cloneContainer) {
                const corners = util.getCorners(cloneContainer);
                const targets = this.detectTargets(corners);
                const activeTarget = document.querySelector('.active');
                let newActiveTarget;
                if (targets.length === 1) {
                    newActiveTarget = targets[0];
                } else if (targets.length) {
                    newActiveTarget = this.selectClosestTarget(targets);
                }
                if (activeTarget && newActiveTarget && newActiveTarget !== activeTarget) {
                    activeTarget.classList.remove('active');
                    newActiveTarget.classList.add('active');
                } else if (!activeTarget && newActiveTarget) {
                    newActiveTarget.classList.add('active');
                    cloneContainer.classList.add('over');
                } else if (activeTarget && !newActiveTarget) {
                    activeTarget.classList.remove('active');
                    cloneContainer.classList.remove('over');
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
            resetDraggedCards: function (isDrop) {
                Array.from(document.getElementsByClassName('dragged'))
                    .forEach(card => {
                        if (isDrop) {
                            card.style.zIndex = '1';
                        }
                        card.classList.remove('dragged');
                    })
            },
            resetTargets: function () {
                Array.from(document.querySelectorAll('.target'))
                    .forEach(target => {
                        target.classList.remove('target', 'active');
                        if (target.parentNode.classList.contains('column-wrapper')) {
                            target.nextElementSibling.classList.remove('empty');
                        }
                    })
            },
            dropCards: function (target) {
                document.querySelectorAll('.dragged')
                    .forEach(card => {
                        if (target.parentNode.classList.contains('column-wrapper')) {
                            target.nextElementSibling.appendChild(card);
                        } else {
                            target.parentNode.appendChild(card);
                        }
                    });
            },
            main: function () {
                this.disableMouseEvents();
                document.getElementById('clone-container').remove();
                const activeTargetCard = document.querySelector('.active');
                if (activeTargetCard) {
                    this.dropCards(activeTargetCard);
                }
                this.resetDraggedCards(Boolean(activeTargetCard));
                this.resetTargets();
            },
        }
    }
};