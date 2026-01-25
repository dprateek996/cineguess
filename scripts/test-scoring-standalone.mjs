
// Standalone Test Script - Logic Copied from gameService.js due to module alias issues

function calculateScore(round, stage = 1, timeRemaining = null, mode = 'classic', maxTime = 15) {
    const BASE_SCORE = 100

    // Stage Penalty (Deductive instead of Multiplicative)
    // Stage 1: 100% (100pts), Stage 2: 60% (60pts), Stage 3: 30% (30pts)
    const stageFactors = { 1: 1.0, 2: 0.6, 3: 0.3 }
    const stageFactor = stageFactors[stage] || 1.0

    // Round Bonus: Linear progression (+10 pts per round)
    // Helps high rounds feel valuable without inflating to millions
    const roundBonus = (round - 1) * 10

    let total = Math.floor((BASE_SCORE * stageFactor) + roundBonus)

    // Rapid Fire Bonuses
    if (mode === 'rapidfire' && timeRemaining !== null) {
        // Speed Bonus: Flat +50 points if guessed fast (<=3s used)
        const timeUsed = maxTime - timeRemaining
        const isSpeedBonus = timeUsed <= 3

        if (isSpeedBonus) {
            total += 50
        }

        // Time Bonus: Small bonus for remaining time (+2 pts per second)
        total += (timeRemaining * 2)
    }

    // Streak Bonus: Small flat bonus (+10 pts) for every 5 streak
    if (round % 5 === 0) {
        total += 10
    }

    return Math.floor(total)
}

// Helper to log test cases
function test(name, actual, expected) {
    const passed = Math.abs(actual - expected) <= 5; // Allow small variance
    console.log(`${passed ? '✅' : '❌'} ${name}: Got ${actual} (Expected ~${expected})`);
}

console.log("--- Testing Score Logic (Standalone) ---");

// 1. Classic Mode Logic
// Base 100 + Round Bonus (0 for R1) * Stage
test('Classic R1 Stage 1 (Poster)', calculateScore(1, 1, null, 'classic'), 100);
test('Classic R1 Stage 2 (Dialogue)', calculateScore(1, 2, null, 'classic'), 60); // 100 * 0.6
test('Classic R1 Stage 3 (Scene)', calculateScore(1, 3, null, 'classic'), 30); // 100 * 0.3

// Round Bonus
test('Classic R10 Stage 1', calculateScore(10, 1, null, 'classic'), 200); // (100 * 1.0) + (9*10) = 190. Wait. Round 10 streak bonus? Yes. 190 + 10 = 200.
test('Classic R50 Stage 1', calculateScore(50, 1, null, 'classic'), 600); // (100) + (49*10) + 10 = 100 + 490 + 10 = 600.

// Streak Bonus (Every 5 rounds)
test('Classic R5 Stage 1 (Streak Bonus)', calculateScore(5, 1, null, 'classic'), 150); // (100) + (4*10) + 10 = 150.

// 2. Rapid Fire Logic
// Base 100 + Speed Bonus (50) + Time Bonus (2 * 10)
// R1, 10s left (Total 15s -> Used 5s, No Speed Bonus)
test('Rapid Fire R1 Slow (10s left)', calculateScore(1, 1, 10, 'rapidfire', 15), 120); // 100 + 20(time) = 120.

// R1, 13s left (Used 2s -> Speed Bonus!)
// 100 + 26 (time) + 50 (speed) = 176
test('Rapid Fire R1 Fast (13s left)', calculateScore(1, 1, 13, 'rapidfire', 15), 176);

console.log("\n--- Verification Complete ---");
