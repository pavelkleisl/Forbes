(function () {
    'use strict';

    const canvas = document.getElementById('vt-wave');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let W, H, dpr, t = 0;

    function resize() {
        dpr = window.devicePixelRatio || 1;
        W = canvas.offsetWidth;
        H = canvas.offsetHeight;
        canvas.width  = W * dpr;
        canvas.height = H * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    window.addEventListener('resize', resize);
    resize();

    // Barvy vlnky vycházejí z barevných proměnných webu (--accent / --glow-2).
    let accentRGB = [255, 209, 102];
    let glow2RGB  = [34, 211, 238];

    function parseRgbVar(value) {
        const parts = String(value).split(',').map(function (n) { return parseInt(n.trim(), 10); });
        if (parts.length === 3 && parts.every(function (n) { return !isNaN(n); })) return parts;
        return null;
    }

    function readThemeColors() {
        const styles = getComputedStyle(document.documentElement);
        accentRGB = parseRgbVar(styles.getPropertyValue('--accent-rgb')) || accentRGB;
        glow2RGB  = parseRgbVar(styles.getPropertyValue('--glow-2-rgb')) || glow2RGB;
    }

    function mix(rgb, target, amount) {
        return [0, 1, 2].map(function (i) { return Math.round(rgb[i] + (target[i] - rgb[i]) * amount); });
    }

    function rgbaOf(rgb, a) {
        return 'rgba(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ',' + a + ')';
    }

    readThemeColors();

    /* S-křivka přes celou šířku:
       Levý bod trochu níže, střed nahoře, pravý bod trochu níže —
       pomalá animace mírně posouvá kontrolní body. */
    function getWaveY(x, phase) {
        const norm = x / W;
        const y = H * 0.52
            + Math.sin(norm * Math.PI * 1.4 + phase)       * H * 0.22
            + Math.sin(norm * Math.PI * 0.6 + phase * 0.4) * H * 0.08;
        return y;
    }

    function buildGradient() {
        const g = ctx.createLinearGradient(0, 0, W, 0);
        g.addColorStop(0,    rgbaOf(accentRGB, 0.9));
        g.addColorStop(0.35, rgbaOf(mix(accentRGB, [255, 255, 255], 0.55), 1));
        g.addColorStop(0.5,  'rgba(255, 255, 255, 1)');
        g.addColorStop(0.65, rgbaOf(mix(glow2RGB, [255, 255, 255], 0.55), 1));
        g.addColorStop(1,    rgbaOf(glow2RGB, 0.85));
        return g;
    }

    function drawLine(phase, lineWidth, alpha, blur) {
        if (blur > 0) ctx.filter = `blur(${blur}px)`;
        ctx.globalAlpha = alpha;
        ctx.lineWidth   = lineWidth;
        ctx.strokeStyle = buildGradient();
        ctx.lineCap     = 'round';
        ctx.lineJoin    = 'round';

        ctx.beginPath();
        const steps = 180;
        for (let i = 0; i <= steps; i++) {
            const x = (W * i) / steps;
            const y = getWaveY(x, phase);
            i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.stroke();
        if (blur > 0) ctx.filter = 'none';
    }

    function drawMesh(phase, lineCount, maxOffset, baseAlpha) {
        const steps = 180;
        ctx.lineWidth = 0.5;

        for (let li = 1; li <= lineCount; li++) {
            const offset  = (li / lineCount) * maxOffset;
            const alpha   = baseAlpha * Math.pow(1 - li / (lineCount + 1), 1.6);
            if (alpha < 0.004) continue;

            ctx.globalAlpha = alpha;

            const g = ctx.createLinearGradient(0, 0, W, 0);
            g.addColorStop(0,   rgbaOf(accentRGB, 1));
            g.addColorStop(0.5, rgbaOf(mix(accentRGB, glow2RGB, 0.5), 1));
            g.addColorStop(1,   rgbaOf(glow2RGB, 1));
            ctx.strokeStyle = g;

            ctx.beginPath();
            for (let i = 0; i <= steps; i++) {
                const x = (W * i) / steps;
                const y = getWaveY(x, phase) + offset;
                i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
            }
            ctx.stroke();
        }
    }

    function frame() {
        ctx.clearRect(0, 0, W, H);

        const phase = t;

        // Mesh čáry pod hlavní linkou
        drawMesh(phase, 28, H * 0.38, 0.18);

        // Glow vrstvy (vnější → vnitřní)
        drawLine(phase, 40, 0.04, 18);
        drawLine(phase, 24, 0.08, 10);
        drawLine(phase, 14, 0.14,  5);
        drawLine(phase,  7, 0.30,  2);
        drawLine(phase,  3, 0.80,  0);  // ostrá hlavní čára
        drawLine(phase,  1, 1.00,  0);  // nejsvětlejší střed

        ctx.globalAlpha = 1;
        t += 0.005;
        requestAnimationFrame(frame);
    }

    frame();
})();
