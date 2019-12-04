export const util = {
    shuffle: function (array) {
        for (let i = array.length - 1; i > 0; i--) {
            let j = Math.floor(Math.random() * (i + 1)); // random index from 0 to i
            [array[i], array[j]] = [array[j], array[i]];
        }
    },
    flipCard: function(flippedDeck, flippedCard) {
        flippedCard.classList.replace('unflipped', 'flipped');
        flippedDeck.appendChild(flippedCard);
    },
    getCorners: function (elem) {
        const rect = elem.getBoundingClientRect();
        return [
            {x: rect.x, y: rect.y},
            {x: rect.x, y: rect.y + rect.height},
            {x: rect.x + rect.width, y: rect.y},
            {x: rect.x + rect.width, y: rect.y + rect.height}
        ];
    }
};