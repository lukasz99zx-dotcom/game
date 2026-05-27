'use strict';
const zlib = require('zlib');
const fs   = require('fs');
const path = require('path');

// ── PNG encoder (pure Node.js) ────────────────────────────────────────────────
const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    t[n] = c;
  }
  return t;
})();

function crc32(buf) {
  let c = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xFF] ^ (c >>> 8);
  return (c ^ 0xFFFFFFFF) >>> 0;
}

function u32(n) { const b = Buffer.allocUnsafe(4); b.writeUInt32BE(n >>> 0, 0); return b; }

function pngChunk(type, data) {
  const t = Buffer.from(type, 'ascii');
  return Buffer.concat([u32(data.length), t, data, u32(crc32(Buffer.concat([t, data])))]);
}

function encodePNG(w, h, rgba) {
  const rows = [];
  for (let y = 0; y < h; y++) {
    const row = Buffer.allocUnsafe(1 + w * 4);
    row[0] = 0;
    for (let x = 0; x < w; x++) {
      const s = (y * w + x) * 4;
      row[1 + x*4]   = rgba[s];
      row[1 + x*4+1] = rgba[s+1];
      row[1 + x*4+2] = rgba[s+2];
      row[1 + x*4+3] = rgba[s+3];
    }
    rows.push(row);
  }
  const compressed = zlib.deflateSync(Buffer.concat(rows), { level: 9 });
  return Buffer.concat([
    Buffer.from([137,80,78,71,13,10,26,10]),
    pngChunk('IHDR', Buffer.concat([u32(w), u32(h), Buffer.from([8,6,0,0,0])])),
    pngChunk('IDAT', compressed),
    pngChunk('IEND', Buffer.alloc(0)),
  ]);
}

// ── Pixel art renderer ────────────────────────────────────────────────────────
// hex color '#RRGGBB' or 0xRRGGBB number → [R,G,B,255]
function c(hex, a = 255) {
  const v = typeof hex === 'number' ? hex : parseInt(hex.replace('#',''), 16);
  return [(v>>16)&255, (v>>8)&255, v&255, a];
}

function renderFrame(rows, palette, scale) {
  const cols = Math.max(...rows.map(r => r.length));
  const W = cols * scale, H = rows.length * scale;
  const buf = new Uint8Array(W * H * 4);
  for (let r = 0; r < rows.length; r++) {
    for (let col = 0; col < rows[r].length; col++) {
      const color = palette[rows[r][col]];
      if (!color) continue;
      for (let dy = 0; dy < scale; dy++) for (let dx = 0; dx < scale; dx++) {
        const i = ((r*scale+dy)*W + col*scale+dx)*4;
        buf[i]=color[0]; buf[i+1]=color[1]; buf[i+2]=color[2]; buf[i+3]=color[3]??255;
      }
    }
  }
  return { buf, W, H };
}

function makeSheet(frames) {
  const { W, H } = frames[0];
  const TW = W * frames.length;
  const out = new Uint8Array(TW * H * 4);
  frames.forEach((f, fi) => {
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const s = (y*W+x)*4, d = (y*TW + fi*W+x)*4;
      out[d]=f.buf[s]; out[d+1]=f.buf[s+1]; out[d+2]=f.buf[s+2]; out[d+3]=f.buf[s+3];
    }
  });
  return { buf: out, W: TW, H };
}

function save(name, frames, scale, outDir) {
  // Normalize all frames to identical dimensions (fixes blurry/shifted frames)
  const maxCols = Math.max(...frames.map(({ rows }) => Math.max(...rows.map(r => r.length))));
  const maxRows = Math.max(...frames.map(({ rows }) => rows.length));
  const normalized = frames.map(({ rows, pal }) => ({
    rows: rows.map(r => r + '.'.repeat(maxCols - r.length))
              .concat(Array(Math.max(0, maxRows - rows.length)).fill('.'.repeat(maxCols))),
    pal,
  }));
  const rendered = normalized.map(({ rows, pal }) => renderFrame(rows, pal, scale));
  const { buf, W, H } = makeSheet(rendered);
  fs.writeFileSync(path.join(outDir, name+'.png'), encodePNG(W, H, buf));
  const fw = W / frames.length;
  console.log(`  ${name}.png  ${W}x${H}  (${frames.length} frames x ${fw}px)`);
  return { frameWidth: fw, frameHeight: H };
}

// ── Color palettes ────────────────────────────────────────────────────────────
// Each palette maps a single character → [R,G,B,A]
// '.' is always transparent

const P_KNIGHT = {
  '.': null,
  'S': c(0x111111),  // shadow/outline
  'H': c(0x555566),  // dark helmet
  'h': c(0x8899AA),  // light helmet
  'V': c(0x223344),  // visor
  'v': c(0x445566),  // visor glow
  'A': c(0xAABBCC),  // armor body
  'a': c(0x7788AA),  // armor shadow
  'Y': c(0xFFDD00),  // gold cross
  'y': c(0xBB9900),  // gold dark
  'R': c(0xCC1111),  // red tabard
  'r': c(0x880000),  // dark red
  'L': c(0x9AABBB),  // leg armor
  'l': c(0x667788),  // leg dark
  'f': c(0xFFCC88),  // face
  'e': c(0x221100),  // eye
  'B': c(0x4466DD),  // blue shield
  'b': c(0x2233AA),  // shield dark
  'W': c(0xCCDDEE),  // sword
  'w': c(0x889999),  // sword dark
};

