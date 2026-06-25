// Galerie na detailu casina - klik na náhled nebo šipky přepne velkou fotku nahoře
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

        if (counter) {
            counter.textContent = (currentIndex + 1) + ' / ' + thumbs.length;
        }

        thumb.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }

    thumbs.forEach((thumb, index) => {
        thumb.addEventListener('click', () => showIndex(index));
    });

    if (prevBtn) {
        prevBtn.addEventListener('click', () => showIndex(currentIndex - 1));
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => showIndex(currentIndex + 1));
    }
});
