// Malá mapa s jedním markerem pro detail stránku konkrétního casina
function initMiniMapa() {
    const sedyStylMapy = [
        { "elementType": "geometry", "stylers": [{ "color": "#f5f5f5" }] },
        { "elementType": "labels.icon", "stylers": [{ "visibility": "off" }] },
        { "elementType": "labels.text.fill", "stylers": [{ "color": "#616161" }] },
        { "elementType": "labels.text.stroke", "stylers": [{ "color": "#f5f5f5" }] },
        { "featureType": "poi", "elementType": "geometry", "stylers": [{ "color": "#eeeeee" }] },
        { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#ffffff" }] },
        { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#e9e9e9" }] }
    ];

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
            url: "https://victoriatip.cz/wp-content/themes/smplv4-child/assets/img/icon-map-64px.png",
            scaledSize: new google.maps.Size(48, 48),
            origin: new google.maps.Point(0, 0),
            anchor: new google.maps.Point(24, 24)
        }
    });
}