const KNIGHT = [
  // rows: 16 wide × 20 tall  (scale=3 → 48×60 per frame)
  // IDLE frame 0
  [
    '....SHHHHHHHS..',
    '...SHhhhhhhhHS.',
    '..SHHhhhhhhhHHS',
    '..SHHVvvvvVHHHS',
    '..SHHhfffffHHS.',
    '..SHHhfefefHS..',
    '..SHHhfffffHS..',
    '...SaaaaaaaS...',
    '..SAaYYYYYaAS..',
    '.SAaYyyyyyYaAS.',
    '.SAaYyyyyyYaAS.',
    '..SAaYYYYYaAS..',
    '...SaaRRRaaS...',
    '..SAlRRRRRlAS..',
    '...SalRRRlaS...',
    '....SlllllS....',
    '....SlSlSlS....',
    '....SlSlSlS....',
    '....SlSlSlS....',
    '....SSSSSSS....',
  ],
  // WALK frame 1 (left leg forward)
  [
    '....SHHHHHHHS..',
    '...SHhhhhhhhHS.',
    '..SHHhhhhhhhHHS',
    '..SHHVvvvvVHHHS',
    '..SHHhfffffHHS.',
    '..SHHhfefefHS..',
    '..SHHhfffffHS..',
    '...SaaaaaaaS...',
    '..SAaYYYYYaAS..',
    '.SAaYyyyyyYaAS.',
    '.SAaYyyyyyYaAS.',
    '..SAaYYYYYaAS..',
    '...SaaRRRaaS...',
    '..SAlRRRRRlAS..',
    '...SalRRRlaS...',
    '....SlllllS....',
    '...SllS.SlS....',  // left leg forward
    '..SllS..SlS....',
    '..SllS..SlS....',
    '..SSSS..SSSS...',
  ],
  // WALK frame 2 (right leg forward)
  [
    '....SHHHHHHHS..',
    '...SHhhhhhhhHS.',
    '..SHHhhhhhhhHHS',
    '..SHHVvvvvVHHHS',
    '..SHHhfffffHHS.',
    '..SHHhfefefHS..',
    '..SHHhfffffHS..',
    '...SaaaaaaaS...',
    '..SAaYYYYYaAS..',
    '.SAaYyyyyyYaAS.',
    '.SAaYyyyyyYaAS.',
    '..SAaYYYYYaAS..',
    '...SaaRRRaaS...',
    '..SAlRRRRRlAS..',
    '...SalRRRlaS...',
    '....SlllllS....',
    '...SlS.SllS....',  // right leg forward
    '..SlS...SllS...',
    '..SlS...SllS...',
    '..SSSS...SSSS..',
  ],
  // ATTACK frame 3 (sword swing)
  [
    '....SHHHHHHHS..',
    '...SHhhhhhhhHS.',
    '..SHHhhhhhhhHHS',
    '..SHHVvvvvVHHHS',
    '..SHHhfffffHHS.',
    '..SHHhfefefHS..',
    '..SHHhfffffHS..',
    '...SaaaaaaaS...',
    '..SAaYYYYYaAS..',
    '.SAaYyyyyyYaASW',   // sword extended
    '.SAaYyyyyyYaASW',
    '..SAaYYYYYaASWW',
    '...SaaRRRaaSwwW',
    '..SAlRRRRRlASwW',
    '...SalRRRlaSwW.',
    '....SlllllSwW..',
    '....SlSlSlS....',
    '....SlSlSlS....',
    '....SlSlSlS....',
    '....SSSSSSS....',
  ],
];

const P_ARCHER = {
  '.': null,
  'S': c(0x111111),
  'B': c(0x6B3A1F),  // brown leather
  'b': c(0x3D1F0A),  // dark brown
  'G': c(0x2D6E3A),  // green hood
  'g': c(0x1A4422),  // dark green
  'f': c(0xFFCC88),  // face
  'e': c(0x221100),  // eye
  'Q': c(0xCCBB88),  // quiver/arrows
  'q': c(0x998855),  // quiver dark
  'W': c(0xAA7733),  // wood bow
  'w': c(0x664422),  // bow dark
  'L': c(0x5C3317),  // leather legging
  'l': c(0x3A1F0A),  // legging dark
  'Y': c(0xFFDD44),  // gold belt buckle
  'T': c(0x888888),  // bowstring
  'A': c(0xCCCC88),  // arrow
};

const ARCHER = [
  // IDLE
  [
    '....SGGGGgS....',
    '...SGGggggGS...',
    '..SGGGffffGGS..',
    '..SGGGfeeefGS..',
    '..SGGGffffGGS..',
    '...SGGggggGS...',
    '..SBBBbBBBBbS..',
    '.SBBBBbBBBBbBS.',
    '.SBBQqBBBBqQBS.',
    '.SBBqQBBBBQqBS.',
    '.SBBBbYYYbBBBS.',
    '..SBBbBBBbBBS..',
    '..SBBbBBBbBBS..',
    '..SLLlBBBlLLS..',
    '..SLLlBBBlLLS..',
    '...SLlBBBlLS...',
    '....SLlBlLS....',
    '....SLlBlLS....',
    '....SLlBlLS....',
    '....SSSSSSS....',
  ],
  // WALK 1
  [
    '....SGGGGgS....',
    '...SGGggggGS...',
    '..SGGGffffGGS..',
    '..SGGGfeeefGS..',
    '..SGGGffffGGS..',
    '...SGGggggGS...',
    '..SBBBbBBBBbS..',
    '.SBBBBbBBBBbBS.',
    '.SBBQqBBBBqQBS.',
    '.SBBqQBBBBQqBS.',
    '.SBBBbYYYbBBBS.',
    '..SBBbBBBbBBS..',
    '..SBBbBBBbBBS..',
    '..SLLlBBBlLLS..',
    '..SLLlBBBlLLS..',
    '..SLLlBBBlLLS..',
    '...SLLlBBlLS...',
    '..SLLlS.SlLS...',
    '..SlLS..SlLS...',
    '..SSSS..SSSS...',
  ],
  // WALK 2
  [
    '....SGGGGgS....',
    '...SGGggggGS...',
    '..SGGGffffGGS..',
    '..SGGGfeeefGS..',
    '..SGGGffffGGS..',
    '...SGGggggGS...',
    '..SBBBbBBBBbS..',
    '.SBBBBbBBBBbBS.',
    '.SBBQqBBBBqQBS.',
    '.SBBqQBBBBQqBS.',
    '.SBBBbYYYbBBBS.',
    '..SBBbBBBbBBS..',
    '..SBBbBBBbBBS..',
    '..SLLlBBBlLLS..',
    '..SLLlBBBlLLS..',
    '..SLLlBBBlLLS..',
    '...SBBllBLLS...',
    '..SlLS..SllLS..',
    '..SlLS..SllLS..',
    '..SSSS...SSSS..',
  ],
  // ATTACK (bow drawn)
  [
    '....SGGGGgS....',
    '...SGGggggGS...',
    '..SGGGffffGGS..',
    '..SGGGfeeefGS..',
    '..SGGGffffGGS..',
    '...SGGggggGS...',
    'WSSBBBBBBBBSSAW',
    'WwSBBBBBBBBSwwW',
    'WWTBBBBBBBBTAaa',
    'WwSBBBBBBBBSwwW',
    'WSSBBBBBBBBSSW.',
    '..SBBbBBBbBBS..',
    '..SBBbBBBbBBS..',
    '..SLLlBBBlLLS..',
    '..SLLlBBBlLLS..',
    '..SLLlBBBlLLS..',
    '....SlSlSlS....',
    '....SlSlSlS....',
    '....SlSlSlS....',
    '....SSSSSSS....',
  ],
];

const P_MAGE = {
  '.': null,
  'S': c(0x0A0010),  // shadow
  'H': c(0x6600CC),  // hat
  'h': c(0x9922FF),  // hat highlight
  'T': c(0x4400AA),  // hat tip
  'f': c(0xEECCAA),  // face
  'e': c(0x110022),  // eye
  'R': c(0x5500BB),  // robe
  'r': c(0x330077),  // robe dark
  'P': c(0xAA44FF),  // robe highlight/trim
  'p': c(0x8822DD),  // trim dark
  'Y': c(0xFFCC00),  // gold star/orb
  'y': c(0xCC8800),  // gold dark
  'C': c(0x00FFFF),  // cyan magic
  'c': c(0x009999),  // cyan dark
  'W': c(0xBBBBCC),  // staff
  'w': c(0x888899),  // staff dark
  'O': c(0xFF6600),  // orb glow
};

