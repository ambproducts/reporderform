function showPrintPreview(type) {
    const title = type === "customer" ? "Customer Quote Preview" : "Internal Order Form Preview";
    document.getElementById("print-preview-title").textContent = title;
    document.getElementById("print-preview-content").innerHTML = generatePrintHTML(type);
    printPreviewModal.classList.add("active");
}

function generatePrintHTML(type) {
    const today = new Date().toLocaleDateString();
    const includeInternal = type === "internal";
    let html = '<div style="text-align: center; margin-bottom: 1.5rem;"><h1 style="margin: 0;">AmeriDex ' + (type === "customer" ? "Quote" : "Order Form") + '</h1><p style="color: #666; margin: 0.5rem 0;">Date: ' + today + '</p></div><h2>Customer Information</h2><table><tr><td style="width: 120px;"><strong>Name:</strong></td><td>' + document.getElementById("cust-name").value + '</td></tr>';
    if (document.getElementById("cust-company").value) html += '<tr><td><strong>Company:</strong></td><td>' + document.getElementById("cust-company").value + '</td></tr>';
    html += '<tr><td><strong>Address:</strong></td><td>' + document.getElementById("cust-address").value.replace(/\n/g, "<br>") + '</td></tr><tr><td><strong>Phone:</strong></td><td>' + document.getElementById("cust-phone").value + '</td></tr><tr><td><strong>Email:</strong></td><td>' + document.getElementById("cust-email").value + '</td></tr></table>';
    if (document.getElementById("pic-frame").checked || document.getElementById("stairs").checked) {
        html += '<h2>Options</h2><ul>';
        if (document.getElementById("pic-frame").checked) html += '<li>Picture Framing Required</li>';
        if (document.getElementById("stairs").checked) html += '<li>Stairs Required</li>';
        html += '</ul>';
    }
    html += '<h2>Order Items</h2><table><thead><tr><th>Product</th><th>Color</th><th>Length/Size</th><th style="text-align: right;">Qty</th><th style="text-align: right;">Unit Price</th><th style="text-align: right;">Subtotal</th></tr></thead><tbody>';
    lineItems.forEach((item, i) => {
        const prod = PRODUCTS[item.type] || PRODUCTS.custom;
        const price = getItemPrice(item);
        const sub = getItemSubtotal(item);
        let desc = item.type === "custom" && item.customDesc ? item.customDesc : prod.name;
        let lengthDisplay = "";
        if (item.type === "dexerdry") lengthDisplay = item.length + " ft box";
        else if (prod.isFt) { const len = item.length === "custom" ? item.customLength : item.length; lengthDisplay = len + " ft"; }
        html += '<tr><td>' + desc + '</td><td>' + (prod.hasColor ? (item.color || "") : "") + '</td><td>' + lengthDisplay + '</td><td style="text-align: right;">' + item.qty + '</td><td style="text-align: right;">$' + price.toFixed(2) + (prod.isFt ? "/ft" : "") + '</td><td style="text-align: right;">$' + sub.toFixed(2) + '</td></tr>';
        if (item.type === "dexerdry") html += '<tr style="background: #f0f9ff;"><td colspan="6" style="font-size: 0.9em; color: #1d4ed8; padding-left: 2rem;">Total Dexerdry: ' + (item.length * item.qty) + ' ft</td></tr>';
    });
    html += '</tbody><tfoot><tr class="total-row"><td colspan="5" style="text-align: right;"><strong>Estimated Total:</strong></td><td style="text-align: right;"><strong>' + document.getElementById("grand-total").textContent + '</strong></td></tr></tfoot></table>';
    const special = document.getElementById("special-instr").value;
    if (special) html += '<h2>Special Instructions</h2><p>' + special.replace(/\n/g, "<br>") + '</p>';
    if (includeInternal) { const internal = document.getElementById("internal-notes").value; if (internal) html += '<h2 style="color: #b91c1c;">Internal Notes (Sales Rep)</h2><p style="background: #fef2f2; padding: 0.75rem; border-radius: 6px;">' + internal.replace(/\n/g, "<br>") + '</p>'; }
    const ship = document.getElementById("ship-addr").value;
    if (ship) html += '<h2>Shipping Address</h2><p>' + ship.replace(/\n/g, "<br>") + '</p>';
    const delDate = document.getElementById("del-date").value;
    if (delDate) html += '<p><strong>Preferred Delivery Date:</strong> ' + delDate + '</p>';
    html += '<div style="margin-top: 2rem; padding-top: 1rem; border-top: 1px solid #ddd; text-align: center; color: #666;"><p>Thank you for choosing AmeriDex!<br>www.ameridex.com</p></div>';
    return html;
}

