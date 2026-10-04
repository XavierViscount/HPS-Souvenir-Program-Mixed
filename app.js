const telegramApp = window.Telegram?.WebApp;
const MAX_FLOWERS = 10;

const flowers = [
  { id: 1, key: "rose", name: "နှင်းဆီ", color: "#f0e0dc" },
  { id: 2, key: "thazin", name: "သဇင်", color: "#ece9d8" },
  { id: 3, key: "orchid", name: "သစ်ခွ", color: "#ece2e9" },
  { id: 4, key: "sabal", name: "စံပယ်", color: "#e2eae0" },
  { id: 5, key: "padouk", name: "ပိတောက်", color: "#efe7d7" },
  { id: 6, key: "cherry", name: "ချယ်ရီ", color: "#f0e0dc" },
  { id: 7, key: "lavender", name: "လာဗင်ဒါ", color: "#e8e4e9" },
  { id: 8, key: "kankaw", name: "ကံ့ကော်", color: "#efe9d9" },
  { id: 9, key: "sunflower", name: "နေကြာ", color: "#f0ead3" },
  { id: 10, key: "tulip", name: "ကျူးလစ်", color: "#efe0dd" },
];

const iconPaths = {
  flower: '<path d="M12 7.5a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9Z"/><path d="M12 2v3m0 14v3M4.93 4.93l2.12 2.12m9.9 9.9 2.12 2.12M2 12h3m14 0h3M4.93 19.07l2.12-2.12m9.9-9.9 2.12-2.12"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  minus: '<path d="M5 12h14"/>',
};

const burmeseDigits = "၀၁၂၃၄၅၆၇၈၉";
const state = { studentId: "", mode: "", counts: new Map() };
const screens = [...document.querySelectorAll("[data-screen]")];
const toast = document.getElementById("toast");
let toastTimer;

function createIcon(name) {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("aria-hidden", "true");
  svg.innerHTML = iconPaths[name];
  return svg;
}

if (telegramApp) {
  telegramApp.ready();
  telegramApp.expand();
  if (telegramApp.versionAtLeast?.("6.1")) {
    telegramApp.setHeaderColor("#f6e9e8");
    telegramApp.setBackgroundColor("#f6e9e8");
  }
}

function toBurmese(value) {
  return String(value).replace(/[0-9]/g, digit => burmeseDigits[Number(digit)]);
}

function showToast(message) {
  toast.textContent = message;
  toast.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toast.hidden = true; }, 2600);
}

