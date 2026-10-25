// ============================================================
// config.js — Product catalog, color definitions, constants
// No dependencies. Must load first.
// ============================================================

const PRODUCT_CONFIG = {
    categories: {
        decking: {
            label: "Decking Boards",
            products: {
                system: { name: "AmeriDex System Boards (Grooved + Dexerdry included)", price: 8.00, isFt: true, hasColor: true, lengthType: "board", help: "Premium option with grooved boards and integrated Dexerdry sealing." },
                grooved: { name: "Grooved Deck Boards (no Dexerdry)", price: 6.00, isFt: true, hasColor: true, lengthType: "board", help: "Grooved boards without integrated sealing." },
                solid: { name: "Solid Edge Deck Boards", price: 6.00, isFt: true, hasColor: true, lengthType: "board", help: "For picture framing or stair construction." }
            }
        },
        sealing: {
            label: "Sealing & Protection",
            products: {
                dexerdry: { name: "Dexerdry Seals (standalone)", price: 2.00, isFt: true, hasColor: false, lengthType: "coil", help: "Standalone sealing. 240 ft or 50 ft boxes." }
            }
        },
        fasteners: {
            label: "Starborn screws and Starborn plugs",
            products: {
                screws: { name: "Starborn screws", price: 37.00, isFt: false, hasColor: false, help: "Per box (375 Starborn screws)." },
                plugs: { name: "Starborn plugs", price: 33.79, isFt: false, hasColor: false, help: "Per box (375 Starborn plugs)." }
            }
        },
        Hardware: {
            label: "Hardware",
            products: {
                blueclaw: { name: "Dexerdry BlueClaw", price: 150.00, isFt: false, hasColor: false, help: "For efficiently compressing deck boards." }
            }
        },
        custom: {
            label: "Custom Items",
            products: {
                custom: { name: "Custom / Manual Item", price: 0, isFt: false, hasColor: false, help: "Enter your own description and price." }
            }
        }
    }
};

// Flat product lookup map derived from PRODUCT_CONFIG
const PRODUCTS = {};
Object.values(PRODUCT_CONFIG.categories).forEach(cat => {
    Object.assign(PRODUCTS, cat.products);
});

const COLORS = ["Driftwood", "Khaki", "Slate", "Beachwood", "Chestnut", "Redwood", "Hazelnut"];

const COLOR_IMAGES = {
    Driftwood: "Driftwood.png",
    Khaki: "Khaki.png",
    Slate: "Slate.png",
    Beachwood: "Beachwood.png",
    Chestnut: "Chestnut.png",
    Redwood: "Redwood.png",
    Hazelnut: "Hazelnut.png"
};

const BOARD_LENGTHS = [12, 16, 20, "custom"];
const COIL_LENGTHS = [240, 50];

// Board geometry constants
const BOARD_WIDTH_INCH = 5.5;
const GAP_INCH = 0.125;
const EFFECTIVE_FT = (BOARD_WIDTH_INCH + GAP_INCH) / 12;

const SCREWS_PER_BOX = 375;
const PLUGS_PER_BOX = 375;
const JOIST_SPACING_IN = 16;
