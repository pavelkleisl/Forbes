// Načte header.html a footer.html do placeholderů
// Automaticky označí aktivní nav odkaz podle aktuální URL
(function () {
    function loadFragment(id, file, callback) {
        const el = document.getElementById(id);
        if (!el) return;
        fetch(file, { cache: 'no-store' })
            .then(r => r.text())
            .then(html => {
                el.innerHTML = html;
                if (callback) callback();
            });
    }

    function markActiveNav() {
        let current = window.location.pathname.split('/').pop();
        if (!current || current === '') current = 'index.html';

        document.querySelectorAll('.main-nav a, .mobile-menu-links a').forEach(a => {
            const href = a.getAttribute('href');
            if (href && href.split('#')[0] === current) {
                a.classList.add('active');
            }
        });

        // Mobilní toggle
        const btn  = document.getElementById('mobileToggle');
        const menu = document.getElementById('mobileMenu');
        if (btn && menu) {
            btn.addEventListener('click', function () {
                this.classList.toggle('active');
                menu.classList.toggle('active');
            });
            menu.querySelectorAll('a').forEach(a => {
                a.addEventListener('click', () => {
                    btn.classList.remove('active');
                    menu.classList.remove('active');
                });
            });
        }
    }

    window.addEventListener('DOMContentLoaded', function () {
        loadFragment('header-placeholder', 'header.html', markActiveNav);
        loadFragment('footer-placeholder', 'footer.html');
    });
})();
