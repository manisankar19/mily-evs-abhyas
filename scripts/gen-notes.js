// Generates the three shared banknote SVGs from one template.
// Usage: node scripts/gen-notes.js  (rewrites app/assets/shared-note-*.svg)
'use strict';
const fs = require('fs');
const path = require('path');
const OUT = path.join(__dirname, '..', 'app', 'assets');

const FONT = `"Noto Sans","Noto Sans Devanagari","Noto Sans Bengali","Noto Sans Gujarati","Noto Sans Gurmukhi","Noto Sans Kannada","Noto Sans Malayalam","Noto Sans Oriya","Noto Sans Tamil","Noto Sans Telugu","Noto Naskh Arabic","Noto Nastaliq Urdu",sans-serif`;

const THEMES = {
  100: { paper: '#ddd2ee', paper2: '#cbbce4', ink: '#45336a', soft: '#8e7bb5', light: '#efe9f8' },
  500: { paper: '#d6d2c8', paper2: '#c3beb2', ink: '#45413a', soft: '#8b857a', light: '#ece9e2' },
};

const r = n => Math.round(n * 10) / 10;

function head(title, desc, t) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 290" width="640" height="290" role="img">
<title>${title}</title>
<desc>${desc}</desc>
<style>
text{font-family:${FONT};fill:${t.ink}}
.b{font-weight:700}
.ln{fill:none;stroke:${t.ink};stroke-linecap:round;stroke-linejoin:round}
</style>
`;
}

// Note body: rounded paper, guilloche-style wavy lines, inner frame, corner blocks.
function body(t) {
  let s = `<rect x="8" y="8" width="624" height="274" rx="10" fill="${t.paper}" stroke="${t.ink}" stroke-width="2"/>
<rect x="18" y="18" width="604" height="254" rx="6" fill="none" stroke="${t.soft}" stroke-width="1.2"/>
<g fill="none" stroke="${t.paper2}" stroke-width="1.4">`;
  for (let i = 0; i < 6; i++) {
    const y = 60 + i * 38;
    s += `<path d="M20 ${y} C120 ${y - 18} 220 ${y + 18} 320 ${y} S520 ${y - 18} 620 ${y}"/>`;
  }
  s += `</g>\n`;
  // corner triangles
  s += `<g fill="${t.paper2}" stroke="${t.soft}" stroke-width="1">
<path d="M18 18 h28 L18 46 Z"/><path d="M622 18 h-28 L622 46 Z"/><path d="M18 272 h28 L18 244 Z"/><path d="M622 272 h-28 L622 244 Z"/>
</g>\n`;
  return s;
}

function specimen(t, cx, cy, k) {
  return `<g transform="translate(${cx} ${cy}) rotate(-16) scale(${k})" opacity="0.55">
