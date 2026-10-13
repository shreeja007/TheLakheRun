const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function generateCartoonAtlas() {
  console.log('Generating 2048x2048 Modern Cartoon / Illustrated Texture Atlas for Tuku...');

  const browser = await chromium.launch({
    channel: 'msedge',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage({
    viewport: { width: 2048, height: 2048 }
  });

  // We set HTML with a full 2048x2048 canvas and run detailed canvas rendering code
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

    // Helper: Draw rounded rect
    function roundRect(ctx, x, y, w, h, r) {
      if (w < 2 * r) r = w / 2;
      if (h < 2 * r) r = h / 2;
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + w, y, x + w, y + h, r);
      ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r);
      ctx.arcTo(x, y, x + w, y, r);
      ctx.closePath();
    }

    // =========================================================================
    // ATLAS LAYOUT (2048 x 2048)
    // [0, 0, 1024, 1024]       : FACE & HEAD (Eyes, brows, mouth, skin, blush)
    // [1024, 0, 2048, 1024]    : TEAL JACKET & HOOD (Zippers, folds, Newar trim)
    // [0, 1024, 1024, 2048]    : PANTS & SNEAKERS (Cargo seams, knees, shoes)
    // [1024, 1024, 2048, 2048] : SHIRT, SCARF, SATCHEL & HAIR ACCENTS
    // =========================================================================

    // Base background
    ctx.fillStyle = '#181E24';
    ctx.fillRect(0, 0, 2048, 2048);

    // -------------------------------------------------------------------------
    // QUADRANT 1: FACE & HEAD (X: 0..1024, Y: 0..1024)
    // -------------------------------------------------------------------------
    // Skin Base (Warm Kathmandu Nepali Youth Tone)
    const skinGrad = ctx.createLinearGradient(0, 0, 0, 1024);
    skinGrad.addColorStop(0, '#D4A378');
    skinGrad.addColorStop(0.5, '#C9966A');
    skinGrad.addColorStop(1, '#B88258');
    ctx.fillStyle = skinGrad;
    ctx.fillRect(0, 0, 1024, 1024);

    // Soft Cel-Shade Chin / Jaw Shadow at bottom
    ctx.fillStyle = '#A36F49';
    ctx.beginPath();
    ctx.moveTo(0, 920);
    ctx.bezierCurveTo(300, 900, 724, 900, 1024, 920);
    ctx.lineTo(1024, 1024);
    ctx.lineTo(0, 1024);
    ctx.closePath();
    ctx.fill();

    // Cheek Peach / Coral Blush (Soft Anime Glow)
    function drawBlush(cx, cy, rx, ry) {
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, rx);
      grad.addColorStop(0, 'rgba(235, 120, 110, 0.42)');
      grad.addColorStop(0.6, 'rgba(235, 120, 110, 0.18)');
      grad.addColorStop(1, 'rgba(235, 120, 110, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
      ctx.fill();

      // Cute anime highlight streak on cheeks
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(cx - 20, cy - 8);
      ctx.lineTo(cx - 4, cy - 4);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx + 4, cy - 8);
      ctx.lineTo(cx + 20, cy - 4);
      ctx.stroke();
    }
    drawBlush(280, 520, 140, 80); // Left cheek
    drawBlush(744, 520, 140, 80); // Right cheek

    // Nose: Cute anime nose contour & highlight
    ctx.fillStyle = '#9C623E';
    ctx.beginPath();
    ctx.moveTo(512, 530);
    ctx.lineTo(498, 555);
    ctx.bezierCurveTo(506, 560, 518, 560, 526, 555);
    ctx.closePath();
    ctx.fill();
    // Nose highlight
    ctx.fillStyle = 'rgba(255, 240, 225, 0.65)';
    ctx.beginPath();
    ctx.ellipse(512, 534, 6, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    // Trickster Smirk / Grin (X: 390..634, Y: 620..710)
    // Dark outer lip contour
    ctx.strokeStyle = '#3D1C16';
    ctx.lineWidth = 9;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(410, 642);
    ctx.bezierCurveTo(460, 680, 564, 680, 624, 638);
    ctx.stroke();

    // Smile cavity fill
    ctx.fillStyle = '#611B1B';
    ctx.beginPath();
    ctx.moveTo(418, 644);
    ctx.bezierCurveTo(470, 682, 554, 682, 616, 642);
    ctx.bezierCurveTo(554, 650, 470, 650, 418, 644);
    ctx.closePath();
    ctx.fill();

    // Gleaming white tooth flash in smile
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.moveTo(442, 645);
    ctx.bezierCurveTo(490, 654, 540, 654, 588, 644);
    ctx.bezierCurveTo(540, 660, 490, 660, 442, 645);
    ctx.closePath();
    ctx.fill();

    // Cheeky corner smirk accent tick
    ctx.beginPath();
    ctx.moveTo(624, 638);
    ctx.lineTo(636, 628);
    ctx.stroke();

    // Lower lip warmth shadow
    ctx.fillStyle = '#964E3D';
    ctx.beginPath();
    ctx.ellipse(512, 692, 45, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    // EYES: Stylized anime eyes with deep pupils, amber/honey iris, and star catchlights
    function drawAnimeEye(cx, cy, isLeft) {
      ctx.save();
      const flip = isLeft ? 1 : -1;

      // Sclera (Eye White)
      ctx.fillStyle = '#FAFCFF';
      ctx.beginPath();
      ctx.moveTo(cx - flip * 130, cy + 20);
      ctx.bezierCurveTo(cx - flip * 70, cy - 85, cx + flip * 70, cy - 85, cx + flip * 130, cy + 10);
      ctx.bezierCurveTo(cx + flip * 70, cy + 70, cx - flip * 70, cy + 70, cx - flip * 130, cy + 20);
      ctx.closePath();
      ctx.fill();

      // Top Sclera Ambient Occlusion (Upper eyelid shadow)
      ctx.fillStyle = 'rgba(70, 85, 115, 0.28)';
      ctx.beginPath();
      ctx.moveTo(cx - flip * 125, cy + 10);
      ctx.bezierCurveTo(cx - flip * 70, cy - 80, cx + flip * 70, cy - 80, cx + flip * 125, cy + 5);
      ctx.bezierCurveTo(cx + flip * 70, cy - 30, cx - flip * 70, cy - 30, cx - flip * 125, cy + 10);
      ctx.closePath();
      ctx.fill();

      // Iris (Warm Amber / Honey Hazel Gradient)
      const irisR = 64;
      const irisY = cy - 2;
      const irisGrad = ctx.createRadialGradient(cx, irisY + 15, 8, cx, irisY, irisR);
      irisGrad.addColorStop(0, '#FFD166'); // Bright golden core
      irisGrad.addColorStop(0.35, '#E08E2B'); // Warm amber
      irisGrad.addColorStop(0.75, '#853C12'); // Rich deep chestnut
      irisGrad.addColorStop(1, '#2B1207'); // Dark rim

      ctx.fillStyle = irisGrad;
      ctx.beginPath();
      ctx.ellipse(cx, irisY, irisR, irisR * 1.08, 0, 0, Math.PI * 2);
      ctx.fill();

      // Dark Outer Iris Ring
      ctx.strokeStyle = '#1F0B03';
      ctx.lineWidth = 6;
      ctx.stroke();

      // Pupil (Deep obsidian black)
      ctx.fillStyle = '#0F0502';
      ctx.beginPath();
      ctx.ellipse(cx, irisY - 4, 26, 32, 0, 0, Math.PI * 2);
      ctx.fill();

      // Iris intricate anime highlights (lower arc)
      ctx.strokeStyle = 'rgba(255, 230, 150, 0.7)';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(cx, irisY, irisR - 12, Math.PI * 0.25, Math.PI * 0.75);
      ctx.stroke();

      // Specular Catchlights (Crisp anime reflection shine)
      // Primary Catchlight (Upper Left)
      ctx.fillStyle = '#FFFFFF';
      ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.ellipse(cx - flip * 22, irisY - 24, 18, 14, isLeft ? -0.3 : 0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Secondary Catchlight (Lower Right)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.beginPath();
      ctx.arc(cx + flip * 24, irisY + 22, 9, 0, Math.PI * 2);
      ctx.fill();

      // Micro Specular Star Highlight
      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.beginPath();
      ctx.arc(cx - flip * 36, irisY - 4, 4.5, 0, Math.PI * 2);
      ctx.fill();

      // Top Eyeliner Contour (Thick stylized anime lash line)
      ctx.strokeStyle = '#120C10';
      ctx.lineWidth = 14;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(cx - flip * 135, cy + 22);
      ctx.bezierCurveTo(cx - flip * 70, cy - 88, cx + flip * 70, cy - 88, cx + flip * 135, cy - 6);
      ctx.stroke();

      // Winged Eyelash Flick
      ctx.lineWidth = 11;
      ctx.beginPath();
      ctx.moveTo(cx + flip * 125, cy - 2);
      ctx.quadraticCurveTo(cx + flip * 155, cy - 28, cx + flip * 168, cy - 38);
      ctx.stroke();

      // Lower Eyelash Accent
      ctx.lineWidth = 6;
      ctx.strokeStyle = '#2A1820';
      ctx.beginPath();
      ctx.moveTo(cx - flip * 60, cy + 62);
      ctx.quadraticCurveTo(cx, cy + 68, cx + flip * 80, cy + 50);
      ctx.stroke();

      // Eyelid crease line
      ctx.lineWidth = 5;
      ctx.strokeStyle = '#7D4734';
      ctx.beginPath();
      ctx.moveTo(cx - flip * 90, cy - 96);
      ctx.quadraticCurveTo(cx, cy - 114, cx + flip * 90, cy - 92);
      ctx.stroke();

      ctx.restore();
    }
    drawAnimeEye(310, 420, true);  // Left Eye
    drawAnimeEye(714, 420, false); // Right Eye

    // EYEBROWS: Dynamic angled hero eyebrows
    function drawEyebrow(cx, cy, isLeft) {
      ctx.save();
      const flip = isLeft ? 1 : -1;
      ctx.fillStyle = '#181B1F';
      ctx.beginPath();
      ctx.moveTo(cx - flip * 110, cy + 18);
      ctx.quadraticCurveTo(cx, cy - 32, cx + flip * 115, cy - 14);
      ctx.quadraticCurveTo(cx + flip * 70, cy - 10, cx - flip * 60, cy + 12);
      ctx.closePath();
      ctx.fill();

      // Subtle warm brown brow hair strokes
      ctx.strokeStyle = '#322521';
      ctx.lineWidth = 3;
      for (let i = -80; i <= 80; i += 24) {
        ctx.beginPath();
        ctx.moveTo(cx + flip * i, cy);
        ctx.lineTo(cx + flip * (i + 14), cy - 16);
        ctx.stroke();
      }
      ctx.restore();
    }
    drawEyebrow(310, 270, true);
    drawEyebrow(714, 270, false);


    // -------------------------------------------------------------------------
    // QUADRANT 2: TEAL BOMBER JACKET & HOOD (X: 1024..2048, Y: 0..1024)
    // -------------------------------------------------------------------------
    // Base Teal Canvas with fabric weave texture
    const jacketGrad = ctx.createLinearGradient(1024, 0, 1024, 1024);
    jacketGrad.addColorStop(0, '#2F8582');   // Bright dusty teal shoulder/chest
    jacketGrad.addColorStop(0.5, '#267370'); // Core body teal
    jacketGrad.addColorStop(1, '#1A5350');   // Lower shadow rim
    ctx.fillStyle = jacketGrad;
    ctx.fillRect(1024, 0, 1024, 1024);

    // Subtle fabric canvas micro-weave pattern
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.lineWidth = 2;
    for (let y = 0; y < 1024; y += 12) {
      ctx.beginPath();
      ctx.moveTo(1024, y);
      ctx.lineTo(2048, y);
      ctx.stroke();
    }
    for (let x = 1024; x < 2048; x += 12) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 1024);
      ctx.stroke();
    }

    // Stylized Cel-Shaded Cloth Folds & Wrinkles
    function drawClothFold(x0, y0, cx, cy, x1, y1, width) {
      // Dark crease shadow
      ctx.strokeStyle = 'rgba(15, 45, 43, 0.65)';
      ctx.lineWidth = width;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.quadraticCurveTo(cx, cy, x1, y1);
      ctx.stroke();

      // Sharp highlight ridge immediately adjacent (Cel-shade look!)
      ctx.strokeStyle = 'rgba(92, 214, 208, 0.45)';
      ctx.lineWidth = width * 0.55;
      ctx.beginPath();
      ctx.moveTo(x0 - 3, y0 - 3);
      ctx.quadraticCurveTo(cx - 3, cy - 3, x1 - 3, y1 - 3);
      ctx.stroke();
    }

    // Back Yoke Seam
    drawClothFold(1060, 220, 1536, 260, 2012, 220, 8);
    drawClothFold(1080, 250, 1536, 280, 1992, 250, 5);

    // Underarm and Torso side creases
    drawClothFold(1120, 480, 1260, 540, 1340, 620, 10);
    drawClothFold(1952, 480, 1812, 540, 1732, 620, 10);
    drawClothFold(1160, 720, 1280, 780, 1400, 840, 9);
    drawClothFold(1912, 720, 1792, 780, 1672, 840, 9);

    // Center Front Zipper Track & Slider (X: 1510..1562, Y: 180..960)
    ctx.fillStyle = '#163E3C'; // Zipper tape
    ctx.fillRect(1518, 180, 36, 780);

    // Silver metallic zipper teeth alternating left/right
    ctx.fillStyle = '#D6DEE6';
    ctx.strokeStyle = '#697A8D';
    ctx.lineWidth = 1;
    for (let y = 190; y < 950; y += 14) {
      // Left tooth
      ctx.fillRect(1522, y, 12, 7);
      ctx.strokeRect(1522, y, 12, 7);
      // Right tooth
      ctx.fillRect(1538, y + 7, 12, 7);
      ctx.strokeRect(1538, y + 7, 12, 7);
    }

    // Metallic Zipper Slider at mid-chest (Y: 520)
    ctx.fillStyle = '#BAC7D5';
    roundRect(ctx, 1524, 510, 24, 38, 4);
    ctx.fill();
    ctx.strokeStyle = '#485766';
    ctx.lineWidth = 2;
    ctx.stroke();
    // Zipper pull tab hanging down
    ctx.fillStyle = '#8E9DAE';
    roundRect(ctx, 1528, 548, 16, 42, 3);
    ctx.fill();
    ctx.stroke();
    // Pull tab hole
    ctx.fillStyle = '#163E3C';
    ctx.beginPath();
    ctx.ellipse(1536, 574, 4, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Traditional Newar Geometric Border Pattern (Cuffs, collar & hem band)
    // Band 1: Bottom hem band (Y: 960..1024)
    ctx.fillStyle = '#17403E';
    ctx.fillRect(1024, 960, 1024, 64);

    // Traditional Marigold & Brick Red Geometric Diamond Trim
    ctx.fillStyle = '#DEA94B'; // Marigold Brass
    for (let x = 1040; x < 2048; x += 48) {
      ctx.beginPath();
      ctx.moveTo(x, 992);
      ctx.lineTo(x + 16, 974);
      ctx.lineTo(x + 32, 992);
      ctx.lineTo(x + 16, 1010);
      ctx.closePath();
      ctx.fill();

      // Inner Red Diamond core
      ctx.fillStyle = '#8A3C46';
      ctx.beginPath();
      ctx.moveTo(x + 8, 992);
      ctx.lineTo(x + 16, 982);
      ctx.lineTo(x + 24, 992);
      ctx.lineTo(x + 16, 1002);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#DEA94B';
    }

    // Traditional Newar Border Trim on upper cuffs (Y: 60..120)
    ctx.fillStyle = '#17403E';
    ctx.fillRect(1024, 60, 1024, 60);
    ctx.fillStyle = '#DEA94B';
    for (let x = 1032; x < 2048; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 90);
      ctx.lineTo(x + 12, 74);
      ctx.lineTo(x + 24, 90);
      ctx.lineTo(x + 12, 106);
      ctx.closePath();
      ctx.fill();
    }


    // -------------------------------------------------------------------------
    // QUADRANT 3: PANTS & SNEAKERS (X: 0..1024, Y: 1024..2048)
    // -------------------------------------------------------------------------
    // Pants Twill Base (Deep Charcoal Twill #2B3237)
    ctx.fillStyle = '#2B3237';
    ctx.fillRect(0, 1024, 1024, 600);

    // Charcoal pants seam stitch lines
    ctx.strokeStyle = '#181C1E';
    ctx.lineWidth = 6;
    // Outer leg seams
    ctx.beginPath();
    ctx.moveTo(80, 1024); ctx.lineTo(80, 1624);
    ctx.moveTo(432, 1024); ctx.lineTo(432, 1624);
    ctx.moveTo(592, 1024); ctx.lineTo(592, 1624);
    ctx.moveTo(944, 1024); ctx.lineTo(944, 1624);
    ctx.stroke();

    // Knee Articulation Creases & Seams
    drawClothFold(120, 1340, 256, 1390, 392, 1340, 8);
    drawClothFold(120, 1380, 256, 1430, 392, 1380, 7);
    drawClothFold(632, 1340, 768, 1390, 904, 1340, 8);
    drawClothFold(632, 1380, 768, 1430, 904, 1380, 7);

    // Cargo Pocket Flaps (Left and Right)
    function drawCargoPocket(x, y, w, h) {
      // Pocket body
      ctx.fillStyle = '#22282C';
      roundRect(ctx, x, y, w, h, 8);
      ctx.fill();
      ctx.strokeStyle = '#16191C';
      ctx.lineWidth = 4;
      ctx.stroke();

      // Pocket Flap
      ctx.fillStyle = '#1E2327';
      roundRect(ctx, x - 4, y - 6, w + 8, 38, 6);
      ctx.fill();
      ctx.stroke();

      // Metal snap button
      ctx.fillStyle = '#DEA94B'; // Brass rivet
      ctx.beginPath();
      ctx.arc(x + w / 2, y + 14, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#8C6728';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
    drawCargoPocket(140, 1140, 230, 160);
    drawCargoPocket(654, 1140, 230, 160);

    // Ribbed Ankle Cuffs (Y: 1560..1624)
    ctx.fillStyle = '#1D2226';
    ctx.fillRect(0, 1560, 1024, 64);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 3;
    for (let x = 8; x < 1024; x += 14) {
      ctx.beginPath();
      ctx.moveTo(x, 1560);
      ctx.lineTo(x, 1624);
      ctx.stroke();
    }

    // SNEAKERS TEXTURE REGION (Y: 1624..2048)
    // Left Sneaker: X: 0..512, Right Sneaker: X: 512..1024
    function drawSneakerTexture(startX) {
      // Upper Charcoal & Dusty Teal panels
      ctx.fillStyle = '#25292E';
      ctx.fillRect(startX, 1624, 512, 220);

      // Stylized Teal mesh panel
      ctx.fillStyle = '#246563';
      ctx.beginPath();
      ctx.moveTo(startX + 80, 1640);
      ctx.lineTo(startX + 432, 1640);
      ctx.lineTo(startX + 390, 1780);
      ctx.lineTo(startX + 120, 1780);
      ctx.closePath();
      ctx.fill();

      // Criss-Cross White Laces
      ctx.strokeStyle = '#F2EFEB';
      ctx.lineWidth = 8;
      ctx.lineCap = 'round';
      const laces = [
        [180, 1660, 332, 1680],
        [332, 1660, 180, 1680],
        [190, 1710, 322, 1730],
        [322, 1710, 190, 1730],
        [200, 1760, 312, 1775],
        [312, 1760, 200, 1775]
      ];
      for (const [x1, y1, x2, y2] of laces) {
        ctx.beginPath();
        ctx.moveTo(startX + x1, y1);
        ctx.lineTo(startX + x2, y2);
        ctx.stroke();
      }

      // Sculpted Cream EVA Midsole (Y: 1844..1980)
      const soleGrad = ctx.createLinearGradient(0, 1844, 0, 1980);
      soleGrad.addColorStop(0, '#ECE5D8');
      soleGrad.addColorStop(0.5, '#DDD5C4');
      soleGrad.addColorStop(1, '#C8BEAA');
      ctx.fillStyle = soleGrad;
      ctx.fillRect(startX, 1844, 512, 136);

      // Midsole geometric shock-absorption grooves
      ctx.strokeStyle = '#A89E8C';
      ctx.lineWidth = 5;
      for (let x = startX + 40; x < startX + 480; x += 55) {
        ctx.beginPath();
        ctx.moveTo(x, 1860);
        ctx.lineTo(x + 20, 1920);
        ctx.lineTo(x, 1970);
        ctx.stroke();
      }

      // Dark Rubber Outsole Tread (Y: 1980..2048)
      ctx.fillStyle = '#16181B';
      ctx.fillRect(startX, 1980, 512, 68);

      // Marigold Heel Pull Tab (X: startX + 220..292, Y: 1624..1680)
      ctx.fillStyle = '#DEA94B';
      roundRect(ctx, startX + 226, 1628, 60, 48, 6);
      ctx.fill();
      ctx.strokeStyle = '#966D24';
      ctx.lineWidth = 3;
      ctx.stroke();
    }
    drawSneakerTexture(0);
    drawSneakerTexture(512);


    // -------------------------------------------------------------------------
    // QUADRANT 4: SHIRT, SCARF, SATCHEL & HAIR ACCENTS (X: 1024..2048, Y: 1024..2048)
    // -------------------------------------------------------------------------
    // Sub-region 4A: Cream Longline Shirt (X: 1024..1536, Y: 1024..1536)
    const shirtGrad = ctx.createLinearGradient(1024, 1024, 1024, 1536);
    shirtGrad.addColorStop(0, '#FAF6EE');
    shirtGrad.addColorStop(0.5, '#EFE8DA');
    shirtGrad.addColorStop(1, '#DDD4C2');
    ctx.fillStyle = shirtGrad;
    ctx.fillRect(1024, 1024, 512, 512);

    // Vertical knit weave and soft cloth drape folds
    ctx.strokeStyle = 'rgba(165, 150, 130, 0.4)';
    ctx.lineWidth = 4;
    for (let x = 1060; x < 1510; x += 45) {
      ctx.beginPath();
      ctx.moveTo(x, 1024);
      ctx.quadraticCurveTo(x + 15, 1280, x - 5, 1536);
      ctx.stroke();
    }
    // Bottom hem double stitching
    ctx.strokeStyle = '#B8AC98';
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 6]);
    ctx.beginPath();
    ctx.moveTo(1024, 1510); ctx.lineTo(1536, 1510);
    ctx.moveTo(1024, 1518); ctx.lineTo(1536, 1518);
    ctx.stroke();
    ctx.setLineDash([]);

    // Sub-region 4B: Brick Maroon Cowl / Scarf (X: 1536..2048, Y: 1024..1536)
    const scarfGrad = ctx.createLinearGradient(1536, 1024, 1536, 1536);
    scarfGrad.addColorStop(0, '#9E4450');
    scarfGrad.addColorStop(0.5, '#8A3C46');
    scarfGrad.addColorStop(1, '#662730');
    ctx.fillStyle = scarfGrad;
    ctx.fillRect(1536, 1024, 512, 512);

    // Wool knit ribs
    ctx.strokeStyle = 'rgba(55, 15, 22, 0.45)';
    ctx.lineWidth = 6;
    for (let x = 1550; x < 2030; x += 32) {
      ctx.beginPath();
      ctx.moveTo(x, 1024);
      ctx.lineTo(x, 1536);
      ctx.stroke();
    }
    // Cross folds
    drawClothFold(1560, 1140, 1792, 1200, 2024, 1140, 8);
    drawClothFold(1560, 1360, 1792, 1420, 2024, 1360, 8);

    // Sub-region 4C: Crossbody Satchel (X: 1024..1536, Y: 1536..2048)
    ctx.fillStyle = '#222629'; // Heavy charcoal canvas
    ctx.fillRect(1024, 1536, 512, 512);

    // Satchel flap contour
    ctx.fillStyle = '#1B1E21';
    roundRect(ctx, 1056, 1568, 448, 280, 16);
    ctx.fill();
    ctx.strokeStyle = '#121416';
    ctx.lineWidth = 6;
    ctx.stroke();

    // Twin Webbing Straps with Brass Buckles
    function drawSatchelStrap(x) {
      // Nylon webbing strap
      ctx.fillStyle = '#15171A';
      ctx.fillRect(x, 1550, 48, 380);

      // Gleaming Marigold / Brass Slider Buckle
      ctx.fillStyle = '#DEA94B';
      roundRect(ctx, x - 4, 1800, 56, 36, 6);
      ctx.fill();
      ctx.strokeStyle = '#856220';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Buckle slot center
      ctx.fillStyle = '#15171A';
      roundRect(ctx, x + 6, 1808, 36, 20, 3);
      ctx.fill();
    }
    drawSatchelStrap(1140);
    drawSatchelStrap(1348);

    // Sub-region 4D: Dark Stylized Hair (X: 1536..2048, Y: 1536..2048)
    const hairGrad = ctx.createLinearGradient(1536, 1536, 1536, 2048);
    hairGrad.addColorStop(0, '#22272C');
    hairGrad.addColorStop(0.5, '#1A1D21');
    hairGrad.addColorStop(1, '#121417');
    ctx.fillStyle = hairGrad;
    ctx.fillRect(1536, 1536, 512, 512);

    // Subtle natural directional hair strand highlights
    ctx.strokeStyle = 'rgba(75, 88, 102, 0.45)';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    for (let x = 1550; x < 2030; x += 18) {
      ctx.beginPath();
      ctx.moveTo(x, 1560 + ((x * 7) % 80));
      ctx.lineTo(x + 12, 1980 - ((x * 5) % 60));
      ctx.stroke();
    }
  });

  // Export 2048x2048 canvas screenshot
  const targetPath1 = path.resolve(__dirname, '../art-source/tuku_cartoon_atlas.png');
  const targetPath2 = path.resolve(__dirname, '../public/models/tuku_cartoon_atlas.png');

  const canvasElem = await page.$('#c');
  const buffer = await canvasElem.screenshot({ type: 'png' });

  fs.writeFileSync(targetPath1, buffer);
  fs.writeFileSync(targetPath2, buffer);
  console.log(`Saved 2048x2048 cartoon texture atlas to:
- ${targetPath1}
- ${targetPath2} (${buffer.length} bytes)`);

  await browser.close();
}

generateCartoonAtlas().catch(err => {
  console.error('Atlas generation failed:', err);
  process.exit(1);
});
