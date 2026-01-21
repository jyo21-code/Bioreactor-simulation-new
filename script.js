const tools = document.querySelectorAll('.tool');
const reactor = document.getElementById('bioreactor');
const liquid = document.getElementById('liquidFill');
const bubblesBox = document.getElementById('bubbles');
const impeller = document.getElementById('impeller');

const barN = document.getElementById('bar-nutrient');
const barI = document.getElementById('bar-inoculum');
const barA = document.getElementById('bar-air');

const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const resetBtn = document.getElementById('resetBtn');

const popup = document.getElementById('popup');
const popupText = document.getElementById('popupText');

const aerationText = document.getElementById('aerationText');
const biomassRead = document.getElementById('biomassRead');

/* STATE */
let nutrients = 0;
let inoculum = 0;
let aeration = 0;

let biomass = 0;
let maxBiomass = 0;

let running = false;
let stationaryReached = false;

let bubbleTimer = null;
let biomassTimer = null;

/* HELPERS */
function showPopup(msg){
  popupText.innerText = msg;
  popup.style.display = 'flex';
}
function closePopup(){
  popup.style.display = 'none';
}
function updateBar(bar, value){
  value = Math.min(100, value);
  bar.style.width = value + '%';
  bar.textContent = value + '%';
}

/* BUBBLES */
function spawnBubble(){
  const b = document.createElement('div');
  b.className = 'bubble';
  b.style.left = (45 + Math.random() * 10) + '%';
  b.style.bottom = '5px';
  bubblesBox.appendChild(b);
  setTimeout(() => b.remove(), 3000);
}

/* DRAG & DROP */
tools.forEach(t => {
  t.ondragstart = e => e.dataTransfer.setData('type', t.dataset.type);
});

reactor.ondragover = e => e.preventDefault();

reactor.ondrop = e => {
  const type = e.dataTransfer.getData('type');

  if (running) {
    showPopup("Inputs cannot be changed while the bioreactor is running.");
    return;
  }

  if (type === 'nutrient') {
    nutrients += 20;
    updateBar(barN, nutrients);
  }

  if (type === 'inoculum') {
    inoculum += 20;
    updateBar(barI, inoculum);
  }

  if (type === 'air') {
    aeration += 20;
    updateBar(barA, aeration);
    aerationText.innerText =
      aeration < 40 ? 'Aeration: Low' :
      aeration < 70 ? 'Aeration: Medium' :
      'Aeration: High';
  }

  liquid.style.height = (nutrients + inoculum + aeration) / 6 + '%';
};

/* START */
startBtn.onclick = () => {
  if (running) return;

  if (nutrients === 0 || inoculum === 0) {
    showPopup("Please add nutrients and inoculum before starting.");
    return;
  }

  running = true;
  stationaryReached = false;

  /* FIXED maximum biomass — batch assumption */
  maxBiomass = (nutrients + inoculum) / 2;

  startBtn.disabled = true;
  stopBtn.disabled = false;

  showPopup("Bioreactor is now running.");

  impeller.classList.add('spin');

  bubbleTimer = setInterval(() => {
    if (aeration > 0) spawnBubble();
  }, 500);

  biomassTimer = setInterval(() => {

    if (stationaryReached) return;

    if (biomass < maxBiomass) {
      const growthRate = (aeration / 100) * 0.5;
      biomass += growthRate;
      biomassRead.innerText = biomass.toFixed(2);
    } else {
      biomass = maxBiomass;
      biomassRead.innerText = biomass.toFixed(2);
      stationaryReached = true;
      showPopup("Stationary phase reached. Biomass growth has stopped.");
    }

  }, 1000);
};

/* STOP */
stopBtn.onclick = () => {
  running = false;

  startBtn.disabled = false;
  stopBtn.disabled = true;

  clearInterval(bubbleTimer);
  clearInterval(biomassTimer);

  impeller.classList.remove('spin');

  showPopup("Bioreactor has been stopped.");
};

/* RESET */
resetBtn.onclick = () => {
  nutrients = inoculum = aeration = 0;
  biomass = 0;
  maxBiomass = 0;
  stationaryReached = false;

  updateBar(barN, 0);
  updateBar(barI, 0);
  updateBar(barA, 0);

  liquid.style.height = '0%';
  bubblesBox.innerHTML = '';

  impeller.classList.remove('spin');

  biomassRead.innerText = '0.00';
  aerationText.innerText = 'Aeration: None';

  running = false;
  startBtn.disabled = false;
  stopBtn.disabled = true;
};
