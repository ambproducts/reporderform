// Shared DOM references used across modules
const tbody = document.querySelector("#line-items tbody");
const modal = document.getElementById("colorModal");
const reviewModal = document.getElementById("reviewModal");
const printPreviewModal = document.getElementById("printPreviewModal");
const modalImg = document.getElementById("colorLarge");
const modalName = document.getElementById("colorName");

// Customer form progress listeners
["cust-name", "cust-address", "cust-phone", "cust-email"].forEach(id => {
    document.getElementById(id).addEventListener("input", updateCustomerProgress);
});

// Orientation change listener
document.getElementById("orientation").addEventListener("change", updateDiagramOrientation);

// Add row button
document.getElementById("add-row").onclick = () => {
    lineItems.push({ type: "system", color: selectedColor1, length: 16, customLength: null, qty: 1, priceOverride: null, customDesc: "", customUnitPrice: 0 });
    deletedItems = [];
    render();
    updateTotalAndFasteners();
};

// Calculator buttons
document.getElementById("calc-btn").onclick = calculateOnly;
document.getElementById("add-suggestion-btn").onclick = addSuggestionToOrder;
document.getElementById("clear-calc-btn").onclick = () => { document.getElementById("calc-result-container").style.display = "none"; lastCalculation = null; };

// Modal close buttons
document.getElementById("modal-close").onclick = () => modal.classList.remove("active");
document.getElementById("review-close").onclick = () => { reviewModal.classList.remove("active"); document.getElementById("email-fallback").style.display = "none"; };
document.getElementById("print-preview-close").onclick = () => printPreviewModal.classList.remove("active");
document.getElementById("print-preview-cancel").onclick = () => printPreviewModal.classList.remove("active");

// Keyboard handler
window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
        modal.classList.remove("active");
        reviewModal.classList.remove("active");
        printPreviewModal.classList.remove("active");
        document.getElementById("print-dropdown").classList.remove("active");
        document.getElementById("email-fallback").style.display = "none";
    }
});

// Click-outside handler
window.addEventListener("click", (e) => {
    if (e.target === modal) modal.classList.remove("active");
    if (e.target === reviewModal) { reviewModal.classList.remove("active"); document.getElementById("email-fallback").style.display = "none"; }
    if (e.target === printPreviewModal) printPreviewModal.classList.remove("active");
    const dropdown = document.getElementById("print-dropdown");
    if (!dropdown.contains(e.target)) dropdown.classList.remove("active");
});

// Reset form
document.getElementById("reset").onclick = () => {
    if (!confirm("Clear the entire form?")) return;
    lineItems = []; deletedItems = []; lastCalculation = null;
    render(); updateTotalAndFasteners(); updateCustomerProgress();
    ["cust-name", "cust-company", "cust-address", "cust-phone", "cust-email", "ship-addr", "del-date", "special-instr", "internal-notes", "deck-len", "deck-wid", "waste-pct"].forEach(id => { document.getElementById(id).value = ""; });
    document.getElementById("pic-frame").checked = false;
    document.getElementById("stairs").checked = false;
    document.getElementById("pic-frame-note").style.display = "none";
    document.getElementById("stairs-note").style.display = "none";
    document.getElementById("fastener-hint").style.display = "none";
    document.getElementById("fastener-hint").innerHTML = "";
    document.getElementById("success-msg").style.display = "none";
    document.getElementById("calc-result-container").style.display = "none";
    document.getElementById("orientation").value = "perpendicular";
    updateDiagramOrientation();
};

// Print/Export buttons
document.getElementById("print-btn").onclick = (e) => { e.stopPropagation(); document.getElementById("print-dropdown").classList.toggle("active"); };
document.getElementById("print-customer").onclick = () => { document.getElementById("print-dropdown").classList.remove("active"); currentPrintType = "customer"; showPrintPreview("customer"); };
document.getElementById("print-internal").onclick = () => { document.getElementById("print-dropdown").classList.remove("active"); currentPrintType = "internal"; showPrintPreview("internal"); };
document.getElementById("export-pdf").onclick = () => { document.getElementById("print-dropdown").classList.remove("active"); generatePDF(); };
document.getElementById("print-preview-print").onclick = () => { printFromPreview(); };

// Review & Submit
document.getElementById("review-btn").onclick = showReview;
document.getElementById("review-submit").onclick = submitOrder;
document.getElementById("review-back").onclick = () => { reviewModal.classList.remove("active"); document.getElementById("email-fallback").style.display = "none"; };
document.getElementById("review-copy").onclick = () => {
    const orderText = generateOrderText(true);
    navigator.clipboard.writeText(orderText).then(() => {
        const btn = document.getElementById("review-copy");
        btn.textContent = "Copied!"; btn.classList.add("btn-success"); btn.classList.remove("btn-outline");
        setTimeout(() => { btn.textContent = "Copy to Clipboard"; btn.classList.remove("btn-success"); btn.classList.add("btn-outline"); }, 2000);
    }).catch(() => alert("Failed to copy."));
};

// Checkbox toggles
["pic-frame", "stairs"].forEach(id => {
    document.getElementById(id).addEventListener("change", (e) => { document.getElementById(id + "-note").style.display = e.target.checked ? "block" : "none"; });
});

// Resize handler
let resizeTimeout;
window.addEventListener("resize", () => { clearTimeout(resizeTimeout); resizeTimeout = setTimeout(render, 250); });

// Initialize
initColorGrid();
updateColorSelection();
updateColorComparison();
updateDiagramOrientation();
render();
updateTotalAndFasteners();
updateCustomerProgress();