const MAGE = [
  // IDLE
  [
    '.....STTS......',
    '....SHhHHS.....',
    '...SHHhhhHHS...',
    '..SHHHhhhHHHS..',
    '..SRRHffffHRS..',
    '..SRRHfeeefRS..',
    '..SRRHffffHRS..',
    '..SRRRRRRRRrS..',
    '.SRRRPpPpPRRrS.',
    '.SRRRPYyYPRRrS.',
    '.SRRRPCyCPRRrS.',
    '.SRRRPpPpPRRrS.',
    '.WwSRRRRRRRrSW.',
    '.WwSRRRRRRrSWw.',
    '.WwSRRRRRRrS...',
    '..SRRRrRRrRS...',
    '..SRRrRrRRrS...',
    '..SRRrRRRrRS...',
    '..SrrrrRrrRS...',
    '...SSSSSSSS....',
  ],
  // WALK 1
  [
    '.....STTS......',
    '....SHhHHS.....',
    '...SHHhhhHHS...',
    '..SHHHhhhHHHS..',
    '..SRRHffffHRS..',
    '..SRRHfeeefRS..',
    '..SRRHffffHRS..',
    '..SRRRRRRRRrS..',
    '.SRRRPpPpPRRrS.',
    '.SRRRPYyYPRRrS.',
    '.SRRRPCyCPRRrS.',
    '.SRRRPpPpPRRrS.',
    'WwSRRRRRRRrSWw.',
    'WwSRRRRRRrSWwW.',
    '.WwSRRRRRrS....',
    '..SRRRrRRrRS...',
    '..SRRrSRRrSS...',
    '.SRRrS.SRrS....',
    '.SrrS...SrS....',
    '.SSSS...SSS....',
  ],
  // WALK 2
  [
    '.....STTS......',
    '....SHhHHS.....',
    '...SHHhhhHHS...',
    '..SHHHhhhHHHS..',
    '..SRRHffffHRS..',
    '..SRRHfeeefRS..',
    '..SRRHffffHRS..',
    '..SRRRRRRRRrS..',
    '.SRRRPpPpPRRrS.',
    '.SRRRPYyYPRRrS.',
    '.SRRRPCyCPRRrS.',
    '.SRRRPpPpPRRrS.',
    '.WwSRRRRRRRrSWw',
    '..WwSRRRRRrSWwW',
    '...WwSRRRRrS...',
    '..SRRRrRRrRS...',
    '.SRRrSRRrSS....',
    'SRRrS.SRrS.....',
    'SrrS...SrS.....',
    'SSSS...SSS.....',
  ],
  // CAST (hands up with orbs)
  [
    'O....STTS....O.',
    'OY...SHhHHS..Yy',
    'YyO.SHHhhhHHS.O',
    '.YySHHHhhhHHHSY',
    '..SRRHffffHRS..',
    '..SRRHfeeefRS..',
    '..SRRHffffHRS..',
    '..SRRRRRRRRrS..',
    'CSRRRPpPpPRRrSC',
    'CSRRRPYyYPRRrSC',
    'CSRRRPCyCPRRrSC',
    'CSRRRPpPpPRRrSC',
    'CSRRRRRRRRrRSCC',
    '.SRRRRRRRRrRS..',
    '..SRRRRRRrRS...',
    '..SRRRrRRrRS...',
    '..SRRrRrRRrS...',
    '..SRRrRRRrRS...',
    '..SrrrrRrrRS...',
    '...SSSSSSSS....',
  ],
];

const P_ROGUE = {
  '.': null,
  'S': c(0x050505),  // deep shadow
  'D': c(0x1A1A1A),  // dark outfit
  'd': c(0x0D0D0D),  // darker
  'H': c(0x111111),  // hood
  'h': c(0x2A2A2A),  // hood edge
  'f': c(0xCCAAAA),  // pale face
  'e': c(0xFF2222),  // glowing red eyes
  'R': c(0xCC0022),  // red scarf
  'r': c(0x880011),  // scarf dark
  'L': c(0x222222),  // leg
  'l': c(0x111111),  // leg dark
  'K': c(0xDDDDDD),  // blade
  'k': c(0x888888),  // blade dark
  'G': c(0x444444),  // gloves
  'g': c(0x222222),  // glove dark
  'Y': c(0xCCAA00),  // gold details
  'P': c(0x9900CC),  // purple trim
};

const ROGUE = [
  // IDLE
  [
    '.....SHHHhS....',
    '....SHHHHhHS...',
    '...SHHHfffffHS.',
    '...SHHHfeeefHS.',
    '...SHHHRRRRhHS.',
    '...SDDDRrrRDDS.',
    '..SDDDDDDDDDdS.',
    '.SDDDDGgGgDDddS',
    '.SDDDDGgGgDDddS',
    '.SDDDDGgGgDDddS',
    '..SYDDDDDDDDyS.',
    '..SDDdDDDdDDS..',
    '..SLLdDDdLLS...',
    '..SLLdDDdLLS...',
    '..SLLdDDdLLS...',
    '..SLLlDDlLLS...',
    '..SLlLDDLlLS...',
    '..SLlLD.DlLS...',
    '..SLlLD.DlLS...',
    '...SSSSS.SSSS..',
  ],
  // WALK 1
  [
    '.....SHHHhS....',
    '....SHHHHhHS...',
    '...SHHHfffffHS.',
    '...SHHHfeeefHS.',
    '...SHHHRRRRhHS.',
    '...SDDDRrrRDDS.',
    '..SDDDDDDDDDdS.',
    '.SDDDDGgGgDDddS',
    '.SDDDDGgGgDDddS',
    '.SDDDDGgGgDDddS',
    '..SYDDDDDDDDyS.',
    '..SDDdDDDdDDS..',
    '..SLLdDDdLLS...',
    '..SLLdDDdLLS...',
    '..SLLdDDdLLS...',
    '..SLLlDDlLLS...',
    '..SLLlDDllLS...',
    '..SLLlDSllLS...',
    '..SLlLS.SllS...',
    '...SSSS..SSSS..',
  ],
  // WALK 2
  [
    '.....SHHHhS....',
    '....SHHHHhHS...',
    '...SHHHfffffHS.',
    '...SHHHfeeefHS.',
    '...SHHHRRRRhHS.',
    '...SDDDRrrRDDS.',
    '..SDDDDDDDDDdS.',
    '.SDDDDGgGgDDddS',
    '.SDDDDGgGgDDddS',
    '.SDDDDGgGgDDddS',
    '..SYDDDDDDDDyS.',
    '..SDDdDDDdDDS..',
    '..SLLdDDdLLS...',
    '..SLLdDDdLLS...',
    '..SLLdDDdLLS...',
    '..SLLlDDlLLS...',
    '..SllLDDllLS...',
    '..SllLS.SllS...',
    '..SllLS..SlS...',
    '..SSSSS..SSSS..',
  ],
  // ATTACK (backstab pose, dagger forward)
  [
    '.....SHHHhS....',
    '....SHHHHhHS...',
    '...SHHHfffffHS.',
    '...SHHHfeeefHS.',
    '...SHHHRRRRhHS.',
    '...SDDDRrrRDDS.',
    '..SDDDDDDDDDdS.',
    '.SDDDDGgGgDDddS',
    '.SDDDDGgKKKDddS',  // dagger extended
    '.SDDDDGgKkDDddS',
    '..SYDDDGKDDDyS.',
    '..SDDdSKDDdDDS..',
    '..SLLdSKddLLS...',
    '..SLLdDDdLLS...',
    '..SLLdDDdLLS...',
    '..SLLlDDlLLS...',
    '..SLlLDDLlLS...',
    '..SLlLD.DlLS...',
    '..SLlLD.DlLS...',
    '...SSSSS.SSSS..',
  ],
];

