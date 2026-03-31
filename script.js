
const STORAGE_KEY_ITEMS = "calorieCounter:items";
const STORAGE_KEY_GOAL = "calorieCounter:goal";
const COOKIE_NAME_LAST_FOOD = "calorieCounterLastFood";
const EXAMPLE_FOOD_DATA = [
  { name: "Apple (medium)", calories: 95 },
  { name: "Banana (medium)", calories: 105 },
  { name: "Grilled chicken breast (100g)", calories: 165 },
  { name: "Cheeseburger", calories: 303 },
  { name: "Slice of pizza", calories: 285 },
  { name: "Caesar salad (no dressing)", calories: 180 },
  { name: " salad (with dressing)", calories: 330 },
  { name: "Fried rice (1 cup)", calories: 238 },
  { name: "Oatmeal (1 cup cooked)", calories: 150 },
  { name: "Plain yogurt (plain, 170g)", calories: 100 },
];

const foodForm = document.getElementById("foodForm");
const foodNameInput = document.getElementById("foodName");
const caloriesInput = document.getElementById("calories");
const foodListElement = document.getElementById("foodList");
const totalCaloriesElement = document.getElementById("totalCalories");
const itemsSummaryElement = document.getElementById("itemsSummary");
const emptyStateElement = document.getElementById("emptyState");
const formMessageElement = document.getElementById("formMessage");
const resetButton = document.getElementById("resetButton");
const setGoalButton = document.getElementById("setGoalButton");
const fetchExampleButton = document.getElementById("fetchExampleButton");
const goalValueElement = document.getElementById("goalValue");
const goalProgressLabelElement = document.getElementById("goalProgressLabel");
const goalProgressBarElement = document.getElementById("goalProgressBar");

function safeJsonParse(raw, fallback) {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}
function createId() {
  return (
    Date.now().toString(36) +
    Math.random().toString(36).slice(2, 7)
  ).toUpperCase();
}
function formatCalories(value) {
  return `${value} kcal`;
}

function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

function loadItems() {
  const stored = localStorage.getItem(STORAGE_KEY_ITEMS);
  const items = safeJsonParse(stored, []);
  if (!Array.isArray(items)) return [];
  return items;
}

function saveItems(items) {
  localStorage.setItem(STORAGE_KEY_ITEMS, JSON.stringify(item))
}
function loadGoal() {
  const raw = localStorage.getItem(STORAGE_KEY_GOAL);
  const parsed = Number(raw);
  if (!raw || Number.isNaN(parsed) || parsed <= 0) {
    return 2000;
  }
  return Math.round(parsed);
}

function saveGoal(goal) {
  localStorage.setItem(STORAGE_KEY_GOAL, String(goal));
}

// cookies
function setCookie(name, value, days) {
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  const expires = "expires=" + date.toUTCString();
  document.cookie = `${name}=${encodeURIComponent(
    value
  )};${expires};path=/;SameSite=Lax`;
}

function getCookie(name) {
  const decoded = decodeURIComponent(document.cookie || "");
  const parts = decoded.split(";");
  for (const part of parts) {
    const trimmed = part.trim();
    if (trimmed.startsWith(name + "=")) {
      return trimmed.substring(name.length + 1);
    }
  }
  return null;
}

let items = loadItems();
let goal = loadGoal();

function calculateTotalCalories(data) {
  return data.reduce((sum, item) => sum + (item.calories || 0), 0);
}

function render() {
  const total = calculateTotalCalories(items);
  const count = items.length;

  // Total label
  totalCaloriesElement.textContent = formatCalories(total);

  // Summary
  if (count === 0) {
    itemsSummaryElement.textContent = "";
    emptyStateElement.classList.remove("hidden");
  } else {
    itemsSummaryElement.textContent =
      count === 1 ? "1 item" : `${count} items`;
    emptyStateElement.classList.add("hidden");
  }

  // Progress
  goalValueElement.textContent = String(goal);
  const fraction = goal > 0 ? Math.min(total / goal, 1) : 0;
  const percent = Math.round(fraction * 100);
  goalProgressLabelElement.textContent = `${percent}%`;
  goalProgressBarElement.style.width = `${percent}%`;

  if (fraction >= 1) {
    goalProgressBarElement.classList.add("bg-rose-500");
  } else {
    goalProgressBarElement.classList.remove("bg-rose-500");
  }

  // List
  foodListElement.innerHTML = "";
  if (items.length === 0) return;

  for (const item of items) {
    const li = document.createElement("li");
    li.className =
      "group flex items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-900/90 px-3 py-2.5 hover:border-emerald-500/60 hover:bg-slate-900 transition";

    const main = document.createElement("div");
    main.className = "min-w-0";

    const nameEl = document.createElement("p");
    nameEl.textContent = item.name;
    nameEl.className =
      "text-sm font-medium text-slate-100 truncate group-hover:text-emerald-300";

    const metaEl = document.createElement("p");
    metaEl.className = "text-[0.7rem] text-slate-400 mt-0.5";
    const created = new Date(item.createdAt);
    metaEl.textContent = `${formatCalories(item.calories)} • ${created.toLocaleTimeString(
      [],
      { hour: "2-digit", minute: "2-digit" }
    )}`;

    main.appendChild(nameEl);
    main.appendChild(metaEl);

    const actions = document.createElement("div");
    actions.className = "flex items-center gap-1.5 flex-shrink-0";

    const editButton = document.createElement("button");
    editButton.type = "button";
    editButton.className =
      "text-[0.7rem] px-2 py-1 rounded-lg border border-slate-700 text-slate-200 hover:bg-slate-800 hover:border-slate-500 transition";
    editButton.textContent = "Edit";
    editButton.addEventListener("click", () => handleEdit(item.id));

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className =
      "text-[0.7rem] px-2 py-1 rounded-lg bg-rose-500/90 text-slate-950 hover:bg-rose-400 active:scale-[0.97] transition";
    deleteButton.textContent = "Remove";
    deleteButton.addEventListener("click", () => handleRemove(item.id));

    actions.appendChild(editButton);
    actions.appendChild(deleteButton);

    li.appendChild(main);
    li.appendChild(actions);

    foodListElement.appendChild(li);
  }
}