function printFromPreview() {
    const content = document.getElementById("print-preview-content").innerHTML;
    const printWindow = window.open("", "_blank", "width=800,height=600");
    printWindow.document.write('<!DOCTYPE html><html><head><title>AmeriDex ' + (currentPrintType === "customer" ? "Quote" : "Order Form") + '</title><style>body { font-family: "Times New Roman", serif; padding: 20px; max-width: 800px; margin: 0 auto; } h1 { color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 0.5rem; } h2 { color: #374151; font-size: 1.1rem; margin-top: 1.5rem; } table { width: 100%; border-collapse: collapse; margin: 1rem 0; } th, td { border: 1px solid #ddd; padding: 8px; text-align: left; } th { background: #f3f4f6; } .total-row { font-weight: bold; background: #f9fafb; } @media print { body { padding: 0; } }</style></head><body>' + content + '</body></html>');
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => { printWindow.print(); printWindow.close(); }, 250);
    printPreviewModal.classList.remove("active");
}

function generatePDF() {
    if (!validateRequired()) return;
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    let y = 20;
    doc.setFontSize(20); doc.setTextColor(37, 99, 235);
    doc.text("AmeriDex Quote", pageWidth / 2, y, { align: "center" }); y += 10;
    doc.setFontSize(10); doc.setTextColor(100);
    doc.text("Date: " + new Date().toLocaleDateString(), pageWidth / 2, y, { align: "center" }); y += 15;
    doc.setFontSize(12); doc.setTextColor(0); doc.setFont(undefined, "bold");
    doc.text("Customer Information", margin, y); y += 7;
    doc.setFont(undefined, "normal"); doc.setFontSize(10);
    doc.text("Name: " + document.getElementById("cust-name").value, margin, y); y += 5;
    doc.text("Email: " + document.getElementById("cust-email").value, margin, y); y += 5;
    doc.text("Phone: " + document.getElementById("cust-phone").value, margin, y); y += 5;
    const addressLines = doc.splitTextToSize("Address: " + document.getElementById("cust-address").value, pageWidth - 2 * margin);
    doc.text(addressLines, margin, y); y += addressLines.length * 5 + 10;
    doc.setFontSize(12); doc.setFont(undefined, "bold");
    doc.text("Order Items", margin, y); y += 7;
    doc.setFontSize(10); doc.setFont(undefined, "normal");
    lineItems.forEach((item, i) => {
        if (y > 260) { doc.addPage(); y = 20; }
        const prod = PRODUCTS[item.type] || PRODUCTS.custom;
        const sub = getItemSubtotal(item);
        let desc = item.type === "custom" && item.customDesc ? item.customDesc : prod.name;
        if (prod.hasColor && item.color) desc += " (" + item.color + ")";
        const descLines = doc.splitTextToSize((i + 1) + ". " + desc, pageWidth - 2 * margin - 40);
        doc.text(descLines, margin, y);
        doc.text("$" + sub.toFixed(2), pageWidth - margin, y, { align: "right" }); y += descLines.length * 5;
        doc.setTextColor(100);
        if (item.type === "dexerdry") doc.text("   " + item.qty + " x " + item.length + "ft box = " + (item.length * item.qty) + " ft", margin, y);
        else if (prod.isFt) doc.text("   " + getItemLength(item) + " ft x " + item.qty + " @ $" + getItemPrice(item).toFixed(2) + "/ft", margin, y);
        else doc.text("   Qty: " + item.qty + " @ $" + getItemPrice(item).toFixed(2) + " each", margin, y);
        doc.setTextColor(0); y += 8;
    });
    y += 5; doc.setDrawColor(37, 99, 235); doc.line(margin, y, pageWidth - margin, y); y += 8;
    doc.setFontSize(14); doc.setFont(undefined, "bold"); doc.setTextColor(37, 99, 235);
    doc.text("Estimated Total: " + document.getElementById("grand-total").textContent, pageWidth - margin, y, { align: "right" });
    for (let i = 1; i <= doc.internal.getNumberOfPages(); i++) {
        doc.setPage(i); doc.setFontSize(8); doc.setTextColor(150);
        doc.text("www.ameridex.com", pageWidth / 2, 290, { align: "center" });
    }
    doc.save("AmeriDex-Quote-" + document.getElementById("cust-name").value.replace(/\s+/g, "-") + ".pdf");
}
