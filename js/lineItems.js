function render() {
    renderDesktop();
    if (isMobileView()) { renderMobile(); document.getElementById("mobile-items-container").style.display = "block"; }
    else { document.getElementById("mobile-items-container").innerHTML = ""; document.getElementById("mobile-items-container").style.display = "none"; }
}

function renderDesktop() {
    tbody.innerHTML = "";
    lineItems.forEach((item, i) => {
        const prod = PRODUCTS[item.type] || PRODUCTS.custom;
        const row = document.createElement("tr");

        let td = document.createElement("td");
        const sel = document.createElement("select");
        Object.entries(PRODUCT_CONFIG.categories).forEach(([catKey, category]) => {
            const optgroup = document.createElement("optgroup");
            optgroup.label = category.label;
            Object.entries(category.products).forEach(([prodKey, prodData]) => {
                const opt = document.createElement("option");
                opt.value = prodKey; opt.textContent = prodData.name;
                if (prodKey === item.type) opt.selected = true;
                optgroup.appendChild(opt);
            });
            sel.appendChild(optgroup);
        });
        sel.onchange = () => {
            item.type = sel.value; item.priceOverride = null;
            if (item.type !== "custom") { item.customDesc = ""; item.customUnitPrice = 0; }
            if (item.type === "dexerdry") item.length = 240;
            else if (PRODUCTS[item.type].isFt) { item.length = 16; item.customLength = null; }
            else item.length = null;
            render(); updateTotalAndFasteners();
        };
        td.appendChild(sel);
        if (item.type === "custom") {
            const descInput = document.createElement("input");
            descInput.type = "text"; descInput.className = "desc-input"; descInput.placeholder = "Enter product description...";
            descInput.value = item.customDesc || ""; descInput.oninput = e => { item.customDesc = e.target.value; };
            td.appendChild(descInput);
        } else {
            const helpDiv = document.createElement("div"); helpDiv.className = "help-text"; helpDiv.textContent = prod.help || "";
            td.appendChild(helpDiv);
        }
        row.appendChild(td);

        td = document.createElement("td");
        if (prod.hasColor) {
            const csel = document.createElement("select");
            COLORS.forEach(c => { const o = document.createElement("option"); o.value = c; o.textContent = c; if (c === item.color) o.selected = true; csel.appendChild(o); });
            const prev = document.createElement("img"); prev.className = "preview-img"; prev.alt = "preview"; prev.title = "Click to enlarge";
            function applyImage() { const colorName = item.color || COLORS[0]; prev.src = "colors/" + (COLOR_IMAGES[colorName] || COLOR_IMAGES.Driftwood); }
            csel.onchange = e => { item.color = e.target.value; applyImage(); updateTotalAndFasteners(); };
            td.appendChild(csel); item.color = item.color || COLORS[0]; applyImage();
            prev.onerror = () => { prev.src = "https://via.placeholder.com/34?text=?"; };
            prev.onclick = () => { modalImg.src = prev.src; modalName.textContent = item.color || COLORS[0]; modal.classList.add("active"); };
            td.appendChild(prev);
        }
        row.appendChild(td);

        td = document.createElement("td");
        if (item.type === "dexerdry") {
            const wrapper = document.createElement("div");
            const lenSel = document.createElement("select"); lenSel.className = "len-input";
            COIL_LENGTHS.forEach(len => { const o = document.createElement("option"); o.value = len; o.textContent = len + " ft box"; if (len === item.length) o.selected = true; lenSel.appendChild(o); });
            lenSel.onchange = e => { item.length = parseInt(e.target.value); updateTotalAndFasteners(); render(); };
            wrapper.appendChild(lenSel);
            const footageDiv = document.createElement("div"); footageDiv.className = "footage-display"; footageDiv.id = "footage-" + i;
            wrapper.appendChild(footageDiv); td.appendChild(wrapper);
        } else if (prod.isFt) {
            const wrapper = document.createElement("div"); wrapper.className = "length-wrapper";
            const lenSel = document.createElement("select"); lenSel.style.flex = "1";
            BOARD_LENGTHS.forEach(len => { const o = document.createElement("option"); o.value = len; o.textContent = len === "custom" ? "Custom" : len + " ft"; if (len === item.length) o.selected = true; lenSel.appendChild(o); });
            lenSel.onchange = e => { item.length = e.target.value === "custom" ? "custom" : parseInt(e.target.value); render(); updateTotalAndFasteners(); };
            wrapper.appendChild(lenSel);
            if (item.length === "custom") {
                const customInput = document.createElement("input");
                customInput.type = "number"; customInput.placeholder = "ft"; customInput.value = item.customLength || "";
                customInput.min = "1"; customInput.step = "0.5"; customInput.style.width = "60px";
                customInput.oninput = e => { item.customLength = parseFloat(e.target.value) || 0; updateTotalAndFasteners(); };
                wrapper.appendChild(customInput);
            }
            td.appendChild(wrapper);
        }
        row.appendChild(td);

        td = document.createElement("td"); td.className = "numeric";
        const qtyInput = document.createElement("input"); qtyInput.type = "number"; qtyInput.className = "qty-input";
        qtyInput.value = item.qty; qtyInput.min = "1"; qtyInput.step = "1";
        qtyInput.oninput = e => { item.qty = Math.max(1, parseInt(e.target.value) || 1); updateTotalAndFasteners(); };
        td.appendChild(qtyInput); row.appendChild(td);

        td = document.createElement("td"); td.className = "numeric";
        const priceWrapper = document.createElement("div");
        if (item.type === "custom") {
            const priceInput = document.createElement("input"); priceInput.type = "number"; priceInput.className = "price-input";
            priceInput.placeholder = "Price"; priceInput.value = item.customUnitPrice || ""; priceInput.step = "0.01"; priceInput.min = "0";
            priceInput.oninput = e => { item.customUnitPrice = parseFloat(e.target.value) || 0; updateTotalAndFasteners(); };
            priceWrapper.appendChild(priceInput);
        } else {
            const priceInput = document.createElement("input"); priceInput.type = "number"; priceInput.className = "price-input";
            priceInput.placeholder = "$" + prod.price.toFixed(2); priceInput.value = item.priceOverride != null ? item.priceOverride : "";
            priceInput.step = "0.01"; priceInput.min = "0";
            priceInput.oninput = e => { const val = e.target.value.trim(); item.priceOverride = val === "" ? null : parseFloat(val) || 0; updateTotalAndFasteners(); };
            priceWrapper.appendChild(priceInput);
            const hintDiv = document.createElement("div"); hintDiv.className = "default-price-hint";
            hintDiv.textContent = "Default: $" + prod.price.toFixed(2) + (prod.isFt ? "/ft" : "");
            priceWrapper.appendChild(hintDiv);
        }
        td.appendChild(priceWrapper); row.appendChild(td);

        td = document.createElement("td"); td.className = "numeric"; td.id = "sub-" + i; row.appendChild(td);

        td = document.createElement("td"); td.className = "table-actions-cell";
        const rmBtn = document.createElement("button"); rmBtn.type = "button"; rmBtn.className = "btn-remove-row";
        rmBtn.innerHTML = "&times;"; rmBtn.title = "Remove item";
        rmBtn.onclick = () => { deletedItems.push(JSON.parse(JSON.stringify(item))); lineItems.splice(i, 1); render(); updateTotalAndFasteners(); updateUndoButton(); };
        td.appendChild(rmBtn); row.appendChild(td);

        tbody.appendChild(row);
    });
}

