/* public/js/main.js (Final Corrected Version) */
document.addEventListener('DOMContentLoaded', async () => {

    // --- Core DOM Elements for Navigation ---
    const navbar = document.querySelector('.navbar');
    const navLinksContainer = navbar ? navbar.querySelector('.nav-links') : null;
    const navButtonsContainer = navbar ? navbar.querySelector('.nav-buttons') : null;

    // --- 1. DYNAMIC NAVIGATION & AUTHENTICATION CHECK ---
    try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
            const { user } = await response.json();
            // User is logged in
            renderAuthenticatedNav(user);
        } else {
            // User is not logged in
            renderGuestNav();
        }
    } catch (error) {
        // This catches network errors if the server is down
        console.error('Authentication check failed:', error);
        renderGuestNav();
    }

    /**
     * Renders the navigation bar for a logged-in user based on their role.
     * @param {object} user The authenticated user object.
     */
    function renderAuthenticatedNav(user) {
        if (!navLinksContainer || !navButtonsContainer) return;

        let links = '';
        if (user.userType === 'recruiter') {
            // Navigation for Company Recruiters
            links = `
                <li><a href="/company-dashboard">Dashboard</a></li>
                <li><a href="/post-job">Post Job</a></li>
            `;
        } else {
            // Navigation for Students / Job Seekers
            links = `
                <li><a href="/feed">Feed</a></li>
                <li><a href="/applied-jobs">My Applications</a></li>
                <li><a href="/profile">Profile</a></li>
            `;
        }

        navLinksContainer.innerHTML = links;
        navButtonsContainer.innerHTML = `<button id="logout-btn" class="btn btn-login">Logout</button>`;

        // Add event listener to the dynamically created logout button
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', async () => {
                await fetch('/api/auth/logout', { method: 'POST' });
                window.location.href = '/'; // Redirect to homepage on logout
            });
        }
    }

    /**
     * Renders the navigation bar for a guest (not logged-in) user.
     */
    function renderGuestNav() {
        if (!navLinksContainer || !navButtonsContainer) return;

        const links = `
            <li><a href="/">Home</a></li>
            <li><a href="/#features">Features</a></li>
            <li><a href="/#faq">FAQ</a></li>
        `;

        navLinksContainer.innerHTML = links;
        navButtonsContainer.innerHTML = `
            <a href="/login" class="btn btn-login">Login</a>
            <a href="/register" class="btn btn-register">Register</a>
        `;
    }
    

    // --- 2. MOBILE NAVIGATION (HAMBURGER MENU) ---
    if (navbar && navLinksContainer) {
        const hamburger = document.createElement('button');
        hamburger.innerHTML = '<span></span><span></span><span></span>';
        hamburger.classList.add('hamburger-menu');
        navbar.appendChild(hamburger);

        navLinksContainer.classList.add('mobile-nav-links'); // Add class for mobile styling

        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navLinksContainer.classList.toggle('active');
        });

        // Inject the CSS for the hamburger menu dynamically
        const style = document.createElement('style');
        style.textContent = `
            .hamburger-menu { display: none; background: none; border: none; cursor: pointer; padding: 0; z-index: 1010; }
            .hamburger-menu span { display: block; width: 25px; height: 3px; background-color: var(--text-color); margin: 5px 0; transition: all 0.3s ease-in-out; }
            .hamburger-menu.active span:nth-child(1) { transform: translateY(8px) rotate(45deg); }
            .hamburger-menu.active span:nth-child(2) { opacity: 0; }
            .hamburger-menu.active span:nth-child(3) { transform: translateY(-8px) rotate(-45deg); }

            @media (max-width: 768px) {
                .hamburger-menu { display: block; }
                .nav-links { display: none; }
                .mobile-nav-links {
                    position: fixed; top: 0; left: 0; width: 100%; height: 100vh;
                    background: var(--background-color);
                    display: flex; flex-direction: column; justify-content: center; align-items: center;
                    transform: translateX(100%); transition: transform 0.3s ease-in-out;
                    padding: 0;
                }
                .mobile-nav-links.active { transform: translateX(0); }
            }
        `;
        document.head.appendChild(style);
    }


    // --- 3. FAQ ACCORDION FUNCTIONALITY ---
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        if (question) {
            question.addEventListener('click', () => {
                const wasActive = item.classList.contains('active');
                // Close all other items for a classic accordion feel
                faqItems.forEach(i => i.classList.remove('active'));
                // If it wasn't already active, open it
                if (!wasActive) {
                    item.classList.add('active');
                }
            });
        }
    });
});