
const assignments = {
  "Janek": "Ludek",
  "Ludvik": "Eva",
  "Ondrej": "Imge",
  "Svetlana": "Petr",
  "Valerie": "Marie",
  "Marie": "Yuliya",
  "Sabina": "Jasper",
  "Lan": "Pepa",
  "Jirka": "Svetlana",
  "Pepa": "Andreas",
  "Elif": "Lan",
  "Imge": "Julia",
  "Yuliya": "Janek",
  "Petr": "Sabina",
  "Eva": "Ondrej",
  "Jasper": "Ludvik",
  "Andreas": "Valerie",
  "Ludek": "Jirka",
  "Julia": "Elif"
};

const aliases = {
  "Ondřej": "Ondrej",
  "Ondra": "Ondrej",
  "Luděk": "Ludek",
  "Ludvík": "Ludvik",
  "Světlana": "Svetlana",
  "Fany": "Eva"
};

// Add gift ideas here whenever you're ready.
// Use each recipient's canonical name as the key.
const giftIdeas = {
  "Janek": "wine, archi book, bike related stuff? ",
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

const normalizeName = (name) =>
  name
    .normalize("NFD")
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
    normalizeName(alias),
    canonical
  ])
);

function findCanonicalName(input) {
  const normalized = normalizeName(input);
  const canonical = aliasLookup.get(normalized) || normalized;
  return assignmentLookup.get(normalizeName(canonical)) || null;
}

const modal = document.getElementById("name-modal");
const nameForm = document.getElementById("name-form");
const playerInput = document.getElementById("player-name");
const nameMessage = document.getElementById("name-message");
const spinButton = document.getElementById("spin-button");
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

  const initials = document.createElement("div");
  initials.textContent = name
    .split(/\s+/)
    .map(part => part[0] || "")
    .join("")
    .slice(0, 2)
    .toUpperCase();
  initials.setAttribute("aria-hidden", "true");

  const image = document.createElement("img");
  image.src = `./images/faces/${encodeURIComponent(name)}.png`;
  image.alt = `${name}'s photo`;
  image.loading = "eager";
  image.onerror = () => image.remove();

  const label = document.createElement("div");
  label.className = "face-label";
  label.textContent = name;

  face.append(initials, image, label);
  return face;
}

function showFace(reel, name) {
  reel.replaceChildren(makeFace(name));
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
  const ideas = giftIdeas[recipient]?.trim();

  giftPanel.textContent = ideas ||
    "Gift ideas coming soon! Add this person's ideas in app.js when you're ready.";
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

  const enteredName = playerInput.value;
  const canonical = findCanonicalName(enteredName);

  if (!canonical) {
    nameMessage.textContent =
      "We can't find that name. Check the spelling and try again.";
    playerInput.focus();
    return;
  }

  nameMessage.textContent = "";

  // Use the canonical name, even when an alias was entered.
  enterGame(canonical);
});

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

  // Each reel spins independently and stops at the assigned recipient.
  const stopTimes = [1700, 2350, 3000];

  const reelAnimations = reels.map(async (reel, index) => {
    let elapsed = 0;
    const tickLength = 75;

    while (elapsed < stopTimes[index]) {
      showFace(reel, randomName());
      await wait(tickLength);
      elapsed += tickLength;
    }

    showFace(reel, recipient);
    reel.classList.remove("spinning");
  });

  await Promise.all(reelAnimations);

  // Dramatic reveal after the final reel stops.
  await wait(350);

  winnerName.textContent = recipient;
  resultPanel.hidden = false;
  updateGiftIdeas(recipient);

  machineStatus.textContent = "JACKPOT! YOUR SECRET IS REVEALED.";
  spinLabel.textContent = "YOUR DRAW IS COMPLETE";
  hasPlayed = true;
  isSpinning = false;
}

spinButton.addEventListener("click", spin);

// Initial reels show placeholders until a player enters their name.
reels.forEach(reel => {
  const face = document.createElement("div");
  face.className = "reel-face";
  face.textContent = "✦";
  reel.replaceChildren(face);
});

// Focus the name field when the page opens.
window.addEventListener("load", () => {
  playerInput.focus();
});
