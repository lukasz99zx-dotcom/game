import Phaser from 'phaser';

export function renderPixelArt(
  g: Phaser.GameObjects.Graphics,
  rows: string[],
  palette: Record<string, number | null>,
  scale: number = 2
): void {
  for (let r = 0; r < rows.length; r++) {
    for (let c = 0; c < rows[r].length; c++) {
      const ch = rows[r][c];
      if (ch === '.' || palette[ch] === null || palette[ch] === undefined) continue;
      g.fillStyle(palette[ch] as number);
      g.fillRect(c * scale, r * scale, scale, scale);
    }
  }
}

// ─── COLOR PALETTES ────────────────────────────────────────────────────
export const P_KNIGHT: Record<string, number | null> = {
  '.': null,
  'S': 0x222222, // shadow/outline
  'H': 0x666666, // dark helmet
  'h': 0x999999, // light helmet
  'A': 0xAAAAAA, // armor
  'a': 0x777777, // dark armor
  'f': 0xFFCC88, // face skin
  'e': 0x221100, // eye
  'Y': 0xFFDD00, // gold cross
  'R': 0xAA1111, // red cape
  'r': 0x660000, // dark red
  'L': 0xAAAAAA, // leg armor
  'l': 0x777777, // dark leg
  'G': 0x888888, // gray
};

export const P_ARCHER: Record<string, number | null> = {
  '.': null,
  'S': 0x222222,
  'B': 0x5C3317, // brown body
  'b': 0x3A1F0A, // dark brown
  'f': 0xFFCC88,
  'e': 0x221100,
  'G': 0x2E8B57, // green hood/belt
  'g': 0x1A5C38,
  'W': 0xDEB887, // wood bow
  'w': 0xA0522D,
  'L': 0x5C3317,
  'l': 0x3A1F0A,
  'Q': 0xCCCCCC, // quiver arrows
};

export const P_MAGE: Record<string, number | null> = {
  '.': null,
  'S': 0x222222,
  'R': 0x6A0DAD, // purple robe
  'r': 0x420A6D, // dark purple
  'f': 0xFFCC88,
  'e': 0x221100,
  'H': 0x8B008B, // hat
  'h': 0xAA00AA,
  'Y': 0xFFDD00, // gold star/trim
  'C': 0x00FFFF, // cyan magic glow
  'W': 0xDDDDDD, // staff
  'w': 0xAAAAAA,
};

export const P_ROGUE: Record<string, number | null> = {
  '.': null,
  'S': 0x111111,
  'D': 0x1A1A1A, // dark outfit
  'd': 0x0A0A0A,
  'f': 0xDDAACC, // pale face
  'e': 0xFF0000, // red eyes
  'R': 0xAA0000, // red scarf
  'L': 0x222222,
  'l': 0x111111,
  'K': 0xCCCCCC, // knife/dagger
  'k': 0x888888,
};

// ─── SPRITE DEFINITIONS ─────────────────────────────────────────────────
// 16×16 pixel art (rendered at scale=2 → 32×32)

export const KNIGHT_FRAME0 = [
  '..HHHHHHHH......',
  '.HhhhhhhhhH.....',
  '.HHfffffHHH.....',
  '.HHfeeffHHH.....',
  '.HHfffffHHH.....',
  '.SHHHHHHHS......',
  '.SAAYAAAS.......',
  'SAAYYYYYAAS.....',
  'SAYYYYYYYAS.....',
  'SAAYYYYYAAS.....',
  '.SAaAAAAaAS.....',
  '..SllSllS.......',
  '..SllSllS.......',
  '..SllSllS.......',
  '..SLLSLLS.......',
  '..S..S..S.......',
];

export const KNIGHT_FRAME1 = [
  '..HHHHHHHH......',
  '.HhhhhhhhhH.....',
  '.HHfffffHHH.....',
  '.HHfeeffHHH.....',
  '.HHfffffHHH.....',
  '.SHHHHHHHS......',
  '.SAAYAAAS.......',
  'SAAYYYYYAAS.....',
  'SAYYYYYYYAS.....',
  'SAAYYYYYAAS.....',
  '.SAaAAAAaAS.....',
  '..SllSLLS.......',
  '..SllSLLS.......',
  '..SLLSLLS.......',
  '..SLLSLLS.......',
  '..S..S..S.......',
];