<rect x="-130" y="-26" width="260" height="46" rx="6" fill="none" stroke="#b3262d" stroke-width="2.5"/>
<text x="0" y="10" text-anchor="middle" font-size="36" letter-spacing="7" class="b" style="fill:#b3262d">SPECIMEN</text>
</g>\n`;
}

// Star polygon used for a lion's mane.
function mane(cx, cy, ro, ri, n) {
  let d = '';
  for (let i = 0; i < n * 2; i++) {
    const a = (Math.PI * i) / n - Math.PI / 2;
    const rr = i % 2 ? ri : ro;
    d += (i ? 'L' : 'M') + r(cx + rr * Math.cos(a)) + ' ' + r(cy + rr * Math.sin(a));
  }
  return d + 'Z';
}

// Simplified Lion Capital: three lions on an abacus with a wheel, motto below.
// Drawn in local coordinates (0,0 = top centre), then placed with translate+scale.
function emblem(t, x, y, k) {
  const lion = (cx, dir) => {
    // dir: 0 front, -1 facing left, 1 facing right
    let g = `<path d="${mane(cx, 20, dir ? 12 : 13.5, dir ? 9 : 10.5, 11)}" fill="${t.soft}" stroke="${t.ink}" stroke-width="1"/>`;
    if (dir === 0) {
      g += `<ellipse cx="${cx}" cy="21" rx="6.5" ry="7.5" fill="${t.light}" stroke="${t.ink}" stroke-width="1"/>`
        + `<circle cx="${cx - 2.4}" cy="19" r="0.9" fill="${t.ink}"/><circle cx="${cx + 2.4}" cy="19" r="0.9" fill="${t.ink}"/>`
        + `<path class="ln" stroke-width="0.9" d="M${cx} 21 v2.5 M${cx - 2.2} 25 Q${cx} 26.8 ${cx + 2.2} 25"/>`;
    } else {
      const m = v => cx + dir * v;
      g += `<path d="M${cx} 13 Q${m(13)} 13 ${m(16)} 19 L${m(16)} 24 Q${m(12)} 28 ${cx} 28 Z" fill="${t.light}" stroke="${t.ink}" stroke-width="1"/>`
        + `<circle cx="${m(8)}" cy="17.5" r="0.9" fill="${t.ink}"/>`
        + `<path class="ln" stroke-width="0.8" d="M${m(15.5)} 23 L${m(10)} 24"/>`;
    }
    return g;
  };
  let s = `<g id="emblem" transform="translate(${x} ${y}) scale(${k})">
<rect x="-34" y="-4" width="68" height="104" rx="8" fill="${t.light}" stroke="${t.soft}" stroke-width="1"/>
<path d="M-30 52 L-27 30 Q0 22 27 30 L30 52 Z" fill="${t.soft}" stroke="${t.ink}" stroke-width="1"/>
<path class="ln" stroke-width="0.9" d="M-23 34 V52 M-17 34 V52 M-4 36 V52 M4 36 V52 M17 34 V52 M23 34 V52"/>
${lion(-17, -1)}${lion(17, 1)}${lion(0, 0)}
<rect x="-28" y="52" width="56" height="14" rx="2" fill="${t.paper2}" stroke="${t.ink}" stroke-width="1.2"/>
<circle cx="0" cy="59" r="5.5" fill="none" stroke="${t.ink}" stroke-width="1"/>`;
  for (let i = 0; i < 8; i++) {
    const a = (Math.PI * i) / 4;
    s += `<line x1="0" y1="59" x2="${r(5.5 * Math.cos(a))}" y2="${r(59 + 5.5 * Math.sin(a))}" stroke="${t.ink}" stroke-width="0.6"/>`;
  }
  // small bull (left) and horse (right) on the abacus, as simple outlines
  s += `<path d="M-24 63 l2 -5 h8 l2 -2 l1 2 v5" class="ln" stroke-width="0.9"/>
<path d="M24 63 l-2 -5 h-8 l-1 -3 l-2 1 v7" class="ln" stroke-width="0.9"/>
<rect x="-22" y="66" width="44" height="8" fill="${t.soft}" stroke="${t.ink}" stroke-width="1"/>
<text x="0" y="89" text-anchor="middle" font-size="8.5" class="b">सत्यमेव जयते</text>
</g>\n`;
  return s;
}

// Simple, respectful line portrait (bald head, round spectacles, ears, gentle smile).
function portrait(t, cx, cy) {
  const skin = '#f3e6d2';
  return `<g id="portrait">