function renderMobile() {
    const container = document.getElementById("mobile-items-container");
    container.innerHTML = "";
    lineItems.forEach((item, i) => {
        const prod = PRODUCTS[item.type] || PRODUCTS.custom;
        const card = document.createElement("div"); card.className = "line-item-card";
        const title = document.createElement("h4");
        title.textContent = "Item " + (i + 1) + ": " + (item.type === "custom" && item.customDesc ? item.customDesc : prod.name);
        card.appendChild(title);

        const productRow = document.createElement("div"); productRow.className = "line-item-row full";
        const prodLabel = document.createElement("label"); prodLabel.textContent = "Product";
        const prodSel = document.createElement("select");
        Object.entries(PRODUCT_CONFIG.categories).forEach(([catKey, category]) => {
            const optgroup = document.createElement("optgroup"); optgroup.label = category.label;
            Object.entries(category.products).forEach(([prodKey, prodData]) => {
                const opt = document.createElement("option"); opt.value = prodKey; opt.textContent = prodData.name;
                if (prodKey === item.type) opt.selected = true; optgroup.appendChild(opt);
            });
            prodSel.appendChild(optgroup);
        });
        prodSel.onchange = () => {
            item.type = prodSel.value; item.priceOverride = null;
            if (item.type !== "custom") { item.customDesc = ""; item.customUnitPrice = 0; }
            if (item.type === "dexerdry") item.length = 240;
            else if (PRODUCTS[item.type].isFt) { item.length = 16; item.customLength = null; }
            else item.length = null;
            render(); updateTotalAndFasteners();
        };
        productRow.appendChild(prodLabel); productRow.appendChild(prodSel); card.appendChild(productRow);

        if (item.type === "custom") {
            const descRow = document.createElement("div"); descRow.className = "line-item-row full";
            const descLabel = document.createElement("label"); descLabel.textContent = "Description";
            const descInput = document.createElement("input"); descInput.type = "text"; descInput.placeholder = "Enter product description...";
            descInput.value = item.customDesc || ""; descInput.oninput = e => { item.customDesc = e.target.value; };
            descRow.appendChild(descLabel); descRow.appendChild(descInput); card.appendChild(descRow);
        }

        if (prod.hasColor) {
            const colorRow = document.createElement("div"); colorRow.className = "line-item-row full";
            const colorLabel = document.createElement("label"); colorLabel.textContent = "Color";
            const colorSel = document.createElement("select");
            COLORS.forEach(c => { const o = document.createElement("option"); o.value = c; o.textContent = c; if (c === item.color) o.selected = true; colorSel.appendChild(o); });
            colorSel.onchange = e => { item.color = e.target.value; updateTotalAndFasteners(); };
            colorRow.appendChild(colorLabel); colorRow.appendChild(colorSel); card.appendChild(colorRow);
        }

        const lengthQtyRow = document.createElement("div"); lengthQtyRow.className = "line-item-row";
        if (item.type === "dexerdry") {
            const lengthDiv = document.createElement("div");
            const lengthLabel = document.createElement("label"); lengthLabel.textContent = "Box Size";
            const lengthSel = document.createElement("select");
            COIL_LENGTHS.forEach(len => { const o = document.createElement("option"); o.value = len; o.textContent = len + " ft box"; if (len === item.length) o.selected = true; lengthSel.appendChild(o); });
            lengthSel.onchange = e => { item.length = parseInt(e.target.value); updateTotalAndFasteners(); render(); };
            lengthDiv.appendChild(lengthLabel); lengthDiv.appendChild(lengthSel); lengthQtyRow.appendChild(lengthDiv);
        } else if (prod.isFt) {
            const lengthDiv = document.createElement("div");
            const lengthLabel = document.createElement("label"); lengthLabel.textContent = "Length (ft)";
            const lengthSel = document.createElement("select");
            BOARD_LENGTHS.forEach(len => { const o = document.createElement("option"); o.value = len; o.textContent = len === "custom" ? "Custom" : len + " ft"; if (len === item.length) o.selected = true; lengthSel.appendChild(o); });
            lengthSel.onchange = e => { item.length = e.target.value === "custom" ? "custom" : parseInt(e.target.value); render(); updateTotalAndFasteners(); };
            lengthDiv.appendChild(lengthLabel); lengthDiv.appendChild(lengthSel);
            if (item.length === "custom") {
                const customInput = document.createElement("input"); customInput.type = "number"; customInput.placeholder = "Enter length";
                customInput.value = item.customLength || ""; customInput.min = "1"; customInput.style.marginTop = "0.5rem";
                customInput.oninput = e => { item.customLength = parseFloat(e.target.value) || 0; updateTotalAndFasteners(); };
                lengthDiv.appendChild(customInput);
            }
            lengthQtyRow.appendChild(lengthDiv);
        }
        const qtyDiv = document.createElement("div");
        const qtyLabel = document.createElement("label"); qtyLabel.textContent = "Quantity";
        const qtyInput = document.createElement("input"); qtyInput.type = "number"; qtyInput.value = item.qty; qtyInput.min = "1";
        qtyInput.oninput = e => { item.qty = Math.max(1, parseInt(e.target.value) || 1); updateTotalAndFasteners(); };
        qtyDiv.appendChild(qtyLabel); qtyDiv.appendChild(qtyInput); lengthQtyRow.appendChild(qtyDiv);
        card.appendChild(lengthQtyRow);

        const priceRow = document.createElement("div"); priceRow.className = "line-item-row full";
        const priceLabel = document.createElement("label");
        priceLabel.textContent = item.type === "custom" ? "Unit Price" : "Unit Price (Default: $" + prod.price.toFixed(2) + (prod.isFt ? "/ft" : "") + ")";
        const priceInput = document.createElement("input"); priceInput.type = "number"; priceInput.step = "0.01"; priceInput.min = "0";
        if (item.type === "custom") {
            priceInput.placeholder = "Enter price"; priceInput.value = item.customUnitPrice || "";
            priceInput.oninput = e => { item.customUnitPrice = parseFloat(e.target.value) || 0; updateTotalAndFasteners(); };
        } else {
            priceInput.placeholder = "Leave blank for default"; priceInput.value = item.priceOverride != null ? item.priceOverride : "";
            priceInput.oninput = e => { const val = e.target.value.trim(); item.priceOverride = val === "" ? null : parseFloat(val) || 0; updateTotalAndFasteners(); };
        }
        priceRow.appendChild(priceLabel); priceRow.appendChild(priceInput); card.appendChild(priceRow);

        const subRow = document.createElement("div"); subRow.className = "line-item-row full"; subRow.id = "mobile-sub-" + i;
        card.appendChild(subRow);

        const actionsDiv = document.createElement("div"); actionsDiv.className = "line-item-card-actions";
        const rmBtn = document.createElement("button"); rmBtn.type = "button"; rmBtn.textContent = "Delete"; rmBtn.className = "btn btn-ghost btn-sm";
        rmBtn.onclick = () => { deletedItems.push(JSON.parse(JSON.stringify(item))); lineItems.splice(i, 1); render(); updateTotalAndFasteners(); updateUndoButton(); };
        actionsDiv.appendChild(rmBtn); card.appendChild(actionsDiv);

        container.appendChild(card);
    });
}

function updateUndoButton() {
    const btn = document.getElementById("undo-btn");
    if (deletedItems.length > 0) {
        btn.style.display = "block";
        btn.onclick = () => { lineItems.push(deletedItems.pop()); render(); updateTotalAndFasteners(); updateUndoButton(); };
    } else btn.style.display = "none";
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
    if (hasSystem && hasStandaloneDex) hintHtml += '<div class="fastener-warning">AmeriDex System Boards already include Dexerdry. Standalone Dexerdry is typically only needed for non-system decks.</div>';
    hintEl.style.display = hintHtml ? "block" : "none";
    hintEl.innerHTML = hintHtml;
}
