// Malá mapa s jedním markerem pro detail stránku konkrétního casina
function initMiniMapa() {
    const pozice = { lat: window.CASINO_LAT, lng: window.CASINO_LNG };

    const mapa = new google.maps.Map(document.getElementById("mini-map"), {
        zoom: 15,
        center: pozice,
        styles: sedyStylMapy,
        disableDefaultUI: true,
        zoomControl: true,
        gestureHandling: "cooperative"
    });

    new google.maps.Marker({
        position: pozice,
        map: mapa,
        title: window.CASINO_TITLE || "",
        icon: {
            url: "img/pin-gold.png",
            scaledSize: new google.maps.Size(48, 48),
            origin: new google.maps.Point(0, 0),
            anchor: new google.maps.Point(24, 24)
        }
    });
}