<ellipse cx="${cx}" cy="${cy}" rx="80" ry="100" fill="${t.light}" stroke="${t.ink}" stroke-width="2"/>
<clipPath id="oval"><ellipse cx="${cx}" cy="${cy}" rx="79" ry="99"/></clipPath>
<g clip-path="url(#oval)"><g transform="translate(${cx} ${cy})">
<path d="M-82 110 C-70 58 -38 46 0 46 C38 46 70 58 82 110 Z" fill="#f7f4ee" stroke="${t.ink}" stroke-width="1.6"/>
<path class="ln" stroke-width="1.2" d="M-30 50 C-18 70 -8 82 0 100 M30 50 C40 72 50 86 56 104"/>
<path d="M-13 30 L-12 50 Q0 58 12 50 L13 30 Z" fill="${skin}" stroke="${t.ink}" stroke-width="1.4"/>
<ellipse cx="-43" cy="-6" rx="11" ry="17" fill="${skin}" stroke="${t.ink}" stroke-width="1.6"/>
<ellipse cx="43" cy="-6" rx="11" ry="17" fill="${skin}" stroke="${t.ink}" stroke-width="1.6"/>
<path class="ln" stroke-width="1" d="M-45 -14 Q-40 -6 -45 4 M45 -14 Q40 -6 45 4"/>
<path d="M0 -70 C-28 -70 -42 -50 -42 -20 C-42 8 -34 30 -18 40 C-10 45 10 45 18 40 C34 30 42 8 42 -20 C42 -50 28 -70 0 -70 Z" fill="${skin}" stroke="${t.ink}" stroke-width="1.8"/>
<path class="ln" stroke-width="1" stroke="#9a9a9a" d="M-41 -26 l-3 -4 M-40 -21 l-4 -2 M41 -26 l3 -4 M40 -21 l4 -2"/>
<path class="ln" stroke-width="0.8" opacity="0.6" d="M-16 -48 Q0 -52 16 -48 M-12 -42 Q0 -45 12 -42"/>
<path class="ln" stroke-width="1.4" d="M-26 -24 Q-17 -29 -8 -25 M8 -25 Q17 -29 26 -24"/>
<circle cx="-16" cy="-13" r="11" fill="#ffffff" fill-opacity="0.35" stroke="${t.ink}" stroke-width="1.8"/>
<circle cx="16" cy="-13" r="11" fill="#ffffff" fill-opacity="0.35" stroke="${t.ink}" stroke-width="1.8"/>
<path class="ln" stroke-width="1.6" d="M-5 -14 Q0 -18 5 -14 M-27 -14 L-40 -10 M27 -14 L40 -10"/>
<path class="ln" stroke-width="1.2" d="M-20 -12 Q-16 -15 -12 -12 M12 -12 Q16 -15 20 -12"/>
<circle cx="-16" cy="-12" r="1.6" fill="${t.ink}"/><circle cx="16" cy="-12" r="1.6" fill="${t.ink}"/>
<path class="ln" stroke-width="1.5" d="M0 -6 C-1 2 -5 8 -6 11 Q0 14 6 11"/>
<path d="M-9 16 Q0 13 9 16 Q0 19 -9 16 Z" fill="#9a9a9a" stroke="${t.ink}" stroke-width="0.8"/>
<path d="M-12 21 Q0 31 12 21 Q0 26 -12 21 Z" fill="#ffffff" stroke="${t.ink}" stroke-width="1.4"/>
<path class="ln" stroke-width="1" d="M-20 12 Q-17 20 -14 23 M20 12 Q17 20 14 23"/>
</g></g>
</g>\n`;
}

function front(denom, words) {
  const t = THEMES[denom];
  const dev = denom === 100 ? '१००' : '५००';
  let s = head('Picture of a banknote (front)',
    'A simplified drawing of the front of a banknote, marked SPECIMEN.', t);
  s += body(t);
  s += `<text x="34" y="44" font-size="17" class="b">भारतीय रिज़र्व बैंक</text>
<text x="606" y="44" font-size="16" text-anchor="end" class="b">RESERVE BANK OF INDIA</text>
<text x="34" y="62" font-size="9.5">${words.hi}</text>
<text x="606" y="62" font-size="9.5" text-anchor="end">${words.en}</text>
<text x="46" y="170" font-size="24" class="b" transform="rotate(-90 46 170)" text-anchor="middle">₹${denom}</text>
`;
  s += portrait(t, 190, 172);
  s += `<text x="395" y="112" font-size="34" class="b" text-anchor="middle">${dev}</text>
