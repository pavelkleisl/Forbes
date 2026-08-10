// Galerie — přepínání fotek
document.addEventListener('DOMContentLoaded', function () {
    const strip = document.querySelector('.gallery-thumb-strip');
    const mainImg = document.getElementById('gallery-main-img');
    if (!strip || !mainImg) return;

    const counter = document.getElementById('gallery-counter');
    const thumbs = Array.from(strip.querySelectorAll('.gallery-thumb'));
    const prevBtn = document.querySelector('.gallery-nav-prev');
    const nextBtn = document.querySelector('.gallery-nav-next');
    let currentIndex = 0;

    function showIndex(index) {
        currentIndex = (index + thumbs.length) % thumbs.length;
        const thumb = thumbs[currentIndex];
        thumbs.forEach(t => t.classList.remove('active'));
        thumb.classList.add('active');
        mainImg.src = thumb.dataset.src;
        mainImg.alt = thumb.dataset.alt || '';
        if (counter) counter.textContent = (currentIndex + 1) + ' / ' + thumbs.length;
        thumb.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }

    thumbs.forEach((thumb, i) => thumb.addEventListener('click', () => showIndex(i)));
    if (prevBtn) prevBtn.addEventListener('click', () => showIndex(currentIndex - 1));
    if (nextBtn) nextBtn.addEventListener('click', () => showIndex(currentIndex + 1));

    // Swipe na mobilu
    let startX = 0;
    mainImg.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
    mainImg.addEventListener('touchend', e => {
        const diff = startX - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 40) showIndex(diff > 0 ? currentIndex + 1 : currentIndex - 1);
    });
});

// Mobilní menu
document.addEventListener('DOMContentLoaded', function () {
    const btn = document.getElementById('mobileToggle');
    const menu = document.getElementById('mobileMenu');
    if (!btn || !menu) return;

    btn.addEventListener('click', function () {
        this.classList.toggle('active');
        menu.classList.toggle('active');
    });

    // Zavřít po kliknutí na odkaz
    menu.querySelectorAll('a').forEach(a => {
        a.addEventListener('click', () => {
            btn.classList.remove('active');
            menu.classList.remove('active');
        });
    });
});

// Smooth scroll pro kotvičkové odkazy
document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('a[href^="#"]').forEach(a => {
        a.addEventListener('click', function (e) {
            const target = document.querySelector(this.getAttribute('href'));
            if (!target) return;
            e.preventDefault();
            const offset = 90;
            const top = target.getBoundingClientRect().top + window.scrollY - offset;
            window.scrollTo({ top, behavior: 'smooth' });
        });
    });
});
