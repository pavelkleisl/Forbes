function includeHTML() {
    fetch('header.html', { cache: 'no-store' })
        .then(response => response.text())
        .then(data => {
            document.getElementById('header-placeholder').innerHTML = data;

            const mobileBtn = document.getElementById('mobileToggle');
            const mobileMenu = document.getElementById('mobileMenu');
            if (mobileBtn && mobileMenu) {
                mobileBtn.addEventListener('click', function() {
                    this.classList.toggle('active');
                    mobileMenu.classList.toggle('active');
                });
            }

            let currentUrl = window.location.pathname.split('/').pop();
            if (currentUrl === '') currentUrl = 'index.html';

            const navLinks = document.querySelectorAll('.main-nav a');
            navLinks.forEach(link => {
                if (link.getAttribute('href') === currentUrl) {
                    link.classList.add('active');
                }
            });
        });

    fetch('footer.html', { cache: 'no-store' })
        .then(response => response.text())
        .then(data => document.getElementById('footer-placeholder').innerHTML = data);
}
window.onload = includeHTML;