<text x="395" y="246" font-size="56" class="b" text-anchor="middle">₹${denom}</text>
`;
  s += specimen(t, 398, 165, 0.78);
  s += emblem(t, 568, 84, 1.25);
  return s + '</svg>\n';
}

const LANGS = [
  'পাঁচশ টকা',           // Assamese
  'পাঁচশো টাকা',          // Bengali
  'પાંચસો રૂપિયા',         // Gujarati
  'ಐನೂರು ರೂಪಾಯಿಗಳು',     // Kannada
  'پانٛژھ ہَتھ رۄپیہِ',     // Kashmiri
  'पांचशें रुपया',          // Konkani
  'അഞ്ഞൂറ് രൂപ',          // Malayalam
  'पाचशे रुपये',           // Marathi
  'पाँच सय रुपियाँ',        // Nepali
  'ପାଞ୍ଚ ଶହ ଟଙ୍କା',         // Odia
  'ਪੰਜ ਸੌ ਰੁਪਏ',            // Punjabi
  'पञ्चशतं रूप्यकाणि',      // Sanskrit
  'ஐந்நூறு ரூபாய்',        // Tamil
  'ఐదు వందల రూపాయలు',    // Telugu
  'پانچ سو روپیے',          // Urdu
];

function back() {
  const t = THEMES[500];
  let s = head('Picture of a banknote (back)',
    'A simplified drawing of the back of a banknote, marked SPECIMEN.', t);
  s += body(t);
  s += `<text x="34" y="50" font-size="26" class="b">₹500</text>
<text x="330" y="44" font-size="12" class="b" text-anchor="middle">RESERVE BANK OF INDIA · FIVE HUNDRED RUPEES</text>
<text x="606" y="50" font-size="22" class="b" text-anchor="end">₹५००</text>
<text x="34" y="80" font-size="13" class="b">पाँच सौ रुपये</text>
`;
  // Swachh Bharat spectacles logo
  s += `<g id="clean-india-logo" transform="translate(34 150)">
<circle cx="22" cy="20" r="19" fill="${t.light}" stroke="${t.ink}" stroke-width="2.4"/>
<circle cx="66" cy="20" r="19" fill="${t.light}" stroke="${t.ink}" stroke-width="2.4"/>
<path class="ln" stroke-width="2.4" d="M41 18 Q44 13 47 18 M3 16 Q-4 4 6 -2 M85 16 Q100 10 112 22 Q118 28 124 22"/>
<text x="22" y="24" font-size="10" text-anchor="middle" class="b">स्वच्छ</text>
<text x="66" y="24" font-size="10" text-anchor="middle" class="b">भारत</text>
<text x="0" y="58" font-size="10.5">एक कदम स्वच्छता की ओर</text>
</g>
<text x="34" y="256" font-size="12" class="b">भारतीय रिज़र्व बैंक</text>
`;
  // Language panel: exactly 15 lines
  s += `<g id="language-panel">
<rect x="180" y="56" width="120" height="212" rx="3" fill="${t.light}" stroke="${t.ink}" stroke-width="1.4"/>`;
  LANGS.forEach((w, i) => {
    const y = 70 + i * 13.5;
    if (i) s += `<line x1="186" y1="${r(y - 10)}" x2="294" y2="${r(y - 10)}" stroke="${t.soft}" stroke-width="0.4"/>`;
    s += `<text x="240" y="${r(y)}" font-size="${/[\u0600-\u06ff]/.test(w) ? 10.5 : 9.5}" text-anchor="middle">${w}</text>`;
  });
  s += `</g>\n`;
  s += redFort(t);
  s += `<text x="606" y="262" font-size="24" class="b" text-anchor="end">₹500</text>\n`;
  s += specimen(t, 470, 150, 0.85);
  return s + '</svg>\n';
}

// Red Fort front: long crenellated wall, central gateway with arch, pavilions with domes, flag.
function redFort(t) {
  const fill = t.paper2, ink = t.ink;
  let s = `<g id="fort" stroke="${ink}" stroke-width="1.3" stroke-linejoin="round">
