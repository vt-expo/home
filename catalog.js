// === Анимация появления секций при скролле ===
//const sections = document.querySelectorAll("section");

//const observer = new IntersectionObserver((entries) => {
//    entries.forEach(entry => {
//        if (entry.isIntersecting) {
    //        entry.target.classList.add("visible");
 //       }
 //   });
//}, { threshold: 0.1 });

//sections.forEach(section => observer.observe(section));



async function getGoogleSheetCell(sheetId, sheetName, cell) {
    const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?sheet=${encodeURIComponent(sheetName)}&range=${cell}`;

    try {
        const response = await fetch(url);
        let text = await response.text();

        // Убираем мусор, чтобы получить чистый JSON
        text = text.substring(text.indexOf("{"), text.lastIndexOf("}") + 1);
        const json = JSON.parse(text);

        const value = json.table.rows[0]?.c[0]?.v ?? null;
        console.log(`Значение ${cell}:`, value);
        renderCategoryButtons(JSON.parse(value));
        renderProducts(JSON.parse(value));
        initCategoryModal(JSON.parse(value));
        initPriceFilter(JSON.parse(value));

        return value;
    } catch (err) {
        console.error("Ошибка:", err);
        return null;
    }
}

getGoogleSheetCell(
    "1w7ggGiIHXwsEjwcI0HTiVNlnomoLOUO-K4B_iELgzR8",
    "Sheet1",
    "N2"
);


function renderProducts(products, containerId = "products") {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = "";

    products.forEach(product => {
        const {
            id,
            name,
            brand,
            category,
            description,
            cost,
            discountCost,
            inStore,
            discount,
            img
        } = product;

        const shortDesc = description.length > 120
            ? description.slice(0, 120) + "..."
            : description;

        const priceHTML = discount === "да" && discountCost
            ? `
        <div class="price">
          <span class="old-price">${cost} ₽</span>
          <span class="new-price">${discountCost} ₽</span>
        </div>
      `
            : `<div class="price"><span class="new-price">${cost} ₽</span></div>`;

        const storeStatus = inStore === "да"
            ? `<span class="in-store yes">В наличии</span>`
            : `<span class="in-store no">Нет в наличии</span>`;

        const discountBadge = discount === "да"
            ? `<div class="discount-badge">Скидка</div>`
            : "";

        const card = document.createElement("div");
        card.className = "product-card";
        card.innerHTML = `
      ${discountBadge}
      <div> 
        <img src="${img}" alt="${name}" class="product-img">
        <h3 class="product-title">${name}</h3>
        <div class="product-brand">${brand}</div>
        <div class="product-category">${category}</div>
    </div>
      <div class="product-card__bottom-box">
        ${priceHTML}
        ${storeStatus}
        <p class="product-description">${shortDesc}</p>
        <button class="more-btn" data-id="${id}">Подробнее</button>
    </div>
    `;

        container.appendChild(card);
    });

    // === ОБРАБОТКА КНОПОК "ПОДРОБНЕЕ" ===
    document.querySelectorAll(".more-btn").forEach(btn => {
        btn.addEventListener("click", e => {
            const productId = e.target.dataset.id;
            const product = products.find(p => p.id == productId);
            openModal(product);
        });
    });
}


// ===== МОДАЛЬНОЕ ОКНО =====

const modal = document.getElementById("modal");
const modalBody = document.getElementById("modalBody");
const modalClose = document.getElementById("modalClose");

function openModal(product) {
    document.querySelector('body').style.overflowY = 'hidden'
    modalBody.innerHTML = `
    <h2>${product.name}</h2>
    <img src="${product.img}" class="modal-img">
    <p><strong>Производитель:</strong> ${product.brand}</p>
    <p><strong>Категория:</strong> ${product.category}</p>
    <p><strong>Цена:</strong> ${product.discount === "да" ? product.discountCost : product.cost} ₽</p>
    <p><strong>Наличие:</strong> ${product.inStore}</p>
    <p>${product.description}</p>
  `;

    modal.style.display = "flex";
}

modalClose.onclick = () => {
    document.querySelector('body').style.overflowY = 'scroll'
    modal.style.display = "none";
}

window.onclick = e => {
    if (e.target === modal) {
        document.querySelector('body').style.overflowY = 'scroll'
        modal.style.display = "none";
    }
};



function renderCategoryButtons(products, containerId = "categoryButtons", productsContainerId = "products") {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = "";

    // Получаем уникальные категории
    const categories = [...new Set(products.map(p => p.category))];

    // Создаём кнопку "Все"
    const allBtn = document.createElement("button");
    allBtn.className = "category-btn active";
    allBtn.textContent = "Все";
    allBtn.addEventListener("click", () => {
        setActiveButton(allBtn);
        renderProducts(products, productsContainerId);
    });
    container.appendChild(allBtn);

    // Создаём кнопки по категориям
    categories.forEach(cat => {
        const btn = document.createElement("button");
        btn.className = "category-btn";
        btn.textContent = cat;

        btn.addEventListener("click", () => {
            setActiveButton(btn);
            const filtered = products.filter(p => p.category === cat);
            renderProducts(filtered, productsContainerId);
        });

        container.appendChild(btn);
    });
}


// помогает сменить активную кнопку
function setActiveButton(activeBtn) {
    document.querySelectorAll(".category-btn").forEach(btn => btn.classList.remove("active"));
    activeBtn.classList.add("active");
}


function initCategoryModal(products) {
    const openBtn = document.getElementById("openCategories");
    const modal = document.getElementById("categoryModal");
    const list = document.getElementById("categoryList");

    // открытие модального окна
    openBtn.addEventListener("click", () => {
        modal.style.display = "flex";
        document.querySelector('body').style.overflowY = 'hidden'
    });

    // закрытие при клике вне окна
    modal.addEventListener("click", e => {
        if (e.target === modal) modal.style.display = "none";
        document.querySelector('body').style.overflowY = 'scroll'

    });

    // уникальные категории
    const categories = [...new Set(products.map(p => p.category))];

    // кнопка "Все"
    const allBtn = document.createElement("button");
    allBtn.textContent = "Все";
    allBtn.addEventListener("click", () => {
        modal.style.display = "none";
        document.querySelector('body').style.overflowY = 'scroll'

        renderProducts(products);
    });
    list.appendChild(allBtn);

    // остальные категории
    categories.forEach(cat => {
        const btn = document.createElement("button");
        btn.textContent = cat;

        btn.addEventListener("click", () => {
            modal.style.display = "none";
            document.querySelector('body').style.overflowY = 'scroll'
            const filtered = products.filter(p => p.category === cat);
            renderProducts(filtered);
        });

        list.appendChild(btn);
    });
    //renderProducts(categories[0])//
    console.log(categories)
}



// helper — безопасно парсит поле цены (строку или число) в Number, либо возвращает NaN
function parsePriceField(field) {
  if (field === null || field === undefined) return NaN;
  // Преобразуем в строку, удаляем пробелы, заменяем запятую на точку и удаляем всё лишнее кроме цифр и точки
  const s = String(field)
    .trim()
    .replace(/\s+/g, "")    // убрать пробелы
    .replace(",", ".")      // заменить запятую на точку (если формат "9,99")
    .replace(/[^0-9.]/g, ""); // оставить только цифры и точку

  if (s === "") return NaN;
  return Number(s);
}

function applyPriceFilter(products) {
  const minVal = document.getElementById("minPrice").value;
  const maxVal = document.getElementById("maxPrice").value;

  const min = minVal === "" ? 0 : Number(minVal);
  const max = maxVal === "" ? Infinity : Number(maxVal);

  // если пользователь ввёл не числа — можно показать предупреждение, но здесь просто игнорируем фильтр
  if (isNaN(min) || isNaN(max)) {
    console.warn("Мин или макс цена не число");
    renderProducts(products);
    return;
  }

  const filtered = products.filter(p => {
    // выбираем поле цены: если есть скидка и есть discountCost — используем её, иначе cost
    const rawPriceField = (p.discount === "да" && p.discountCost) ? p.discountCost : p.cost;
    const price = parsePriceField(rawPriceField);

    // если не удалось распарсить цену — исключаем товар из результатов
    if (isNaN(price)) return false;

    return price >= min && price <= max;
  });

  renderProducts(filtered);
}
        


function initPriceFilter(products) {
    const btn = document.getElementById("applyPrice");
    btn.addEventListener("click", () => {
        applyPriceFilter(products);
    });
}


