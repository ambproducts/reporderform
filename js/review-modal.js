// ============================================================
// review-modal.js — Review modal, order text, email submit
// Depends on: config.js, state.js, pricing.js
// ============================================================

function validateRequired() {
    const fields = [
        { id: "cust-name", msg: "customer name" },
        { id: "cust-email", msg: "customer email" },
        { id: "cust-phone", msg: "customer phone" },
        { id: "cust-address", msg: "customer address" }
    ];
    for (const f of fields) {
        if (!document.getElementById(f.id).value.trim()) {
            alert("Please enter " + f.msg + ".");
            document.getElementById(f.id).focus();
            return false;
        }
    }
    if (lineItems.length === 0) { alert("Please add at least one line item."); return false; }
    return true;
}

function generateOrderText(includeInternal) {
    const today = new Date().toLocaleDateString();
    let txt = "AMERIDEX ORDER / QUOTE\nDate: " + today + "\n\nCUSTOMER INFORMATION\n";
    txt += "Name: " + document.getElementById("cust-name").value + "\n";
    const company = document.getElementById("cust-company").value;
    if (company) txt += "Company: " + company + "\n";
    txt += "Address: " + document.getElementById("cust-address").value.replace(/\n/g, ", ") + "\n";
    txt += "Phone: " + document.getElementById("cust-phone").value + "\n";
    txt += "Email: " + document.getElementById("cust-email").value + "\n\n";
    if (document.getElementById("pic-frame").checked) txt += "* Picture Framing Required\n";
    if (document.getElementById("stairs").checked) txt += "* Stairs Required\n";
    if (document.getElementById("pic-frame").checked || document.getElementById("stairs").checked) txt += "\n";
    txt += "LINE ITEMS:\n\n";
    lineItems.forEach((item, i) => {
        const prod = PRODUCTS[item.type] || PRODUCTS.custom;
        const price = getItemPrice(item);
        const sub = getItemSubtotal(item);
        let desc = item.type === "custom" && item.customDesc ? item.customDesc : prod.name;
        if (prod.hasColor && item.color) desc += " (" + item.color + ")";
        txt += (i + 1) + ". " + desc + "\n";
        if (item.type === "dexerdry") txt += "   Box: " + item.length + " ft | Qty: " + item.qty + " | Total: " + (item.length * item.qty) + " ft\n";
        else if (prod.isFt) txt += "   Length: " + getItemLength(item) + " ft | Qty: " + item.qty + " | @ $" + price.toFixed(2) + "/ft\n";
        else txt += "   Qty: " + item.qty + " | @ $" + price.toFixed(2) + " each\n";
        txt += "   Subtotal: $" + sub.toFixed(2) + "\n\n";
    });
    txt += "ESTIMATED TOTAL: " + document.getElementById("grand-total").textContent + "\n\n";
    const special = document.getElementById("special-instr").value;
    if (special) txt += "SPECIAL INSTRUCTIONS:\n" + special + "\n\n";
    if (includeInternal) {
        const internal = document.getElementById("internal-notes").value;
        if (internal) txt += "INTERNAL NOTES:\n" + internal + "\n\n";
    }
    const ship = document.getElementById("ship-addr").value;
    if (ship) txt += "SHIPPING ADDRESS:\n" + ship.replace(/\n/g, ", ") + "\n\n";
    const delDate = document.getElementById("del-date").value;
    if (delDate) txt += "PREFERRED DELIVERY DATE: " + delDate + "\n\n";
    txt += "www.ameridex.com\n";
    return txt;
}

function showReview() {
    if (!validateRequired()) return;
    document.getElementById("review-name").textContent = document.getElementById("cust-name").value;
    document.getElementById("review-email").textContent = document.getElementById("cust-email").value;
    document.getElementById("review-phone").textContent = document.getElementById("cust-phone").value;
    document.getElementById("email-fallback").style.display = "none";
    const reviewItems = document.getElementById("review-items");
    reviewItems.innerHTML = "";
    lineItems.forEach((item, i) => {
        const prod = PRODUCTS[item.type] || PRODUCTS.custom;
        const sub = getItemSubtotal(item);
        let desc = item.type === "custom" && item.customDesc ? item.customDesc : prod.name;
        if (prod.hasColor && item.color) desc += " (" + item.color + ")";
        let detail = "";
        if (item.type === "dexerdry") detail = " - " + item.qty + " x " + item.length + "ft box (" + (item.length * item.qty) + " ft)";
        else if (prod.isFt) detail = " - " + item.qty + " x " + getItemLength(item) + "ft";
        else detail = " - Qty: " + item.qty;
        const itemDiv = document.createElement("div"); itemDiv.className = "review-item";
        itemDiv.innerHTML = '<span class="review-item-label">' + (i + 1) + ". " + desc + detail + '</span><span>$' + sub.toFixed(2) + '</span>';
        reviewItems.appendChild(itemDiv);
    });
    document.getElementById("review-total").textContent = document.getElementById("grand-total").textContent;
    reviewModal.classList.add("active");
}

function submitOrder() {
    if (!validateRequired()) return;
    const orderText = generateOrderText(true);
    const customerName = document.getElementById("cust-name").value;
    const subject = "AmeriDex Quote - " + customerName;
    navigator.clipboard.writeText(orderText).then(() => {
        const mailto = "mailto:saless@ameridex.com?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(orderText);
        const link = document.createElement("a"); link.href = mailto; link.style.display = "none";
        document.body.appendChild(link); link.click(); document.body.removeChild(link);
        setTimeout(() => { document.getElementById("email-fallback").style.display = "block"; }, 500);
        document.getElementById("success-msg").style.display = "block";
    }).catch(() => {
        window.location.href = "mailto:sales@ameridex.com?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(orderText);
        document.getElementById("email-fallback").style.display = "block";
    });
}
