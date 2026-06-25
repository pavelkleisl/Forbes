function initMapa() {
    // Střed České republiky posunutý lehce tak, aby seděl do vyšší mapy
    const stredCR = { lat: 49.8500, lng: 15.3000 };
    let aktualniInfoWindow = null;

    // Seznam webů a fotek pro 6 největších červených poboček
    const detailyVelkychCasin = {
        160: { web: "https://casinoroyal.cz/", fotka: "img/casino-royale.jpg" },
        47:  { web: "https://www.casinoatlantis.cz/", fotka: "img/casino-atlantis.jpg" },
        26:  { web: "https://www.forbes-brandys.cz/", fotka: "img/casino-forbes.jpg" },
        29:  { web: "https://www.jackscasino.cz/", fotka: "img/casino-jacks.jpg" },
        135: { web: "http://casinolitomerice.cz/", fotka: "img/casino-litomerice.jpg" },
        122: { web: "http://www.casinosokolov.cz/", fotka: "img/casino-sokolov.jpg" }
    };

    const sedyStylMapy = [
        { "elementType": "geometry", "stylers": [{ "color": "#f5f5f5" }] },
        { "elementType": "labels.icon", "stylers": [{ "visibility": "off" }] },
        { "elementType": "labels.text.fill", "stylers": [{ "color": "#616161" }] },
        { "elementType": "labels.text.stroke", "stylers": [{ "color": "#f5f5f5" }] },
        { "featureType": "poi", "elementType": "geometry", "stylers": [{ "color": "#eeeeee" }] },
        { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#ffffff" }] },
        { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#e9e9e9" }] }
    ];

    const mapa = new google.maps.Map(document.getElementById("map"), {
        zoom: 8,
        center: stredCR,
        styles: sedyStylMapy
    });

    // Boční panel pro detail TOP casin (vyjíždí z levé strany mapy)
    const detailPanel = document.getElementById('casino-detail-panel');

    function zavriPanel() {
        if (detailPanel) {
            detailPanel.classList.remove('active');
        }
    }

    function otevriPanel(htmlObsah) {
        if (!detailPanel) return;
        detailPanel.innerHTML = `<button class="panel-close" aria-label="Zavřít">&times;</button>${htmlObsah}`;
        const tlacitkoZavrit = detailPanel.querySelector('.panel-close');
        if (tlacitkoZavrit) {
            tlacitkoZavrit.addEventListener('click', zavriPanel);
        }
        detailPanel.classList.add('active');
    }

    fetch('pobocky.json')
        .then(response => response.json())
        .then(responseJson => {
            const pobocky = responseJson.data;
            const seznamGrid = document.getElementById('seznam-grid');
            
            if (seznamGrid) {
                seznamGrid.innerHTML = ''; 
            }
            
            const serazenePobocky = [...pobocky].sort((a, b) => a.title.localeCompare(b.title));

            serazenePobocky.forEach(pobocka => {
                if (!pobocka.location || !pobocka.location.lat || !pobocka.location.lng) return;

                const pozice = { 
                    lat: parseFloat(pobocka.location.lat), 
                    lng: parseFloat(pobocka.location.lng) 
                };
                
                let ikonaUrl = pobocka.icon;
                let jeMini = pobocka.id.toString().includes('mini');
                let velikostIkony = jeMini ? 32 : 64;

                let prioritaVrstvy = 100; 
                if (!jeMini) {
                    prioritaVrstvy = 300; 
                } else if (ikonaUrl.includes('gold')) {
                    prioritaVrstvy = 200; 
                }

                const mapaIkona = {
                    url: ikonaUrl,
                    scaledSize: new google.maps.Size(velikostIkony, velikostIkony),
                    origin: new google.maps.Point(0, 0),
                    anchor: new google.maps.Point(velikostIkony / 2, velikostIkony / 2)
                };

                const marker = new google.maps.Marker({
                    position: pozice,
                    map: mapa,
                    title: pobocka.title,
                    icon: mapaIkona,
                    zIndex: prioritaVrstvy
                });

                const typProvozu = pobocka.herna ? "Herna" : "Casino";
                const barvaStitku = pobocka.herna ? "#4da6ff" : "#FFD166";
                const extraDetail = detailyVelkychCasin[pobocka.id];
                
                let fotkaHtml = "";
                if (extraDetail && extraDetail.fotka) {
                    fotkaHtml = `<img src="${extraDetail.fotka}" class="map-info-img">`;
                }

                // Příprava tlačítka pro WEB (pokud existuje)
                let tlacitkoHtml = "";
                if (extraDetail && extraDetail.web) {
                    tlacitkoHtml = `<a href="${extraDetail.web}" target="_blank" class="btn-primary btn-full">Navštívit web casina</a>`;
                }

                // Příprava tlačítka NAVIGACE přímo do InfoWindow - vždy modré, ať je vizuálně odlišené od zlatého CTA na web
                const navigaceUrl = `https://www.google.com/maps/dir/?api=1&destination=${pozice.lat},${pozice.lng}`;
                const navigaceHtml = `<a href="${navigaceUrl}" target="_blank" class="btn-route btn-full">➤ Naplánovat trasu</a>`;

                let cistaAdresa = pobocka.location.address.trim();
                let cistyPopis = pobocka.description ? pobocka.description.trim() : "";

                let zobrazitPopis = true;
                if (jeMini || cistyPopis === cistaAdresa || cistyPopis.includes(cistaAdresa.substring(0, 15))) {
                    zobrazitPopis = false;
                }

                // Sestavení InfoWindow s oběma tlačítky pod sebou - skleněná (glassmorphism) karta
                const infoObsah = `
                    <div class="map-info-card">
                        <button class="map-info-close" aria-label="Zavřít">&times;</button>
                        ${fotkaHtml}
                        <div class="map-info-body">
                            <span class="map-info-tag" style="color: ${barvaStitku};">${typProvozu}</span>
                            <h3>${pobocka.title}</h3>
                            <p class="map-info-address">📍 ${cistaAdresa}</p>
                            ${pobocka.description && zobrazitPopis ? `<p class="map-info-desc">${pobocka.description}</p>` : ''}
                            <div class="map-info-actions">
                                ${tlacitkoHtml}
                                ${navigaceHtml}
                            </div>
                        </div>
                    </div>
                `;

                // TOP casina (mají fotku) otevírají boční panel, ostatní klasické malé okénko na mapě
                const infowindow = extraDetail ? null : new google.maps.InfoWindow({ content: infoObsah });

                if (infowindow) {
                    // Google pozici svého zavíracího tlačítka spočítá podle skrytého obalu bubliny,
                    // proto je skryté v CSS a zavírání řeší náš vlastní křížek uvnitř karty
                    google.maps.event.addListener(infowindow, 'domready', function() {
                        const tlacitkoZavrit = document.querySelector('.gm-style-iw-d .map-info-close');
                        if (tlacitkoZavrit) {
                            tlacitkoZavrit.addEventListener('click', () => infowindow.close());
                        }
                    });
                }

                function otevriDetail() {
                    if (extraDetail) {
                        if (aktualniInfoWindow) {
                            aktualniInfoWindow.close();
                        }
                        otevriPanel(infoObsah);
                    } else {
                        zavriPanel();
                        if (aktualniInfoWindow) {
                            aktualniInfoWindow.close();
                        }
                        infowindow.open(mapa, marker);
                        aktualniInfoWindow = infowindow;
                    }
                }

                marker.addListener("click", otevriDetail);

                // VYKRESLENÍ ČISTÝCH KARET DO SEZNAMU POD MAPOU (BEZ TLAČÍTKA)
                if (seznamGrid) {
                    let zobrazenyNazev = pobocka.title;
                    if (zobrazenyNazev.trim().toUpperCase() === "CASINO" || zobrazenyNazev.trim().toUpperCase() === "HERNA") {
                        let castiAdresy = cistaAdresa.split(',');
                        if (castiAdresy.length > 1) {
                            let mesto = castiAdresy[castiAdresy.length - 1].replace(/\d{3}\s?\d{2}/, '').trim();
                            zobrazenyNazev = `${zobrazenyNazev} ${mesto}`;
                        }
                    }

                    const kartaPobocky = document.createElement('div');
                    kartaPobocky.className = 'seznam-card';
                    kartaPobocky.style.cursor = 'pointer'; 
                    
                    // Karta teď obsahuje jen čisté, elegantní informace, žádné rušivé texty navíc
                    kartaPobocky.innerHTML = `
                        <span style="color: ${barvaStitku}; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px;">${typProvozu}</span>
                        <h3>${zobrazenyNazev}</h3>
                        <p>📍 ${cistaAdresa}</p>
                    `;

                    kartaPobocky.addEventListener('click', function() {
                        document.getElementById('map').scrollIntoView({ behavior: 'smooth', block: 'center' });
                        mapa.panTo(pozice);
                        mapa.setZoom(14);
                        otevriDetail();
                    });

                    seznamGrid.appendChild(kartaPobocky);
                }
            });

            const searchInput = document.getElementById('hledatPobocku');
            if (searchInput && seznamGrid) {
                searchInput.addEventListener('input', function(e) {
                    const hledanyText = e.target.value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                    const vsechnyKarty = seznamGrid.querySelectorAll('.seznam-card');
                    
                    vsechnyKarty.forEach(karta => {
                        const textKarty = karta.textContent.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                        if (textKarty.includes(hledanyText)) {
                            karta.style.display = 'block';
                        } else {
                            karta.style.display = 'none';
                        }
                    });
                });
            }

            google.maps.event.addListener(mapa, 'domready', function() {
                const iwBgChild = document.querySelector('.gm-style-iw-d');
                if (iwBgChild) {
                    iwBgChild.style.overflow = 'hidden';
                }
            });

        })
        .catch(error => console.error("Chyba při načítání poboček:", error));
}