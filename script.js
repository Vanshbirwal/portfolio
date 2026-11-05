(() => {
    "use strict";

    const $ = (selector, context = document) =>
        context.querySelector(selector);

    const $$ = (selector, context = document) =>
        [...context.querySelectorAll(selector)];

    const root = document.documentElement;
    const body = document.body;

    const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;

    const canHover = window.matchMedia(
        "(hover: hover) and (pointer: fine)"
    ).matches;


    // ==========================================
    // 1. LIGHT / DARK THEME
    // ==========================================

    const themeToggle = $("#themeToggle");
    const themeColor = $('meta[name="theme-color"]');

    function setTheme(theme) {
        root.dataset.theme = theme;

        if (themeToggle) {
            themeToggle.setAttribute(
                "aria-label",
                theme === "light"
                    ? "Switch to dark theme"
                    : "Switch to light theme"
            );

            themeToggle.innerHTML =
                theme === "light"
                    ? '<i class="fa-solid fa-moon"></i>'
                    : '<i class="fa-solid fa-sun"></i>';
        }

        if (themeColor) {
            themeColor.content =
                theme === "light" ? "#f7f7f5" : "#0b0c10";
        }

        try {
            localStorage.setItem("portfolio_theme", theme);
        } catch (error) {
            // Theme still works if storage is unavailable.
        }
    }

    let savedTheme = "light";

    try {
        savedTheme =
            localStorage.getItem("portfolio_theme") || "light";
    } catch (error) { }

    setTheme(savedTheme);

    themeToggle?.addEventListener("click", () => {
        const nextTheme =
            root.dataset.theme === "light" ? "dark" : "light";

        setTheme(nextTheme);
    });


    // ==========================================
    // 2. MOBILE NAVIGATION
    // ==========================================

    const menuToggle = $("#menuToggle");
    const nav = $("#siteNav");

    function closeMenu() {
        nav?.classList.remove("open");
        menuToggle?.setAttribute("aria-expanded", "false");
        menuToggle?.setAttribute("aria-label", "Open menu");
    }

    menuToggle?.addEventListener("click", () => {
        const isOpen = !nav.classList.contains("open");

        nav.classList.toggle("open", isOpen);

        menuToggle.setAttribute(
            "aria-expanded",
            String(isOpen)
        );

        menuToggle.setAttribute(
            "aria-label",
            isOpen ? "Close menu" : "Open menu"
        );
    });

    $$("#siteNav a").forEach(link => {
        link.addEventListener("click", closeMenu);
    });

    document.addEventListener("click", event => {
        if (
            nav?.classList.contains("open") &&
            !nav.contains(event.target) &&
            !menuToggle?.contains(event.target)
        ) {
            closeMenu();
        }
    });


    // ==========================================
    // 3. PRELOADER
    // ==========================================

    const preloader = $("#preloader");
    const loaderNumber = $("#loaderNum");
    const loaderBar = $("#loaderBar");

    let loaderDone = false;

    function finishLoader() {
        if (loaderDone) return;

        loaderDone = true;

        if (loaderNumber) loaderNumber.textContent = "100";
        if (loaderBar) loaderBar.style.transform = "scaleX(1)";

        body.classList.add("loaded");

        window.setTimeout(() => {
            preloader?.classList.add("done");
        }, reduceMotion ? 0 : 350);
    }

    if (document.readyState === "complete") {
        finishLoader();
    } else {
        window.addEventListener("load", finishLoader, {
            once: true
        });
    }

    window.setTimeout(finishLoader, 1800);


    // ==========================================
    // 4. SCROLL PROGRESS + HEADER
    // ==========================================

    const progressBar = $("#progressBar");
    const header = $(".site-header");

    function updateScroll() {
        const scrollHeight =
            document.documentElement.scrollHeight -
            window.innerHeight;

        const progress =
            scrollHeight > 0
                ? window.scrollY / scrollHeight
                : 0;

        if (progressBar) {
            progressBar.style.transform =
                `scaleX(${Math.min(1, progress)})`;
        }

        header?.classList.toggle(
            "scrolled",
            window.scrollY > 30
        );
    }

    window.addEventListener("scroll", updateScroll, {
        passive: true
    });

    updateScroll();


    // ==========================================
    // 5. SCROLL REVEAL
    // ==========================================

    const revealItems = $$(".reveal");

    if ("IntersectionObserver" in window && !reduceMotion) {
        const revealObserver = new IntersectionObserver(
            (entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("in");
                        observer.unobserve(entry.target);
                    }
                });
            },
            {
                threshold: 0.12,
                rootMargin: "0px 0px -35px 0px"
            }
        );

        revealItems.forEach((item, index) => {
            item.style.setProperty(
                "--d",
                `${Math.min(index % 4, 3) * 0.07}s`
            );

            revealObserver.observe(item);
        });
    } else {
        revealItems.forEach(item => item.classList.add("in"));
    }


    // ==========================================
    // 6. ROTATING HERO TEXT
    // ==========================================

    const roleText = $("#roleText");

    const roles = [
        "Python development",
        "web experiences",
        "AI / ML foundations",
        "creative problem solving"
    ];

    let roleIndex = 0;

    if (roleText && !reduceMotion) {
        window.setInterval(() => {
            roleText.classList.add("swap");

            window.setTimeout(() => {
                roleIndex = (roleIndex + 1) % roles.length;
                roleText.textContent = roles[roleIndex];
                roleText.classList.remove("swap");
            }, 250);

        }, 2700);
    }


    // ==========================================
    // 7. INTERACTIVE 3D DOORS
    // ==========================================

    const doorScenes = $$(".door-scene");

    function closeAllDoors() {
        doorScenes.forEach(scene => {
            scene.classList.remove("is-open");

            const button = $(".door-leaf", scene);

            button?.setAttribute("aria-expanded", "false");
        });
    }

    doorScenes.forEach(scene => {
        const door = $(".door-leaf", scene);

        door?.addEventListener("click", () => {
            const wasOpen = scene.classList.contains("is-open");

            closeAllDoors();

            if (!wasOpen) {
                scene.classList.add("is-open");
                door.setAttribute("aria-expanded", "true");
            }
        });
    });


    // ==========================================
    // 8. CERTIFICATE FILTERS
    // ==========================================

    const filterButtons = $$(".chip[data-filter]");
    const certificateCards = $$(".certificate-card[data-cat]");

    filterButtons.forEach(button => {
        button.addEventListener("click", () => {
            const filter = button.dataset.filter;

            filterButtons.forEach(item => {
                item.classList.toggle("active", item === button);
            });

            certificateCards.forEach(card => {
                const visible =
                    filter === "all" ||
                    card.dataset.cat === filter;

                card.hidden = !visible;

                if (visible) {
                    card.classList.add("in");
                }
            });
        });
    });


    // ==========================================
    // 9. CERTIFICATE CARD LIGHT EFFECT
    // ==========================================

    if (canHover) {
        certificateCards.forEach(card => {
            card.addEventListener("pointermove", event => {
                const rect = card.getBoundingClientRect();

                card.style.setProperty(
                    "--mx",
                    `${event.clientX - rect.left}px`
                );

                card.style.setProperty(
                    "--my",
                    `${event.clientY - rect.top}px`
                );
            });
        });
    }


    // ==========================================
    // 10. JOURNEY YEAR INDICATOR
    // ==========================================

    const yearDisplay = $("#journeyYear");
    const journeyItems = $$(".journey-item[data-year]");

    if (
        yearDisplay &&
        "IntersectionObserver" in window
    ) {
        const yearObserver = new IntersectionObserver(
            entries => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        yearDisplay.textContent =
                            entry.target.dataset.year;
                    }
                });
            },
            { threshold: 0.5 }
        );

        journeyItems.forEach(item => {
            yearObserver.observe(item);
        });
    }


    // ==========================================
    // 11. 3D PROJECT CARD TILT
    // ==========================================

    if (canHover && !reduceMotion) {
        $$(".tilt-card").forEach(card => {
            card.addEventListener("pointermove", event => {
                const rect = card.getBoundingClientRect();

                const x =
                    (event.clientX - rect.left) / rect.width - 0.5;

                const y =
                    (event.clientY - rect.top) / rect.height - 0.5;

                card.style.transform = `
          perspective(900px)
          rotateX(${-y * 4}deg)
          rotateY(${x * 5}deg)
          translateY(-3px)
        `;
            });

            card.addEventListener("pointerleave", () => {
                card.style.transform = "";
            });
        });
    }


    // ==========================================
    // 12. MAGNETIC BUTTONS
    // ==========================================

    if (canHover && !reduceMotion) {
        $$(".magnetic").forEach(element => {
            element.addEventListener("pointermove", event => {
                const rect = element.getBoundingClientRect();

                const x =
                    event.clientX - rect.left - rect.width / 2;

                const y =
                    event.clientY - rect.top - rect.height / 2;

                element.style.transform =
                    `translate(${x * 0.07}px, ${y * 0.1}px)`;
            });

            element.addEventListener("pointerleave", () => {
                element.style.transform = "";
            });
        });
    }


    // ==========================================
    // 13. CURSOR GLOW
    // ==========================================

    const cursorGlow = $(".cursor-glow");

    if (cursorGlow && canHover && !reduceMotion) {
        window.addEventListener("pointermove", event => {
            cursorGlow.style.transform =
                `translate3d(${event.clientX - 170}px, ${event.clientY - 170}px, 0)`;
        }, { passive: true });
    }


    // ==========================================
    // 14. KEYBOARD ACCESSIBILITY
    // ==========================================

    window.addEventListener("keydown", event => {
        if (event.key === "Escape") {
            closeAllDoors();
            closeMenu();
        }
    });


    // ==========================================
    // 15. IMAGE FALLBACK
    // ==========================================

    const profileImage = $(".profile-image-wrap img");

    profileImage?.addEventListener("error", () => {
        profileImage.style.display = "none";
        profileImage.parentElement.classList.add("image-placeholder");
    });


    // ==========================================
    // 16. SMOOTH INTERNAL NAVIGATION
    // ==========================================

    $$('a[href^="#"]').forEach(link => {
        link.addEventListener("click", event => {
            const targetId = link.getAttribute("href");

            if (!targetId || targetId === "#") return;

            const target = $(targetId);

            if (target) {
                event.preventDefault();

                target.scrollIntoView({
                    behavior: reduceMotion ? "auto" : "smooth",
                    block: "start"
                });

                closeMenu();
            }
        });
    });

})();