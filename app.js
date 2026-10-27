
const assignments = {
  "Janek123": "Ludek",
  "Ludvik123": "Eva",
  "Ondrej456": "Imge",
  "Svetlana456": "Petr",
  "Valerie123": "Marie",
  "Marie123": "Yuliya",
  "Sabina123": "Jasper",
  "Lan456": "Pepa",
  "Jirka123": "Svetlana",
  "Pepa456": "Andreas",
  "Elif123": "Lan",
  "Imge456": "Julia",
  "Yuliya123": "Janek",
  "Petr456": "Ondrej",
  "Eva123": "Sabina",
  "Jasper456": "Ludvik",
  "Andreas123": "Valerie",
  "Ludek123": "Jirka",
  "Julia456": "Elif"
};

const aliases = {
  "Ondřej": "Ondrej",
  "Ondra": "Ondrej",
  "Luděk": "Ludek",
  "Ludvík": "Ludvik",
  "Světlana": "Svetlana",
  "Fany": "Eva"
};

const giftIdeas = {
  "Janek": "wine, archi book, bike related stuff?",
  "Ludvik": "anything fun, wine",
  "Ondrej": "he's a mysterious man",
  "Svetlana": "make-up, cosmetics, DIY",
  "Valerie": "outdoorsy things?",
  "Marie": "easy to please, no wrong answers",
  "Sabina": "horses, horse, horse stuff",
  "Lan": "bottle, anything silly",
  "Jirka": "loves Italy so think along those lines",
  "Pepa": "v easy to please, the cheaper the better, the stupider the better",
  "Elif": "bottle, make up, her gym crush",
  "Imge": "DIY, fun stuff, silly stuff",
  "Yuliya": "mushrooms, boxing",
  "Petr": "matcha, healthy foods?",
  "Eva": "anything for Fany, bottle",
  "Jasper": "sustainable stuff, small business, finish his house for him",
  "Andreas": "belgian beers, workshops",
  "Ludek": "bottle?",
  "Julia": "workout, healthy stuff"
};

const normalizeName = name =>
  name.normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();

const canonicalNames = Object.keys(assignments);

const assignmentLookup = new Map(
  canonicalNames.map(name => [normalizeName(name), name])
);

const aliasLookup = new Map(
  Object.entries(aliases).map(([alias, canonical]) => [
    normalizeName(alias), canonical
  ])
);


function normalise(raw) {
  const entered = raw.trim().toLowerCase();

  const login = Object.keys(loginNames).find(
    key => key.toLowerCase() === entered
  );

  return login ? loginNames[login] : null;
}


const modal = document.getElementById("name-modal");
const nameForm = document.getElementById("name-form");
const playerInput = document.getElementById("player-name");
const nameMessage = document.getElementById("name-message");
const spinButton = document.getElementById("lever-button");
const spinLabel = document.getElementById("spin-label");
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
  image.onerror = () => image.remove();

  const label = document.createElement("div");
  label.className = "face-label";
  label.textContent = name;

  face.append(image, label);
  return face;
}

function randomName() {
  return canonicalNames[
    Math.floor(Math.random() * canonicalNames.length)
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
  spinLabel.textContent = "PULL FOR YOUR RECIPIENT";
  machineStatus.textContent = `GOOD LUCK, ${name.toUpperCase()}!`;
}

nameForm.addEventListener("submit", event => {
  event.preventDefault();

  const canonical = findCanonicalName(playerInput.value);

  if (!canonical) {
    nameMessage.textContent =
      "We can't find that name. Check the spelling and try again.";
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
  spinLabel.textContent = "THE REELS ARE SPINNING...";
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
  spinLabel.textContent = "YOUR DRAW IS COMPLETE";
  hasPlayed = true;
  isSpinning = false;
}

lever.addEventListener("click", pullLever);

reels.forEach(reel => {
  const placeholder = document.createElement("div");
  placeholder.className = "reel-face";
  placeholder.textContent = "✦";
  reel.replaceChildren(placeholder);
});

window.addEventListener("load", () => {
  playerInput.focus();
});
