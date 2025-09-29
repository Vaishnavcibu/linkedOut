/* public/js/swipe.js (Corrected Version 2) */

document.addEventListener('DOMContentLoaded', () => {
    if (typeof Hammer === 'undefined') {
        console.error('Hammer.js is not loaded. Make sure to include it before this script.');
        return;
    }

    const deck = document.querySelector('.swipe-deck');
    const acceptBtn = document.getElementById('accept');
    const rejectBtn = document.getElementById('reject');

    let currentCards = Array.from(deck.querySelectorAll('.swipe-card'));

    function initializeCards() {
        currentCards.forEach((card, index) => {
            // --- THIS IS THE CORRECTED LINE ---
            // This ensures the last card in the HTML gets the highest z-index, putting it on top.
            card.style.zIndex = index; 
            
            card.setAttribute('tabindex', '-1');
            
            const hammer = new Hammer(card);
            hammer.on('pan', (event) => onPan(event.target, event)); // Use event.target to be safe
            hammer.on('panend', (event) => onPanEnd(event.target, event));
        });
        updateUiStack();
    }
    
    function onPan(card, event) {
        if (!card.classList.contains('is-active')) return;
        card.classList.add('dragging');
        const rotationStrength = Math.min(event.deltaX / 10, 20);
        card.style.transform = `translateX(${event.deltaX}px) rotate(${rotationStrength}deg)`;
    }

    function onPanEnd(card, event) {
        if (!card.classList.contains('is-active')) return;
        card.classList.remove('dragging');
        const swipeThreshold = 120;

        if (Math.abs(event.deltaX) > swipeThreshold) {
            const direction = event.deltaX > 0 ? 'right' : 'left';
            swipeCard(card, direction);
        } else {
            card.style.transform = '';
        }
    }

    function swipeCard(card, direction) {
        if (!card || !currentCards.includes(card)) return;

        const endX = direction === 'right' ? window.innerWidth : -window.innerWidth;
        const rotation = direction === 'right' ? 30 : -30;
        card.style.transform = `translateX(${endX}px) rotate(${rotation}deg)`;
        card.style.opacity = '0';

        currentCards = currentCards.filter(c => c !== card);
        
        setTimeout(() => card.remove(), 400);

        const jobId = card.id;
        console.log(`User swiped ${direction} on job: ${jobId}`);
        
        updateUiStack();

        if (currentCards.length === 0) {
            setTimeout(() => {
                deck.innerHTML = '<p class="no-more-cards">No more opportunities for now. Check back later!</p>';
            }, 500);
        }
    }
    
    function updateUiStack() {
        // Now that z-index is correct, this logic will work as intended.
        // It finds the last card in the array, which is also visually on top.
        currentCards.forEach((card, index) => {
            card.classList.remove('is-active');

            if (index === currentCards.length - 1) { // Top card
                card.style.transform = 'scale(1) translateY(0)';
                card.classList.add('is-active');
            } else if (index === currentCards.length - 2) { // Card below top
                card.style.transform = 'scale(0.95) translateY(-20px)';
            } else { // All other cards
                 card.style.transform = 'scale(0.9) translateY(-40px)';
            }
        });
    }

    acceptBtn.addEventListener('click', () => {
        const topCard = currentCards[currentCards.length - 1];
        if (topCard) swipeCard(topCard, 'right');
    });

    rejectBtn.addEventListener('click', () => {
        const topCard = currentCards[currentCards.length - 1];
        if (topCard) swipeCard(topCard, 'left');
    });

    if (currentCards.length > 0) {
        initializeCards();
    } else {
        deck.innerHTML = '<p class="no-more-cards">No opportunities found.</p>';
    }
});