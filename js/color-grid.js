// ============================================================
// color-grid.js — Color swatch grid and comparison panel
// Depends on: config.js, state.js
// ============================================================

function initColorGrid() {
    const grid = document.getElementById("color-grid");
    grid.innerHTML = "";
    COLORS.forEach(color => {
        const card = document.createElement("div");
        card.className = "color-card";
        card.setAttribute("data-color", color);

        const img = document.createElement("img");
        img.src = "colors/" + COLOR_IMAGES[color];
        img.alt = color;
        img.onerror = () => { img.src = "https://via.placeholder.com/100x80?text=" + color; };

        const label = document.createElement("div");
        label.className = "color-card-label";
        label.textContent = color;

        card.appendChild(img);
        card.appendChild(label);
        card.addEventListener("click", () => {
            selectedColor1 = color;
            updateColorComparison();
            updateColorSelection();
        });
        grid.appendChild(card);
    });
}

function updateColorSelection() {
    document.querySelectorAll(".color-card").forEach(card => {
        card.classList.toggle("selected", card.getAttribute("data-color") === selectedColor1);
    });
}

function updateColorComparison() {
    document.getElementById("color1-preview").src = "colors/" + COLOR_IMAGES[selectedColor1];
    document.getElementById("color1-name").textContent = selectedColor1;
    const idx = COLORS.indexOf(selectedColor1);
    selectedColor2 = COLORS[(idx + 1) % COLORS.length];
    document.getElementById("color2-preview").src = "colors/" + COLOR_IMAGES[selectedColor2];
    document.getElementById("color2-name").textContent = selectedColor2;
}
