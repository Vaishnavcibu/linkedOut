/* public/js/main.js */

document.addEventListener('DOMContentLoaded', () => {

    // --- Mobile Navigation (Hamburger Menu) ---
    // First, let's add a hamburger menu button to the header for mobile screens.
    // We will create it with JS to keep the HTML clean.
    const navbar = document.querySelector('.navbar');
    const navLinks = document.querySelector('.nav-links');

    if (navbar && navLinks) {
        const hamburger = document.createElement('button');
        hamburger.innerHTML = '<span></span><span></span><span></span>'; // The 3 lines of the icon
        hamburger.classList.add('hamburger-menu');
        navbar.appendChild(hamburger);

        // Add a class to nav-links for styling
        navLinks.classList.add('mobile-nav-links');

        hamburger.addEventListener('click', () => {
            // Toggle active class on both hamburger and nav links
            hamburger.classList.toggle('active');
            navLinks.classList.toggle('active');
        });

        // Add CSS for the hamburger menu dynamically
        const style = document.createElement('style');
        style.textContent = `
            .hamburger-menu {
                display: none; /* Hidden by default */
                background: none;
                border: none;
                cursor: pointer;
                padding: 0;
                z-index: 1010;
            }
            .hamburger-menu span {
                display: block;
                width: 25px;
                height: 3px;
                background-color: var(--text-color);
                margin: 5px 0;
                transition: all 0.3s ease;
            }
            .hamburger-menu.active span:nth-child(1) {
                transform: translateY(8px) rotate(45deg);
            }
            .hamburger-menu.active span:nth-child(2) {
                opacity: 0;
            }
            .hamburger-menu.active span:nth-child(3) {
                transform: translateY(-8px) rotate(-45deg);
            }

            @media (max-width: 768px) {
                .hamburger-menu {
                    display: block;
                }
                .nav-links {
                    display: none; /* Hide original nav links */
                }
                .mobile-nav-links {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100vh;
                    background: var(--background-color);
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    transform: translateX(100%);
                    transition: transform 0.3s ease-in-out;
                }
                .mobile-nav-links.active {
                    transform: translateX(0);
                }
            }
        `;
        document.head.appendChild(style);
    }


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