// ── ENEMIES ───────────────────────────────────────────────────────────────────

const P_WOLF = {
  '.': null,
  'S': c(0x111111),
  'B': c(0x8B7355),  // brown body
  'b': c(0x6B5335),  // dark brown
  'G': c(0x9B8365),  // gray-brown fur
  'g': c(0x7B6345),
  'E': c(0xFF4444),  // red eyes
  'T': c(0xF5F5DC),  // teeth/fangs
  'N': c(0x444444),  // nose
  'L': c(0x7B6345),  // legs
  'l': c(0x5A4030),
  'W': c(0xCCBBAA),  // white belly
};

const WOLF = [
  // IDLE
  [
    '..........SBbbBS',
    '.........SBbBbBbS',
    '........SBBBbbBbBS',
    '.......SBbBEEBbBBS',
    '.......SBBBNNBbBS.',
    '.......SBBTTBbBS..',
    '....SBBBBBBBBBbS..',
    '...SBbBBBBBBBBBbS.',
    '..SBBbBBBBBBBBBbS.',
    '..SBBBBBBBBBBBbBS.',
    '..SBBWWWWWWBBbBS..',
    '...SBBBBBBBBbBS...',
    '..SlSbSbSbSbSlS...',
    '.SlllSlSlSlSlllS..',
    'SlllSSSSSSSSllllS.',
    'SSSS............SS',
  ],
  // WALK 1
  [
    '..........SBbbBS',
    '.........SBbBbBbS',
    '........SBBBbbBbBS',
    '.......SBbBEEBbBBS',
    '.......SBBBNNBbBS.',
    '.......SBBTTBbBS..',
    '....SBBBBBBBBBbS..',
    '...SBbBBBBBBBBBbS.',
    '..SBBbBBBBBBBBBbS.',
    '..SBBBBBBBBBBBbBS.',
    '..SBBWWWWWWBBbBS..',
    '...SBBBBBBBBbBS...',
    '..SlSbSbSbSbSlS...',
    '.SllllSlSlSlllS...',
    'SlSSSSSSSSSSlllS..',
    'SSS.............SS',
  ],
  // ATTACK (lunging)
  [
    '...............SBbbBS',
    '..............SBbBbBbS',
    '.............SBBBbbBbBS',
    '............SBbBEEBbBBS',
    '...........SBBBNNBbBS..',
    '...........SBBTTTbBS...',
    '.......SBBBBBBBBBBbS...',
    '......SBbBBBBBBBBBBbS..',
    '.....SBBbBBBBBBBBBBbS..',
    '.....SBBBBBBBBBBBBbBS..',
    '.....SBBWWWWWWWBBbBS...',
    '......SBBBBBBBBBbBS....',
    '.....SlSbSbSbSbSlS.....',
    '....SlSSSSSSSSSSlS.....',
    '....SSSSSSSSSSSSS......',
    '.....................',
  ],
];

const P_SKELETON = {
  '.': null,
  'S': c(0x222222),
  'W': c(0xF5F5DC),  // bone white
  'w': c(0xCCCCAA),  // bone shadow
  'E': c(0xFF4444),  // eye glow
  'C': c(0x888866),  // rusty chain/armor
  'R': c(0xAA2222),  // rust
  'B': c(0xCCBB88),  // brown bone
};

const SKELETON = [
  // IDLE
  [
    '....SWWWWS.....',
    '...SWwWwwWS....',
    '..SWWwEEwWWS...',
    '..SWWwwwwWWS...',
    '...SWwwwwWS....',
    '.....SWwWS.....',
    '..SWWWwwWWWS...',
    '..SWwWwwWwWS...',
    '.SWwwwwwwwwwWS.',
    '..SWwwwwwwWWS..',
    '.....SWwWS.....',
    '.....SWwWS.....',
    '...SWWWWWWWS...',
    '...SWw.B.wWS...',
    '....SWw.wWS....',
    '.....SWwWS.....',
    '....SWS.SWS....',
    '....SWS.SWS....',
    '....SWS.SWS....',
    '....SWSSSWS....',
  ],
  // WALK
  [
    '....SWWWWS.....',
    '...SWwWwwWS....',
    '..SWWwEEwWWS...',
    '..SWWwwwwWWS...',
    '...SWwwwwWS....',
    '.....SWwWS.....',
    '..SWWWwwWWWS...',
    '..SWwWwwWwWS...',
    '.SWwwwwwwwwwWS.',
    '..SWwwwwwwWWS..',
    '.....SWwWS.....',
    '.....SWwWS.....',
    '...SWWWWWWWS...',
    '...SWw.B.wWS...',
    '....SWw.wWS....',
    '.....SWwWS.....',
    '....SWWSSswS...',  // one leg raised
    '....SWWS.SWS...',
    '...SSwWS.SWS...',
    '...SSSSS.SSSS..',
  ],
  // ATTACK (sword swing)
  [
    '....SWWWWS.....',
    '...SWwWwwWS....',
    '..SWWwEEwWWS...',
    '..SWWwwwwWWS...',
    '...SWwwwwWS....',
    '.....SWwWS.....',
    'BBBSWWWWWWWWS..',
    'BBBSWwWwwWwWS..',
    'BBBSWWWWWWWWWS.',
    '...SWwwwwwwWWS.',
    '.....SWwWS.....',
    '.....SWwWS.....',
    '...SWWWWWWWS...',
    '...SWw.B.wWS...',
    '....SWw.wWS....',
    '.....SWwWS.....',
    '....SWS.SWS....',
    '....SWS.SWS....',
    '....SWS.SWS....',
    '....SWSSSWS....',
  ],
];

const P_ZOMBIE = {
  '.': null,
  'S': c(0x1A1A0A),
  'G': c(0x5A8A5A),  // zombie green
  'g': c(0x3A6A3A),
  'f': c(0x7AAA7A),  // face green
  'e': c(0xFF2222),
  'R': c(0xAA2222),  // blood
  'r': c(0x661111),
  'B': c(0x4A7A4A),
  'b': c(0x2A5A2A),
  'W': c(0xEEEEEE),  // bone exposed
  'T': c(0xFFEE88),  // teeth
};

