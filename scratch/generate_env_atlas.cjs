const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function main() {
  console.log('Generating Master 2048x2048 Modern Cartoon Kathmandu Environment Texture Atlas...');

  const browser = await chromium.launch({
    channel: 'msedge',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage({ viewport: { width: 2048, height: 2048 } });

  await page.setContent(`
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body, html { margin: 0; padding: 0; overflow: hidden; background: #000; }
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

    // Solid dark base
    ctx.fillStyle = '#100D12';
    ctx.fillRect(0, 0, 2048, 2048);

    // =========================================================================
    // QUADRANT 1: ARCHITECTURE & MASONRY (0..1024, 0..1024)
    // =========================================================================

    // 1. Dachi Appā Polished Red Terracotta Brickwork (0..512, 0..512)
    // Traditional high-fired smooth Malla veneer bricks with fine recessed mortar
    ctx.save();
    ctx.fillStyle = '#8B2E1E';
    ctx.fillRect(0, 0, 512, 512);

    const brickH = 24;
    const brickW = 56;
    const mortarColor = '#3A1810';
    const mortarHighlight = '#B24530';

    ctx.strokeStyle = mortarColor;
    ctx.lineWidth = 3;

    let row = 0;
    for (let y = 0; y < 512; y += brickH) {
      const offsetX = (row % 2 === 0) ? 0 : brickW / 2;
      for (let x = -brickW; x < 512 + brickW; x += brickW) {
        const bx = x + offsetX;
        // Individual brick subtle tone variation
        const toneRand = ((row * 13 + x * 7) % 7);
        const brickTones = ['#943422', '#862B1C', '#A03A26', '#7D2618', '#8E301F', '#A63F2A', '#802719'];
        ctx.fillStyle = brickTones[toneRand];
        ctx.fillRect(bx + 1.5, y + 1.5, brickW - 3, brickH - 3);

        // Cel-shaded brick top highlight
        ctx.fillStyle = mortarHighlight;
        ctx.fillRect(bx + 2, y + 2, brickW - 4, 3);

        // Cel-shaded bottom bevel shadow
        ctx.fillStyle = 'rgba(30, 8, 5, 0.45)';
        ctx.fillRect(bx + 2, y + brickH - 4, brickW - 4, 3);
      }
      // Horizontal mortar line
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(512, y);
      ctx.stroke();
      row++;
    }
    ctx.restore();

    // 2. Aged Weathered Clay Brick Wall (512..1024, 0..512)
    // Deeper terracotta alley character with vintage mortar accents
    ctx.save();
    ctx.fillStyle = '#6E2619';
    ctx.fillRect(512, 0, 512, 512);

    row = 0;
    for (let y = 0; y < 512; y += 28) {
      const offsetX = (row % 2 === 0) ? 0 : 32;
      for (let x = 512 - 64; x < 1024 + 64; x += 64) {
        const bx = x + offsetX;
        const toneRand = ((row * 17 + x * 11) % 5);
        const brickTones = ['#752B1D', '#642115', '#7F3122', '#5D1D12', '#6C2518'];
        ctx.fillStyle = brickTones[toneRand];
        ctx.fillRect(bx + 2, y + 2, 60, 24);

        // Weathering patina spots
        if ((row + x) % 9 === 0) {
          ctx.fillStyle = 'rgba(40, 50, 30, 0.35)'; // moss patina
          ctx.fillRect(bx + 4, y + 4, 25, 12);
        }
      }
      row++;
    }
    ctx.restore();

    // 3. Nepalese Clay Roof Tiles (Chhajja) (0..512, 512..1024)
    // Overlapping traditional terracotta barrel tiles
    ctx.save();
    ctx.fillStyle = '#5A2016';
    ctx.fillRect(0, 512, 512, 512);

    const tileH = 32;
    const tileW = 22;
    for (let y = 512; y < 1024; y += tileH) {
      for (let x = 0; x < 512; x += tileW) {
        // Curved tile gradient
        const tGrad = ctx.createLinearGradient(x, y, x + tileW, y);
        tGrad.addColorStop(0, '#3E150D');
        tGrad.addColorStop(0.3, '#782E20');
        tGrad.addColorStop(0.7, '#8C3727');
        tGrad.addColorStop(1, '#3A130B');

        ctx.fillStyle = tGrad;
        ctx.beginPath();
        ctx.roundRect(x + 1, y + 2, tileW - 2, tileH - 4, [4, 4, 1, 1]);
        ctx.fill();

        // Tile lower rim highlight
        ctx.fillStyle = '#A34330';
        ctx.fillRect(x + 2, y + tileH - 4, tileW - 4, 2.5);
      }
      // Shadow cast on row below
      ctx.fillStyle = 'rgba(15, 5, 3, 0.65)';
      ctx.fillRect(0, y + tileH - 2, 512, 4);
    }
    ctx.restore();

    // 4. Carved Sal-Wood Timber Beams & Pillars (512..1024, 512..1024)
    // Traditional dark polished Sal hardwood with carved relief fluting
    ctx.save();
    const woodGrad = ctx.createLinearGradient(512, 512, 1024, 1024);
    woodGrad.addColorStop(0, '#281710');
    woodGrad.addColorStop(0.5, '#1E110B');
    woodGrad.addColorStop(1, '#150A06');
    ctx.fillStyle = woodGrad;
    ctx.fillRect(512, 512, 512, 512);

    // Carved woodgrain streaks
    for (let i = 0; i < 90; i++) {
      const gx = 520 + (i * 17) % 480;
      const gy = 520 + (i * 29) % 480;
      const gw = 40 + (i * 19) % 180;
      ctx.fillStyle = (i % 2 === 0) ? '#382017' : '#1A0E09';
      ctx.fillRect(gx, gy, gw, 3 + (i % 3));
    }

    // Traditional Newar lotus flower beam carving medallions
    for (let cy = 560; cy < 1024; cy += 110) {
      for (let cx = 560; cx < 1024; cx += 110) {
        ctx.fillStyle = '#3F251A';
        ctx.beginPath();
        ctx.arc(cx, cy, 28, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#5A3626';
        ctx.lineWidth = 3;
        ctx.stroke();

        // 8 Petals
        for (let p = 0; p < 8; p++) {
          const ang = (p / 8) * Math.PI * 2;
          ctx.fillStyle = '#4E2D1F';
          ctx.beginPath();
          ctx.arc(cx + Math.cos(ang) * 16, cy + Math.sin(ang) * 16, 7, 0, Math.PI * 2);
          ctx.fill();
        }

        // Center Brass Boss
        ctx.fillStyle = '#D97706';
        ctx.beginPath();
        ctx.arc(cx, cy, 6, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();

    // =========================================================================
    // QUADRANT 2: WINDOWS, SHRINES & LANTERNS (1024..2048, 0..1024)
    // =========================================================================

    // 1. San Jhyā Classic Carved Projecting Bay Window (1024..1536, 0..512)
    ctx.save();
    // Dark timber surrounding frame
    ctx.fillStyle = '#22140D';
    ctx.fillRect(1024, 0, 512, 512);

    // Outer carved frame border with gold accents
    ctx.strokeStyle = '#92400E';
    ctx.lineWidth = 8;
    ctx.strokeRect(1040, 20, 480, 472);

    // Arched Peacock Lintel Top
    ctx.fillStyle = '#2F1B12';
    ctx.beginPath();
    ctx.moveTo(1060, 110);
    ctx.bezierCurveTo(1160, 30, 1400, 30, 1500, 110);
    ctx.lineTo(1500, 130);
    ctx.lineTo(1060, 130);
    ctx.closePath();
    ctx.fill();

    // Golden Peacock Crest in center of lintel
    ctx.fillStyle = '#F59E0B';
    ctx.beginPath();
    ctx.arc(1280, 75, 22, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#FEF08A';
    ctx.lineWidth = 3;
    ctx.stroke();

    // 3 Bay Window Panes with Intricate Diamond Lattice & Candlelit Glow
    const bayW = 125;
    const bayH = 280;
    const bayY = 150;
    const bayXOffsets = [1075, 1217, 1360];

    for (let b = 0; b < 3; b++) {
      const bx = bayXOffsets[b];

      ctx.save();
      ctx.beginPath();
      ctx.rect(bx, bayY, bayW, bayH);
      ctx.clip();

      // Warm candlelit golden interior glow
      const glowGrad = ctx.createRadialGradient(bx + bayW / 2, bayY + bayH / 2, 10, bx + bayW / 2, bayY + bayH / 2, bayW);
      glowGrad.addColorStop(0, '#FEF08A');
      glowGrad.addColorStop(0.3, '#F59E0B');
      glowGrad.addColorStop(0.7, '#D97706');
      glowGrad.addColorStop(1, '#78350F');

      ctx.fillStyle = glowGrad;
      ctx.fillRect(bx, bayY, bayW, bayH);

      // Fine Dark Wood Lattice Grille (Jhyā-gāh)
      ctx.strokeStyle = '#180E09';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      for (let lx = -bayH; lx < bayW + bayH; lx += 18) {
        ctx.moveTo(bx + lx, bayY);
        ctx.lineTo(bx + lx + bayH, bayY + bayH);
        ctx.moveTo(bx + lx, bayY + bayH);
        ctx.lineTo(bx + lx + bayH, bayY);
      }
      ctx.stroke();

      // Bay Window Timber Frame Inner Border
      ctx.strokeStyle = '#3E2417';
      ctx.lineWidth = 6;
      ctx.strokeRect(bx, bayY, bayW, bayH);
      ctx.restore();
    }

    // Carved Sill Brackets along bottom of window
    ctx.fillStyle = '#331D12';
    ctx.fillRect(1055, 440, 450, 45);
    for (let k = 1080; k <= 1480; k += 50) {
      ctx.fillStyle = '#48291B';
      ctx.fillRect(k, 445, 24, 35);
      ctx.fillStyle = '#D97706';
      ctx.beginPath();
      ctx.arc(k + 12, 470, 4, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // 2. Aki Jhyā Delicate Lattice Screen & Shutters (1536..2048, 0..512)
    ctx.save();
    ctx.fillStyle = '#24150E';
    ctx.fillRect(1536, 0, 512, 512);

    // Warm candle glow background
    const akiGlow = ctx.createRadialGradient(1792, 256, 20, 1792, 256, 260);
    akiGlow.addColorStop(0, '#FEF9C3');
    akiGlow.addColorStop(0.35, '#FBBF24');
    akiGlow.addColorStop(0.75, '#B45309');
    akiGlow.addColorStop(1, '#451A03');
    ctx.fillStyle = akiGlow;
    ctx.fillRect(1560, 40, 464, 432);

    // Fine square cross-hatching lattice
    ctx.strokeStyle = '#150B07';
    ctx.lineWidth = 4;
    ctx.beginPath();
    for (let x = 1560; x <= 2024; x += 16) {
      ctx.moveTo(x, 40);
      ctx.lineTo(x, 472);
    }
    for (let y = 40; y <= 472; y += 16) {
      ctx.moveTo(1560, y);
      ctx.lineTo(2024, y);
    }
    ctx.stroke();

    // Timber shutters frame
    ctx.strokeStyle = '#3F2417';
    ctx.lineWidth = 12;
    ctx.strokeRect(1560, 40, 464, 432);
    ctx.restore();

    // 3. Ceremonial Torana Arch Pediment & Golden Gajur (1024..1536, 512..1024)
    ctx.save();
    ctx.fillStyle = '#1D1217';
    ctx.fillRect(1024, 512, 512, 512);

    // Arch base
    const toranaGrad = ctx.createRadialGradient(1280, 800, 40, 1280, 800, 220);
    toranaGrad.addColorStop(0, '#F59E0B');
    toranaGrad.addColorStop(0.5, '#D97706');
    toranaGrad.addColorStop(0.85, '#78350F');
    toranaGrad.addColorStop(1, '#2D1609');

    ctx.fillStyle = toranaGrad;
    ctx.beginPath();
    ctx.arc(1280, 820, 200, Math.PI, 0, false);
    ctx.closePath();
    ctx.fill();

    // Mythical Chhepu Face / Kirtimukha at Apex
    ctx.fillStyle = '#FEF08A';
    ctx.beginPath();
    ctx.ellipse(1280, 660, 45, 35, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#92400E';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Chhepu fangs & horns
    ctx.fillStyle = '#FFF';
    ctx.beginPath();
    ctx.moveTo(1260, 680); ctx.lineTo(1255, 705); ctx.lineTo(1270, 685);
    ctx.moveTo(1300, 680); ctx.lineTo(1305, 705); ctx.lineTo(1290, 685);
    ctx.fill();

    // Golden Gajur Pinnacle Spire (1280, 520..620)
    const gajurGrad = ctx.createLinearGradient(1260, 520, 1300, 620);
    gajurGrad.addColorStop(0, '#FEF08A');
    gajurGrad.addColorStop(0.4, '#F59E0B');
    gajurGrad.addColorStop(1, '#B45309');

    ctx.fillStyle = gajurGrad;
    ctx.beginPath();
    ctx.moveTo(1280, 525);
    ctx.lineTo(1305, 620);
    ctx.lineTo(1255, 620);
    ctx.closePath();
    ctx.fill();

    // Ruby cabochon in Gajur spire
    ctx.fillStyle = '#E11D48';
    ctx.beginPath();
    ctx.arc(1280, 570, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#FEF08A';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.restore();

    // 4. Street Lanterns & Glowing Butter Lamps (1536..2048, 512..1024)
    ctx.save();
    ctx.fillStyle = '#161219';
    ctx.fillRect(1536, 512, 512, 512);

    // Glowing Lantern Amber Glass Face
    const lampGlow = ctx.createRadialGradient(1792, 768, 15, 1792, 768, 190);
    lampGlow.addColorStop(0, '#FFFFFF');
    lampGlow.addColorStop(0.2, '#FEF08A');
    lampGlow.addColorStop(0.55, '#F59E0B');
    lampGlow.addColorStop(0.85, '#D97706');
    lampGlow.addColorStop(1, '#451A03');

    ctx.fillStyle = lampGlow;
    ctx.beginPath();
    ctx.roundRect(1650, 620, 284, 296, 24);
    ctx.fill();

    // Brass filigree lantern frame
    ctx.strokeStyle = '#27150C';
    ctx.lineWidth = 14;
    ctx.strokeRect(1650, 620, 284, 296);

    ctx.beginPath();
    ctx.moveTo(1650, 620); ctx.lineTo(1934, 916);
    ctx.moveTo(1934, 620); ctx.lineTo(1650, 916);
    ctx.stroke();

    // Center Flame
    ctx.fillStyle = '#FEF08A';
    ctx.beginPath();
    ctx.ellipse(1792, 768, 22, 36, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // =========================================================================
    // QUADRANT 3: ROADWAYS, PAVEMENT & WALLS (0..1024, 1024..2048)
    // =========================================================================

    // 1. Weathered Kathmandu Flagstone Pavement (0..512, 1024..1536)
    ctx.save();
    ctx.fillStyle = '#22252B';
    ctx.fillRect(0, 1024, 512, 512);

    // Chiseled Granite Slabs with Cel-Shaded Joints
    const slabH = 48;
    const slabW = 96;
    row = 0;
    for (let y = 1024; y < 1536; y += slabH) {
      const offsetX = (row % 2 === 0) ? 0 : slabW / 2;
      for (let x = -slabW; x < 512 + slabW; x += slabW) {
        const sx = x + offsetX;
        const toneRand = ((row * 7 + x * 13) % 6);
        const slabTones = ['#2C3038', '#252830', '#343A44', '#21242A', '#383E49', '#282C34'];
        ctx.fillStyle = slabTones[toneRand];
        ctx.fillRect(sx + 2, y + 2, slabW - 4, slabH - 4);

        // Chiseled slab edge highlights
        ctx.fillStyle = '#474F5D';
        ctx.fillRect(sx + 3, y + 3, slabW - 6, 2.5);

        // Dark mortar furrow
        ctx.fillStyle = '#121417';
        ctx.fillRect(sx + 3, y + slabH - 5, slabW - 6, 3);
      }
      row++;
    }
    ctx.restore();

    // 2. Terracotta Sandstone Pavers & Curbs (512..1024, 1024..1536)
    ctx.save();
    ctx.fillStyle = '#3E2A22';
    ctx.fillRect(512, 1024, 512, 512);

    for (let y = 1024; y < 1536; y += 40) {
      for (let x = 512; x < 1024; x += 70) {
        const paverTones = ['#4A3329', '#3D2820', '#553B30', '#36231C', '#4F362C'];
        const pIdx = ((x * 3 + y * 5) % 5);
        ctx.fillStyle = paverTones[pIdx];
        ctx.fillRect(x + 2, y + 2, 66, 36);

        // Highlight
        ctx.fillStyle = '#6E493B';
        ctx.fillRect(x + 3, y + 3, 64, 2.5);
      }
    }
    ctx.restore();

    // 3. River Causeway Granite & Stone Balustrades (0..512, 1536..2048)
    ctx.save();
    ctx.fillStyle = '#30343C';
    ctx.fillRect(0, 1536, 512, 512);

    // Weathered bridge granite with water-washed stains
    for (let i = 0; i < 70; i++) {
      const sx = (i * 29) % 480;
      const sy = 1540 + (i * 37) % 480;
      ctx.fillStyle = (i % 3 === 0) ? '#242830' : ((i % 3 === 1) ? '#3C424C' : '#1C2026');
      ctx.fillRect(sx, sy, 35 + (i % 40), 18 + (i % 25));
    }

    // Carved lotus balustrade relief circles
    for (let cy = 1580; cy < 2048; cy += 120) {
      for (let cx = 60; cx < 512; cx += 120) {
        ctx.fillStyle = '#22262E';
        ctx.beginPath();
        ctx.arc(cx, cy, 32, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#474E5B';
        ctx.lineWidth = 4;
        ctx.stroke();

        ctx.fillStyle = '#3E4551';
        ctx.beginPath();
        ctx.arc(cx, cy, 14, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();

    // 4. Mossy Mountain Stone Retaining Wall (512..1024, 1536..2048)
    ctx.save();
    ctx.fillStyle = '#282F26';
    ctx.fillRect(512, 1536, 512, 512);

    // Irregular alpine stone masonry
    for (let y = 1536; y < 2048; y += 45) {
      for (let x = 512; x < 1024; x += 75) {
        const stoneTones = ['#30382E', '#2A3328', '#384236', '#222B20', '#3D473A'];
        ctx.fillStyle = stoneTones[(x + y) % stoneTones.length];
        ctx.fillRect(x + 2, y + 2, 71, 41);

        // Lush green alpine moss patches
        if ((x + y) % 7 === 0 || (x + y) % 11 === 0) {
          ctx.fillStyle = '#3E6633';
          ctx.beginPath();
          ctx.arc(x + 20, y + 20, 14, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#5A8F48';
          ctx.beginPath();
          ctx.arc(x + 22, y + 18, 7, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
    ctx.restore();

    // =========================================================================
    // QUADRANT 4: PROPS, OBSTACLES & BIOME ACCESSORIES (1024..2048, 1024..2048)
    // =========================================================================

    // 1. Obstacle Timber & Festive Warning Chevrons (1024..1536, 1024..1536)
    ctx.save();
    ctx.fillStyle = '#3B271E';
    ctx.fillRect(1024, 1024, 512, 512);

    // Heavy weathered woodgrain
    for (let y = 1030; y < 1530; y += 22) {
      ctx.fillStyle = (y % 44 === 0) ? '#4A3227' : '#2A1B14';
      ctx.fillRect(1024, y, 512, 8);
    }

    // Bold Festive Hazard Chevrons (Gold & Crimson Warning Bands)
    ctx.save();
    ctx.beginPath();
    ctx.rect(1024, 1140, 512, 120);
    ctx.clip();

    ctx.fillStyle = '#DC2626'; // Festival Crimson
    ctx.fillRect(1024, 1140, 512, 120);

    ctx.fillStyle = '#F59E0B'; // Saffron Gold
    for (let cx = 1000; cx < 1600; cx += 60) {
      ctx.beginPath();
      ctx.moveTo(cx, 1140);
      ctx.lineTo(cx + 30, 1140);
      ctx.lineTo(cx + 70, 1260);
      ctx.lineTo(cx + 40, 1260);
      ctx.closePath();
      ctx.fill();
    }

    ctx.strokeStyle = '#180F0B';
    ctx.lineWidth = 6;
    ctx.strokeRect(1024, 1140, 512, 120);
    ctx.restore();

    // Brass Reinforcing Corner Brackets & Heavy Iron Rivets
    for (const rx of [1040, 1500]) {
      for (const ry of [1040, 1500]) {
        ctx.fillStyle = '#D97706';
        ctx.fillRect(rx - 15, ry - 15, 30, 30);
        ctx.fillStyle = '#18110D';
        ctx.beginPath();
        ctx.arc(rx, ry, 6, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();

    // 2. Painted Terracotta Pot (Matka) & Barrel (1536..2048, 1024..1536)
    ctx.save();
    const potGrad = ctx.createLinearGradient(1536, 1024, 2048, 1536);
    potGrad.addColorStop(0, '#9A3412');
    potGrad.addColorStop(0.5, '#C2410C');
    potGrad.addColorStop(1, '#7C2D12');
    ctx.fillStyle = potGrad;
    ctx.fillRect(1536, 1024, 512, 512);

    // Traditional White/Cream Rice-Paste (*Aipon*) Festival Patterns
    ctx.strokeStyle = '#FEF08A';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(1536, 1150); ctx.lineTo(2048, 1150);
    ctx.moveTo(1536, 1390); ctx.lineTo(2048, 1390);
    ctx.stroke();

    // Lotus Diamond Band
    for (let px = 1536; px < 2048; px += 48) {
      ctx.fillStyle = '#FFFBEB';
      ctx.beginPath();
      ctx.moveTo(px + 24, 1210);
      ctx.lineTo(px + 44, 1270);
      ctx.lineTo(px + 24, 1330);
      ctx.lineTo(px + 4, 1270);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#DC2626';
      ctx.beginPath();
      ctx.arc(px + 24, 1270, 8, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // 3. Gilded Bronze Prayer Wheel (Mani Khorlo) (1024..1536, 1536..2048)
    ctx.save();
    const wheelGrad = ctx.createLinearGradient(1024, 1536, 1536, 2048);
    wheelGrad.addColorStop(0, '#FEF08A');
    wheelGrad.addColorStop(0.3, '#F59E0B');
    wheelGrad.addColorStop(0.7, '#D97706');
    wheelGrad.addColorStop(1, '#78350F');

    ctx.fillStyle = wheelGrad;
    ctx.fillRect(1024, 1536, 512, 512);

    // Embossed Sacred Tibetan Mantra Calligraphy (*Om Mani Padme Hum*)
    ctx.strokeStyle = '#451A03';
    ctx.lineWidth = 6;
    for (let my = 1600; my < 2000; my += 85) {
      ctx.beginPath();
      for (let mx = 1040; mx < 1520; mx += 65) {
        ctx.moveTo(mx, my + 10);
        ctx.bezierCurveTo(mx + 15, my - 20, mx + 35, my + 30, mx + 50, my);
      }
      ctx.stroke();

      // Turquoise & Coral Jewel Cabochons
      for (let jx = 1070; jx < 1520; jx += 130) {
        ctx.fillStyle = '#06B6D4'; // Turquoise
        ctx.beginPath();
        ctx.arc(jx, my, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#FEF08A';
        ctx.lineWidth = 3;
        ctx.stroke();
      }
    }

    // Top & Bottom Lotus Petal Bands
    for (const by of [1546, 2016]) {
      ctx.fillStyle = '#B45309';
      ctx.fillRect(1024, by, 512, 24);
    }
    ctx.restore();

    // 4. 5-Color Tibetan Prayer Flags & Pine Foliage (1536..2048, 1536..2048)
    ctx.save();
    // Split into 5 vertical Lung-ta flag stripes
    const flagW = 512 / 5;
    const flagColors = ['#1D4ED8', '#F8FAFC', '#DC2626', '#16A34A', '#EAB308'];
    const flagNames = ['Blue', 'White', 'Red', 'Green', 'Yellow'];

    for (let f = 0; f < 5; f++) {
      const fx = 1536 + f * flagW;
      ctx.fillStyle = flagColors[f];
      ctx.fillRect(fx, 1536, flagW, 256);

      // Sacred Wind-Horse (Lung-ta) Stylized Graphic Icon in center
      ctx.fillStyle = (f === 1) ? '#1E293B' : '#FEF08A';
      ctx.beginPath();
      ctx.ellipse(fx + flagW / 2, 1664, 22, 34, 0, 0, Math.PI * 2);
      ctx.fill();

      // Mantra text lines
      ctx.fillStyle = (f === 1) ? 'rgba(30, 41, 59, 0.65)' : 'rgba(255, 255, 255, 0.75)';
      for (let ly = 1720; ly < 1780; ly += 14) {
        ctx.fillRect(fx + 10, ly, flagW - 20, 3);
      }
    }

    // Lower half: Himalayan Pine Needle Foliage & Bark (1536..2048, 1792..2048)
    const foliageGrad = ctx.createLinearGradient(1536, 1792, 2048, 2048);
    foliageGrad.addColorStop(0, '#064E3B');
    foliageGrad.addColorStop(0.5, '#065F46');
    foliageGrad.addColorStop(1, '#022C22');
    ctx.fillStyle = foliageGrad;
    ctx.fillRect(1536, 1792, 512, 256);

    // Pine needle clumps
    for (let i = 0; i < 180; i++) {
      const nx = 1540 + (i * 23) % 490;
      const ny = 1800 + (i * 19) % 230;
      ctx.strokeStyle = (i % 2 === 0) ? '#10B981' : '#34D399';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(nx, ny);
      ctx.lineTo(nx + 15, ny - 25);
      ctx.moveTo(nx, ny);
      ctx.lineTo(nx - 12, ny - 22);
      ctx.stroke();
    }
    ctx.restore();

    window.getTileDataUrl = function(x, y, w, h) {
      const tileCanvas = document.createElement('canvas');
      tileCanvas.width = w;
      tileCanvas.height = h;
      const tctx = tileCanvas.getContext('2d');
      tctx.drawImage(canvas, x, y, w, h, 0, 0, w, h);
      return tileCanvas.toDataURL('image/png');
    };

    console.log('Master Kathmandu Environment Texture Atlas 2048x2048 rendered successfully.');
  });

  const canvasHandle = await page.$('#c');
  const buffer = await canvasHandle.screenshot({ type: 'png' });

  const artPath = path.resolve(__dirname, '../art-source/kathmandu_env_atlas.png');
  const pubPath = path.resolve(__dirname, '../public/models/kathmandu_env_atlas.png');

  fs.writeFileSync(artPath, buffer);
  fs.writeFileSync(pubPath, buffer);
  console.log(`Saved Atlas to ${artPath} (${buffer.length} bytes)`);
  console.log(`Saved Atlas to ${pubPath} (${buffer.length} bytes)`);

  // Export 16 individual 512x512 texture files for seamless repeating materials
  const pubTexDir = path.resolve(__dirname, '../public/models/textures');
  const artTexDir = path.resolve(__dirname, '../art-source/textures');
  fs.mkdirSync(pubTexDir, { recursive: true });
  fs.mkdirSync(artTexDir, { recursive: true });

  const tiles = [
    { name: 'tex_brick_dachi.png', x: 0, y: 0, w: 512, h: 512 },
    { name: 'tex_brick_aged.png', x: 512, y: 0, w: 512, h: 512 },
    { name: 'tex_window_sanjhya.png', x: 1024, y: 0, w: 512, h: 512 },
    { name: 'tex_window_akijhya.png', x: 1536, y: 0, w: 512, h: 512 },
    { name: 'tex_roof_tiles.png', x: 0, y: 512, w: 512, h: 512 },
    { name: 'tex_timber_sal.png', x: 512, y: 512, w: 512, h: 512 },
    { name: 'tex_torana_crest.png', x: 1024, y: 512, w: 512, h: 512 },
    { name: 'tex_lantern_amber.png', x: 1536, y: 512, w: 512, h: 512 },
    { name: 'tex_road_flagstone.png', x: 0, y: 1024, w: 512, h: 512 },
    { name: 'tex_road_sandstone.png', x: 512, y: 1024, w: 512, h: 512 },
    { name: 'tex_hazard_chevron.png', x: 1024, y: 1024, w: 512, h: 512 },
    { name: 'tex_matka_pottery.png', x: 1536, y: 1024, w: 512, h: 512 },
    { name: 'tex_stone_bridge.png', x: 0, y: 1536, w: 512, h: 512 },
    { name: 'tex_stone_mossy.png', x: 512, y: 1536, w: 512, h: 512 },
    { name: 'tex_bronze_wheel.png', x: 1024, y: 1536, w: 512, h: 512 },
    { name: 'tex_prayer_flags.png', x: 1536, y: 1536, w: 512, h: 512 }
  ];

  for (const t of tiles) {
    const dataUrl = await page.evaluate(({ x, y, w, h }) => window.getTileDataUrl(x, y, w, h), t);
    const base64Data = dataUrl.replace(/^data:image\/png;base64,/, '');
    const tileBuf = Buffer.from(base64Data, 'base64');
    fs.writeFileSync(path.join(pubTexDir, t.name), tileBuf);
    fs.writeFileSync(path.join(artTexDir, t.name), tileBuf);
  }
  console.log(`Saved ${tiles.length} individual textures to ${pubTexDir} and ${artTexDir}`);

  await browser.close();
}

main().catch(err => {
  console.error('Atlas generation failed:', err);
  process.exit(1);
});
