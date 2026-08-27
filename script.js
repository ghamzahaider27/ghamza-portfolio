// ========================================
// GHAMZA HAIDER - PORTFOLIO JAVASCRIPT
// ========================================

document.addEventListener("DOMContentLoaded", () => {

    // ========================================
    // 1. SMOOTH SCROLLING
    // ========================================

    const navigationLinks = document.querySelectorAll('a[href^="#"]');

    navigationLinks.forEach(link => {

        link.addEventListener("click", function (event) {

            const targetId = this.getAttribute("href");

            if (!targetId || targetId === "#") {
                return;
            }

            const targetSection = document.querySelector(targetId);

            if (!targetSection) {
                return;
            }

            event.preventDefault();

            targetSection.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

        });

    });


    // ========================================
    // 2. ACTIVE NAVIGATION
    // ========================================

    const sections = document.querySelectorAll("main section[id]");
    const navLinks = document.querySelectorAll(".nav-links a");

    function updateActiveNavigation() {

        let currentSection = "";

        sections.forEach(section => {

            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;

            if (window.scrollY >= sectionTop - 200) {
                currentSection = section.getAttribute("id");
            }

        });

        navLinks.forEach(link => {

            link.classList.remove("active");

            if (link.getAttribute("href") === `#${currentSection}`) {
                link.classList.add("active");
            }

        });

    }

    window.addEventListener("scroll", updateActiveNavigation);

    updateActiveNavigation();


    // ========================================
    // 3. SCROLL REVEAL
    // ========================================

    const revealElements = document.querySelectorAll(
        ".section-heading, .about-layout, .skill-card, .project-card, .project-featured, .journey-item, .service-card, .contact-wrapper"
    );

    revealElements.forEach(element => {
        element.classList.add("reveal");
    });

    const revealObserver = new IntersectionObserver(
        (entries) => {

            entries.forEach(entry => {

                if (entry.isIntersecting) {

                    entry.target.classList.add("visible");

                    revealObserver.unobserve(entry.target);

                }

            });

        },
        {
            threshold: 0.15
        }
    );

    revealElements.forEach(element => {
        revealObserver.observe(element);
    });


    // ========================================
    // 4. HEADER SCROLL EFFECT
    // ========================================

    const header = document.querySelector(".site-header");

    function handleHeaderScroll() {

        if (!header) {
            return;
        }

        if (window.scrollY > 50) {
            header.classList.add("scrolled");
        } else {
            header.classList.remove("scrolled");
        }

    }

    window.addEventListener("scroll", handleHeaderScroll);

    handleHeaderScroll();


    // ========================================
    // 5. PROJECT CARD INTERACTION
    // ========================================

    const projectCards = document.querySelectorAll(".project-card");

    projectCards.forEach(card => {

        card.addEventListener("mousemove", event => {

            const rect = card.getBoundingClientRect();

            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = ((y - centerY) / centerY) * -3;
            const rotateY = ((x - centerX) / centerX) * 3;

            card.style.transform =
                `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-5px)`;

        });

        card.addEventListener("mouseleave", () => {

            card.style.transform =
                "perspective(800px) rotateX(0) rotateY(0) translateY(0)";

        });

    });


    // ========================================
// 6. CONTACT FORM - GOOGLE SHEETS
// ========================================

const CONTACT_FORM_URL =
    "https://script.google.com/macros/s/AKfycbwhK1G6Y7sZdJ60KkgBgRiGjflm6aLGiDeYpLEMNdOddpxv_tVX_undAUBKV7BKOWur/exec";

const contactForm = document.querySelector(".contact-form");

if (contactForm) {

    const submitButton =
        contactForm.querySelector('button[type="submit"]');

    contactForm.addEventListener("submit", async function (event) {

        // Stop the browser from reloading or changing the URL
        event.preventDefault();
        event.stopPropagation();

        const nameInput = contactForm.querySelector("#name");
        const emailInput = contactForm.querySelector("#email");
        const messageInput = contactForm.querySelector("#message");

        const name = nameInput ? nameInput.value.trim() : "";
        const email = emailInput ? emailInput.value.trim() : "";
        const message = messageInput ? messageInput.value.trim() : "";

        // Confirm that the Apps Script URL was added correctly
        const validEndpoint =
            CONTACT_FORM_URL.startsWith(
                "https://script.google.com/macros/s/"
            ) &&
            CONTACT_FORM_URL.endsWith("/exec");

        if (!validEndpoint) {

            showFormMessage(
                "The contact form endpoint has not been configured correctly.",
                "error"
            );

            return;
        }

        // Required-field validation
        if (!name || !email || !message) {

            showFormMessage(
                "Please fill in all fields.",
                "error"
            );

            return;
        }

        // Match the validation used by Apps Script
        if (name.length > 100) {

            showFormMessage(
                "Please enter a shorter name.",
                "error"
            );

            return;
        }

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailPattern.test(email) || email.length > 254) {

            showFormMessage(
                "Please enter a valid email address.",
                "error"
            );

            return;
        }

        if (message.length < 10) {

            showFormMessage(
                "Your message must contain at least 10 characters.",
                "error"
            );

            return;
        }

        if (message.length > 5000) {

            showFormMessage(
                "Your message is too long.",
                "error"
            );

            return;
        }

        // Remember the button's original content
        const originalButtonContent =
            submitButton ? submitButton.innerHTML : "";

        if (submitButton) {

            submitButton.disabled = true;
            submitButton.setAttribute("aria-busy", "true");
            submitButton.textContent = "SENDING...";

        }

        showFormMessage(
            "Sending your message...",
            "pending"
        );

        // Send URL-encoded form data to Apps Script
        const payload = new URLSearchParams();

        payload.append("name", name);
        payload.append("email", email);
        payload.append("message", message);

        // Empty honeypot value for the bot check in Apps Script
        payload.append("website", "");

        try {

            await fetch(CONTACT_FORM_URL, {

                method: "POST",

                // Required for the cross-origin Apps Script request
                mode: "no-cors",

                body: payload

            });

            showFormMessage(
                `Thanks, ${name}! Your message has been submitted.`,
                "success"
            );

            contactForm.reset();

        } catch (error) {

            console.error(
                "Contact form submission failed:",
                error
            );

            showFormMessage(
                "Sorry, your message could not be sent. Please try again.",
                "error"
            );

        } finally {

            if (submitButton) {

                submitButton.disabled = false;
                submitButton.removeAttribute("aria-busy");
                submitButton.innerHTML = originalButtonContent;

            }

        }

    });

}

// ========================================
// CONTACT FORM MESSAGE
// ========================================

function showFormMessage(message, type) {

    let statusMessage = document.querySelector("#form-status");

    if (!statusMessage) {

        statusMessage = document.createElement("p");

        statusMessage.id = "form-status";

        contactForm.appendChild(statusMessage);
    }

    statusMessage.textContent = message;

    statusMessage.className = "";

    statusMessage.classList.add(`form-${type}`);

}

});



// ========================================
// 7. MOBILE NAVIGATION
// ========================================

const navbar = document.querySelector(".navbar");
const navLinksContainer = document.querySelector(".nav-links");

if (navbar && navLinksContainer) {

    // Create mobile menu button
    const menuButton = document.createElement("button");

    menuButton.className = "menu-toggle";
    menuButton.setAttribute("aria-label", "Toggle navigation");
    menuButton.innerHTML = "☰";

    navbar.insertBefore(menuButton, navLinksContainer);

    // Open / close menu
    menuButton.addEventListener("click", () => {

        navLinksContainer.classList.toggle("mobile-open");

        menuButton.classList.toggle("menu-active");

        if (navLinksContainer.classList.contains("mobile-open")) {
            menuButton.innerHTML = "✕";
        } else {
            menuButton.innerHTML = "☰";
        }

    });

    // Close menu after clicking a navigation link
    navLinksContainer.querySelectorAll("a").forEach(link => {

        link.addEventListener("click", () => {

            navLinksContainer.classList.remove("mobile-open");
            menuButton.classList.remove("menu-active");

            menuButton.innerHTML = "☰";

        });

    });

}

