// adding
function handleFormSubmit(event) {
  event.preventDefault();
  hideFormMessage();

  const nameRaw = foodNameInput.value.trim();
  const caloriesRaw = caloriesInput.value.trim();

  if (!nameRaw || !caloriesRaw) {
    showFormMessage("Please enter both a food name and calories.");
    return;
  }

  const caloriesValue = Number(caloriesRaw);
  if (Number.isNaN(caloriesValue) || caloriesValue < 0) {
    showFormMessage("Calories must be a non‑negative number.");
    return;
  }

  const item = {
    id: createId(),
    name: nameRaw,
    calories: Math.round(caloriesValue),
    createdAt: new Date().toISOString(),
  };

  items.unshift(item);
  saveItems(items);

  setCookie(COOKIE_NAME_LAST_FOOD, item.name, 3);

  foodNameInput.value = "";
  caloriesInput.value = "";

  render();
}

//remove item
function handleRemove(id) {
  items = items.filter((item) => item.id !== id);
  saveItems(items);
  render();
}

//edit
function handleEdit(id) {
  const item = items.find((it) => it.id === id);
  if (!item) return;

  const newName = window.prompt("Edit food name:", item.name);
  if (newName === null) return;
  const trimmedName = newName.trim();
  if (!trimmedName) {
    showFormMessage("Food name cannot be empty.");
    return;
  }

  const newCaloriesRaw = window.prompt(
    "Edit calories (kcal):",
    String(item.calories)
  );
  if (newCaloriesRaw === null) return;
  const caloriesValue = Number(newCaloriesRaw);
  if (Number.isNaN(caloriesValue) || caloriesValue < 0) {
    showFormMessage("Calories must be a non‑negative number.");
    return;
  }

  item.name = trimmedName;
  item.calories = Math.round(caloriesValue);

  saveItems(items);
  setCookie(COOKIE_NAME_LAST_FOOD, item.name, 3);
  render();
}

//clear item
function handleReset() {
  if (!window.confirm("Clear all items for today?")) {
    return;
  }
  items = [];
  saveItems(items);
  render();
}

//prompt user to use new calorie goal
function handleSetGoal() {
  const raw = window.prompt(
    "Set your daily calorie goal (kcal):",
    String(goal || 2000)
  );
  if (raw === null) return;
  const value = Number(raw);
  if (Number.isNaN(value) || value <= 0) {
    showFormMessage("Goal must be a positive number.");
    return;
  }
  goal = Math.round(value);
  saveGoal(goal);
  render();
}

function showFormMessage(message) {
  formMessageElement.textContent = message;
  formMessageElement.classList.remove("hidden");
}

function hideFormMessage() {
  formMessageElement.textContent = "";
  formMessageElement.classList.add("hidden");
}

function fetchExampleFoodData() {
  const dataUrl = `data:application/json,${encodeURIComponent(
    JSON.stringify(EXAMPLE_FOOD_DATA)
  )}`;
  return fetch(dataUrl, { cache: "no-store" });
}

async function handleFetchExample() {
  hideFormMessage();

  const query = foodNameInput.value.trim().toLowerCase();
  if (!query) {
    showFormMessage("Type a food name first, then click Suggest calories.");
    return;
  }

  try {
    fetchExampleButton.disabled = true;

    const response = await fetchExampleFoodData();

    if (!response.ok) {
      throw new Error("Failed to fetch calorie data.");
    }

    /** @type {{name: string, calories: number}[]} */
    const data = await response.json();

    const match = data.find((item) =>
      item.name.toLowerCase().includes(query)
    );

    if (!match) {
      showFormMessage(
        "No example found for that food. Try a common item like 'apple' or 'pizza'."
      );
      return;
    }

    caloriesInput.value = String(match.calories);
    showFormMessage(
      `Estimated calories for "${match.name}" loaded from API demo. You can adjust if needed.`
    );
  } catch (error) {
    
    console.error(error);
    showFormMessage(
      "Unable to fetch calorie suggestion right now. Please enter calories manually."
    );
  } finally {
    fetchExampleButton.disabled = false;
  }
}

// initialize
function restoreFromCookie() {
  const lastFood = getCookie(COOKIE_NAME_LAST_FOOD);
  if (!lastFood) return;

  if (!foodNameInput.value) {
    foodNameInput.value = lastFood;
  }
}

function attachEventListeners() {
  foodForm.addEventListener("submit", handleFormSubmit);
  resetButton.addEventListener("click", handleReset);
  setGoalButton.addEventListener("click", handleSetGoal);
  fetchExampleButton.addEventListener("click", () => {
    // Explicitly wrap in a function to avoid unhandled promise rejections
    void handleFetchExample();
  });
}

function init() {
  attachEventListeners();
  restoreFromCookie();
  render();
}

// Start app
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

