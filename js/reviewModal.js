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