export const ARCHER_FRAME0 = [
  '...GBBBBg.......',
  '..GBBbbBBg......',
  '..GBffffBg......',
  '..GBfeeefg......',
  '..GBffffBg......',
  '..SGBBBGSg......',
  '.SBBGgGBBS......',
  'WBBBBBBBBBW.....',
  'wBBBBBBBBBW.....',
  'WBBBBBBBBBW.....',
  '.SBBGgGBBS......',
  '..SLLSLLs.......',
  '..SLLSLLs.......',
  '..SLLS..s.......',
  '..SBBSBBs.......',
  '..S..S..s.......',
];

export const ARCHER_FRAME1 = [
  '...GBBBBg.......',
  '..GBBbbBBg......',
  '..GBffffBg......',
  '..GBfeeefg......',
  '..GBffffBg......',
  '..SGBBBGSg......',
  '.SBBGgGBBS......',
  'WBBBBBBBBBW.....',
  'wBBBBBBBBBW.....',
  'WBBBBBBBBBW.....',
  '.SBBGgGBBS......',
  '..SLLSLLs.......',
  '..SLLSLLs.......',
  '..SBBSLLs.......',
  '..SBBSBBs.......',
  '..S..S..s.......',
];

export const MAGE_FRAME0 = [
  '...HHHHH........',
  '..HhHHHhH.......',
  '.HhHffffHhH.....',
  '.HHHfeeefHH.....',
  '.HHHffffHHH.....',
  '.SRRRRRRSs......',
  '.SRRYYRRSs......',
  'SRRCYYCRRS......',
  'SRRYYYYYRS......',
  'SRRCYYCRRS......',
  '.SRRRRRRSs......',
  '..SWRRWSs.......',
  '..SWRRWSs.......',
  '..SWRRWS........',
  '..SRRRRs........',
  '..S....s........',
];

export const MAGE_FRAME1 = [
  '...HHHHH........',
  '..HhHHHhH.......',
  '.HhHffffHhH.....',
  '.HHHfeeefHH.....',
  '.HHHffffHHH.....',
  '.SRRRRRRSs......',
  '.SRRYYRRSs......',
  'SRRCYYCRRS......',
  'SRRYYYYYRS......',
  'SRRCYYCRRS......',
  '.SRRRRRRSs......',
  '..SWRRWSs.......',
  '..SWRRWSs.......',
  '..SRRRWWs.......',
  '..SRRRRs........',
  '..S....s........',
];

export const ROGUE_FRAME0 = [
  '...SSSSSS.......',
  '..SDDDDDDSs.....',
  '..SDffffDS......',
  '..SDfeeefS......',
  '..SDRRRRdS......',
  '..SDDDDDdS......',
  '.SDDDDDDdSK.....',
  'SDDDDDDDDSkK....',
  'SDDDDDDDDSkK....',
  'SDDDDDDDDSkK....',
  '.SDDDDDDdS......',
  '..SlllSSSs......',
  '..SlllSSSs......',
  '..SlllSSSs......',
  '..SDDDDDDS......',
  '..S....S........',
];

export const ROGUE_FRAME1 = [
  '...SSSSSS.......',
  '..SDDDDDDSs.....',
  '..SDffffDS......',
  '..SDfeeefS......',
  '..SDRRRRdS......',
  '..SDDDDDdS......',
  '.SDDDDDDdSK.....',
  'SDDDDDDDDSkK....',
  'SDDDDDDDDSkK....',
  'SDDDDDDDDSkK....',
  '.SDDDDDDdS......',
  '..SSSSlllS......',
  '..SSSSlllS......',
  '..SSSSlllS......',
  '..SDDDDDDS......',
  '..S....S........',
];

// ─── ENEMY SPRITES ────────────────────────────────────────────────────

export const P_WOLF: Record<string, number | null> = {
  '.': null,
  'S': 0x111111,
  'B': 0x8B7355, // brown body
  'b': 0x6B5335, // dark brown
  'G': 0x9B8365, // gray-brown
  'e': 0xFF4444, // red eye
  'T': 0x888888, // teeth
  'L': 0x7B6345, // leg
};

