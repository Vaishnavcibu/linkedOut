/* public/js/swipe.js (Corrected and Dynamic) */

document.addEventListener('DOMContentLoaded', () => {
    if (typeof Hammer === 'undefined') {
        console.error('Hammer.js is not loaded. Make sure to include it before this script.');
        return;
    }

    const deck = document.querySelector('.swipe-deck');
    const acceptBtn = document.getElementById('accept');
    const rejectBtn = document.getElementById('reject');
    let currentCards = [];

    async function fetchAndInitializeCards() {
        try {
            const response = await fetch('/api/jobs/feed');
            if (!response.ok) {
                throw new Error('Failed to fetch jobs');
            }
            const jobs = await response.json();

            deck.innerHTML = ''; // Clear static cards

            if (jobs.length === 0) {
                deck.innerHTML = '<p class="no-more-cards">No more opportunities for now. Check back later!</p>';
                return;
            }

            jobs.forEach(job => {
                const card = document.createElement('div');
                card.className = 'swipe-card';
                card.id = job._id;
                card.innerHTML = `
                    <div class="card-content">
                        <h3 class="job-title">${job.title}</h3>
                        <p class="company-name">${job.company}</p>
                        <div class="job-details">
                            <p>📍 ${job.location}</p>
                            <p>🕒 ${job.jobType}</p>
                            ${job.salary && job.salary.details ? `<p>💰 ${job.salary.details}</p>` : ''}
                        </div>
                        <div class="job-skills">
                            ${job.skillsRequired.map(skill => `<span>${skill}</span>`).join('')}
                        </div>
                    </div>
                `;
                deck.appendChild(card);
            });

            initializeCardEventListeners();

        } catch (error) {
            console.error('Error fetching jobs:', error);
            deck.innerHTML = '<p class="no-more-cards">Could not load jobs. Please try again later.</p>';
        }
    }


    function initializeCardEventListeners() {
        currentCards = Array.from(deck.querySelectorAll('.swipe-card'));
        currentCards.forEach((card, index) => {
            // This ensures the last card in the HTML gets the highest z-index, putting it on top.
            card.style.zIndex = currentCards.length - index;

            const hammer = new Hammer(card);
            hammer.on('pan', (event) => onPan(event.target, event));
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

        const jobId = card.id;
        // Send swipe data to the backend
        fetch(`/api/jobs/swipe/${jobId}/${direction}`, { method: 'POST' })
            .then(res => res.json())
            .then(data => console.log(data.message))
            .catch(err => console.error('Swipe API error:', err));


        currentCards = currentCards.filter(c => c !== card);
        setTimeout(() => card.remove(), 400);

        updateUiStack();

        if (currentCards.length === 0) {
            setTimeout(() => {
                deck.innerHTML = '<p class="no-more-cards">No more opportunities for now. Check back later!</p>';
            }, 500);
        }
    }

    function updateUiStack() {
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

    // Initial load
    fetchAndInitializeCards();
});