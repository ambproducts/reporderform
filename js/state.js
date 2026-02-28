// ============================================================
// state.js — Global runtime state
// Depends on: config.js
// Must load after config.js, before all feature modules.
// ============================================================

let lineItems = [];
let deletedItems = [];
let deckLengthFt = 0;
let deckWidthFt = 0;
let selectedColor1 = "Driftwood";
let selectedColor2 = "Khaki";
let currentPrintType = "customer";
let lastCalculation = null;

// Cached DOM references used across multiple modules
const tbody = document.querySelector("#line-items tbody");
const modal = document.getElementById("colorModal");
const reviewModal = document.getElementById("reviewModal");
const printPreviewModal = document.getElementById("printPreviewModal");
const modalImg = document.getElementById("colorLarge");
const modalName = document.getElementById("colorName");
