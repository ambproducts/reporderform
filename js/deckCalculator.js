function updateDiagramOrientation() {
    const orientation = document.getElementById("orientation").value;
    const boardLines = document.getElementById("board-lines-preview");
    const helpText = document.getElementById("orientation-help");

    if (orientation === "perpendicular") {
        boardLines.className = "board-lines perpendicular";
        helpText.textContent = "Boards will run away from the house, toward the yard";
    } else {
        boardLines.className = "board-lines parallel";
        helpText.textContent = "Boards will run along the house wall, left to right";
    }
}

function calculateOnly() {
    const alongHouse = parseFloat(document.getElementById("deck-len").value) || 0;
    const fromHouse = parseFloat(document.getElementById("deck-wid").value) || 0;

    if (alongHouse <= 0 || fromHouse <= 0) {
        alert("Please enter both dimensions greater than 0.");
        return;
    }

    deckLengthFt = alongHouse;
    deckWidthFt = fromHouse;

    const orientation = document.getElementById("orientation").value;
    const isPerpendicular = orientation === "perpendicular";

    const span = isPerpendicular ? fromHouse : alongHouse;
    const run = isPerpendicular ? alongHouse : fromHouse;

    const wastePctInput = document.getElementById("waste-pct").value.trim();
    const wastePct = wastePctInput === "" ? 0 : (parseFloat(wastePctInput) || 0);
    const wasteMultiplier = 1 + (wastePct / 100);

    const boardsNeeded = Math.ceil((run / EFFECTIVE_FT) * wasteMultiplier);

    let suggestedLength = span <= 12 ? 12 : (span <= 16 ? 16 : 20);

    lastCalculation = {
        boardsNeeded: boardsNeeded,
        suggestedLength: suggestedLength,
        wastePct: wastePct
    };

    const totalBoardFt = boardsNeeded * suggestedLength;

    const orientationText = isPerpendicular 
        ? "Perpendicular to house (boards run away from house)" 
        : "Parallel to house (boards run along house wall)";

    const spanExplanation = isPerpendicular
        ? "Each board spans " + fromHouse + " ft (from house to yard edge)"
        : "Each board spans " + alongHouse + " ft (along the house wall)";

    const msg = "<strong>Deck Size:</strong> " + alongHouse + " ft along house x " + fromHouse + " ft from house<br>" +
        "<strong>Board Direction:</strong> " + orientationText + "<br>" +
        "<strong>Board Length:</strong> " + spanExplanation + "<br>" +
        "&nbsp;&nbsp;&nbsp;&nbsp;Suggested board length: <strong>" + suggestedLength + " ft</strong><br>" +
        "<strong>Quantity:</strong> " + boardsNeeded + " boards (includes " + wastePct + "% waste)<br>" +
        "<strong>Total Board Feet:</strong> " + totalBoardFt.toFixed(0) + " ft";

    document.getElementById("calc-result").innerHTML = msg;
    document.getElementById("calc-result-container").style.display = "block";
}

function addSuggestionToOrder() {
    if (!lastCalculation) {
        alert("Please calculate first.");
        return;
    }

    lineItems.push({
        type: "system",
        color: selectedColor1,
        length: lastCalculation.suggestedLength,
        customLength: null,
        qty: lastCalculation.boardsNeeded,
        priceOverride: null,
        customDesc: "",
        customUnitPrice: 0
    });

    deletedItems = [];
    render();
    updateTotalAndFasteners();
    updateUndoButton();

    document.getElementById("calc-result-container").style.display = "none";
    lastCalculation = null;

    alert("AmeriDex System Boards added to your order!");
}
