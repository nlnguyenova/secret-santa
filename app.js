
const assignments = {
  "Janek123": "Petr",
  "Ludvik123": "Elif",
  "Svetlana456": "Sabina",
  "Valerie123": "Pepa",
  "Marie123": "Lan",
  "Sabina123": "Andreas",
  "Lan456": "Ludvik",
  "Jirka123": "Jasper",
  "Pepa456": "Valerie",
  "Elif123": "Julia",
  "Imge456": "Marie",
  "Yuliya123": "Eva",
  "Petr456": "Svetlana",
  "Eva123": "Jirka",
  "Jasper456": "Imge",
  "Andreas123": "Yuliya",
  "Ludek123": "Janek",
  "Julia456": "Ludek"
};

const giftIdeas = {
  "Janek": "wine, archi book, edible underwear",
  "Ludvik": "anything fun, wine, edible underwear",
  "Svetlana": "make-up, cosmetics, DIY, edible underwear",
  "Valerie": "outdoorsy things, edible underwear",
  "Marie": "animal print, edible underwear",
  "Sabina": "horses, horse, horse stuff, edible underwear",
  "Lan": "wine, anything silly, edible underwear",
  "Jirka": "loves Italy so think along those lines?, edible underwear",
  "Pepa": "easy to please, the cheaper the better, the stupider the better, edible underwear",
  "Elif": "her gym crush, edible underwear",
  "Imge": "DIY, handmade stuff, silly stuff, edible underwear",
  "Yuliya": "mushrooms, french wine, massage, edible underwear",
  "Petr": "matcha, healthy foods-tvaroh? edible underwear",
  "Eva": "THIS INCLUDES FANY, wine, edible underwear",
  "Jasper": "sustainable stuff, wigs & beer, finish his house for him, edible underwear",
  "Andreas": "belgian beers, wigs & beer, edible underwear",
  "Ludek": "bottle, edible underwear",
  "Julia": "workout, healthy stuff, fashion, edible underwear"
};

// Accept different spellings and capitalization
const normalizeName = name =>
  name.normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .replace(/[\s_-]+/g, "")
    .toLowerCase();

// Alternative spellings for login names
const nameAliases = {
  "luděk": "Ludek",
  "luděk123": "Ludek123",
  "ludvík": "Ludvik",
  "ludvík123": "Ludvik123",
  "ondřej": "Ondrej",
  "ondřej456": "Ondrej456",
  "jiří": "Jirka",
  "jiří123": "Jirka123",
  "pepa": "Pepa",
  "pepa456": "Pepa456",
  "julia": "Julia",
  "julie456": "Julia456",
  "imge": "Imge",
  "imge456": "Imge456",
  "yulia123": "Yuliya123",
  "yuliya123": "Yuliya123"
};

const canonicalNames = Object.keys(assignments);
const recipientNames = [...new Set(Object.values(assignments))];

const assignmentLookup = new Map(
  canonicalNames.map(name => [normalizeName(name), name])
);

// Login codes are the keys in `assignments`. Matching ignores case and spaces.
function findCanonicalName(raw) {
  const normalized = normalizeName(raw);
  return assignmentLookup.get(normalized) || null;
}


const modal = document.getElementById("name-modal");
const nameForm = document.getElementById("name-form");
const playerInput = document.getElementById("player-name");
const nameMessage = document.getElementById("name-message");
const spinButton = document.getElementById("lever-button");
const machineStatus = document.getElementById("machine-status");
const resultPanel = document.getElementById("result");
const winnerName = document.getElementById("winner-name");
const giftPanel = document.getElementById("gift-ideas");

const reels = [
  document.getElementById("reel-1"),
  document.getElementById("reel-2"),
  document.getElementById("reel-3")
];

let playerName = null;
let isSpinning = false;
let hasPlayed = false;

