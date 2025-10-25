/* public/js/main.js (Final Corrected Version) */
document.addEventListener('DOMContentLoaded', async () => {
    const navbar = document.querySelector('.navbar');
    const navLinksContainer = navbar.querySelector('.nav-links');
    const navButtonsContainer = navbar.querySelector('.nav-buttons');
    const mobileNavLinksContainer = document.querySelector('.mobile-nav-links');

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
        // Network error or server is down
        console.error('Auth check failed:', error);
        renderGuestNav();
    }

    function renderAuthenticatedNav(user) {
        let links = '';
        if (user.userType === 'recruiter') {
            links = `
                <li><a href="/company-dashboard">Dashboard</a></li>
                <li><a href="/post-job">Post Job</a></li>
            `;
        } else { // 'student'
            links = `
                <li><a href="/feed">Feed</a></li>
                <li><a href="/profile">Profile</a></li>
            `;
        }

        if (navLinksContainer) navLinksContainer.innerHTML = links;
        if (mobileNavLinksContainer) mobileNavLinksContainer.innerHTML = links;


        navButtonsContainer.innerHTML = `<button id="logout-btn" class="btn btn-login">Logout</button>`;
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', async () => {
                await fetch('/api/auth/logout', { method: 'POST' });
                window.location.href = '/';
            });
        }
    }

    function renderGuestNav() {
        const links = `
            <li><a href="/">Home</a></li>
            <li><a href="#features">Features</a></li>
            <li><a href="#faq">FAQ</a></li>
        `;
        if (navLinksContainer) navLinksContainer.innerHTML = links;
        if (mobileNavLinksContainer) mobileNavLinksContainer.innerHTML = links;


        navButtonsContainer.innerHTML = `
            <a href="/login" class="btn btn-login">Login</a>
            <a href="/register" class="btn btn-register">Register</a>
        `;
    }
    
    // Hamburger Menu Logic (remains the same)
    if (navbar && navLinksContainer) {
       // ... hamburger menu creation and styling injection code from before
    }
    
    // FAQ Logic (remains the same)
    // --- FAQ Accordion Functionality ---
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        if (question) {
            question.addEventListener('click', () => {
                // Check if the clicked item is already active
                const wasActive = item.classList.contains('active');

                // Optional: Close all other items for a classic accordion feel
                faqItems.forEach(i => i.classList.remove('active'));

                // If it wasn't active, open it
                if (!wasActive) {
                    item.classList.add('active');
                }
            });
        }
    });
});