export const WOLF_FRAME0 = [
  '....BBBBBB......',
  '..BBBBBBBBBb....',
  '.BBGGBbbbBBBb...',
  '.BBGGBBBBBBBb...',
  '.BBBBeeeBBBBb...',
  '.SBBBBBBBBBS....',
  '.SBBBBBBBBBS....',
  '.SBBBBBBBBBS....',
  '..SBBLLLLBBS....',
  '...SLLbbLLS.....',
  '..SLSbbbSLS.....',
  '.SLSS...SSLS....',
  '..SS.....SS.....',
];

export const WOLF_FRAME1 = [
  '....BBBBBB......',
  '..BBBBBBBBBb....',
  '.BBGGBbbbBBBb...',
  '.BBGGBBBBBBBb...',
  '.BBBBeeeBBBBb...',
  '.SBBBBBBBBBS....',
  '.SBBBBBBBBBS....',
  '.SBBBBBBBBBS....',
  '..SBBLLLLBBS....',
  '...SLLbbLLS.....',
  '.SLSbbbSLS......',
  'SLSS...SSLS.....',
  '.SS.....SS......',
];

export const P_SKELETON: Record<string, number | null> = {
  '.': null,
  'S': 0x222222,
  'W': 0xF5F5DC, // bone white
  'w': 0xCCCCAA, // darker bone
  'e': 0xFF0000, // glowing red eyes
  'R': 0xAA2222, // rust/damage
};

export const SKELETON_FRAME0 = [
  '.....SWWWS......',
  '....SWwWwWS.....',
  '....SWeWeWS.....',
  '....SWwwwWS.....',
  '....SWwwwWS.....',
  '.....SWwWS......',
  '..SWWWwwWWWS....',
  '..SWwWwwWwWS....',
  '..SWWWwwWWWS....',
  '.....SWwWS......',
  '....SWwwwWS.....',
  '...SWS.SWS......',
  '...SWS.SWS......',
  '...SWS.SWS......',
  '...SWS.SWS......',
  '...SSS.SSS......',
];

export const SKELETON_FRAME1 = [
  '.....SWWWS......',
  '....SWwWwWS.....',
  '....SWeWeWS.....',
  '....SWwwwWS.....',
  '....SWwwwWS.....',
  '.....SWwWS......',
  '..SWWWwwWWWS....',
  '..SWwWwwWwWS....',
  '..SWWWwwWWWS....',
  '.....SWwWS......',
  '....SWwwwWS.....',
  '..SWSSWwwS......',
  '..SWSSWwwS......',
  '..SWwSWSSS......',
  '..SWwSWSSS......',
  '..SSSSSSSS......',
];

export const P_ZOMBIE: Record<string, number | null> = {
  '.': null,
  'S': 0x1A2A1A,
  'G': 0x5A8A5A, // zombie green
  'g': 0x3A6A3A, // dark green
  'f': 0x8ABB8A, // pale green face
  'e': 0xFF0000,
  'R': 0xAA0000, // blood
  'B': 0x4A7A4A, // body
};

export const ZOMBIE_FRAME0 = [
  '....SGGGGgS.....',
  '...SGGffffGS....',
  '...SGGfeefGS....',
  '...SGGffffGS....',
  '...SGGRRRGgS....',
  '....SGGGGgS.....',
  '..SBBBBBBBgS....',
  '.SBBGBBBBGBgS...',
  '.SBBBBBBBBBgS...',
  '.SBBGBBBBGBgS...',
  '..SBBBBBBBgS....',
  '...SGBBBGgS.....',
  '...SGBBBGgS.....',
  '...SBGGBgS......',
  '....SBBBgS......',
  '.....SSSSs......',
];

export const ZOMBIE_FRAME1 = [
  '....SGGGGgS.....',
  '...SGGffffGS....',
  '...SGGfeefGS....',
  '...SGGffffGS....',
  '...SGGRRRGgS....',
  '....SGGGGgS.....',
  '..SBBBBBBBgS....',
  '.SBBGBBBBGBgS...',
  '.SBBBBBBBBBgS...',
  '.SBBGBBBBGBgS...',
  '..SBBBBBBBgS....',
  '...SGBBBGgS.....',
  '...SBGBBGgS.....',
  '...SBBGBgS......',
  '....SBBBgS......',
  '.....SSSSs......',
];

