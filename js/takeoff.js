// ============================================================
// takeoff.js - Joist counts and Starborn screw and plug boxes
// Depends on: config.js (SCREWS_PER_BOX, PLUGS_PER_BOX)
//
// Portal rule (ambproducts/dealerportal1 PR #24, lib/deck-takeoff.js):
// When boards run perpendicular to the house, joists are spaced along
// the out-from-house run:
//   joists = floor(outFt * 12 / spacingIn) + 1
// When boards run parallel, diagonal, or herringbone, count along the house:
//   joists = floor(alongFt * 12 / spacingIn) + 1
// Starborn screws are 2 per joist crossing (one crossing is one board on one joist).
// Starborn plugs are a separate item: 1 plug per Starborn screw when plugs are on.
// Boxes for each item are ceil(count / 375).
// ============================================================

function joistRunFt(alongFt, outFt, boardDirection) {
    const direction = String(boardDirection || "").toLowerCase();
    if (direction === "perpendicular") return outFt;
    return alongFt;
}

function countJoists(alongFt, outFt, boardDirection, spacingIn) {
    const runFt = joistRunFt(alongFt, outFt, boardDirection);
    const spacing = spacingIn > 0 ? spacingIn : 16;
    return Math.floor(runFt * 12 / spacing) + 1;
}

function fastenerBoxSize(kind) {
    if (kind === "plugs" && typeof PLUGS_PER_BOX === "number") return PLUGS_PER_BOX;
    if (kind === "screws" && typeof SCREWS_PER_BOX === "number") return SCREWS_PER_BOX;
    return 375;
}

function starbornFastenerTakeoff(opts) {
    const boardCount = opts.boardCount || 0;
    const joists = opts.joists != null
        ? opts.joists
        : countJoists(opts.alongFt, opts.outFt, opts.boardDirection, opts.spacingIn);
    const crossings = boardCount * joists;
    const screws = crossings * 2;
    const plugs = opts.plugsOn ? screws : 0;
    return {
        joists: joists,
        crossings: crossings,
        screws: screws,
        plugs: plugs,
        screwBoxes: Math.ceil(screws / fastenerBoxSize("screws")),
        plugBoxes: Math.ceil(plugs / fastenerBoxSize("plugs"))
    };
}

if (typeof module !== "undefined" && module.exports) {
    module.exports = {
        joistRunFt: joistRunFt,
        countJoists: countJoists,
        starbornFastenerTakeoff: starbornFastenerTakeoff
    };
}
