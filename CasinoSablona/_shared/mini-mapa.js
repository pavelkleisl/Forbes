function initMiniMapa() {
    const pozice = { lat: window.CASINO_LAT, lng: window.CASINO_LNG };

    const mapa = new google.maps.Map(document.getElementById('mini-map'), {
        zoom: 15,
        center: pozice,
        styles: sedyStylMapy,
        disableDefaultUI: true,
        zoomControl: true,
        gestureHandling: 'cooperative'
    });

    new google.maps.Marker({
        position: pozice,
        map: mapa,
        title: window.CASINO_TITLE || '',
        icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: '#FFD166',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 2
        }
    });
}