export const P_GOBLIN: Record<string, number | null> = {
  '.': null,
  'S': 0x1A1A0A,
  'G': 0x3CB371, // goblin green
  'g': 0x2E8B57, // dark green
  'f': 0x55BB88, // face green
  'e': 0xFFFF00, // yellow eyes
  'B': 0x8B4513, // brown (weapon/belt)
  'T': 0xAAAA00, // teeth yellow
  'A': 0x777744, // leather armor
};

export const GOBLIN_FRAME0 = [
  '....SGGGGGG.....',
  '..SGGGffffGGS...',
  '..SGGGfeeefGS...',
  '..SGGGffffGGS...',
  '...SGGGTGGgS....',
  '....SAAAAgS.....',
  '...SAAAAAgS.....',
  '..SAAAAAAgSB....',
  '..SAAAAgAgSBB...',
  '..SAAAAAAAAs....',
  '...SAggAggSs....',
  '....SGSGgSs.....',
  '....SGSGgSs.....',
  '....SGSGgSs.....',
  '....SBSBgSs.....',
  '....SSSSSSs.....',
];

export const GOBLIN_FRAME1 = [
  '....SGGGGGG.....',
  '..SGGGffffGGS...',
  '..SGGGfeeefGS...',
  '..SGGGffffGGS...',
  '...SGGGTGGgS....',
  '....SAAAAgS.....',
  '...SAAAAAgS.....',
  '..SAAAAAAgSB....',
  '..SAAAAgAgSBB...',
  '..SAAAAAAAAs....',
  '...SAggAggSs....',
  '....SBSGgSs.....',
  '....SBSGgSs.....',
  '....SGSBgSs.....',
  '....SGSBgSs.....',
  '....SSSSSSs.....',
];

export const P_NECROMANCER: Record<string, number | null> = {
  '.': null,
  'S': 0x0A000A,
  'D': 0x1A001A, // dark robe
  'd': 0x100010,
  'P': 0x9400D3, // purple trim
  'p': 0x5A008A,
  'f': 0xDDCCEE, // pale face
  'e': 0x00FFFF, // cyan eyes
  'C': 0x00CCCC, // cyan magic
  'W': 0x888888, // staff
  'w': 0x555555,
  'Y': 0xAAFF00, // skull ornament
};

export const NECROMANCER_FRAME0 = [
  '...SDDPDDDS.....',
  '...SDffffDS.....',
  '...SDfeeefDS....',
  '...SDffffDS.....',
  '...SDDPDDdS.....',
  '...SDDDDDdS.....',
  '..SDDPpPDDdS....',
  '.WSDDDDDDDdSW...',
  '.WSDDDDDDDdSW...',
  '.WSDDPpPDDdSW...',
  '..SDDDDDDDdS....',
  '..SDPpppPDdS....',
  '..SDDDDDDdS.....',
  '..SDPPPPDdS.....',
  '...SDDDDdS......',
  '....SSSSs.......',
];

export const NECROMANCER_FRAME1 = [
  '...SDDPDDDS.....',
  '...SDffffDS.....',
  '...SDfeeefDS....',
  '...SDffffDS.....',
  '...SDDPDDdS.....',
  '...SDDDDDdS.....',
  '.WSDDPpPDDdSW...',
  'WSDDDDDDDDdSWW..',
  '.WSDDDDDDDdSW...',
  '..SDDPpPDDdSW...',
  '..SDDDDDDDdS....',
  '..SDPpppPDdS....',
  '..SDDDDDDdS.....',
  '..SDPPPPDdS.....',
  '...SDDDDdS......',
  '....SSSSs.......',
];

export const P_DEMON: Record<string, number | null> = {
  '.': null,
  'S': 0x1A0000,
  'R': 0xCC2200, // red body
  'r': 0x881100, // dark red
  'O': 0xFF4400, // orange highlights
  'H': 0xDD3300, // horn
  'h': 0xBB1100, // dark horn
  'f': 0xFF6644, // face
  'e': 0xFFFF00, // yellow eyes
  'W': 0x880000, // wings
  'w': 0x440000,
  'L': 0xAA1100, // legs
};

