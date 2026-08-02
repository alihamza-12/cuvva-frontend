/**
 * frontend/src/utils/generateClubMembers.js
 *
 * Generates a FULL, deterministic list of fake members for a car club
 * — matching the club's real displayed member count (e.g. Virk shows
 * "84 members", so this generates all 84, not just the 2-3 hand-typed
 * names that used to be hardcoded in carClubsData.json).
 *
 * "Deterministic" is the key design choice here: given the same
 * club ID + count, this ALWAYS produces the exact same list of names
 * and photos, every single time it's called — it does NOT use
 * Math.random() (which would reshuffle members every time you open
 * the same club, making it obviously fake/broken-looking). Instead a
 * simple seeded pseudo-random generator (mulberry32) is seeded from
 * the club's own ID string, so "Virk" always generates the same 84
 * members in the same order, forever, across every visit/session —
 * exactly like a real backend would return the same member list
 * every time you fetch it.
 *
 * NO-REPEAT GUARANTEE (fixed bug: "2 or 3 people have the same
 * picture"): the previous version picked each member's avatar/name
 * INDEPENDENTLY at random from a small pool (70 pravatar photos),
 * which meant duplicates weren't just possible, they were basically
 * guaranteed once a club had more than ~10 members (birthday-paradox
 * math), and for a club with 84 members it was IMPOSSIBLE to avoid
 * repeats from only 70 photos (pigeonhole principle). Fixed by:
 *   1. Using a much bigger avatar pool — 200 distinct real photos
 *      from randomuser.me (men 0-99 + women 0-99, all verified
 *      working, non-rotating per URL).
 *   2. Sampling WITHOUT replacement: each club gets its own
 *      deterministically-shuffled copy of the full name pool (3,500
 *      unique first+last combos) and avatar pool (200 photos), then
 *      just takes the first N off the top — so within any single
 *      club, no two members can ever end up with the same name or
 *      the same photo. Different clubs still get different shuffles
 *      (seeded from their own club ID), so Virk's members don't look
 *      identical to Faisal's members.
 */

const FIRST_NAMES = [
  "James","Amelia","Oliver","Isla","Harry","Ava","George","Mia","Noah","Ella",
  "Jack","Freya","Leo","Grace","Charlie","Lily","Jacob","Sophie","Alfie","Poppy",
  "Thomas","Ruby","Oscar","Chloe","William","Evie","Henry","Isabella","Joshua","Emily",
  "Daniel","Charlotte","Samuel","Millie","Benjamin","Daisy","Lucas","Phoebe","Ethan","Alice",
  "Mohammed","Fatima","Ahmed","Zara","Omar","Layla","Yusuf","Amara","Ali","Noor",
  "Priya","Raj","Anika","Dev","Meera","Arjun","Kiran","Divya","Sanjay","Neha",
  "Wei","Mei","Jun","Ling","Hao","Yan","Chen","Xia","Feng","Jing",
];

const LAST_NAMES = [
  "Smith","Jones","Taylor","Brown","Williams","Wilson","Johnson","Davies","Robinson","Wright",
  "Thompson","Evans","Walker","White","Roberts","Green","Hall","Wood","Jackson","Clarke",
  "Kelly","Baker","Hughes","Turner","Morris","Cooper","Reed","Bell","Ward","Cox",
  "Khan","Patel","Kaur","Ahmed","Hussain","Malik","Shah","Chowdhury","Rahman","Iqbal",
  "Chen","Wang","Li","Zhang","Liu","Yang","Huang","Zhao","Wu","Zhou",
];

// 200 distinct real photos (verified 200 status): randomuser.me has
// stable, non-rotating images at these fixed indices, 0-99 for each
// gender — a MUCH bigger pool than the old 70-image pravatar set, so
// even the biggest club (84 members) has plenty of headroom left over.
const AVATAR_POOL = [
  ...Array.from({ length: 100 }, (_, i) => `https://randomuser.me/api/portraits/men/${i}.jpg`),
  ...Array.from({ length: 100 }, (_, i) => `https://randomuser.me/api/portraits/women/${i}.jpg`),
];

/** mulberry32 — tiny, fast, deterministic PRNG seeded from a number. */
function mulberry32(seed) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Turns a club's string ID into a numeric seed for mulberry32. */
function seedFromString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}

/** Deterministic Fisher-Yates shuffle — same seed always produces the same shuffle. */
function seededShuffle(array, rand) {
  const copy = array.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * @param {string} clubId - used as the deterministic seed, so the
 *   same club always generates the same member list.
 * @param {number} count - how many fake members to generate.
 * @returns {Array<{name: string, avatar: string}>}
 */
export function generateClubMembers(clubId, count) {
  // Two independent seeded RNGs (offset seed for names vs avatars) so
  // shuffling one pool doesn't accidentally correlate with the other.
  const nameRand = mulberry32(seedFromString(clubId + ":names"));
  const avatarRand = mulberry32(seedFromString(clubId + ":avatars"));

  // Build the full pool of unique "First Last" combos (3,500 of them
  // — way more than any club will ever need), shuffle it once for
  // this club, then just take the first `count` off the top. Because
  // every combo in the pool is unique and we never reuse an index,
  // no two members in the same club can ever get the same full name.
  const allNameCombos = [];
  for (const first of FIRST_NAMES) {
    for (const last of LAST_NAMES) allNameCombos.push(`${first} ${last}`);
  }
  const shuffledNames = seededShuffle(allNameCombos, nameRand);

  // Same no-replacement approach for avatars, from the 200-photo pool.
  const shuffledAvatars = seededShuffle(AVATAR_POOL, avatarRand);

  const safeCount = Math.min(count, shuffledNames.length, shuffledAvatars.length);
  const members = [];
  for (let i = 0; i < safeCount; i++) {
    members.push({
      name: shuffledNames[i],
      avatar: shuffledAvatars[i],
    });
  }
  return members;
}