const ZOMBIE = [
  // IDLE
  [
    '....SGGGGgS....',
    '...SGGffffGgS..',
    '..SGGGfeeefGgS.',
    '..SGGGfTTTfGgS.',
    '..SGGGffffGGgS.',
    '...SGRRRRRGgS..',
    '..SGGGGBBGGGgS.',
    '.SGGGGbBbBGGGgS',
    '.SGGGBbBbBGGGgS',
    '.SGGGGBBBGGGgS.',
    '.SGGGGGGGGGGgS.',
    '..SGGGGGGGGgS..',
    '..SGGGbGGgGGS..',
    '..SGGGbGGgGGS..',
    '..SBBGbGGgBBS..',
    '..SBBGbGGgBBS..',
    '..SBBGbGGgBBS..',
    '..SGGGSGGSGgS..',
    '..SGGGSGGSGgS..',
    '..SSSSSSSSSSSS.',
  ],
  // WALK (shambling)
  [
    '....SGGGGgS....',
    '...SGGffffGgS..',
    '..SGGGfeeefGgS.',
    '..SGGGfTTTfGgS.',
    '..SGGGffffGGgS.',
    '...SGRRRRRGgS..',
    '..SGGGGBBGGGgS.',
    '.SGGGGbBbBGGGgS',
    '.SGGGBbBbBGGGgS',
    '.SGGGGBBBGGGgS.',
    '.SGGGGGGGGGGgS.',
    '..SGGGGGGGGgS..',
    '..SGGGbGGgGGS..',
    '..SGGGbGGgGGS..',
    '..SBBGbGGgBBS..',
    '..SBBGbGGgBBS..',
    '..SBBGSSSgBBS..',
    '..SGGGSGGSGgS..',
    '.SGGGSSGGSSgS..',
    '.SSSSSSSSSSSS..',
  ],
];

const P_GOBLIN = {
  '.': null,
  'S': c(0x1A1A0A),
  'G': c(0x3CB371),
  'g': c(0x228855),
  'f': c(0x55CC88),  // face
  'e': c(0xFFFF00),
  'B': c(0x8B4513),  // armor/bow
  'b': c(0x5C3317),
  'A': c(0x888844),  // leather
  'a': c(0x665522),
  'T': c(0xFFEE55),  // teeth
  'L': c(0x44AA55),  // legs
  'l': c(0x228844),
};

const GOBLIN = [
  // IDLE
  [
    '....SGGGGGgS...',
    '...SGGGGGGGgS..',
    '..SGGGfffffGgS.',
    '..SGGGfEEEfGgS.',
    '..SGGGfTTTfGgS.',
    '..SGGGfffffGgS.',
    '...SGGGGGGGgS..',
    '..SAAAAAAAAAAaS.',
    '.SAaAAAAAAAAAaAS',
    '.SAaAAAAAAAAAaAS',
    '.SAaBAAAABAAaAS.',
    '..SAaAAAAAAAAS..',
    '..SGAaAAAAAAGS..',
    '..SGGAaAAAAGGS..',
    '...SLLGaAGLLS...',
    '...SLLLaALLLS...',
    '....SLLaALLS....',
    '....SLSaASLS....',
    '....SLSaSALS....',
    '....SSSSSSSSS...',
  ],
  // WALK
  [
    '....SGGGGGgS...',
    '...SGGGGGGGgS..',
    '..SGGGfffffGgS.',
    '..SGGGfEEEfGgS.',
    '..SGGGfTTTfGgS.',
    '..SGGGfffffGgS.',
    '...SGGGGGGGgS..',
    '..SAAAAAAAAAAaS.',
    '.SAaAAAAAAAAAaAS',
    '.SAaAAAAAAAAAaAS',
    '.SAaBAAAABAAaAS.',
    '..SAaAAAAAAAAS..',
    '..SGAaAAAAAAGS..',
    '..SGGAaAAAAGGS..',
    '...SLLGaAGLLS...',
    '...SLLLaALLLS...',
    '....SLLLaLLS....',
    '....SLLSaSLS....',
    '...SLLSa.SLLS...',
    '...SSSS...SSSS..',
  ],
  // SHOOT (bow draw)
  [
    '....SGGGGGgS...',
    '...SGGGGGGGgS..',
    '..SGGGfffffGgS.',
    '..SGGGfEEEfGgS.',
    '..SGGGfTTTfGgS.',
    '..SGGGfffffGgS.',
    '...SGGGGGGGgS..',
    '.BSAAABBBBAAAAaS',
    'BBSAaBBBBBAAaAAS',
    '.BSAaBBBBBAAaAAS',
    '.BSAABAAAABAAaAS',
    '..SAaAAAAAAAAS..',
    '..SGAaAAAAAAGS..',
    '..SGGAaAAAAGGS..',
    '...SLLGaAGLLS...',
    '...SLLLaALLLS...',
    '....SLLaALLS....',
    '....SLSaASLS....',
    '....SLSaSALS....',
    '....SSSSSSSSS...',
  ],
];

const P_NECROMANCER = {
  '.': null,
  'S': c(0x050005),
  'D': c(0x180018),  // robe dark purple
  'd': c(0x0D000D),
  'H': c(0x1A001A),  // hat
  'h': c(0x330033),
  'P': c(0x8800CC),  // purple magic
  'p': c(0x550088),
  'f': c(0xDDCCEE),
  'e': c(0x00FFFF),  // cyan eyes
  'C': c(0x00CCFF),  // magic glow
  'c': c(0x009999),
  'W': c(0x888899),  // staff
  'w': c(0x555566),
  'K': c(0xCCCC88),  // skull ornament
  'k': c(0x999966),
  'Y': c(0xCCBB00),  // gold
};

const NECROMANCER = [
  // IDLE
  [
    '...SHHHHHhS....',
    '..SHHHHHHhHS...',
    '.SHHHHHHHHhHS..',
    '.SHHHKKKKHhHS..',
    '..SHHKkkkHHHS..',
    '...SHHHHHhHS...',
    '...SDDffffDS...',
    '...SDDfeeefDS...',
    '...SDDffffDS....',
    '...SDDPPPDdS....',
    '..SDDDPpPDDdS...',
    '.WwSDDDpDDDdSWw.',
    '.WwSDDDDDDDdSWw.',
    '.WwSDDDpDDDdSWw.',
    '..SDDDPpPDDdS...',
    '..SDDPpPpPDdS...',
    '...SDDPpPDdS....',
    '...SDDDDDdS.....',
    '...SDDDDdS......',
    '....SSSSSSs.....',
  ],
  // CAST
  [
    '...SHHHHHhS....',
    '..SHHHHHHhHS...',
    '.SHHHHHHHHhHS..',
    '.SHHHKKKKHhHS..',
    '..SHHKkkkHHHS..',
    '...SHHHHHhHS...',
    '...SDDffffDS...',
    '...SDDfeeefDS...',
    '...SDDffffDS....',
    '...SDDPPPDdS....',
    'CcSDDDPpPDDdSCc.',
    'CCSDDDpDDDdSCC..',
    'CcSDDDDDDDdSCc..',
    'CCSDDDpDDDdSCC..',
    'CcSDDDPpPDDdSCc.',
    '..SDDPpPpPDdS...',
    '...SDDPpPDdS....',
    '...SDDDDDdS.....',
    '...SDDDDdS......',
    '....SSSSSSs.....',
  ],
];

const P_DEMON = {
  '.': null,
  'S': c(0x110000),
  'R': c(0xCC2200),
  'r': c(0x880000),
  'O': c(0xFF6600),
  'o': c(0xCC3300),
  'H': c(0xFF4400),  // horn
  'h': c(0xAA2200),
  'f': c(0xFF5544),
  'e': c(0xFFFF00),
  'W': c(0xAA0000),  // wing
  'w': c(0x660000),
  'L': c(0xBB1100),
  'l': c(0x880000),
  'T': c(0xFFFFCC),  // teeth
};