<rect x="314" y="176" width="290" height="62" fill="${fill}"/>`;
  // crenellations on the wall
  for (let x = 316; x < 600; x += 10) s += `<path d="M${x} 176 v-5 h5 v5" fill="${fill}" stroke-width="0.9"/>`;
  // horizontal courses
  s += `<path fill="none" stroke-width="0.6" d="M314 196 H604 M314 216 H604"/>`;
  // small arches along the base
  for (let x = 320; x < 600; x += 16) {
    if (x > 425 && x < 495) continue;
    s += `<path d="M${x} 238 v-10 a5 5 0 0 1 10 0 v10" fill="${t.light}" stroke-width="0.8"/>`;
  }
  // central gate block
  s += `<rect x="420" y="128" width="80" height="110" fill="${fill}"/>
<path d="M440 238 V190 Q460 166 480 190 V238 Z" fill="${t.light}"/>
<path fill="none" stroke-width="0.7" d="M432 238 V184 Q460 150 488 184 V238"/>`;
  for (let x = 422; x < 500; x += 8) s += `<path d="M${x} 128 v-4 h4 v4" fill="${fill}" stroke-width="0.8"/>`;
  // pavilion (chhatri) row above the gate
  const chhatri = (cx, base, w, h) =>
    `<rect x="${cx - w / 2}" y="${base - h}" width="${w}" height="${h}" fill="${t.light}"/>`
    + `<path d="M${cx - w / 2 - 2} ${base - h} h${w + 4}" stroke-width="1.6"/>`
    + `<path d="M${cx - w / 2} ${base - h - 1} Q${cx - w / 2} ${base - h - w * 0.7} ${cx} ${base - h - w * 0.85} Q${cx + w / 2} ${base - h - w * 0.7} ${cx + w / 2} ${base - h - 1} Z" fill="${fill}"/>`
    + `<path d="M${cx} ${base - h - w * 0.85} v-5" stroke-width="1"/>`
    + `<path fill="none" stroke-width="0.7" d="M${cx - w / 6} ${base} v-${h - 3} M${cx + w / 6} ${base} v-${h - 3}"/>`;
  s += chhatri(436, 124, 14, 12) + chhatri(484, 124, 14, 12) + chhatri(460, 124, 22, 16);
  // flag
  s += `<path d="M460 86 V58" stroke-width="1.3"/>
<rect x="460" y="58" width="22" height="5" fill="#e7883a" stroke-width="0.6"/>
<rect x="460" y="63" width="22" height="5" fill="#ffffff" stroke-width="0.6"/>
<rect x="460" y="68" width="22" height="5" fill="#3f8a3c" stroke-width="0.6"/>
<circle cx="471" cy="65.5" r="1.6" fill="none" stroke="#2a3f8f" stroke-width="0.6"/>`;
  // side towers with domed pavilions
  for (const cx of [366, 554]) {
    s += `<rect x="${cx - 14}" y="150" width="28" height="88" fill="${fill}"/>`
      + chhatri(cx, 150, 22, 16);
  }
  s += `</g>\n`;
  return s;
}

const files = {
  'shared-note-100-front.svg': front(100, { hi: 'एक सौ रुपये', en: 'ONE HUNDRED RUPEES' }),
  'shared-note-500-front.svg': front(500, { hi: 'पाँच सौ रुपये', en: 'FIVE HUNDRED RUPEES' }),
  'shared-note-500-back.svg': back(),
};
for (const [f, svg] of Object.entries(files)) {
  fs.writeFileSync(path.join(OUT, f), svg);
  console.log(f, svg.length);
}
