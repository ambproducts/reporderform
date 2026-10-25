// Portal numbers from the AmeriDex joist rule
// (ambproducts/dealerportal1 PR #24, lib/deck-takeoff.js).
// Perpendicular boards: joists = floor(outFt * 12 / spacingIn) + 1.
// Parallel, diagonal, and herringbone: count along the house.
// Example: 16 ft along by 12 ft out at 16 in spacing, perpendicular
// boards: floor(144/16)+1 = 10 joists.
// Starborn screws: 2 per joist crossing. Starborn plugs: 1 per screw when on.
// Boxes: ceil(count / 375) for each item.

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const { countJoists, starbornFastenerTakeoff } = require(path.join(root, "js/takeoff.js"));

const portalJoistCases = [
    { alongFt: 16, outFt: 12, spacingIn: 16, boardDirection: "perpendicular", joists: 10 },
    { alongFt: 16, outFt: 12, spacingIn: 16, boardDirection: "parallel", joists: 13 },
    { alongFt: 16, outFt: 12, spacingIn: 16, boardDirection: "diagonal", joists: 13 },
    { alongFt: 16, outFt: 12, spacingIn: 16, boardDirection: "herringbone", joists: 13 },
    { alongFt: 16, outFt: 12, spacingIn: 12, boardDirection: "perpendicular", joists: 13 },
    { alongFt: 16, outFt: 12, spacingIn: 12, boardDirection: "parallel", joists: 17 },
    { alongFt: 16, outFt: 12, spacingIn: 12, boardDirection: "diagonal", joists: 17 },
    { alongFt: 16, outFt: 12, spacingIn: 12, boardDirection: "herringbone", joists: 17 },
    { alongFt: 20, outFt: 10, spacingIn: 16, boardDirection: "perpendicular", joists: 8 },
    { alongFt: 20, outFt: 10, spacingIn: 16, boardDirection: "parallel", joists: 16 },
    { alongFt: 24, outFt: 18, spacingIn: 16, boardDirection: "perpendicular", joists: 14 },
    { alongFt: 15, outFt: 12, spacingIn: 16, boardDirection: "parallel", joists: 12 },
    { alongFt: 12, outFt: 16, spacingIn: 16, boardDirection: "perpendicular", joists: 13 },
    { alongFt: 12, outFt: 16, spacingIn: 16, boardDirection: "herringbone", joists: 10 }
];

test("joist direction matches the portal rule", () => {
    for (const row of portalJoistCases) {
        const got = countJoists(row.alongFt, row.outFt, row.boardDirection, row.spacingIn);
        assert.equal(
            got,
            row.joists,
            row.boardDirection + " " + row.alongFt + "x" + row.outFt + " @ " + row.spacingIn
        );
    }
});

test("16 ft along by 12 ft out at 16 in, perpendicular, is 10 joists", () => {
    assert.equal(Math.floor(144 / 16) + 1, 10);
    assert.equal(countJoists(16, 12, "perpendicular", 16), 10);
    assert.notEqual(countJoists(16, 12, "perpendicular", 16), countJoists(16, 12, "parallel", 16));
});

test("Starborn screws are 2 per joist crossing and boxes are ceil(count/375)", () => {
    const deck = starbornFastenerTakeoff({
        boardCount: 20,
        alongFt: 16,
        outFt: 12,
        boardDirection: "perpendicular",
        spacingIn: 16,
        plugsOn: true
    });
    assert.equal(deck.joists, 10);
    assert.equal(deck.crossings, 200);
    assert.equal(deck.screws, 400);
    assert.equal(deck.screwBoxes, 2);
    assert.equal(deck.plugs, 400);
    assert.equal(deck.plugBoxes, 2);

    const oneShort = starbornFastenerTakeoff({ boardCount: 187, joists: 1, plugsOn: true });
    assert.equal(oneShort.screws, 374);
    assert.equal(oneShort.screwBoxes, 1);
    assert.equal(oneShort.plugs, 374);
    assert.equal(oneShort.plugBoxes, 1);

    const oneOver = starbornFastenerTakeoff({ boardCount: 188, joists: 1, plugsOn: true });
    assert.equal(oneOver.screws, 376);
    assert.equal(oneOver.screwBoxes, 2);
    assert.equal(oneOver.plugBoxes, 2);

    const exact = starbornFastenerTakeoff({ boardCount: 375, joists: 1, plugsOn: true });
    assert.equal(exact.screws, 750);
    assert.equal(exact.screwBoxes, 2);
    assert.equal(exact.plugBoxes, 2);
});

test("Starborn plugs are off unless plugs are on, and then 1 plug per screw", () => {
    const on = starbornFastenerTakeoff({
        boardCount: 8,
        alongFt: 16,
        outFt: 12,
        boardDirection: "parallel",
        spacingIn: 16,
        plugsOn: true
    });
    assert.equal(on.joists, 13);
    assert.equal(on.screws, 8 * 13 * 2);
    assert.equal(on.plugs, on.screws);

    const off = starbornFastenerTakeoff({
        boardCount: 8,
        alongFt: 16,
        outFt: 12,
        boardDirection: "parallel",
        spacingIn: 16,
        plugsOn: false
    });
    assert.equal(off.screws, on.screws);
    assert.equal(off.plugs, 0);
    assert.equal(off.plugBoxes, 0);
    assert.equal(off.screwBoxes, Math.ceil(off.screws / 375));
});

test("sales email, Starborn names, and no saless or Cortex remain", () => {
    const review = fs.readFileSync(path.join(root, "js/review-modal.js"), "utf8");
    assert.match(review, /mailto:sales@ameridex.com/);
    assert.doesNotMatch(review, /saless/);

    const config = fs.readFileSync(path.join(root, "js/config.js"), "utf8");
    assert.match(config, /name: "Starborn screws"/);
    assert.match(config, /name: "Starborn plugs"/);
    assert.match(config, /375 Starborn screws/);
    assert.match(config, /375 Starborn plugs/);
    assert.match(config, /const SCREWS_PER_BOX = 375/);
    assert.match(config, /const PLUGS_PER_BOX = 375/);
    assert.doesNotMatch(config, /Epoxy-Coated|Color-Matching|Cortex|saless/i);

    const pricing = fs.readFileSync(path.join(root, "js/pricing.js"), "utf8");
    assert.match(pricing, /boxes of Starborn screws/);
    assert.match(pricing, /boxes of Starborn plugs/);
    assert.doesNotMatch(pricing, /boxes of screws|boxes of plugs|Fastener suggestion/);

    const textExt = new Set([".js", ".html", ".css", ".md", ".json"]);
    const files = [];
    (function walk(dir) {
        for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
            if (ent.name === ".git" || ent.name === "node_modules" || ent.name === "test") continue;
            const full = path.join(dir, ent.name);
            if (ent.isDirectory()) walk(full);
            else if (textExt.has(path.extname(ent.name))) files.push(full);
        }
    })(root);

    for (const file of files) {
        const text = fs.readFileSync(file, "utf8");
        assert.doesNotMatch(text, /saless/i, file);
        assert.doesNotMatch(text, /Cortex/i, file);
    }
});
