const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function generateLakheyCartoonAtlas() {
  console.log('Generating Refined 2048x2048 Modern Cartoon Texture Atlas for Lakhey Guardian...');

  const browser = await chromium.launch({
    channel: 'msedge',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage({
    viewport: { width: 2048, height: 2048 }
  });

  await page.setContent(`
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body, html { margin: 0; padding: 0; width: 2048px; height: 2048px; overflow: hidden; background: #000; }
        canvas { width: 2048px; height: 2048px; display: block; }
      </style>
    </head>
    <body>
      <canvas id="c" width="2048" height="2048"></canvas>
    </body>
    </html>
  `);

  await page.evaluate(() => {
    const canvas = document.getElementById('c');
    const ctx = canvas.getContext('2d');

    // =========================================================================
    // ATLAS LAYOUT (2048 x 2048)
    // [0, 0, 1024, 1024]       : QUADRANT 1 - THEATRICAL GUARDIAN MASK & VISAGE
    // [1024, 0, 2048, 1024]    : QUADRANT 2 - CEREMONIAL VESTMENT & FLARED SKIRT (JAMA)
    // [0, 1024, 1024, 2048]    : QUADRANT 3 - BILLOWING DARK MANE & POINTED BOOTS
    // [1024, 1024, 2048, 2048] : QUADRANT 4 - GOLD BROCADE YOKE, BELT, STREAMERS & CHĀMARA
    // =========================================================================

    // Base background
    ctx.fillStyle = '#0F1218';
    ctx.fillRect(0, 0, 2048, 2048);

    // =========================================================================
    // QUADRANT 1: THEATRICAL GUARDIAN MASK & VISAGE (0..1024, 0..1024)
    // =========================================================================

    // 1. Mask Base Gradient (Warm Vermillion Terracotta with Cel-Shade Lighting)
    const maskGrad = ctx.createRadialGradient(512, 540, 100, 512, 540, 500);
    maskGrad.addColorStop(0, '#E11D48');    // Radiant festive vermillion center
    maskGrad.addColorStop(0.40, '#C2410C'); // Rich terracotta warmth
    maskGrad.addColorStop(0.80, '#991B1B'); // Deep ceremonial crimson perimeter
    maskGrad.addColorStop(1.0, '#7F1D1D');  // Edge shadow
    ctx.fillStyle = maskGrad;
    ctx.fillRect(0, 0, 1024, 1024);

    // Stylized facial cheekbone contour highlights
    ctx.fillStyle = 'rgba(251, 146, 60, 0.28)';
    ctx.beginPath();
    ctx.ellipse(300, 550, 130, 80, -0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(724, 550, 130, 80, 0.2, 0, Math.PI * 2);
    ctx.fill();

    // 2. Ornate Golden Mukut (Crest / Crown) at Top (Y: 40..340)
    ctx.save();
    const goldGrad = ctx.createLinearGradient(0, 160, 0, 340);
    goldGrad.addColorStop(0, '#FEF08A');
    goldGrad.addColorStop(0.3, '#F59E0B');
    goldGrad.addColorStop(0.75, '#D97706');
    goldGrad.addColorStop(1, '#92400E');

    ctx.fillStyle = goldGrad;
    ctx.strokeStyle = '#181414';
    ctx.lineWidth = 9;

    // Crown Base Arch Band
    ctx.beginPath();
    ctx.moveTo(120, 335);
    ctx.bezierCurveTo(320, 360, 704, 360, 904, 335);
    ctx.lineTo(914, 255);
    ctx.bezierCurveTo(704, 280, 320, 280, 110, 255);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Crown Flame Peaks
    // Left Flame Peak
    ctx.beginPath();
    ctx.moveTo(210, 260);
    ctx.bezierCurveTo(180, 140, 250, 60, 310, 75);
    ctx.bezierCurveTo(345, 125, 355, 205, 375, 265);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Right Flame Peak
    ctx.beginPath();
    ctx.moveTo(814, 260);
    ctx.bezierCurveTo(844, 140, 774, 60, 714, 75);
    ctx.bezierCurveTo(679, 125, 669, 205, 649, 265);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Center Grand Flame Peak (Highest, majestic pagoda spire)
    ctx.beginPath();
    ctx.moveTo(375, 265);
    ctx.bezierCurveTo(395, 95, 465, 25, 512, 15);
    ctx.bezierCurveTo(559, 25, 629, 95, 649, 265);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Inner Flame Filigree & Crown Jewel Medallions
    ctx.fillStyle = '#E11D48'; // Ruby center
    ctx.beginPath();
    ctx.ellipse(512, 155, 38, 52, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#FEF08A';
    ctx.lineWidth = 6;
    ctx.stroke();

    // Turquoise side gems
    ctx.fillStyle = '#06B6D4';
    ctx.beginPath();
    ctx.arc(310, 175, 22, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(714, 175, 22, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Pearl Band at bottom of crown
    for (let px = 150; px <= 874; px += 28) {
      ctx.fillStyle = '#FFFBEB';
      ctx.beginPath();
      ctx.arc(px, 312, 11, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#D97706';
      ctx.lineWidth = 2.5;
      ctx.stroke();
    }
    ctx.restore();

    // 3. Sacred Third Eye (Trinetra) (Center X: 512, Y: 360..435)
    ctx.save();
    // Golden Flame Halo
    ctx.fillStyle = '#F59E0B';
    ctx.beginPath();
    ctx.ellipse(512, 395, 36, 56, 0, 0, Math.PI * 2);
    ctx.fill();

    // Ivory Sclera
    ctx.fillStyle = '#FFFBEB';
    ctx.beginPath();
    ctx.ellipse(512, 395, 25, 42, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#181414';
    ctx.lineWidth = 6;
    ctx.stroke();

    // Fiery Red Iris & Pupil
    ctx.fillStyle = '#DC2626';
    ctx.beginPath();
    ctx.arc(512, 395, 17, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#111827';
    ctx.beginPath();
    ctx.arc(512, 395, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(509, 390, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 4. Arched Calligraphic Eyebrows
    function drawEyebrow(isLeft) {
      ctx.save();
      const cx = isLeft ? 335 : 689;
      const dir = isLeft ? 1 : -1;

      // Outer Gold Flame Halo
      ctx.fillStyle = '#F59E0B';
      ctx.beginPath();
      ctx.moveTo(cx - dir * 145, 475);
      ctx.bezierCurveTo(cx - dir * 40, 420, cx + dir * 60, 410, cx + dir * 135, 455);
      ctx.bezierCurveTo(cx + dir * 60, 430, cx - dir * 40, 440, cx - dir * 145, 475);
      ctx.fill();

      // Bold Charcoal Brow Lock
      ctx.fillStyle = '#141113';
      ctx.beginPath();
      ctx.moveTo(cx - dir * 135, 485);
      ctx.bezierCurveTo(cx - dir * 40, 435, cx + dir * 50, 425, cx + dir * 125, 470);
      ctx.bezierCurveTo(cx + dir * 60, 450, cx - dir * 40, 460, cx - dir * 135, 485);
      ctx.fill();
      ctx.restore();
    }
    drawEyebrow(true);
    drawEyebrow(false);

    // 5. Guardian Eyes (Almond Shaped, Fiery Amber, Focused & Expressive)
    function drawEye(cx, cy, isLeft) {
      ctx.save();
      // Heavy Comic Eyeliner Outline
      ctx.strokeStyle = '#141113';
      ctx.lineWidth = 14;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(cx - 100, cy + 10);
      ctx.bezierCurveTo(cx - 30, cy - 48, cx + 30, cy - 48, cx + 100, cy + 10);
      ctx.stroke();

      ctx.lineWidth = 9;
      ctx.beginPath();
      ctx.moveTo(cx - 95, cy + 10);
      ctx.bezierCurveTo(cx - 30, cy + 42, cx + 30, cy + 42, cx + 95, cy + 10);
      ctx.stroke();

      // Eye White (Ivory Sclera)
      ctx.fillStyle = '#FFFBEB';
      ctx.beginPath();
      ctx.moveTo(cx - 90, cy + 10);
      ctx.bezierCurveTo(cx - 30, cy - 38, cx + 30, cy - 38, cx + 90, cy + 10);
      ctx.bezierCurveTo(cx + 30, cy + 34, cx - 30, cy + 34, cx - 90, cy + 10);
      ctx.fill();

      // Radiant Fiery Amber Iris
      const irisGrad = ctx.createRadialGradient(cx, cy, 5, cx, cy, 44);
      irisGrad.addColorStop(0, '#FEF08A'); // Brilliant gold core
      irisGrad.addColorStop(0.40, '#F97316'); // Fiery orange mid
      irisGrad.addColorStop(0.80, '#C2410C'); // Deep amber rim
      irisGrad.addColorStop(1.0, '#7F1D1D');

      ctx.fillStyle = irisGrad;
      ctx.beginPath();
      ctx.arc(cx, cy + 2, 40, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#181414';
      ctx.lineWidth = 6;
      ctx.stroke();

      // Deep Charcoal Pupil
      ctx.fillStyle = '#0F1218';
      ctx.beginPath();
      ctx.arc(cx, cy + 2, 21, 0, Math.PI * 2);
      ctx.fill();

      // Anime Catchlights (Dynamic Dual Sparkles)
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(cx - 11, cy - 11, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx + 13, cy + 11, 5, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }
    drawEye(335, 525, true);
    drawEye(689, 525, false);

    // 6. Sculpted Nose (Bold Theatrical Flare)
    ctx.save();
    ctx.fillStyle = '#991B1B';
    ctx.strokeStyle = '#7F1D1D';
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.moveTo(512, 495);
    ctx.lineTo(468, 605);
    ctx.bezierCurveTo(490, 620, 534, 620, 556, 605);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Nostril Flairs
    ctx.fillStyle = '#450A0A';
    ctx.beginPath();
    ctx.ellipse(474, 600, 15, 10, -0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(550, 600, 15, 10, 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 7. Expressive Theatrical Mouth, Benevolent Fangs & Teeth (Y: 650..820)
    ctx.save();
    ctx.fillStyle = '#380606';
    ctx.strokeStyle = '#141113';
    ctx.lineWidth = 14;
    ctx.beginPath();
    ctx.moveTo(320, 680);
    ctx.bezierCurveTo(420, 645, 604, 645, 704, 680);
    ctx.bezierCurveTo(684, 785, 340, 785, 320, 680);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Upper Teeth Ridge
    ctx.fillStyle = '#FFFBEB';
    for (let tx = 405; tx <= 619; tx += 27) {
      ctx.fillRect(tx, 665, 21, 17);
      ctx.strokeRect(tx, 665, 21, 17);
    }

    // Lower Teeth Ridge
    for (let tx = 420; tx <= 604; tx += 27) {
      ctx.fillRect(tx, 738, 19, 15);
      ctx.strokeRect(tx, 738, 19, 15);
    }

    // Grand Curved Ivory Guardian Fangs
    function drawFang(fx, isLeft) {
      ctx.save();
      const dir = isLeft ? 1 : -1;
      const fangGrad = ctx.createLinearGradient(fx, 660, fx + dir * 25, 770);
      fangGrad.addColorStop(0, '#FEF9C3');
      fangGrad.addColorStop(0.3, '#FFFBEB');
      fangGrad.addColorStop(0.85, '#FDE68A');
      fangGrad.addColorStop(1, '#F59E0B');

      ctx.fillStyle = fangGrad;
      ctx.strokeStyle = '#181414';
      ctx.lineWidth = 8;

      ctx.beginPath();
      ctx.moveTo(fx - dir * 24, 665);
      ctx.lineTo(fx + dir * 20, 665);
      ctx.bezierCurveTo(fx + dir * 28, 715, fx + dir * 46, 755, fx + dir * 38, 780);
      ctx.bezierCurveTo(fx + dir * 12, 760, fx - dir * 10, 720, fx - dir * 24, 665);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Shiny reflection
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(fx - dir * 8, 675);
      ctx.lineTo(fx + dir * 16, 745);
      ctx.stroke();
      ctx.restore();
    }
    drawFang(370, true);
    drawFang(654, false);

    // Mouth Rim / Festive Vermillion Lips
    ctx.strokeStyle = '#991B1B';
    ctx.lineWidth = 15;
    ctx.beginPath();
    ctx.moveTo(305, 680);
    ctx.bezierCurveTo(420, 638, 604, 638, 719, 680);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(310, 680);
    ctx.bezierCurveTo(420, 800, 604, 800, 714, 680);
    ctx.stroke();
    ctx.restore();

    // 8. Stylized Graphic Black Beard & Whisker Locks (Y: 780..1024)
    ctx.save();
    ctx.fillStyle = '#141113';
    ctx.strokeStyle = '#7F1D1D';
    ctx.lineWidth = 5;

    // Center Chin Beard Locks
    ctx.beginPath();
    ctx.moveTo(350, 780);
    ctx.bezierCurveTo(330, 885, 415, 965, 512, 1005);
    ctx.bezierCurveTo(609, 965, 694, 885, 674, 780);
    ctx.bezierCurveTo(605, 845, 419, 845, 350, 780);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Flared Whisker Locks on sides
    function drawWhiskerLock(wx, wy, dir) {
      ctx.beginPath();
      ctx.moveTo(wx, wy);
      ctx.bezierCurveTo(wx + dir * 65, wy + 40, wx + dir * 95, wy + 115, wx + dir * 75, wy + 165);
      ctx.bezierCurveTo(wx + dir * 42, wy + 115, wx + dir * 20, wy + 72, wx, wy);
      ctx.fill();
      ctx.stroke();
    }
    drawWhiskerLock(280, 690, -1);
    drawWhiskerLock(250, 765, -1);
    drawWhiskerLock(744, 690, 1);
    drawWhiskerLock(774, 765, 1);
    ctx.restore();

    // =========================================================================
    // QUADRANT 2: CEREMONIAL VESTMENT & FLARED SKIRT (JAMA) (1024..2048, 0..1024)
    // =========================================================================
    const robeGrad = ctx.createLinearGradient(1024, 0, 1024, 1024);
    robeGrad.addColorStop(0, '#B91C1C');
    robeGrad.addColorStop(0.5, '#991B1B');
    robeGrad.addColorStop(1, '#7F1D1D');
    ctx.fillStyle = robeGrad;
    ctx.fillRect(1024, 0, 1024, 1024);

    // Vertical Pleat Folds
    for (let px = 1040; px < 2048; px += 48) {
      ctx.fillStyle = 'rgba(69, 10, 10, 0.45)';
      ctx.fillRect(px, 0, 18, 760);
      ctx.fillStyle = 'rgba(239, 68, 68, 0.35)';
      ctx.fillRect(px + 18, 0, 12, 760);
    }

    // Gold Brocade Hem Border Band (Kinari) (Y: 760..1024)
    ctx.save();
    const borderGrad = ctx.createLinearGradient(0, 760, 0, 1024);
    borderGrad.addColorStop(0, '#FEF08A');
    borderGrad.addColorStop(0.15, '#F59E0B');
    borderGrad.addColorStop(0.7, '#D97706');
    borderGrad.addColorStop(1, '#78350F');

    ctx.fillStyle = borderGrad;
    ctx.fillRect(1024, 760, 1024, 264);

    ctx.strokeStyle = '#181414';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(1024, 760);
    ctx.lineTo(2048, 760);
    ctx.moveTo(1024, 782);
    ctx.lineTo(2048, 782);
    ctx.moveTo(1024, 1010);
    ctx.lineTo(2048, 1010);
    ctx.stroke();

    // Brocade Diamonds
    const repeatW = 96;
    for (let bx = 1024; bx < 2048 + repeatW; bx += repeatW) {
      ctx.fillStyle = '#FEF08A';
      ctx.strokeStyle = '#92400E';
      ctx.lineWidth = 5;

      ctx.beginPath();
      ctx.moveTo(bx + 48, 800);
      ctx.lineTo(bx + 90, 895);
      ctx.lineTo(bx + 48, 990);
      ctx.lineTo(bx + 6, 895);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#DC2626';
      ctx.beginPath();
      ctx.moveTo(bx + 48, 830);
      ctx.lineTo(bx + 76, 895);
      ctx.lineTo(bx + 48, 960);
      ctx.lineTo(bx + 20, 895);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#FDE047';
      ctx.beginPath();
      ctx.arc(bx + 48, 895, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#181414';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.strokeStyle = '#FEF08A';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(bx, 895, 24, -Math.PI * 0.4, Math.PI * 0.4);
      ctx.stroke();
    }
    ctx.restore();

    // Center Gold Brocade Hanging Sash (Patuka) (X: 1420..1680, Y: 40..720)
    ctx.save();
    const sashGrad = ctx.createLinearGradient(1420, 0, 1680, 0);
    sashGrad.addColorStop(0, '#B45309');
    sashGrad.addColorStop(0.2, '#F59E0B');
    sashGrad.addColorStop(0.5, '#FEF08A');
    sashGrad.addColorStop(0.8, '#F59E0B');
    sashGrad.addColorStop(1, '#92400E');

    ctx.fillStyle = sashGrad;
    ctx.strokeStyle = '#141113';
    ctx.lineWidth = 8;
    ctx.fillRect(1420, 40, 260, 680);
    ctx.strokeRect(1420, 40, 260, 680);

    for (let sy = 100; sy <= 640; sy += 120) {
      ctx.fillStyle = '#DC2626';
      ctx.beginPath();
      ctx.arc(1550, sy, 38, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#FEF08A';
      ctx.lineWidth = 5;
      ctx.stroke();

      ctx.fillStyle = '#FEF08A';
      ctx.beginPath();
      ctx.arc(1550, sy, 18, 0, Math.PI * 2);
      ctx.fill();
    }

    for (let tx = 1428; tx <= 1672; tx += 12) {
      ctx.strokeStyle = '#FDE047';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(tx, 720);
      ctx.lineTo(tx, 755);
      ctx.stroke();
    }
    ctx.restore();

    // =========================================================================
    // QUADRANT 3: BILLOWING DARK MANE & CEREMONIAL BOOTS (0..1024, 1024..2048)
    // Mane occupies X: 0..640, Y: 1024..2048. Boots occupy X: 640..1024.
    // =========================================================================
    // 1. Mane Hair Texture (X: 0..640, Y: 1024..2048)
    const maneGrad = ctx.createLinearGradient(0, 1024, 640, 2048);
    maneGrad.addColorStop(0, '#1E1014');
    maneGrad.addColorStop(0.5, '#140A0D');
    maneGrad.addColorStop(1, '#0C0608');
    ctx.fillStyle = maneGrad;
    ctx.fillRect(0, 1024, 640, 1024);

    ctx.save();
    // Broad Stylized Dark & Crimson Hair Clumps / Locks
    for (let bx = 0; bx < 640; bx += 32) {
      const gradLock = ctx.createLinearGradient(bx, 1024, bx + 32, 2048);
      gradLock.addColorStop(0, bx % 64 === 0 ? '#260F16' : '#180B0F');
      gradLock.addColorStop(0.5, bx % 48 === 0 ? '#38121D' : '#1E0D13');
      gradLock.addColorStop(1, '#12080B');
      ctx.fillStyle = gradLock;
      ctx.fillRect(bx, 1024, 30, 1024);
    }

    // Dense flowing wavy hair ribbons and flame strands
    for (let i = 0; i < 280; i++) {
      const sx = (i * 19) % 620;
      const sy = 1030 + (i * 23) % 960;
      const len = 120 + (i * 31) % 260;
      const curveDir = (i % 2 === 0) ? 1 : -1;

      const colors = ['#991B1B', '#B91C1C', '#DC2626', '#7F1D1D', '#450A0A', '#EF4444', '#F87171'];
      ctx.strokeStyle = colors[i % colors.length];
      ctx.lineWidth = 3 + (i % 6);
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.bezierCurveTo(
        sx + curveDir * 40, sy + len * 0.35,
        sx - curveDir * 30, sy + len * 0.70,
        sx + curveDir * 25, sy + len
      );
      ctx.stroke();
    }

    // Dynamic anime flame highlights
    for (let i = 0; i < 90; i++) {
      const sx = (i * 37) % 600;
      const sy = 1050 + (i * 41) % 920;
      ctx.strokeStyle = 'rgba(254, 202, 202, 0.65)';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(sx + 14, sy + 65);
      ctx.stroke();
    }
    ctx.restore();

    // 2. Ceremonial Pointed Boots (Khussa) (X: 640..1024, Y: 1024..2048)
    ctx.save();
    ctx.fillStyle = '#181E24';
    ctx.fillRect(640, 1024, 384, 1024);

    // Boot Leather Upper
    const bootGrad = ctx.createLinearGradient(660, 1100, 1000, 1500);
    bootGrad.addColorStop(0, '#991B1B');
    bootGrad.addColorStop(0.5, '#7F1D1D');
    bootGrad.addColorStop(1, '#1E293B');

    ctx.fillStyle = bootGrad;
    ctx.fillRect(660, 1080, 340, 480);

    // Upturned Golden Toe Cap
    const goldToeGrad = ctx.createLinearGradient(660, 1580, 1000, 1820);
    goldToeGrad.addColorStop(0, '#FEF08A');
    goldToeGrad.addColorStop(0.4, '#F59E0B');
    goldToeGrad.addColorStop(1, '#92400E');

    ctx.fillStyle = goldToeGrad;
    ctx.fillRect(660, 1580, 340, 240);
    ctx.strokeStyle = '#181414';
    ctx.lineWidth = 8;
    ctx.strokeRect(660, 1580, 340, 240);

    ctx.strokeStyle = '#141113';
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.moveTo(700, 1750);
    ctx.bezierCurveTo(780, 1790, 880, 1790, 960, 1710);
    ctx.bezierCurveTo(990, 1660, 970, 1620, 940, 1630);
    ctx.stroke();

    // Ankle Cuff & Brass Bells
    ctx.fillStyle = '#D97706';
    ctx.fillRect(660, 1840, 340, 190);
    ctx.strokeStyle = '#181414';
    ctx.lineWidth = 6;
    ctx.strokeRect(660, 1840, 340, 190);

    for (let gx = 680; gx <= 970; gx += 32) {
      for (let gy = 1860; gy <= 2010; gy += 42) {
        ctx.fillStyle = '#FEF08A';
        ctx.beginPath();
        ctx.arc(gx, gy, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#78350F';
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.strokeStyle = '#181414';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(gx - 6, gy + 3);
        ctx.lineTo(gx + 6, gy + 3);
        ctx.stroke();
      }
    }
    ctx.restore();

    // =========================================================================
    // QUADRANT 4: GOLD BROCADE YOKE, BELT, STREAMERS & CHĀMARA (1024..2048, 1024..2048)
    // =========================================================================
    // 1. Gold Brocade Chest Yoke (Galbandi) (X: 1040..1640, Y: 1040..1520)
    ctx.save();
    const yokeGrad = ctx.createRadialGradient(1340, 1280, 50, 1340, 1280, 280);
    yokeGrad.addColorStop(0, '#FEF08A');
    yokeGrad.addColorStop(0.35, '#F59E0B');
    yokeGrad.addColorStop(0.75, '#D97706');
    yokeGrad.addColorStop(1, '#92400E');

    ctx.fillStyle = yokeGrad;
    ctx.fillRect(1040, 1040, 600, 460);
    ctx.strokeStyle = '#141113';
    ctx.lineWidth = 8;
    ctx.strokeRect(1040, 1040, 600, 460);

    ctx.strokeStyle = '#FEF08A';
    ctx.lineWidth = 6;
    for (let a = 0; a < Math.PI * 2; a += Math.PI / 10) {
      ctx.beginPath();
      ctx.moveTo(1340, 1280);
      ctx.lineTo(1340 + Math.cos(a) * 220, 1280 + Math.sin(a) * 180);
      ctx.stroke();
    }

    for (let r = 80; r <= 200; r += 50) {
      for (let a = Math.PI * 0.15; a <= Math.PI * 0.85; a += 0.12) {
        ctx.fillStyle = '#FFFBEB';
        ctx.beginPath();
        ctx.arc(1340 + Math.cos(a) * r * 1.3, 1160 + Math.sin(a) * r, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#D97706';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    }
    ctx.restore();

    // 2. Ceremonial Jewel Medallion & Belt (X: 1040..1640, Y: 1540..1740)
    ctx.save();
    const beltGrad = ctx.createLinearGradient(1040, 1540, 1640, 1540);
    beltGrad.addColorStop(0, '#D97706');
    beltGrad.addColorStop(0.5, '#F59E0B');
    beltGrad.addColorStop(1, '#D97706');
    ctx.fillStyle = beltGrad;
    ctx.fillRect(1040, 1540, 600, 200);
    ctx.strokeStyle = '#181414';
    ctx.lineWidth = 8;
    ctx.strokeRect(1040, 1540, 600, 200);

    const medX = 1340, medY = 1640;
    ctx.fillStyle = '#FEF08A';
    ctx.beginPath();
    ctx.arc(medX, medY, 80, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#181414';
    ctx.lineWidth = 6;
    ctx.stroke();

    ctx.fillStyle = '#06B6D4';
    ctx.beginPath();
    ctx.arc(medX, medY, 55, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#DC2626';
    ctx.beginPath();
    ctx.arc(medX, medY, 32, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#FEF08A';
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.restore();

    // 3. Vibrant Festival Wrist Ribbon Streamers (X: 1660..2048, Y: 1040..1560)
    ctx.save();
    const ribbons = [
      { color: '#FBBF24', x: 1660 },
      { color: '#0284C7', x: 1755 },
      { color: '#F43F5E', x: 1850 },
      { color: '#10B981', x: 1945 },
    ];

    for (const rib of ribbons) {
      ctx.fillStyle = rib.color;
      ctx.fillRect(rib.x, 1040, 85, 520);
      ctx.strokeStyle = '#141113';
      ctx.lineWidth = 6;
      ctx.strokeRect(rib.x, 1040, 85, 520);

      for (let fy = 1080; fy <= 1520; fy += 60) {
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.25)';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(rib.x, fy);
        ctx.lineTo(rib.x + 85, fy + 15);
        ctx.stroke();

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(rib.x, fy - 4);
        ctx.lineTo(rib.x + 85, fy + 11);
        ctx.stroke();
      }

      ctx.fillStyle = '#0F1218';
      ctx.beginPath();
      ctx.moveTo(rib.x, 1560);
      ctx.lineTo(rib.x + 42.5, 1520);
      ctx.lineTo(rib.x + 85, 1560);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();

    // 4. Sacred Chāmara (Yak-Hair Fly-Whisk) (X: 1040..2048, Y: 1760..2048)
    ctx.save();
    const handleGrad = ctx.createLinearGradient(1040, 1880, 1480, 1880);
    handleGrad.addColorStop(0, '#B45309');
    handleGrad.addColorStop(0.3, '#F59E0B');
    handleGrad.addColorStop(0.6, '#FEF08A');
    handleGrad.addColorStop(0.8, '#F59E0B');
    handleGrad.addColorStop(1, '#92400E');

    ctx.fillStyle = handleGrad;
    ctx.fillRect(1040, 1850, 440, 60);
    ctx.strokeStyle = '#141113';
    ctx.lineWidth = 6;
    ctx.strokeRect(1040, 1850, 440, 60);

    for (let rx = 1070; rx <= 1450; rx += 35) {
      ctx.fillStyle = '#FEF08A';
      ctx.beginPath();
      ctx.arc(rx, 1880, 36, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

    const plumeGrad = ctx.createLinearGradient(1480, 1760, 2048, 2048);
    plumeGrad.addColorStop(0, '#F8FAFC');
    plumeGrad.addColorStop(0.5, '#E2E8F0');
    plumeGrad.addColorStop(1, '#CBD5E1');

    ctx.fillStyle = plumeGrad;
    ctx.fillRect(1480, 1760, 568, 288);
    ctx.strokeStyle = '#181414';
    ctx.lineWidth = 6;
    ctx.strokeRect(1480, 1760, 568, 288);

    for (let i = 0; i < 70; i++) {
      const py = 1770 + (i * 23) % 260;
      ctx.strokeStyle = (i % 2 === 0) ? '#94A3B8' : '#CBD5E1';
      ctx.lineWidth = 3 + (i % 4);
      ctx.beginPath();
      ctx.moveTo(1490, py);
      ctx.bezierCurveTo(1650, py - 20, 1850, py + 30, 2040, py);
      ctx.stroke();
    }
    ctx.restore();

    console.log('Lakhey 2048x2048 Atlas rendered.');
  });

  const canvasElement = await page.$('#c');
  const pngBuffer = await canvasElement.screenshot({ type: 'png' });

  const artSourcePath = path.resolve(__dirname, '../art-source/lakhey_cartoon_atlas.png');
  const publicPath = path.resolve(__dirname, '../public/models/lakhey_cartoon_atlas.png');

  fs.writeFileSync(artSourcePath, pngBuffer);
  fs.writeFileSync(publicPath, pngBuffer);

  console.log(`Saved Atlas to ${artSourcePath}`);
  await browser.close();
}

generateLakheyCartoonAtlas().catch(err => {
  console.error(err);
  process.exit(1);
});
