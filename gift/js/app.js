/**
 * YUWASO — Front-end application logic.
 * Organized as small, focused modules (namespaced under `Yuwaso.*`) instead
 * of one flat script: Toast, Cart, Wishlist, Filters, Search, Modals, Nav,
 * and Reveal (scroll animation) each own their own state and DOM handles.
 */
(function () {
    'use strict';

    const Yuwaso = {};
    window.Yuwaso = Yuwaso;

    /* ---------------------------------------------------------------------
       Toast — shared notification popup
       --------------------------------------------------------------------- */
    Yuwaso.Toast = (function () {
        let timer = null;

        function show(message) {
            const toast = document.getElementById('toastMessage');
            const text = document.getElementById('toastText');
            if (!toast || !text) return;

            text.textContent = message;
            toast.classList.remove('translate-y-24', 'opacity-0');
            clearTimeout(timer);
            timer = setTimeout(() => {
                toast.classList.add('translate-y-24', 'opacity-0');
            }, 3000);
        }

        return { show };
    })();

    /* ---------------------------------------------------------------------
       Cart — item count + add-to-cart feedback
       --------------------------------------------------------------------- */
    Yuwaso.Cart = (function () {
        let count = 2;

        function badge() {
            return document.getElementById('cartCountBadge');
        }

        function add(itemName, price) {
            count += 1;
            const el = badge();
            if (el) el.textContent = String(count);
            Yuwaso.Toast.show(`Added "${itemName}" (₹${price}) to your cart!`);
        }

        function open() {
            Yuwaso.Toast.show(`Cart has ${count} item(s). Ready for checkout!`);
        }

        return { add, open, get count() { return count; } };
    })();

    /* ---------------------------------------------------------------------
       Wishlist — per-card heart toggle + running counter
       --------------------------------------------------------------------- */
    Yuwaso.Wishlist = (function () {
        let count = 0;

        function badge() {
            return document.getElementById('wishlistCount');
        }

        function toggleCard(btn, itemName) {
            const icon = btn.querySelector('i');
            if (!icon) return;
            const isFilled = icon.classList.contains('fa-solid');

            if (!isFilled) {
                icon.classList.remove('fa-regular', 'text-gray-400');
                icon.classList.add('fa-solid', 'text-red-500');
                count += 1;
                Yuwaso.Toast.show(`Saved "${itemName}" to wishlist!`);
            } else {
                icon.classList.remove('fa-solid', 'text-red-500');
                icon.classList.add('fa-regular', 'text-gray-400');
                count = Math.max(0, count - 1);
                Yuwaso.Toast.show(`Removed "${itemName}" from wishlist.`);
            }

            const el = badge();
            if (!el) return;
            if (count > 0) {
                el.textContent = String(count);
                el.classList.remove('hidden');
            } else {
                el.classList.add('hidden');
            }
        }

        function open() {
            Yuwaso.Toast.show(`Wishlist contains ${count} saved treasures.`);
        }

        return { toggleCard, open };
    })();

    /* ---------------------------------------------------------------------
       Filters — category tabs + category-card shortcuts on the product grid
       --------------------------------------------------------------------- */
    Yuwaso.Filters = (function () {
        function apply(category) {
            const products = document.querySelectorAll('.product-item');
            const tabs = document.querySelectorAll('.filter-tab');

            tabs.forEach((tab) => {
                const active = tab.getAttribute('data-category') === category;
                tab.setAttribute('data-active', active ? 'true' : 'false');
            });

            products.forEach((item) => {
                const matches = category === 'All' || item.getAttribute('data-category') === category;
                item.style.display = matches ? 'flex' : 'none';
            });

            document.getElementById('specialties')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            Yuwaso.Toast.show(`Filtering: ${category}`);
        }

        return { apply };
    })();

    /* ---------------------------------------------------------------------
       Search — live filter of the product grid by title
       --------------------------------------------------------------------- */
    Yuwaso.Search = (function () {
        function init() {
            const input = document.getElementById('siteSearchInput');
            if (!input) return;

            input.addEventListener('input', (e) => {
                const query = e.target.value.toLowerCase().trim();
                document.querySelectorAll('.product-item').forEach((card) => {
                    const title = card.querySelector('h4')?.textContent.toLowerCase() || '';
                    card.style.display = title.includes(query) ? 'flex' : 'none';
                });
            });
        }

        return { init };
    })();

    /* ---------------------------------------------------------------------
       Modals — customizer, video, auth, mobile nav drawer
       --------------------------------------------------------------------- */
    Yuwaso.Modals = (function () {
        function toggle(id, show) {
            const el = document.getElementById(id);
            if (!el) return;
            el.classList.toggle('hidden', !show);
        }

        function openCustomizer() { toggle('customizerModal', true); }
        function closeCustomizer() { toggle('customizerModal', false); }

        function submitCustomHamper() {
            closeCustomizer();
            Yuwaso.Cart.add('Customized Kashmiri Hamper', 1139);
        }

        function openVideo() { toggle('videoModal', true); }
        function closeVideo() { toggle('videoModal', false); }

        function openAuth() { toggle('authModal', true); }
        function closeAuth() { toggle('authModal', false); }

        function handleLogin(e) {
            e.preventDefault();
            closeAuth();
            Yuwaso.Toast.show('Welcome back! You are now logged in.');
        }

        function toggleMobileNav() {
            document.getElementById('mobileMenu')?.classList.toggle('hidden');
        }

        return {
            openCustomizer, closeCustomizer, submitCustomHamper,
            openVideo, closeVideo,
            openAuth, closeAuth, handleLogin,
            toggleMobileNav,
        };
    })();

    /* ---------------------------------------------------------------------
       Nav — scroll shadow state + category carousel scroller
       --------------------------------------------------------------------- */
    Yuwaso.Nav = (function () {
        function initScrollShadow() {
            const nav = document.getElementById('siteNav');
            if (!nav) return;
            const onScroll = () => nav.classList.toggle('is-scrolled', window.scrollY > 8);
            onScroll();
            window.addEventListener('scroll', onScroll, { passive: true });
        }

        function scrollCategories(direction) {
            const container = document.getElementById('categoryCarousel');
            if (!container) return;
            const amount = direction === 'left' ? -280 : 280;
            container.scrollBy({ left: amount, behavior: 'smooth' });
        }

        return { initScrollShadow, scrollCategories };
    })();

    /* ---------------------------------------------------------------------
       Newsletter
       --------------------------------------------------------------------- */
    Yuwaso.Newsletter = (function () {
        function handleSubmit(e) {
            e.preventDefault();
            const input = document.getElementById('newsletterEmail');
            const email = input ? input.value : '';
            Yuwaso.Toast.show(`Thank you! ${email} has been subscribed.`);
            if (input) input.value = '';
        }

        return { handleSubmit };
    })();

    /* ---------------------------------------------------------------------
       Reveal — IntersectionObserver-driven scroll-in animation
       --------------------------------------------------------------------- */
    Yuwaso.Reveal = (function () {
        function init() {
            const targets = document.querySelectorAll('[data-reveal], [data-reveal-group]');
            if (!targets.length) return;

            if (!('IntersectionObserver' in window)) {
                targets.forEach((t) => t.classList.add('is-visible'));
                return;
            }

            const observer = new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-visible');
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

            targets.forEach((t) => observer.observe(t));
        }

        return { init };
    })();

    /* ---------------------------------------------------------------------
       Bootstrap — wire up simple event bindings on DOM ready
       --------------------------------------------------------------------- */
    document.addEventListener('DOMContentLoaded', () => {
        Yuwaso.Search.init();
        Yuwaso.Nav.initScrollShadow();
        Yuwaso.Reveal.init();
    });
})();