export const DEMON_FRAME0 = [
  '..HHSRRRSHh.....',
  '.HhHSfffSHhH....',
  '.HhHSfeefSHh....',
  '...SfffffS......',
  '..SRRRRRRrS.....',
  '.SRRRRRRRRrS....',
  'SRRRRRRRRRRrS...',
  '.SRROOOORRrS....',
  '.SRRRRRRRRrS....',
  '.SRROOOORRrS....',
  '..SRRRRRRrS.....',
  '...SLLrLLSs.....',
  '...SLLrLLSs.....',
  '...SLLrLLSs.....',
  '...SRRrRRSs.....',
  '...SSSSSSs......',
];

export const DEMON_FRAME1 = [
  '..HHSRRRSHh.....',
  '.HhHSfffSHhH....',
  '.HhHSfeefSHh....',
  '...SfffffS......',
  '..SRRRRRRrS.....',
  '.SRRRRRRRRrS....',
  'SRRRRRRRRRRrS...',
  '.SRROOOORRrS....',
  '.SRRRRRRRRrS....',
  '.SRROOOORRrS....',
  '..SRRRRRRrS.....',
  '...SRRrLLSs.....',
  '...SRRrLLSs.....',
  '...SLLrRRSs.....',
  '...SLLrRRSs.....',
  '...SSSSSSs......',
];

export const P_VAMPIRE: Record<string, number | null> = {
  '.': null,
  'S': 0x0A0005,
  'D': 0x2A0A2A, // dark purple body
  'd': 0x1A001A,
  'C': 0xCC0044, // crimson cape
  'c': 0x880022,
  'f': 0xDDAACC, // pale face
  'e': 0xFF0000, // red eyes
  'F': 0xFFFFFF, // fangs
  'H': 0x1A001A, // hair
};

export const VAMPIRE_FRAME0 = [
  '....SDDHHdS.....',
  '...SDDffffDdS...',
  '...SDfDeeefDS...',
  '...SDffffFFdS...',
  '...SCCCCCCcS....',
  '...SCCDDDCcS....',
  '..SCCDDDDDCcS...',
  '.SCCCDDDDDCcCS..',
  'SCCCCDDDDCCcCCS.',
  '.SCCCDDDDCCcCS..',
  '..SCCDDDDCcS....',
  '...SDdDdDdS.....',
  '...SDdDdDdS.....',
  '...SDDdDDdS.....',
  '...SddDddS......',
  '....SSSSS.......',
];

export const VAMPIRE_FRAME1 = [
  '....SDDHHdS.....',
  '...SDDffffDdS...',
  '...SDfDeeefDS...',
  '...SDffffFFdS...',
  '...SCCCCCCcS....',
  '...SCCDDDCcS....',
  '..SCCCDDDCCcS...',
  'SCCCCDDDDDCcCS..',
  '.SCCCCDDDCCcCS..',
  '..SCCCDDDCCcS...',
  '..SCCDDDDCcS....',
  '...SDdDdDdS.....',
  '...SdDdDdDS.....',
  '...SDDdDDdS.....',
  '...SddDddS......',
  '....SSSSS.......',
];

// ─── BOSS SPRITES ────────────────────────────────────────────────────

export const P_BOSS_OGRE: Record<string, number | null> = {
  '.': null,
  'S': 0x111111,
  'B': 0x8B6914, // brown skin
  'b': 0x5B4014,
  'A': 0x777777, // armor
  'a': 0x444444,
  'G': 0xCCCC00, // gold
  'e': 0xFF2222,
  'T': 0xFFFFCC, // teeth
  'W': 0x888888, // weapon
};

export const OGRE_FRAME0 = [
  '..SBBBBBBBBBBBS.',
  '.SBBBBBBBBBBBbS.',
  '.SBBBBBBBBBBbbS.',
  'SBBBBeeBBBBBbbS.',
  'SBBBBBTTBBBBbbS.',
  '.SBBBBBBBBBbbS..',
  '.SAAAAAAAAAAAS..',
  'SAAAAAAAAAAAAAAS',
  'SAAAGGGGGGGAAAaS',
  'SAAAGGGGGGGAAAaS',
  'SAAAGGGGGGGAAAaS',
  'SAAAAaaaaaAAAAaS',
  'SAAAAaaaaaAAAAaS',
  '.SAAAaaaaaAAAaS.',
  '..SBBaBaBBBaS...',
  '..SBBaBaBBBaS...',
  '..SBBaBaBBBaS...',
  '..SBBaBaBBBaS...',
  '..SBBaBaBBBaS...',
  '..SBBaBaBBBaS...',
  '...SbbSbbbbS....',
];

