const API = "/api/fruits";
const grid = document.querySelector("#fruitGrid");
const searchInput = document.querySelector("#searchInput");
const resultsCount = document.querySelector("#resultsCount");
const notice = document.querySelector("#notice");
const fruitDialog = document.querySelector("#fruitDialog");
const deleteDialog = document.querySelector("#deleteDialog");
const fruitForm = document.querySelector("#fruitForm");

let fruits = [];
let searchTimer;
let deleteTarget = null;

const emojiByFruit = [
  [/apple/i, "🍎"], [/banana/i, "🍌"], [/orange|mandarin/i, "🍊"],
  [/mango/i, "🥭"], [/grape/i, "🍇"], [/strawberry/i, "🍓"],
  [/watermelon/i, "🍉"], [/pineapple/i, "🍍"], [/lemon/i, "🍋"],
  [/pear/i, "🍐"], [/peach/i, "🍑"], [/cherry/i, "🍒"],
  [/kiwi/i, "🥝"], [/coconut/i, "🥥"], [/avocado/i, "🥑"],
  [/blueberr/i, "🫐"], [/papaya/i, "🍈"], [/melon/i, "🍈"]
];

function fruitEmoji(name = "") {
  return (emojiByFruit.find(([pattern]) => pattern.test(name)) || [null, "🍏"])[1];
}

function showNotice(message, type = "success") {
  notice.textContent = message;
  notice.className = `notice show ${type}`;
  if (type === "success") {
    window.setTimeout(() => { notice.className = "notice"; }, 4000);
  }
}

async function request(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(options.headers || {})
    }
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok || result.success === false) {
    throw new Error(result.message || `Request failed (${response.status})`);
  }
  return result;
}

function safeImage(url) {
  if (typeof url !== "string" || !url.trim()) return null;
  try {
    const parsed = new URL(url, window.location.origin);
    if (parsed.protocol !== "https:" && parsed.origin !== window.location.origin) return null;
    if (!["https:", "http:"].includes(parsed.protocol)) return null;
    return parsed.href;
  } catch {
    return null;
  }
}

function renderFruits(items) {
  grid.replaceChildren();
  resultsCount.textContent = `${items.length} ${items.length === 1 ? "fruit" : "fruits"}`;

  if (!items.length) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    const title = document.createElement("strong");
    title.textContent = "No fruits found";
    const desc = document.createElement("span");
    desc.textContent = "Try another search or add a new fruit to the shop.";
    empty.append(title, desc);
    grid.append(empty);
    return;
  }

  items.forEach((fruit) => {
    const card = document.createElement("article");
    card.className = "fruit-card";

    const visual = document.createElement("div");
    visual.className = "fruit-visual";
    const stock = document.createElement("span");
    stock.className = "stock-pill";
    stock.textContent = Number(fruit.quantity) > 0 ? `${fruit.quantity} in stock` : "Out of stock";
    visual.append(stock);

    const imageUrl = safeImage(fruit.image);
    if (imageUrl) {
      const img = document.createElement("img");
      img.src = imageUrl;
      img.alt = fruit.name;
      img.loading = "lazy";
      img.onerror = () => {
        const emoji = document.createElement("span");
        emoji.className = "fruit-emoji";
        emoji.textContent = fruitEmoji(fruit.name);
        img.replaceWith(emoji);
      };
      visual.append(img);
    } else {
      const emoji = document.createElement("span");
      emoji.className = "fruit-emoji";
      emoji.textContent = fruitEmoji(fruit.name);
      visual.append(emoji);
    }

    const content = document.createElement("div");
    content.className = "card-content";
    const name = document.createElement("h3");
    name.className = "fruit-name";
    name.textContent = fruit.name;
    const stockText = document.createElement("p");
    stockText.className = "fruit-stock";
    stockText.textContent = "Freshly picked goodness";
    const priceRow = document.createElement("div");
    priceRow.className = "price-row";
    const price = document.createElement("span");
    price.className = "fruit-price";
    price.textContent = `₹${Number(fruit.price).toFixed(2)}`;
    const per = document.createElement("small");
    per.textContent = " / item";
    price.append(per);
    priceRow.append(price);

    const actions = document.createElement("div");
    actions.className = "card-actions";
    const edit = document.createElement("button");
    edit.className = "small-button";
    edit.type = "button";
    edit.textContent = "✎ Edit";
    edit.addEventListener("click", () => openEdit(fruit));
    const remove = document.createElement("button");
    remove.className = "small-button delete";
    remove.type = "button";
    remove.textContent = "× Delete";
    remove.addEventListener("click", () => openDelete(fruit));
    actions.append(edit, remove);
    content.append(name, stockText, priceRow, actions);
    card.append(visual, content);
    grid.append(card);
  });
}

