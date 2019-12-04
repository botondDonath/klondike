export const util = {
    shuffle: function (array) {
        for (let i = array.length - 1; i > 0; i--) {
            let j = Math.floor(Math.random() * (i + 1)); // random index from 0 to i
            [array[i], array[j]] = [array[j], array[i]];
        }
    },
    createCardHeader: function(card) {
        let suit = card.dataset.suit;
        let rank = card.dataset.rank;
        const cardHeader = document.createElement('DIV');
        cardHeader.classList.add('card-header');
        cardHeader.textContent = `${suit} ${rank}`;
        card.appendChild(cardHeader);
    },
    flipCard: function(flippedDeck, flippedCard) {
        flippedCard.remove();
        flippedCard.classList.remove('unflipped');
        flippedCard.classList.add('flipped');
        flippedDeck.appendChild(flippedCard);
}

};