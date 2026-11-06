(() => {
    "use strict";

    const $ = (s, c = document) => c.querySelector(s);
    const $$ = (s, c = document) => [...c.querySelectorAll(s)];
    const root = document.documentElement;
    const body = document.body;
    const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const canHover = matchMedia("(hover: hover) and (pointer: fine)").matches;

    // 1. THEME
    const themeToggle = $("#themeToggle");
    const themeColor = $('meta[name="theme-color"]');
    let themeTimer;

    function setTheme(theme, animate) {
        if (animate) {
            root.classList.add("theme-anim");
            clearTimeout(themeTimer);
            themeTimer = setTimeout(() => root.classList.remove("theme-anim"), 450);
        }
        root.dataset.theme = theme;
        if (themeToggle) {
            themeToggle.setAttribute("aria-label", theme === "light" ? "Switch to dark theme" : "Switch to light theme");
            themeToggle.innerHTML = theme === "light" ? '<i class="fa-solid fa-moon"></i>' : '<i class="fa-solid fa-sun"></i>';
        }
        if (themeColor) themeColor.content = theme === "light" ? "#f7f7f5" : "#0b0c10";
        try { localStorage.setItem("portfolio_theme", theme); } catch (e) { }
    }

    let savedTheme = "light";
    try { savedTheme = localStorage.getItem("portfolio_theme") || "light"; } catch (e) { }
    setTheme(savedTheme, false);
    themeToggle?.addEventListener("click", () => setTheme(root.dataset.theme === "light" ? "dark" : "light", true));

    // 2. MOBILE NAV
    const menuToggle = $("#menuToggle");
    const nav = $("#siteNav");

    function closeMenu() {
        nav?.classList.remove("open");
        menuToggle?.setAttribute("aria-expanded", "false");
        menuToggle?.setAttribute("aria-label", "Open menu");
    }

    menuToggle?.addEventListener("click", () => {
        const open = !nav.classList.contains("open");
        nav.classList.toggle("open", open);
        menuToggle.setAttribute("aria-expanded", String(open));
        menuToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });

    document.addEventListener("click", e => {
        if (nav?.classList.contains("open") && !nav.contains(e.target) && !menuToggle?.contains(e.target)) closeMenu();
    });
    addEventListener("resize", () => { if (innerWidth > 760) closeMenu(); }, { passive: true });

    // 3. PRELOADER (real counter, hero starts after it)
    const preloader = $("#preloader");
    const loaderNumber = $("#loaderNum");
    const loaderBar = $("#loaderBar");
    let pageLoaded = false, shown = 0, started = false;

    function startSite() {
        if (started) return;
        started = true;
        body.classList.add("loaded");
        root.classList.remove("loading");
        preloader?.classList.add("done");
        initReveal();
    }

    (function loop() {
        shown += ((pageLoaded ? 100 : 88) - shown) * 0.09;
        if (pageLoaded && shown > 99.4) shown = 100;
        if (loaderNumber) loaderNumber.textContent = Math.round(shown);
        if (loaderBar) loaderBar.style.transform = `scaleX(${shown / 100})`;
        if (shown < 100) requestAnimationFrame(loop);
        else setTimeout(startSite, reduceMotion ? 0 : 250);
    })();

    if (document.readyState === "complete") pageLoaded = true;
    else addEventListener("load", () => (pageLoaded = true), { once: true });
    setTimeout(() => (pageLoaded = true), 4000);

    // 4. SCROLL PROGRESS + HEADER (rAF throttled)
    const progressBar = $("#progressBar");
    const header = $(".site-header");
    let ticking = false;

    function updateScroll() {
        ticking = false;
        const max = root.scrollHeight - innerHeight;
        const p = max > 0 ? scrollY / max : 0;
        if (progressBar) progressBar.style.transform = `scaleX(${Math.min(1, p)})`;
        header?.classList.toggle("scrolled", scrollY > 30);
    }

    addEventListener("scroll", () => {
        if (!ticking) { ticking = true; requestAnimationFrame(updateScroll); }
    }, { passive: true });
    updateScroll();

    // 5. SCROLL REVEAL (staggered per batch)
    function initReveal() {
        const items = $$(".reveal");
        if (!("IntersectionObserver" in window) || reduceMotion) {
            items.forEach(i => i.classList.add("in"));
            return;
        }
        const io = new IntersectionObserver((entries, o) => {
            entries.filter(e => e.isIntersecting).forEach((e, i) => {
                e.target.style.setProperty("--d", `${i * 0.09}s`);
                e.target.classList.add("in");
                o.unobserve(e.target);
                setTimeout(() => e.target.style.setProperty("--d", "0s"), 1500);
            });
        }, { threshold: 0.12, rootMargin: "0px 0px -35px 0px" });
        items.forEach(i => io.observe(i));
    }

    // 6. ROTATING HERO TEXT
    const roleText = $("#roleText");
    const roles = ["Python development", "web experiences", "AI / ML foundations", "creative problem solving"];
    let roleIndex = 0;
    if (roleText && !reduceMotion) {
        setInterval(() => {
            roleText.classList.add("swap");
            setTimeout(() => {
                roleIndex = (roleIndex + 1) % roles.length;
                roleText.textContent = roles[roleIndex];
                roleText.classList.remove("swap");
            }, 250);
        }, 2700);
    }

    // 7. DOORS
    const doorScenes = $$(".door-scene");

    function closeAllDoors() {
        doorScenes.forEach(scene => {
            scene.classList.remove("is-open");
            $(".door-leaf", scene)?.setAttribute("aria-expanded", "false");
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

    document.addEventListener("click", e => {
        if (!e.target.closest(".door-scene")) closeAllDoors();
    });

    // 8. CERTIFICATE FILTERS
    const filterButtons = $$(".chip[data-filter]");
    const certificateCards = $$(".certificate-card[data-cat]");

    filterButtons.forEach(button => {
        button.setAttribute("aria-pressed", String(button.classList.contains("active")));
        button.addEventListener("click", () => {
            const filter = button.dataset.filter;
            filterButtons.forEach(b => {
                b.classList.toggle("active", b === button);
                b.setAttribute("aria-pressed", String(b === button));
            });
            certificateCards.forEach(card => {
                const visible = filter === "all" || card.dataset.cat === filter;
                card.hidden = !visible;
                if (visible) {
                    card.classList.add("in");
                    card.classList.remove("pop");
                    void card.offsetWidth;
                    card.classList.add("pop");
                }
            });
        });
    });

    // 9. CERTIFICATE LIGHT EFFECT
    if (canHover) {
        certificateCards.forEach(card => {
            card.addEventListener("pointermove", e => {
                const r = card.getBoundingClientRect();
                card.style.setProperty("--mx", `${e.clientX - r.left}px`);
                card.style.setProperty("--my", `${e.clientY - r.top}px`);
            });
        });
    }

    // 10. JOURNEY YEAR (mid-screen line)
    const yearDisplay = $("#journeyYear");
    if (yearDisplay && "IntersectionObserver" in window) {
        const yo = new IntersectionObserver(entries => {
            entries.forEach(e => {
                if (e.isIntersecting && yearDisplay.textContent !== e.target.dataset.year) {
                    yearDisplay.classList.add("swap");
                    setTimeout(() => {
                        yearDisplay.textContent = e.target.dataset.year;
                        yearDisplay.classList.remove("swap");
                    }, 200);
                }
            });
        }, { rootMargin: "-45% 0px -45% 0px" });
        $$(".journey-item[data-year]").forEach(i => yo.observe(i));
    }

    // 11. SMOOTH 3D TILT (lerped, keeps base rotation)
    if (canHover && !reduceMotion) {
        $$(".tilt-card").forEach(card => {
            const base = parseFloat(card.dataset.rot || 0);
            let rx = 0, ry = 0, lift = 0, tx = 0, ty = 0, tl = 0, raf = 0;

            const draw = () => {
                rx += (tx - rx) * 0.12;
                ry += (ty - ry) * 0.12;
                lift += (tl - lift) * 0.12;
                card.style.transform = `perspective(900px) rotate(${base}deg) rotateX(${rx}deg) rotateY(${ry}deg) translateY(${lift}px)`;
                if (Math.abs(tx - rx) + Math.abs(ty - ry) + Math.abs(tl - lift) > 0.01) {
                    raf = requestAnimationFrame(draw);
                } else {
                    raf = 0;
                    if (!tl) { card.style.transform = ""; card.classList.remove("is-tilting"); }
                }
            };
            const go = () => { if (!raf) raf = requestAnimationFrame(draw); };

            card.addEventListener("pointermove", e => {
                const r = card.getBoundingClientRect();
                ty = ((e.clientX - r.left) / r.width - 0.5) * 5;
                tx = -((e.clientY - r.top) / r.height - 0.5) * 4;
                tl = -6;
                card.classList.add("is-tilting");
                go();
            });
            card.addEventListener("pointerleave", () => { tx = ty = tl = 0; go(); });
        });
    }

    // 12. MAGNETIC BUTTONS
    if (canHover && !reduceMotion) {
        $$(".magnetic").forEach(el => {
            el.addEventListener("pointermove", e => {
                const r = el.getBoundingClientRect();
                el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.12}px, ${(e.clientY - r.top - r.height / 2) * 0.18}px)`;
            });
            el.addEventListener("pointerleave", () => (el.style.transform = ""));
        });
    }

    // 13. CURSOR: dot + trailing ring + glow
    if (canHover && !reduceMotion) {
        const dot = $(".cursor-dot");
        const ring = $(".cursor-ring");
        const label = $(".cursor-label");
        const glow = $(".cursor-glow");

        if (dot && ring) {
            $$(".door-leaf").forEach(e => (e.dataset.cursor = "Open"));
            $$(".certificate-card").forEach(e => (e.dataset.cursor = "View"));

            let mx = innerWidth / 2, my = innerHeight / 2;
            let rx = mx, ry = my, gx = mx, gy = my, on = false;

            addEventListener("pointermove", e => {
                mx = e.clientX;
                my = e.clientY;
                if (!on) { on = true; rx = gx = mx; ry = gy = my; root.classList.add("custom-cursor"); }
                dot.classList.remove("out");
                ring.classList.remove("out");
            }, { passive: true });

            document.addEventListener("pointerover", e => {
                ring.classList.toggle("is-hover", !!e.target.closest("a, button, .chip, .tilt-card, .certificate-card"));
                const l = e.target.closest("[data-cursor]");
                if (label) label.textContent = l ? l.dataset.cursor : "";
            });
            document.addEventListener("pointerdown", () => ring.classList.add("is-down"));
            document.addEventListener("pointerup", () => ring.classList.remove("is-down"));
            root.addEventListener("pointerleave", () => { dot.classList.add("out"); ring.classList.add("out"); });

            (function frame() {
                rx += (mx - rx) * 0.17;
                ry += (my - ry) * 0.17;
                gx += (mx - gx) * 0.07;
                gy += (my - gy) * 0.07;
                dot.style.transform = `translate3d(${mx}px, ${my}px, 0)`;
                ring.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
                if (glow) glow.style.transform = `translate3d(${gx - 170}px, ${gy - 170}px, 0)`;
                requestAnimationFrame(frame);
            })();
        }
    }

    // 14. KEYBOARD
    addEventListener("keydown", e => {
        if (e.key === "Escape") { closeAllDoors(); closeMenu(); }
    });

    // 15. IMAGE FALLBACK
    const profileImage = $(".profile-image-wrap img");
    const showFallback = () => {
        profileImage.style.display = "none";
        profileImage.parentElement.classList.add("image-placeholder");
    };
    if (profileImage) {
        profileImage.addEventListener("error", showFallback);
        if (profileImage.complete && profileImage.naturalWidth === 0) showFallback();
    }

    // 16. EASED ANCHOR SCROLL + NAV SCROLLSPY
    let scrolling = false;

    function scrollToY(y) {
        const start = scrollY;
        const d = y - start;
        if (reduceMotion || Math.abs(d) < 2) { scrollTo(0, y); return; }
        const dur = Math.min(1400, Math.max(600, Math.abs(d) * 0.55));
        const ease = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
        const cancel = () => (scrolling = false);
        let t0 = null;
        scrolling = true;
        addEventListener("wheel", cancel, { once: true, passive: true });
        addEventListener("touchstart", cancel, { once: true, passive: true });
        (function step(t) {
            if (!scrolling) return;
            if (t0 === null) t0 = t;
            const p = Math.min(1, (t - t0) / dur);
            scrollTo(0, start + d * ease(p));
            if (p < 1) requestAnimationFrame(step);
            else scrolling = false;
        })(performance.now());
    }

    $$('a[href^="#"]').forEach(link => {
        link.addEventListener("click", e => {
            const id = link.getAttribute("href");
            if (!id || id === "#") return;
            const target = $(id);
            if (!target) return;
            e.preventDefault();
            closeMenu();
            const offset = (header?.offsetHeight || 80) - 8;
            scrollToY(id === "#home" ? 0 : target.getBoundingClientRect().top + scrollY - offset);
            history.replaceState(null, "", id);
        });
    });

    if ("IntersectionObserver" in window) {
        const spy = new IntersectionObserver(entries => {
            entries.forEach(e => {
                if (e.isIntersecting) {
                    $$("#siteNav a").forEach(a => a.classList.toggle("active", a.getAttribute("href") === "#" + e.target.id));
                }
            });
        }, { rootMargin: "-45% 0px -50% 0px" });
        $$("main section[id]").forEach(s => spy.observe(s));
    }
})();