const DEMON = [
  // IDLE
  [
    'H..SRRRRRRrS..h',
    'HhSRRRRRRRRrSHh',
    '.HSRRRfffffRrS..',
    '..SRRRfeeefRrS..',
    '..SRRRfTTTfRrS..',
    '..SRRRRRRRRrS...',
    '.SWRROoooORRrSw.',
    'SWWRRoOOOoRRrSwW',
    'SWWRROoooORRrSwW',
    '.SWRRRRRRRRrSw..',
    '..SRRRRRRRRrS...',
    '..SRROoOoORrS...',
    '..SLLRoRoRLlS...',
    '..SLLLRRRLllS...',
    '...SLLRRRLlS....',
    '...SLLRRRllS....',
    '...SlLlRlLlS....',
    '...SlLlRlLlS....',
    '...SlLlRlLlS....',
    '...SSSSSSSSS....',
  ],
  // WALK
  [
    'H..SRRRRRRrS..h',
    'HhSRRRRRRRRrSHh',
    '.HSRRRfffffRrS..',
    '..SRRRfeeefRrS..',
    '..SRRRfTTTfRrS..',
    '..SRRRRRRRRrS...',
    '.SWRROoooORRrSw.',
    'SWWRRoOOOoRRrSwW',
    'SWWRROoooORRrSwW',
    '.SWRRRRRRRRrSw..',
    '..SRRRRRRRRrS...',
    '..SRROoOoORrS...',
    '..SLLRoRoRLlS...',
    '..SLLLRRRLllS...',
    '..SLLLRRRlllS...',
    '..SLLlRRRllS....',
    '..SLlLlRlLlS....',
    '..SLlLlRlllS....',
    '.SLlLlSRSllLS...',
    '.SSSSSS.SSSSS...',
  ],
];

const P_VAMPIRE = {
  '.': null,
  'S': c(0x050005),
  'D': c(0x220022),
  'd': c(0x110011),
  'C': c(0xBB0044),  // crimson cape
  'c': c(0x770022),
  'f': c(0xDDAACC),
  'e': c(0xFF0000),
  'F': c(0xFFFFFF),  // fangs
  'H': c(0x110011),  // hair
  'h': c(0x220022),
  'G': c(0x8800AA),  // dark purple
  'g': c(0x440066),
  'Y': c(0xCCCC00),
};

const VAMPIRE = [
  // IDLE
  [
    '....SDDHHdS....',
    '...SDDHHHHdS...',
    '..SDDDfffffDdS.',
    '..SDDDfeeefDdS.',
    '..SDDDFFFFFDdS.',
    '...SCCCCCCCcS..',
    '...SCCDDDCCcS..',
    '..SCCCDDDCCcCS.',
    '.SCCCGDDDGCcCCS',
    '.SCCCGgDgGCcCCS',
    '.SCCCGDDDGCcCCS',
    '.SCCCDDDDDCcCS.',
    '..SCCCDDDCCcS..',
    '...SCDDDDDcS...',
    '...SCDDDDDcS...',
    '...SDDdDddS....',
    '...SDDdDddS....',
    '...SDDdDddS....',
    '...SDDdDddS....',
    '....SSSSSSS....',
  ],
  // WALK (cape billowing)
  [
    '....SDDHHdS....',
    '...SDDHHHHdS...',
    '..SDDDfffffDdS.',
    '..SDDDfeeefDdS.',
    '..SDDDFFFFFDdS.',
    '...SCCCCCCCcS..',
    '...SCCDDDCCcS..',
    '..SCCCDDDCCcCS.',
    'SCCCCGDDDGCcCCCS',
    'SCCCCGgDgGCcCCCS',
    '.SCCCGDDDGCcCCS.',
    '.SCCCDDDDDCcCS..',
    '..SCCCDDDCCcS...',
    '..SCCDDDDDcS....',
    '..SCDDDDDDcS....',
    '...SDDdDddS.....',
    '..SDDdDdSddS....',
    '.SDDdSDd.SdDS...',
    'SDDdSSDd..SdDS..',
    'SSS..SSS...SSS..',
  ],
];

// ── BOSS SPRITES (20×22, scale=3 → 60×66) ────────────────────────────────────

const P_OGRE = {
  '.': null,
  'S': c(0x111111),
  'B': c(0x9B7920),  // tan skin
  'b': c(0x6B5510),
  'A': c(0x888888),  // armor
  'a': c(0x555555),
  'G': c(0xCCAA00),  // gold
  'g': c(0x997700),
  'E': c(0xFF3333),
  'T': c(0xFFEECC),  // teeth
  'H': c(0xAA8800),  // hair
  'C': c(0x8B4513),  // club/weapon
  'c': c(0x5C2E00),
};

const OGRE = [
  // IDLE
  [
    '....SBBBBBbbS...',
    '..SBBBBBBBBBbS..',
    '.SBBBBBBBBBBBbS.',
    '.SBBBBEEEBBBBbS.',
    '.SBBBBBTBBBBBbS.',
    '.SBBBBBBBBBBBbS.',
    'SAAAAAAAAAAAAAaS',
    'SAaAAAAAAAAaaAS.',
    'SAaAGGGGGGAaaAS.',
    'SAaAGGGGGGAaaAS.',
    'SAaAGGGGGGAaaAS.',
    'SAAAGGGGGGAAAAaS',
    'SAAAAAAAAAAAAAaS',
    '.SBBBBBBBBBbbS..',
    '.SBBBbbBBBBbbS..',
    '.SBBBbbBBBBbbS..',
    '.SBBBbbBBBBbbS..',
    '.SBBBbbBBBBbbS..',
    '.SBBBbbBBBBbbS..',
    '..SbbSSSSSbbS...',
    '..SSSSSSSSSSSS..',
  ],
  // WALK
  [
    '....SBBBBBbbS...',
    '..SBBBBBBBBBbS..',
    '.SBBBBBBBBBBBbS.',
    '.SBBBBEEEBBBBbS.',
    '.SBBBBBTBBBBBbS.',
    '.SBBBBBBBBBBBbS.',
    'SAAAAAAAAAAAAAaS',
    'SAaAAAAAAAAaaAS.',
    'SAaAGGGGGGAaaAS.',
    'SAaAGGGGGGAaaAS.',
    'SAaAGGGGGGAaaAS.',
    'SAAAGGGGGGAAAAaS',
    'SAAAAAAAAAAAAAaS',
    '.SBBBBBBBBBbbS..',
    '.SBBBbbBBBBbbS..',
    '.SBBBbbBBBBbbS..',
    '.SBBbBBBBbBbbS..',
    '.SBbBBBBBBbbS...',
    'SBbBBBBBBbSBbbS.',
    'SBBSSSSSSS.SbbS.',
    'SSS........SSS..',
  ],
];

