

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

const AVATAR_POOL = [
  ...Array.from({ length: 100 }, (_, i) => `https://randomuser.me/api/portraits/men/${i}.jpg`),
  ...Array.from({ length: 100 }, (_, i) => `https://randomuser.me/api/portraits/women/${i}.jpg`),
];

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

function seedFromString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}

function seededShuffle(array, rand) {
  const copy = array.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function generateClubMembers(clubId, count) {

  const nameRand = mulberry32(seedFromString(clubId + ":names"));
  const avatarRand = mulberry32(seedFromString(clubId + ":avatars"));

  const allNameCombos = [];
  for (const first of FIRST_NAMES) {
    for (const last of LAST_NAMES) allNameCombos.push(`${first} ${last}`);
  }
  const shuffledNames = seededShuffle(allNameCombos, nameRand);

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
