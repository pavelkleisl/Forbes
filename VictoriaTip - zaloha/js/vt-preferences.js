/*
 * VictoriaTip - lišta a centrum nastavení souhlasu s cookies.
 * Soulad s GDPR / zákonem č. 480/2004 Sb. (eIDAS/ePrivacy): nezbytné cookies běží vždy,
 * volitelné kategorie (analytické, marketingové) se aktivují až po výslovném souhlasu
 * a jdou odmítnout stejně snadno jako přijmout. Souhlas lze kdykoliv změnit přes
 * window.VTPreferences.open() (viz odkaz "Nastavení cookies" v patičce a na stránce cookies.html).
 *
 * Pozn.: třídy a název souboru se záměrně vyhýbají běžným řetězcům typu "cookie-banner"
 * nebo "cookie-consent" - filtrovací listy prohlížečů jako Brave Shields tyto vzory
 * automaticky skrývají/blokují, protože je používají třetí strany typu Cookiebot/OneTrust.
 */
(function () {
    'use strict';

    var STORAGE_KEY = 'vt_prefs_v1';
    var COOKIE_NAME = 'vt_prefs';

    var CATEGORIES = [
        {
            id: 'necessary',
            name: 'Nezbytně nutné',
            locked: true,
            description: 'Zajišťují základní funkčnost webu (např. zapamatování vašeho nastavení cookies, bezpečnost, fungování mobilního menu). Bez nich by web nefungoval správně, proto je nelze vypnout.'
        },
        {
            id: 'analytics',
            name: 'Analytické',
            locked: false,
            description: 'Pomáhají nám pochopit, jak návštěvníci web používají (např. počet zobrazení stránek), abychom mohli web postupně zlepšovat. Data jsou anonymizovaná.'
        },
        {
            id: 'marketing',
            name: 'Marketingové',
            locked: false,
            description: 'Používají se k zobrazování relevantní reklamy a měření účinnosti kampaní na našich i partnerských webech.'
        }
    ];

    function readConsent() {
        try {
            var raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return null;
            var parsed = JSON.parse(raw);
            if (parsed && typeof parsed === 'object' && parsed.categories) return parsed;
            return null;
        } catch (e) {
            return null;
        }
    }

    function writeConsent(categories) {
        var consent = {
            categories: categories,
            timestamp: new Date().toISOString(),
            version: 1
        };
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
        } catch (e) { /* localStorage nedostupné, pokračujeme jen s cookie */ }

        var maxAge = 60 * 60 * 24 * 365;
        document.cookie = COOKIE_NAME + '=1; max-age=' + maxAge + '; path=/; SameSite=Lax';

        return consent;
    }

    function applyConsent(consent) {
        // Skripty s atributem data-vt-category="analytics|marketing" a type="text/plain"
        // se aktivují teprve po udělení souhlasu s danou kategorií.
        document.querySelectorAll('script[data-vt-category]').forEach(function (placeholder) {
            var category = placeholder.getAttribute('data-vt-category');
            if (consent.categories[category]) {
                var script = document.createElement('script');
                Array.prototype.slice.call(placeholder.attributes).forEach(function (attr) {
                    if (attr.name !== 'type') script.setAttribute(attr.name, attr.value);
                });
                script.textContent = placeholder.textContent;
                placeholder.replaceWith(script);
            }
        });

        document.dispatchEvent(new CustomEvent('vt-preferences-updated', { detail: consent }));
    }

    var barEl = null;
    var modalEl = null;

    function buildBar() {
        var el = document.createElement('div');
        el.className = 'vt-pref-bar';
        el.setAttribute('role', 'dialog');
        el.setAttribute('aria-live', 'polite');
        el.setAttribute('aria-label', 'Nastavení souborů cookies');
        el.innerHTML =
            '<div class="vt-pref-bar-inner glass-card">' +
                '<div class="vt-pref-bar-text">' +
                    '<strong>Používáme cookies</strong>' +
                    '<p>Soubory cookies používáme pro zajištění funkčnosti webu a se souhlasem také pro analýzu návštěvnosti a personalizaci obsahu. Více informací najdete na stránce ' +
                    '<a href="cookies.html">Cookies</a>.</p>' +
                '</div>' +
                '<div class="vt-pref-bar-actions">' +
                    '<button type="button" class="btn-outline-yellow vt-pref-btn-settings">Nastavení</button>' +
                    '<button type="button" class="btn-outline-yellow vt-pref-btn-reject">Odmítnout vše</button>' +
                    '<button type="button" class="btn-primary vt-pref-btn-accept">Přijmout vše</button>' +
                '</div>' +
            '</div>';

        el.querySelector('.vt-pref-btn-accept').addEventListener('click', function () {
            acceptAll();
        });
        el.querySelector('.vt-pref-btn-reject').addEventListener('click', function () {
            rejectAll();
        });
        el.querySelector('.vt-pref-btn-settings').addEventListener('click', function () {
            openSettings();
        });

        return el;
    }

    function buildModal() {
        var el = document.createElement('div');
        el.className = 'vt-pref-modal-overlay';
        el.setAttribute('role', 'dialog');
        el.setAttribute('aria-modal', 'true');
        el.setAttribute('aria-label', 'Podrobné nastavení cookies');

        var rowsHtml = CATEGORIES.map(function (cat) {
            return (
                '<div class="vt-pref-row">' +
                    '<div class="vt-pref-row-header">' +
                        '<span class="vt-pref-row-name">' + cat.name + '</span>' +
                        '<label class="vt-pref-switch">' +
                            '<input type="checkbox" data-vt-category="' + cat.id + '"' +
                                (cat.locked ? ' checked disabled' : '') + '>' +
                            '<span class="vt-pref-switch-slider"></span>' +
                        '</label>' +
                    '</div>' +
                    '<p class="vt-pref-row-desc">' + cat.description + '</p>' +
                '</div>'
            );
        }).join('');

        el.innerHTML =
            '<div class="vt-pref-modal glass-card">' +
                '<button type="button" class="vt-pref-modal-close" aria-label="Zavřít">&times;</button>' +
                '<h3>Nastavení cookies</h3>' +
                '<p class="vt-pref-modal-intro">Vyberte, které kategorie cookies chcete povolit. Nezbytné cookies jsou aktivní vždy, ostatní pouze s vaším souhlasem. Nastavení můžete kdykoliv změnit na stránce ' +
                '<a href="cookies.html">Cookies</a>.</p>' +
                '<div class="vt-pref-list">' + rowsHtml + '</div>' +
                '<div class="vt-pref-modal-actions">' +
                    '<button type="button" class="btn-outline-yellow vt-pref-btn-reject-modal">Odmítnout vše</button>' +
                    '<button type="button" class="btn-primary vt-pref-btn-save">Uložit nastavení</button>' +
                '</div>' +
            '</div>';

        el.addEventListener('click', function (e) {
            if (e.target === el) closeSettings();
        });
        el.querySelector('.vt-pref-modal-close').addEventListener('click', closeSettings);
        el.querySelector('.vt-pref-btn-reject-modal').addEventListener('click', function () {
            rejectAll();
        });
        el.querySelector('.vt-pref-btn-save').addEventListener('click', function () {
            var categories = { necessary: true };
            el.querySelectorAll('input[data-vt-category]').forEach(function (input) {
                categories[input.getAttribute('data-vt-category')] = input.checked;
            });
            finalizeConsent(categories);
        });

        return el;
    }

    function finalizeConsent(categories) {
        var consent = writeConsent(categories);
        applyConsent(consent);
        hideBar();
        closeSettings();
    }

    function acceptAll() {
        var categories = {};
        CATEGORIES.forEach(function (cat) { categories[cat.id] = true; });
        finalizeConsent(categories);
    }

    function rejectAll() {
        var categories = {};
        CATEGORIES.forEach(function (cat) { categories[cat.id] = cat.locked === true; });
        finalizeConsent(categories);
    }

    function showBar() {
        if (!barEl) {
            barEl = buildBar();
            document.body.appendChild(barEl);
        }
        requestAnimationFrame(function () {
            barEl.classList.add('vt-pref-bar-visible');
        });
    }

    function hideBar() {
        if (barEl) barEl.classList.remove('vt-pref-bar-visible');
    }

    function openSettings() {
        if (!modalEl) {
            modalEl = buildModal();
            document.body.appendChild(modalEl);
        }
        var existing = readConsent();
        modalEl.querySelectorAll('input[data-vt-category]').forEach(function (input) {
            var category = input.getAttribute('data-vt-category');
            if (existing) {
                input.checked = !!existing.categories[category];
            } else {
                input.checked = false;
            }
        });
        modalEl.classList.add('vt-pref-modal-visible');
        document.body.classList.add('vt-pref-modal-open');
    }

    function closeSettings() {
        if (modalEl) modalEl.classList.remove('vt-pref-modal-visible');
        document.body.classList.remove('vt-pref-modal-open');
    }

    function init() {
        var consent = readConsent();
        if (consent) {
            applyConsent(consent);
        } else {
            showBar();
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    window.VTPreferences = {
        open: openSettings,
        acceptAll: acceptAll,
        rejectAll: rejectAll,
        getConsent: readConsent,
        categories: CATEGORIES
    };
})();