const P_BLACK_KNIGHT = {
  '.': null,
  'S': c(0x050505),
  'D': c(0x111111),  // dark armor
  'd': c(0x080808),
  'R': c(0xFF0000),  // red visor glow
  'G': c(0xCCAA00),  // gold trim
  'g': c(0x887700),
  'W': c(0xCCCCCC),  // sword blade
  'w': c(0x888888),
  'P': c(0x6666CC),  // shield glow
  'p': c(0x333399),
  'A': c(0x1A1A1A),
  'a': c(0x222222),
};

const BLACK_KNIGHT = [
  // IDLE
  [
    '.....SDDDDdS...',
    '....SDDDDDddS..',
    '...SDDDDDDdddS.',
    '...SDDRRRDdddS.',
    '...SDDRRRDdddS.',
    '...SDDDDDDdddS.',
    '..SDGGGGGGGddS.',
    '.SDDDDDDDDDdddS',
    '.SDGDDDDDDGdddS',
    '.SDGDDDDDDGdddS',
    '.SDGDDDDDDGdddS',
    '..SDDGGGGDddddS',
    '..SDDDDDDDddddS',
    '..SDDdDDddddS.W',
    '..SDDdDDdddS.WW',
    '..SDDdDDddS.WwW',
    '..SDDdDDdS..WwW',
    '..SDDdDDdS..WwW',
    '..SDDdDDdS..WwW',
    '...SddddS...WwW',
    '...SddddS...WwW',
  ],
  // WALK
  [
    '.....SDDDDdS...',
    '....SDDDDDddS..',
    '...SDDDDDDdddS.',
    '...SDDRRRDdddS.',
    '...SDDRRRDdddS.',
    '...SDDDDDDdddS.',
    '..SDGGGGGGGddS.',
    '.SDDDDDDDDDdddS',
    '.SDGDDDDDDGdddS',
    '.SDGDDDDDDGdddS',
    '.SDGDDDDDDGdddS',
    '..SDDGGGGDddddS',
    '..SDDDDDDDddddS',
    '..SDDdDDddddS.W',
    '..SDDdDDdddS.WW',
    '..SDDdDDddS.WwW',
    '..SDDdSDDdS.....',
    '..SDDdSdDdS.....',
    '.SDDdSS.SdDS....',
    '.SddSS...SddS...',
    '.SSS......SSS...',
  ],
];

const P_ARCLICH = {
  '.': null,
  'S': c(0x050005),
  'W': c(0xF0F0D8),  // bone
  'w': c(0xCCCCAA),
  'P': c(0x7700CC),  // purple robe
  'p': c(0x440077),
  'C': c(0x00FFFF),  // cyan eyes/magic
  'c': c(0x009999),
  'G': c(0xFFCC00),  // gold crown
  'g': c(0xCC8800),
  'M': c(0xBB00FF),  // magic aura
  'm': c(0x880099),
  'O': c(0xFF8800),  // orange glow orb
};

const ARCLICH = [
  // IDLE
  [
    '....SGGGGgS....',
    '...SGGGGGGgS...',
    '..SGWGGGGGWGS..',
    '..SWWWWWWWWwS..',
    '..SWwWCCCWwwS..',
    '..SWwwwwwwwwS..',
    '..SWwwwwwwwwS..',
    '.SPPPWwwwwWppS.',
    '.SPPPPWwwWpppS.',
    '.SPPPPPPPpppS..',
    '.SWPPPPPPWppS..',
    '..SWWPPPPWpS...',
    '..SPWWWWpS.....',
    '.SwwwSSwwwS....',
    '.SwwwSSwwwS....',
    '.SWWwSSWWwS....',
    '.SWWwSSWWwS....',
    '..SWwSSWwS.....',
    '..SWwSSWwS.....',
    '...SWSSWwSS....',
    '...SSSSSSSSS...',
  ],
  // CAST (arms raising)
  [
    '....SGGGGgS....',
    '...SGGGGGGgS...',
    '..SGWGGGGGWGS..',
    '..SWWWWWWWWwS..',
    '..SWwWCCCWwwS..',
    '..SWwwwwwwwwS..',
    '..SWwwwwwwwwS..',
    'MmSPPPWwwwWppSMm',
    'MMSPPPPWwwWpppSM',
    'MmSPPPPPPPpppSMm',
    'MmSWPPPPPPWppSMm',
    '..SWWPPPPWpS....',
    '..SPWWWWpS......',
    '.SwwwSSwwwS.....',
    '.SWWwSSWWwS.....',
    '.SWWwSSWWwS.....',
    '.SwwwSSwwwS.....',
    '..SwwSSWwS......',
    '..SWwSSWwS......',
    '...SWSSWwSS.....',
    '...SSSSSSSSS....',
  ],
];

const P_DRAGON = {
  '.': null,
  'S': c(0x110000),
  'R': c(0x9B0000),
  'r': c(0x660000),
  'O': c(0xFF4400),
  'o': c(0xCC2200),
  'Y': c(0xFFFF00),  // eye
  'F': c(0xFF8800),  // fire
  'f': c(0xFFCC00),  // fire light
  'W': c(0xBB0000),  // wing membrane
  'w': c(0x770000),
  'H': c(0xCC2200),  // horn
  'h': c(0xAA1100),
  'T': c(0xEEEECC),  // teeth
  'B': c(0x441100),  // darker belly
};

const DRAGON = [
  // IDLE
  [
    '..HHSRRRRRRrSRr.',
    '..HhSRRRRRRRrrS.',
    '...SRRRRRRRRrrS.',
    '...SRRRYRRRRrrS.',
    '...SRRRRRRRRrrS.',
    '.SRRRTTRRRRRRS..',
    'SRRRROORRRRORRRS',
    'SRRRRRRRRRRRRRRS',
    'SRRRRRRRRRRRRRRS',
    '.SRRRRRRRRRRRS..',
    '.SRRrOOOOrrrS...',
    'WRRRRRRRRRRRSRRR',
    'WRRRRRRRRRrS.RRR',
    'WRRRRRRRRrS..RRR',
    '.SRRRRRRrS...rrS',
    '..SRRrrRRS......',
    '..SRRrrRRS......',
    '...SRRrRS.......',
    '...SRrrRS.......',
    '....SrRS........',
    '....SSSS........',
  ],
  // ATTACK (fire breath)
  [
    '..HHSRRRRRRrSRr.',
    '..HhSRRRRRRRrrS.',
    '...SRRRRRRRRrrS.',
    '...SRRRYRRRRrrS.',
    '...SRRRRRRRRrrS.',
    '.SRRRTTRRRRRRS..',
    'SRRRROORRRRORRRS',
    'SRRRRRRRRRRRRRRS',
    'SRRRRRRRRRRRRRRS',
    '.SRRRRRRRRRRRS..',
    '.SRRrOOOOrrrSFFF',
    'WRRRRRRRRRRRSFff',
    'WRRRRRRRRRrS.FFF',
    'WRRRRRRRRrS..fff',
    '.SRRRRRRrS...FFf',
    '..SRRrrRRS......',
    '..SRRrrRRS......',
    '...SRRrRS.......',
    '...SRrrRS.......',
    '....SrRS........',
    '....SSSS........',
  ],
];

