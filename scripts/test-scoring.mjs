
import gameService from '../src/services/gameService.js';

// Helper to log test cases
function test(name, actual, expected) {
    const passed = Math.abs(actual - expected) <= 5; // Allow small variance
    console.log(`${passed ? '✅' : '❌'} ${name}: Got ${actual} (Expected ~${expected})`);
}

console.log("--- Testing Score Logic ---");

const { calculateScore } = gameService;

// 1. Classic Mode Logic
// Base 100 + Round Bonus (0 for R1) * Stage
test('Classic R1 Stage 1 (Poster)', calculateScore(1, 1, null, 'classic'), 100);
test('Classic R1 Stage 2 (Dialogue)', calculateScore(1, 2, null, 'classic'), 60); // 100 * 0.6
test('Classic R1 Stage 3 (Scene)', calculateScore(1, 3, null, 'classic'), 30); // 100 * 0.3

// Round Bonus
test('Classic R10 Stage 1', calculateScore(10, 1, null, 'classic'), 190); // (100 * 1.0) + 90
test('Classic R50 Stage 1', calculateScore(50, 1, null, 'classic'), 590); // (100 * 1.0) + 490

// Streak Bonus (Every 5 rounds)
test('Classic R5 Stage 1 (Streak Bonus)', calculateScore(5, 1, null, 'classic'), 150); // (100 + 40) + 10

// 2. Rapid Fire Logic
// Base 100 + Speed Bonus (50) + Time Bonus (2 * 10)
// R1, 10s left (Total 15s -> Used 5s, No Speed Bonus)
test('Rapid Fire R1 Slow (10s left)', calculateScore(1, 1, 10, 'rapidfire', 15), 120); // 100 + 20

// R1, 13s left (Used 2s -> Speed Bonus!)
// 100 + 26 (time) + 50 (speed) = 176
test('Rapid Fire R1 Fast (13s left)', calculateScore(1, 1, 13, 'rapidfire', 15), 176);

console.log("\n--- Verification Complete ---");