export const OGRE_FRAME1 = [
  '..SBBBBBBBBBBBS.',
  '.SBBBBBBBBBBBbS.',
  '.SBBBBBBBBBBbbS.',
  'SBBBBeeBBBBBbbS.',
  'SBBBBBTTBBBBbbS.',
  '.SBBBBBBBBBbbS..',
  '.SAAAAAAAAAAAS..',
  'SAAAAAAAAAAAAAAS',
  'SAAAGGGGGGGAAAaS',
  'SAAAGGGGGGGAAAaS',
  'SAAAGGGGGGGAAAaS',
  'SAAAAaaaaaAAAAaS',
  'SAAAAaaaaaAAAAaS',
  '.SAAAaaaaaAAAaS.',
  '..SbBaBaBBBaS...',
  '..SbBaBaBBBaS...',
  '..SBBaBaBbBaS...',
  '..SBBaBaBbBaS...',
  '..SbBaBaBBBaS...',
  '..SbBaBaBBBaS...',
  '...SbbSbbbbS....',
];

export const P_BOSS_BLACK_KNIGHT: Record<string, number | null> = {
  '.': null,
  'S': 0x050505,
  'D': 0x111111, // dark armor
  'd': 0x080808,
  'R': 0xCC0000, // red visor glow
  'G': 0xCCCC00, // gold trim
  'g': 0x888800,
  'W': 0xAAAAAA, // sword blade
  'w': 0x666666,
  'P': 0x8888CC, // shield glow
};

export const BLACK_KNIGHT_FRAME0 = [
  '.....SDDDDS.....',
  '....SDDDDDdS....',
  '...SDDDDDDddS...',
  '...SDDRRRDddS...',
  '...SDDRRRDddS...',
  '...SDDDDDDdS....',
  '..SDGGGGGGGdS...',
  '.SDDDDDDDDDddS..',
  '.SDGDDDDDDGdS...',
  '.SDGDDDDDDGdS...',
  '.SDGDDDDDDGdS...',
  '..SDDGGGGDddS...',
  '..SDDDDDDDdS....',
  '...SDdDDddS.WWWW',
  '...SDdDDddS.WwwW',
  '...SDdDDddS.WwwW',
  '...SDdDDddS.WwwW',
  '...SDdDDddS.WwwW',
  '...SDdDDddS.....',
  '....SddddS......',
  '....SddddS......',
];

export const BLACK_KNIGHT_FRAME1 = [
  '.....SDDDDS.....',
  '....SDDDDDdS....',
  '...SDDDDDDddS...',
  '...SDDRRRDddS...',
  '...SDDRRRDddS...',
  '...SDDDDDDdS....',
  '..SDGGGGGGGdS...',
  '.SDDDDDDDDDddS..',
  '.SDGDDDDDDGdS...',
  '.SDGDDDDDDGdS...',
  '.SDGDDDDDDGdS...',
  '..SDDGGGGDddS...',
  '..SDDDDDDDdS....',
  'WWWW.SDdDDddS...',
  'WwwW.SDdDDddS...',
  'WwwW.SDdDDddS...',
  'WwwW.SDdDDddS...',
  'WwwW.SDdDDddS...',
  '...SDdDDddS.....',
  '....SddddS......',
  '....SddddS......',
];

export const P_BOSS_ARCLICH: Record<string, number | null> = {
  '.': null,
  'S': 0x050505,
  'W': 0xF5F5DC, // bone
  'w': 0xCCCCAA,
  'P': 0x6600CC, // purple robe
  'p': 0x440088,
  'C': 0x00FFFF, // cyan eyes/magic
  'G': 0xFFCC00, // gold crown
  'g': 0xCC8800,
  'M': 0x9900FF, // magic aura
  'O': 0xFF6600, // orange glow
};

