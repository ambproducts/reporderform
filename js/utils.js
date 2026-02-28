function isMobileView() { return window.innerWidth <= 768; }

function getItemLength(item) { return item.length === "custom" ? (item.customLength || 0) : (item.length || 0); }

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