async function loadFruits(search = "") {
  grid.innerHTML = '<div class="loading-card">Gathering fresh picks…</div>';
  try {
    const query = search.trim() ? `?search=${encodeURIComponent(search.trim())}` : "";
    const result = await request(`${API}${query}`);
    fruits = result.data || [];
    renderFruits(fruits);
  } catch (error) {
    grid.replaceChildren();
    const failed = document.createElement("div");
    failed.className = "empty-state";
    const title = document.createElement("strong");
    title.textContent = "We couldn't load the fruit shop";
    const desc = document.createElement("span");
    desc.textContent = error.message;
    failed.append(title, desc);
    grid.append(failed);
    resultsCount.textContent = "Unavailable";
    showNotice("Check your database connection and Vercel function logs.", "error");
  }
}

function openAdd() {
  fruitForm.reset();
  document.querySelector("#fruitId").value = "";
  document.querySelector("#fruitQuantity").value = "0";
  document.querySelector("#formTitle").textContent = "Add a fruit";
  document.querySelector("#formEyebrow").textContent = "FRESH ARRIVAL";
  document.querySelector("#saveBtn").innerHTML = 'Save fruit <span>→</span>';
  document.querySelector("#formError").textContent = "";
  fruitDialog.showModal();
  document.querySelector("#fruitName").focus();
}

function openEdit(fruit) {
  fruitForm.reset();
  document.querySelector("#fruitId").value = fruit.id;
  document.querySelector("#fruitName").value = fruit.name;
  document.querySelector("#fruitPrice").value = fruit.price;
  document.querySelector("#fruitQuantity").value = fruit.quantity;
  document.querySelector("#fruitImage").value = fruit.image || "";
  document.querySelector("#formTitle").textContent = "Edit fruit";
  document.querySelector("#formEyebrow").textContent = "UPDATE YOUR PICKS";
  document.querySelector("#saveBtn").innerHTML = 'Save changes <span>→</span>';
  document.querySelector("#formError").textContent = "";
  fruitDialog.showModal();
}

function openDelete(fruit) {
  deleteTarget = fruit;
  deleteDialog.showModal();
}

document.querySelector("#addFruitBtn").addEventListener("click", openAdd);
document.querySelector("#closeDialogBtn").addEventListener("click", () => fruitDialog.close());
document.querySelector("#cancelBtn").addEventListener("click", () => fruitDialog.close());
document.querySelector("#closeDeleteBtn").addEventListener("click", () => deleteDialog.close());
document.querySelector("#keepBtn").addEventListener("click", () => deleteDialog.close());

fruitForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const id = document.querySelector("#fruitId").value;
  const payload = {
    name: document.querySelector("#fruitName").value.trim(),
    price: Number(document.querySelector("#fruitPrice").value),
    quantity: Number(document.querySelector("#fruitQuantity").value),
    image: document.querySelector("#fruitImage").value.trim() || null
  };
  const saveButton = document.querySelector("#saveBtn");
  const errorBox = document.querySelector("#formError");
  saveButton.disabled = true;
  saveButton.textContent = "Saving…";
  errorBox.textContent = "";
  try {
    const result = await request(id ? `${API}/${id}` : API, {
      method: id ? "PUT" : "POST",
      body: JSON.stringify(payload)
    });
    fruitDialog.close();
    showNotice(result.message || "Fruit saved successfully.");
    await loadFruits(searchInput.value);
  } catch (error) {
    errorBox.textContent = error.message;
  } finally {
    saveButton.disabled = false;
    saveButton.innerHTML = id ? 'Save changes <span>→</span>' : 'Save fruit <span>→</span>';
  }
});

document.querySelector("#confirmDeleteBtn").addEventListener("click", async () => {
  if (!deleteTarget) return;
  const button = document.querySelector("#confirmDeleteBtn");
  button.disabled = true;
  button.textContent = "Deleting…";
  try {
    const result = await request(`${API}/${deleteTarget.id}`, { method: "DELETE" });
    deleteDialog.close();
    showNotice(result.message || "Fruit deleted successfully.");
    deleteTarget = null;
    await loadFruits(searchInput.value);
  } catch (error) {
    deleteDialog.close();
    showNotice(error.message, "error");
  } finally {
    button.disabled = false;
    button.textContent = "Yes, delete";
  }
});

searchInput.addEventListener("input", () => {
  window.clearTimeout(searchTimer);
  searchTimer = window.setTimeout(() => loadFruits(searchInput.value), 250);
});

document.querySelector("#year").textContent = new Date().getFullYear();
loadFruits();
