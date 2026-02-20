let operatorsData = {};
let selectedOperators = [];

const rankedMaps = [
  'bank','border','chalet','clubhouse','coastline','consulate',
  'kafe dostoyevsky','kanal','oregon','outback','skyscraper',
  'theme park','villa','lair','nighthaven labs','emerald plains'
];

async function loadOperators() {
  const response = await fetch('operators.json');
  operatorsData = await response.json();
  populateMaps();
  updateOperators();
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function populateMaps() {
  const mapSelect = document.getElementById('mapSelect');
  rankedMaps.forEach(map => {
    const opt = document.createElement('option');
    opt.value = map;
    opt.textContent = capitalize(map);
    mapSelect.appendChild(opt);
  });

  mapSelect.addEventListener('change', () => {
    selectedOperators = [];
    updateOperators();
  });

  document.getElementById('sideSelect').addEventListener('change', () => {
    selectedOperators = [];
    updateOperators();
  });
}

function updateOperators() {
  const side = document.getElementById('sideSelect').value;
  const container = document.getElementById('operatorsContainer');
  container.innerHTML = '';

  const filtered = Object.keys(operatorsData).filter(op => operatorsData[op].side === side);

  filtered.forEach(opName => {
    const card = document.createElement('div');
    card.classList.add('operator-card');
    card.dataset.op = opName;

    const img = document.createElement('img');
    img.src = `images/${opName}.png`;
    img.alt = opName;
    card.appendChild(img);

    const name = document.createElement('div');
    name.textContent = capitalize(opName);
    card.appendChild(name);

    card.addEventListener('click', () => {
      if (!selectedOperators.includes(opName) && selectedOperators.length < 5) {
        selectedOperators.push(opName);
        card.classList.add('selected');
      } else if (selectedOperators.includes(opName)) {
        selectedOperators = selectedOperators.filter(o => o !== opName);
        card.classList.remove('selected');
      }
      showRecommendations();
    });

    container.appendChild(card);
  });
}

function showRecommendations() {
  const recommendationsContainer = document.getElementById('recommendations');
  recommendationsContainer.innerHTML = '';

  if (selectedOperators.length === 0) return;

  const side = document.getElementById('sideSelect').value;
  const map = document.getElementById('mapSelect').value;

  const candidates = Object.keys(operatorsData).filter(op => 
    operatorsData[op].side === side && !selectedOperators.includes(op)
  );

  const scored = candidates.map(op => {
    const data = operatorsData[op];
    let score = data.meta_score*0.4 + data.utility_score*0.35 + data.ease_score*0.25;

    if (data.map_bonus && data.map_bonus.includes(map)) score += 5;

    // SYNERGY: adjust score based on selected operators
    selectedOperators.forEach(teamOp => {
      if (data.synergy && data.synergy[teamOp]) {
        score += data.synergy[teamOp]; // positive or negative
      }
    });

    return {op, score, data};
  });

  scored.sort((a,b) => b.score - a.score);
  const top3 = scored.slice(0,3);

  top3.forEach(rec => {
    const div = document.createElement('div');
    div.classList.add('recommendation');

    const img = document.createElement('img');
    img.src = `images/${rec.op}.png`;
    img.alt = rec.op;
    img.style.width = '80px';
    div.appendChild(img);

    const name = document.createElement('div');
    name.textContent = capitalize(rec.op);
    div.appendChild(name);

    const score = document.createElement('div');
    score.textContent = `Score: ${Math.round(rec.score)}%`;
    div.appendChild(score);

    const reason = document.createElement('div');
    reason.style.fontSize = '12px';
    reason.textContent = `Meta: ${rec.data.meta_score}, Utility: ${rec.data.utility_score}, Ease: ${rec.data.ease_score}`;
    div.appendChild(reason);

    recommendationsContainer.appendChild(div);
  });
}

loadOperators();