function makeFace(name) {
  const face = document.createElement("div");
  face.className = "reel-face";

  const image = document.createElement("img");
  image.src = `./images/faces/${encodeURIComponent(name)}.png`;
  image.alt = name;
  image.draggable = false;

  // Keep the face blank if a photo is missing; no initials.
  image.onerror = () => { image.remove(); face.classList.add("no-photo"); };

  const label = document.createElement("div");
  label.className = "face-label";
  label.textContent = name;

  face.append(image, label);
  return face;
}

function randomName() {
  return recipientNames[
    Math.floor(Math.random() * recipientNames.length)
  ];
}

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function updateGiftIdeas(recipient) {
  giftPanel.textContent = giftIdeas[recipient]?.trim() ||
    "Gift ideas coming soon!";
}

function enterGame(name) {
  playerName = name;
  modal.hidden = true;
  spinButton.disabled = false;
  machineStatus.textContent = `GOOD LUCK! PULL THE LEVER.`;
}

nameForm.addEventListener("submit", event => {
  event.preventDefault();

  const canonical = findCanonicalName(playerInput.value);

  if (!canonical) {
    nameMessage.textContent =
      "Login code not found. Check the spelling and try again.";
    playerInput.focus();
    return;
  }

  nameMessage.textContent = "";
  enterGame(canonical);
});

/*
  Build a vertical strip of faces and animate it upward.
  Each face occupies exactly one reel-window height.
*/
async function rollReel(reel, recipient, duration, delay = 0) {
  await wait(delay);

  const windowHeight = reel.clientHeight;

  if (!windowHeight) {
    showFinalFace(reel, recipient);
    return;
  }

  const strip = document.createElement("div");
  strip.className = "reel-strip";

  // Many faces give the impression of a continuous rolling reel.
  const rollNames = Array.from(
    { length: 32 },
    () => randomName()
  );

  // The assigned recipient is always the final face.
  rollNames.push(recipient);

  rollNames.forEach(name => {
    const face = makeFace(name);
    face.style.height = `${windowHeight}px`;
    face.style.minHeight = `${windowHeight}px`;
    strip.appendChild(face);
  });

  reel.replaceChildren(strip);

  // Start at the top and move the strip upward.
  strip.style.transform = "translateY(0)";
  strip.getBoundingClientRect();

  strip.style.transition = `transform ${duration}ms cubic-bezier(0.12, 0.72, 0.12, 1)`;
  strip.style.transform =
    `translateY(-${windowHeight * (rollNames.length - 1)}px)`;

  await wait(duration);

  // Leave only the final assigned face visible after the roll.
  showFinalFace(reel, recipient);
}

function showFinalFace(reel, recipient) {
  const face = makeFace(recipient);
  face.style.height = "100%";
  reel.replaceChildren(face);
}

async function spin() {
  if (!playerName || isSpinning || hasPlayed) return;

  const recipient = assignments[playerName];
  if (!recipient) return;

  isSpinning = true;
  spinButton.disabled = true;
  machineStatus.textContent = "FINGERS CROSSED...";
  resultPanel.hidden = true;
  winnerName.textContent = "";

  reels.forEach(reel => reel.classList.add("spinning"));

  // Each reel starts and stops after the previous one.
  await Promise.all([
    rollReel(reels[0], recipient, 2600, 0),
    rollReel(reels[1], recipient, 3300, 350),
    rollReel(reels[2], recipient, 4000, 700)
  ]);
  spinButton.classList.add("pulled");
  reels.forEach(reel => reel.classList.remove("spinning"));

  await wait(350);

  winnerName.textContent = recipient;
  resultPanel.hidden = false;
  updateGiftIdeas(recipient);
  spinButton.classList.remove("pulled");
  
  machineStatus.textContent = "JACKPOT?";
  hasPlayed = true;
  isSpinning = false;
}

spinButton.addEventListener("click", spin);

reels.forEach(reel => {
  const placeholder = document.createElement("div");
  placeholder.className = "reel-face";
  placeholder.textContent = "✦";
  reel.replaceChildren(placeholder);
});

window.addEventListener("load", () => {
  playerInput.focus();
});
