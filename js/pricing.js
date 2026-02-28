// ============================================================
// pricing.js — Price calculation helpers and fastener hints
// Depends on: config.js, state.js
// ============================================================

function getItemLength(item) {
    return item.length === "custom" ? (item.customLength || 0) : (item.length || 0);
}

function getItemPrice(item) {
    const prod = PRODUCTS[item.type] || PRODUCTS.custom;
    if (item.type === "custom") return item.customUnitPrice || 0;
    if (item.priceOverride != null && !Number.isNaN(item.priceOverride)) return item.priceOverride;
    return prod.price;
}

function getItemSubtotal(item) {
    const prod = PRODUCTS[item.type] || PRODUCTS.custom;
    const price = getItemPrice(item);
    if (item.type === "dexerdry") return item.length * item.qty * price;
    else if (prod.isFt) return getItemLength(item) * (item.qty || 0) * price;
    return (item.qty || 0) * price;
}

function updateTotalAndFasteners() {
    let total = 0, totalGroovedBoards = 0, hasSystem = false, hasStandaloneDex = false;

    lineItems.forEach((item, i) => {
        const sub = getItemSubtotal(item);
        total += sub;

        const subCell = document.getElementById("sub-" + i);
        if (subCell) subCell.textContent = "$" + sub.toFixed(2);

        const mobileSubCell = document.getElementById("mobile-sub-" + i);
        if (mobileSubCell) {
            let subText = "Subtotal: $" + sub.toFixed(2);
            if (item.type === "dexerdry") subText += " (" + (item.length * item.qty) + " ft total)";
            mobileSubCell.textContent = subText;
        }

        const footageEl = document.getElementById("footage-" + i);
        if (footageEl && item.type === "dexerdry") footageEl.textContent = "Total: " + (item.length * item.qty) + " ft";

        if (["system", "grooved"].includes(item.type)) totalGroovedBoards += item.qty;
        if (item.type === "system") hasSystem = true;
        if (item.type === "dexerdry") hasStandaloneDex = true;
    });

    document.getElementById("grand-total").textContent = "$" + total.toFixed(2);

    const hintEl = document.getElementById("fastener-hint");
    let hintHtml = "";
    if (totalGroovedBoards > 0 && deckLengthFt > 0) {
        const joistCount = Math.floor(deckLengthFt * 12 / 16) + 1;
        const boxesScrews = Math.ceil((totalGroovedBoards * joistCount * 2) / SCREWS_PER_BOX);
        hintHtml += "<strong>Fastener suggestion:</strong><br>Approx " + boxesScrews + " boxes of screws<br>Approx " + boxesScrews + " boxes of plugs";
    }
    if (hasSystem && hasStandaloneDex) {
        hintHtml += '<div class="fastener-warning">AmeriDex System Boards already include Dexerdry. Standalone Dexerdry is typically only needed for non-system decks.</div>';
    }
    hintEl.style.display = hintHtml ? "block" : "none";
    hintEl.innerHTML = hintHtml;
}
