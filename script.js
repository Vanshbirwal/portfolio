/* Vansh Birwal Portfolio — interactions and animations */

(() => {
    const $ = (selector, context = document) =>
        context.querySelector(selector);

    const $$ = (selector, context = document) =>
        [...context.querySelectorAll(selector)];

    const root = document.documentElement;
    const body = document.body;

    const reduceMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
    ).matches;

    const canHover = window.matchMedia(
        '(hover: hover) and (pointer: fine)'
    ).matches;


    // ==========================================
    // 1. DARK / LIGHT THEME
    // ==========================================

    const themeToggle = $('#themeToggle');

    const setTheme = (theme) => {
        root.dataset.theme = theme;

        if (themeToggle) {
            themeToggle.setAttribute(
                'aria-label',
                `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`
            );
        }

        try {
            localStorage.setItem('portfolio_theme', theme);
        } catch (error) {
            // Theme still works if local storage is unavailable.
        }
    };

    let initialTheme = root.dataset.theme || 'dark';

    try {
        initialTheme =
            localStorage.getItem('portfolio_theme') || initialTheme;
    } catch (error) { }

    setTheme(initialTheme);

    themeToggle?.addEventListener('click', () => {
        const nextTheme =
            root.dataset.theme === 'dark' ? 'light' : 'dark';

        setTheme(nextTheme);
    });


    // ==========================================
    // 2. MOBILE NAVIGATION
    // ==========================================

    const menuToggle = $('#menuToggle');
    const nav = $('#siteNav');

    const closeMenu = () => {
        nav?.classList.remove('open');
        menuToggle?.setAttribute('aria-expanded', 'false');
    };

    menuToggle?.addEventListener('click', () => {
        const isOpen = !nav.classList.contains('open');

        nav.classList.toggle('open', isOpen);

        menuToggle.setAttribute(
            'aria-expanded',
            String(isOpen)
        );
    });

    $$('#siteNav a').forEach(link => {
        link.addEventListener('click', closeMenu);
    });


    // ==========================================
    // 3. PRELOADER
    // ==========================================

    const preloader = $('#preloader');
    const loaderNumber = $('#loaderNum');
    const loaderBar = $('#loaderBar');

    let loaderFinished = false;

    const finishLoader = () => {
        if (loaderFinished) return;

        loaderFinished = true;

        if (loaderNumber) {
            loaderNumber.textContent = '100';
        }

        if (loaderBar) {
            loaderBar.style.transform = 'scaleX(1)';
        }

        body.classList.add('loaded');

        window.setTimeout(() => {
            preloader?.classList.add('done');
        }, reduceMotion ? 0 : 350);
    };

    if (document.readyState === 'complete') {
        finishLoader();
    } else {
        window.addEventListener(
            'load',
            finishLoader,
            { once: true }
        );
    }

    // Safety fallback if the load event takes too long.
    window.setTimeout(finishLoader, 1800);


    // ==========================================
    // 4. SCROLL PROGRESS BAR
    // ==========================================

    const progressBar = $('#progressBar');
    const header = $('.site-header');

    const updateScroll = () => {
        const scrollableHeight =
            document.documentElement.scrollHeight -
            window.innerHeight;

        const progress =
            scrollableHeight > 0
                ? (window.scrollY / scrollableHeight) * 100
                : 0;

        if (progressBar) {
            progressBar.style.transform = `scaleX(${progress / 100})`;
        }

        header?.classList.toggle(
            'scrolled',
            window.scrollY > 30
        );
    };

    window.addEventListener(
        'scroll',
        updateScroll,
        { passive: true }
    );

    updateScroll();


    // ==========================================
    // 5. SCROLL REVEAL ANIMATIONS
    // ==========================================

    const revealItems = $$('.reveal, .h-in, .h-word');

    if (
        'IntersectionObserver' in window &&
        !reduceMotion
    ) {
        const revealObserver = new IntersectionObserver(
            (entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('in');
                        observer.unobserve(entry.target);
                    }
                });
            },
            {
                threshold: 0.12,
                rootMargin: '0px 0px -35px 0px'
            }
        );

        revealItems.forEach(element => {
            revealObserver.observe(element);
        });

    } else {
        revealItems.forEach(element => {
            element.classList.add('in');
        });
    }


    // ==========================================
    // 6. ROTATING HERO ROLE TEXT
    // ==========================================

    const roleText = $('#roleText');

    const roles = [
        'Python development',
        'web experiences',
        'AI / ML foundations',
        'creative problem solving'
    ];

    let roleIndex = 0;

    if (roleText && !reduceMotion) {
        window.setInterval(() => {
            roleText.classList.add('swap');

            window.setTimeout(() => {
                roleIndex = (roleIndex + 1) % roles.length;

                roleText.textContent = roles[roleIndex];

                roleText.classList.remove('swap');
            }, 250);

        }, 2600);
    }


    // ==========================================
    // 7. CERTIFICATE FILTERS
    // ==========================================

    const filterButtons = $$('.chip[data-filter]');

    const certificateCards = $$('.certificate-card[data-cat]');

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            const selectedFilter = button.dataset.filter;

            // Update active filter button.
            filterButtons.forEach(item => {
                item.classList.toggle(
                    'active',
                    item === button
                );
            });

            // Show matching certificates.
            certificateCards.forEach(card => {
                const shouldShow =
                    selectedFilter === 'all' ||
                    card.dataset.cat === selectedFilter;

                card.hidden = !shouldShow;

                if (shouldShow) {
                    card.classList.add('in');
                }
            });
        });
    });


    // ==========================================
    // 8. CERTIFICATE PDF PREVIEW
    // ==========================================

    const modal = $('#pdfModal');
    const pdfFrame = $('#pdfFrame');
    const pdfTitle = $('#pdfTitle');
    const downloadLink = $('#downloadLink');
    const closeButton = $('#pdfClose');

    let previouslyFocusedElement = null;

    const openPdf = (card) => {
        const pdfPath = card.dataset.pdf;

        if (!pdfPath || !modal || !pdfFrame) {
            return;
        }

        previouslyFocusedElement = document.activeElement;

        const certificateTitle =
            card.dataset.title ||
            card.querySelector('h3')?.textContent ||
            'Certificate';

        pdfTitle.textContent = certificateTitle;

        pdfFrame.src = pdfPath;

        downloadLink.href = pdfPath;

        modal.classList.add('is-open');

        modal.setAttribute('aria-hidden', 'false');

        body.classList.add('modal-open');

        closeButton?.focus();
    };

    const closePdf = () => {
        if (!modal?.classList.contains('is-open')) {
            return;
        }

        modal.classList.remove('is-open');

        modal.setAttribute('aria-hidden', 'true');

        body.classList.remove('modal-open');

        // Stop the PDF from loading after the modal closes.
        pdfFrame.src = '';

        previouslyFocusedElement?.focus();
    };

    certificateCards.forEach(card => {
        card.addEventListener('click', () => {
            openPdf(card);
        });
    });

    closeButton?.addEventListener('click', closePdf);

    // Close when clicking outside the PDF container.
    modal?.addEventListener('click', event => {
        if (event.target === modal) {
            closePdf();
        }
    });


    // ==========================================
    // 9. ESCAPE KEY SUPPORT
    // ==========================================

    window.addEventListener('keydown', event => {
        if (event.key === 'Escape') {
            closePdf();
            closeMenu();
        }
    });


    // ==========================================
    // 10. CURSOR GLOW
    // ==========================================

    const cursorGlow = $('.cursor-glow');

    const customCursor = $('.custom-cursor');

    if (canHover && !reduceMotion) {

        if (cursorGlow) {
            cursorGlow.style.opacity = '1';

            window.addEventListener(
                'pointermove',
                event => {
                    cursorGlow.style.transform =
                        `translate3d(${event.clientX - 170}px, ${event.clientY - 170}px, 0)`;
                },
                { passive: true }
            );
        }

        if (customCursor) {
            customCursor.style.opacity = '1';

            window.addEventListener(
                'pointermove',
                event => {
                    customCursor.style.left = `${event.clientX}px`;
                    customCursor.style.top = `${event.clientY}px`;
                },
                { passive: true }
            );

            $$('a, button').forEach(element => {
                element.addEventListener('pointerenter', () => {
                    customCursor.classList.add('active');
                });

                element.addEventListener('pointerleave', () => {
                    customCursor.classList.remove('active');
                });
            });
        }
    }


    // ==========================================
    // 11. 3D TILT EFFECT
    // ==========================================

    if (canHover && !reduceMotion) {
        $$('.tilt-card').forEach(card => {

            card.addEventListener('pointermove', event => {
                const rect = card.getBoundingClientRect();

                const x =
                    (event.clientX - rect.left) / rect.width - 0.5;

                const y =
                    (event.clientY - rect.top) / rect.height - 0.5;

                card.style.transform = `
                    perspective(900px)
                    rotateX(${-y * 5}deg)
                    rotateY(${x * 6}deg)
                    translateY(-3px)
                `;
            });

            card.addEventListener('pointerleave', () => {
                card.style.transform = '';
            });
        });
    }


    // ==========================================
    // 12. CERTIFICATE CARD LIGHT EFFECT
    // ==========================================

    if (canHover) {
        certificateCards.forEach(card => {
            card.addEventListener('pointermove', event => {
                const rect = card.getBoundingClientRect();

                const x = event.clientX - rect.left;
                const y = event.clientY - rect.top;

                card.style.setProperty('--mx', `${x}px`);
                card.style.setProperty('--my', `${y}px`);
            });
        });
    }


    // ==========================================
    // 13. JOURNEY YEAR INDICATOR
    // ==========================================

    const yearDisplay = $('#journeyYear');

    const journeyItems = $$('.journey-item[data-year]');

    if (
        yearDisplay &&
        'IntersectionObserver' in window
    ) {
        const yearObserver = new IntersectionObserver(
            entries => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        yearDisplay.textContent =
                            entry.target.dataset.year;

                        yearDisplay.classList.remove('pop');

                        // Restart the year animation.
                        void yearDisplay.offsetWidth;

                        yearDisplay.classList.add('pop');
                    }
                });
            },
            {
                threshold: 0.55
            }
        );

        journeyItems.forEach(item => {
            yearObserver.observe(item);
        });
    }


    // ==========================================
    // 14. SMOOTH MAGNETIC BUTTON HOVER
    // ==========================================

    if (canHover && !reduceMotion) {
        $$('.magnetic').forEach(element => {

            element.addEventListener('pointermove', event => {
                const rect = element.getBoundingClientRect();

                const x =
                    event.clientX - rect.left - rect.width / 2;

                const y =
                    event.clientY - rect.top - rect.height / 2;

                element.style.transform =
                    `translate(${x * 0.08}px, ${y * 0.12}px)`;
            });

            element.addEventListener('pointerleave', () => {
                element.style.transform = '';
            });
        });
    }

})();