// ── PICKUPS & PROJECTILES ─────────────────────────────────────────────────────

const P_PICKUP = {
  '.': null,
  'C': c(0x00FFFF),  // cyan crystal
  'c': c(0x009999),
  'W': c(0xFFFFFF),
  'G': c(0xFFDD00),  // gold
  'g': c(0xBB9900),
  'D': c(0xFFAA00),  // dark gold
  'M': c(0xCC44FF),  // magnet purple
  'm': c(0x8800CC),
  'N': c(0xCC00FF),  // magnet glow
  'S': c(0x222222),
  'R': c(0xFF2222),  // red
};

const XP_CRYSTAL_F0 = [
  '...SC..',
  '..SCCS.',
  '.SCCCCS',
  'SCCCCCCS',
  '.SCCCCS',
  '..SCCS.',
  '...SC..',
];

const XP_CRYSTAL_F1 = [
  '...SCS.',
  '..SCWCS',
  '.SCWwCS',
  'SCCWwCCS',
  '.SCwWCS',
  '..SCWcS',
  '...SCS.',
];

const GOLD_COIN_F0 = [
  '..SGGgS.',
  '.SGGGGgS',
  'SGGGgGGgS',
  'SGGgDGGgS',
  'SGGGgGGgS',
  '.SGGGGgS',
  '..SGGgS.',
];

const GOLD_COIN_F1 = [
  '..SGGgS.',
  '.SGGGGgS',
  'SGGGGGGgS',
  'SGgDDDGgS',
  'SGGGGGGgS',
  '.SGGGGgS',
  '..SGGgS.',
];

const MAGNET_F0 = [
  '.SMMMNMMS.',
  'SMMMmNmMMS',
  'SMMMmNmMMS',
  '.SMMmNmMS.',
  '..SmNNmS..',
  '...SNN S..',
  '..SmmmmS..',
  '.SmMMMMmS.',
  'SMMMmMMMMS',
  '.SMMmMMMS.',
];

const MAGNET_F1 = [
  '.SNMMMMNMS',
  'SNMMmmmMNS',
  'SNMNmmmNMS',
  '.SMNmmmNMS',
  '..SNNNNmS.',
  '...SNNNS..',
  '..SmmmmS..',
  '.SmMMMMmS.',
  'SMMMmMMMMS',
  '.SMMmMMMS.',
];

// ── Projectile sprites ────────────────────────────────────────────────────────
const P_PROJ = {
  '.': null,
  'A': c(0xCCBB88),  // arrow shaft
  'a': c(0x887744),
  'T': c(0x888888),  // arrowhead
  'F': c(0xFF6600),  // fire orange
  'f': c(0xFF2200),
  'Y': c(0xFFFF00),  // yellow glow
  'W': c(0xFFFFFF),  // white
  'C': c(0x00FFFF),  // cyan lightning
  'c': c(0x008888),
  'P': c(0xCC44FF),  // purple magic
  'p': c(0x880099),
  'G': c(0xCCFF44),  // green (cross orb)
  'H': c(0xFFDD00),  // holy gold
  'S': c(0x111111),
};

const ARROW_SPRITE = [
  [
    '.....TAAA',
    '...TAAAAa',
    '.TTAAAAaa',
    '...TAAAAa',
    '.....TAAA',
  ],
];

const FIREBALL_SPRITE = [
  [
    '..SFFS..',
    '.SFFffFS.',
    'SFFFfffFS',
    'SFFYfffFS',
    'SFFFfffFS',
    '.SFFffFS.',
    '..SFFS..',
  ],
];

const HOLY_ORB_SPRITE = [
  [
    '..SHH S..',
    '.SHHHHHS.',
    'SHHWHHWHS',
    'SHHWHHWHS',
    'SHHHHHHHS',
    '.SHHHHHS.',
    '..SHHHS..',
  ],
];

// ── Main ──────────────────────────────────────────────────────────────────────
const outDir = path.join(__dirname, '..', 'public', 'assets', 'sprites');
fs.mkdirSync(outDir, { recursive: true });

console.log('\nGenerating sprite PNG files...\n');

// Heroes (scale 3 → 48×60 per frame, 4 frames)
save('knight', KNIGHT.map(rows => ({ rows, pal: P_KNIGHT })), 3, outDir);
save('archer', ARCHER.map(rows => ({ rows, pal: P_ARCHER })), 3, outDir);
save('mage',   MAGE.map(rows =>   ({ rows, pal: P_MAGE })),   3, outDir);
save('rogue',  ROGUE.map(rows =>  ({ rows, pal: P_ROGUE })),  3, outDir);

// Regular enemies (scale 3 → 48×48, 3 frames)
save('wolf',         WOLF.map(r => ({ rows: r, pal: P_WOLF })),         3, outDir);
save('skeleton',     SKELETON.map(r => ({ rows: r, pal: P_SKELETON })), 3, outDir);
save('zombie',       ZOMBIE.map(r => ({ rows: r, pal: P_ZOMBIE })),     3, outDir);
save('goblin',       GOBLIN.map(r => ({ rows: r, pal: P_GOBLIN })),     3, outDir);
save('necromancer',  NECROMANCER.map(r => ({ rows: r, pal: P_NECROMANCER })), 3, outDir);
save('demon',        DEMON.map(r => ({ rows: r, pal: P_DEMON })),       3, outDir);
save('vampire',      VAMPIRE.map(r => ({ rows: r, pal: P_VAMPIRE })),   3, outDir);

// Bosses (scale 3 → 60×66, 2 frames)
save('ogre_warlord', OGRE.map(r => ({ rows: r, pal: P_OGRE })),               3, outDir);
save('black_knight', BLACK_KNIGHT.map(r => ({ rows: r, pal: P_BLACK_KNIGHT })), 3, outDir);
save('arclich',      ARCLICH.map(r => ({ rows: r, pal: P_ARCLICH })),          3, outDir);
save('chaos_dragon', DRAGON.map(r => ({ rows: r, pal: P_DRAGON })),            3, outDir);

// Pickups (scale 4 → 28-40px per frame, 2 frames)
save('xp_crystal',  [{ rows: XP_CRYSTAL_F0, pal: P_PICKUP }, { rows: XP_CRYSTAL_F1, pal: P_PICKUP }], 4, outDir);
save('gold_coin',   [{ rows: GOLD_COIN_F0,  pal: P_PICKUP }, { rows: GOLD_COIN_F1,  pal: P_PICKUP }], 4, outDir);
save('loot_magnet', [{ rows: MAGNET_F0,     pal: P_PICKUP }, { rows: MAGNET_F1,     pal: P_PICKUP }], 4, outDir);

// Projectiles (scale 3, 1 frame)
save('arrow',     ARROW_SPRITE.map(r => ({ rows: r, pal: P_PROJ })),    3, outDir);
save('fireball',  FIREBALL_SPRITE.map(r => ({ rows: r, pal: P_PROJ })), 3, outDir);
save('holy_cross', HOLY_ORB_SPRITE.map(r => ({ rows: r, pal: P_PROJ })), 3, outDir);

console.log('\nAll sprites generated!\n');