function showScreen(name) {
  screens.forEach(screen => { screen.hidden = screen.dataset.screen !== name; });
  const step = name === "id" ? "id" : name === "choice" ? "choice" : "flowers";
  const order = ["id", "choice", "flowers"];
  const activeIndex = order.indexOf(step);
  document.querySelectorAll("[data-progress]").forEach((item, index) => {
    item.classList.toggle("is-active", index === activeIndex);
    item.classList.toggle("is-done", index < activeIndex);
  });
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function selectedTotal() {
  return [...state.counts.values()].reduce((sum, count) => sum + count, 0);
}

function selectedIds() {
  return flowers.flatMap(flower => Array(state.counts.get(flower.id) || 0).fill(flower.id));
}

function makeThumbnail(flower, className = "flower-thumb") {
  const box = document.createElement("span");
  box.className = className;
  box.style.setProperty("--thumb-bg", flower.color);
  const image = document.createElement("img");
  image.src = `assets/flowers/${flower.key}.png`;
  image.alt = "";
  image.loading = "lazy";
  image.onerror = () => {
    image.remove();
    box.append(createIcon("flower"));
    box.setAttribute("aria-hidden", "true");
  };
  box.append(image);
  return box;
}

function renderPicker() {
  const list = document.getElementById("flower-list");
  list.replaceChildren();
  for (const flower of flowers) {
    const quantity = state.counts.get(flower.id) || 0;
    const row = document.createElement("article");
    row.className = "flower-row";
    row.append(makeThumbnail(flower));

    const info = document.createElement("div");
    info.className = "flower-info";
    const name = document.createElement("strong");
    name.textContent = flower.name;
    const englishName = document.createElement("small");
    englishName.textContent = flower.key;
    info.append(name, englishName);

    const minus = document.createElement("button");
    minus.type = "button";
    minus.className = "stepper-button";
    minus.append(createIcon("minus"));
    minus.disabled = quantity === 0;
    minus.setAttribute("aria-label", `Remove one ${flower.key}`);
    minus.addEventListener("click", () => changeQuantity(flower.id, -1));

    const count = document.createElement("span");
    count.className = "quantity";
    count.textContent = toBurmese(quantity);
    count.setAttribute("aria-live", "polite");

    const plus = document.createElement("button");
    plus.type = "button";
    plus.className = "stepper-button";
    plus.append(createIcon("plus"));
    plus.disabled = selectedTotal() >= MAX_FLOWERS;
    plus.setAttribute("aria-label", `Add one ${flower.key}`);
    plus.addEventListener("click", () => changeQuantity(flower.id, 1));

    const controls = document.createElement("div");
    controls.className = "quantity-control";
    controls.append(minus, count, plus);

    row.append(info, controls);
    list.append(row);
  }
  document.getElementById("selected-total").textContent = toBurmese(selectedTotal());
  document.getElementById("review-individual").disabled = selectedTotal() === 0;
}

function changeQuantity(id, delta) {
  const current = state.counts.get(id) || 0;
  if (delta > 0 && selectedTotal() >= MAX_FLOWERS) {
    showToast("ပန်းအများဆုံး ၁၀ ပွင့်အထိသာ ရွေးချယ်နိုင်ပါသည်။");
    return;
  }
  const next = current + delta;
  if (next <= 0) state.counts.delete(id);
  else state.counts.set(id, next);
  renderPicker();
}

function renderAllFlowers() {
  const grid = document.getElementById("all-flower-grid");
  grid.replaceChildren();
  for (const flower of flowers) {
    const item = document.createElement("div");
    item.className = "all-flower-item";
    item.append(makeThumbnail(flower));
    const name = document.createElement("span");
    name.textContent = flower.name;
    item.append(name);
    grid.append(item);
  }
}

function renderReview() {
  document.getElementById("review-student-id").textContent = state.studentId;
  document.getElementById("review-total").textContent = `${toBurmese(selectedTotal())} ပွင့်`;
  const items = document.getElementById("review-items");
  items.replaceChildren();
  for (const flower of flowers) {
    const quantity = state.counts.get(flower.id) || 0;
    if (!quantity) continue;
    const line = document.createElement("div");
    line.className = "review-line";
    const name = document.createElement("span");
    name.textContent = flower.name;
    const amount = document.createElement("strong");
    amount.textContent = `×${toBurmese(quantity)}`;
    line.append(name, amount);
    items.append(line);
  }
}

function submitOrder() {
  const ids = state.mode === "all" ? flowers.map(flower => flower.id) : selectedIds();
  if (!state.studentId) {
    showToast("Student ID ကို အရင်ဖြည့်ပေးပါ။");
    showScreen("id");
    return;
  }
  if (!ids.length || ids.length > MAX_FLOWERS) {
    showToast("ပန်း ၁ ပွင့်မှ ၁၀ ပွင့်အထိ ရွေးချယ်ပေးပါ။");
    return;
  }

  const payload = {
    version: 1,
    student_id: state.studentId,
    mode: state.mode,
    flower_ids: ids,
  };

  if (!telegramApp || typeof telegramApp.sendData !== "function") {
    showToast("အော်ဒါတင်ရန် Telegram ထဲမှ Mini App ကို ဖွင့်ပါ။");
    return;
  }
  telegramApp.sendData(JSON.stringify(payload));
}

const studentForm = document.getElementById("student-form");
studentForm.addEventListener("submit", event => {
  event.preventDefault();
  const input = document.getElementById("student-id");
  const value = input.value.trim();
  if (!value) {
    showToast("Student ID ကို ဖြည့်ပေးပါ။");
    input.focus();
    return;
  }
  state.studentId = value;
  showScreen("choice");
});

document.querySelectorAll("[data-mode]").forEach(button => {
  button.addEventListener("click", () => {
    state.mode = button.dataset.mode;
    state.counts.clear();
    if (state.mode === "individual") {
      renderPicker();
      showScreen("individual");
    } else {
      renderAllFlowers();
      showScreen("all");
    }
  });
});

document.querySelectorAll("[data-back]").forEach(button => {
  button.addEventListener("click", () => {
    const destination = button.dataset.back;
    if (destination === "individual") showScreen("individual");
    else showScreen(destination);
  });
});

document.getElementById("review-individual").addEventListener("click", () => {
  renderReview();
  showScreen("review");
});
document.getElementById("submit-individual").addEventListener("click", submitOrder);
document.getElementById("submit-all").addEventListener("click", submitOrder);
document.getElementById("close-app").addEventListener("click", () => {
  if (telegramApp) telegramApp.close();
  else showToast("Telegram ထဲတွင်သာ ပိတ်နိုင်ပါသည်။");
});