export const ARCLICH_FRAME0 = [
  '....SGGGGgS.....',
  '...SGGGGGGgS....',
  '...SGGGGGGgS....',
  '..SWWWWWWWwS....',
  '..SWWCCCWwwS....',
  '..SWwwwwwwwS....',
  '..SWwwwwwwwS....',
  '.SPPWwwwwWppS...',
  '.SPPPWwwWpppS...',
  '.SPPPPPPPpppS...',
  '.SWPPPPPPWppS...',
  '.SWWPPPPWWpS....',
  '..SPWWWWpS......',
  '.SwwwSSwwwS.....',
  '.SwwwSSwwwS.....',
  '.SWWwSSWWwS.....',
  '.SWWwSSWWwS.....',
  '..SWwSSWwS......',
  '..SWwSSWwS......',
  '...SWSSWSS......',
  '...SSSSSS.......',
];

export const ARCLICH_FRAME1 = [
  '....SGGGGgS.....',
  '...SGGGGGGgS....',
  '...SGGGGGGgS....',
  '..SWWWWWWWwS....',
  '..SWWCCCWwwS....',
  '..SWwwwwwwwS....',
  '..SWwwwwwwwS....',
  'SwwWPPPPPPwwS...',
  '.SPPPPPPPPpS....',
  '.SPMPPPPMPpS....',
  '.SWPMPPMPWpS....',
  '.SWWPPPPWWpS....',
  '..SPWWWWpS......',
  '.SwwwSSwwwS.....',
  '.SWWwSSWWwS.....',
  '.SWWwSSWWwS.....',
  '.SwwwSSwwwS.....',
  '..SwwSSWwS......',
  '..SWwSSWwS......',
  '...SWSSWSS......',
  '...SSSSSS.......',
];

export const P_BOSS_DRAGON: Record<string, number | null> = {
  '.': null,
  'S': 0x110000,
  'R': 0x8B0000, // dark red body
  'r': 0x550000,
  'O': 0xFF4400, // orange
  'o': 0xCC2200,
  'Y': 0xFFFF00, // yellow eye
  'F': 0xFF8800, // fire breath
  'f': 0xFFCC00, // light fire
  'W': 0xAA0000, // wing
  'w': 0x660000,
  'T': 0x888888, // teeth
  'H': 0xCC2200, // horn
};

export const DRAGON_FRAME0 = [
  '.HHSRRRRRRRRSRR.',
  '.HHSRRRRRRRRrrS.',
  '..SRRRYRRRRRrS..',
  '..SRRRYRRRRRrS..',
  '.SRRRTTRRRRRSRRR',
  'SRRROORRRRRORRRR',
  'SRRRRRRRRRRRRRRS',
  'SRRRRRRRRRRRRRRS',
  '.SRRRRRRRRRRRS..',
  '.SRRRROOOORRRS..',
  'WRRRRRRRRRRRRSRR',
  'WRRRRRRRRRRrSRRR',
  'WRRRRRRRRRrS.RRR',
  '.SRRRRRRRrS..RRR',
  '..SRRrrRRS...rSS',
  '..SRRrrRRS......',
  '...SRrrRS.......',
  '...SRrrRS.......',
  '....SrRS........',
  '....SrRS........',
  '.....SS.........',
];

export const DRAGON_FRAME1 = [
  '.HHSRRRRRRRRSRR.',
  '.HHSRRRRRRRRrrS.',
  '..SRRRYRRRRRrS..',
  '..SRRRYRRRRRrS..',
  '.SRRRTTRRRRRSRRR',
  'SRRROORRRRRORRRR',
  'SRRRRRRRRRRRRRRS',
  'SRRRRRRRRRRRRRRS',
  '.SRRRROOOOrrrS..',
  'WRRRRRRRRRRRRRS.',
  'WRRRRRRRRRRrSRRR',
  'WRRRRRRRRRrS.RRS',
  '.SRRRRRRRrS..RRS',
  '..SRRrrRRS...SSS',
  '..SRRrrRRS......',
  '..SRRrrRRS......',
  '...SRrrRS.......',
  '....SrRRS.......',
  '....SrrS........',
  '....SrRS........',
  '.....SS.........',
];
