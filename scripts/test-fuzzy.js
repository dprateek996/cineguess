
import { validateGuess } from '../src/services/validationService.js';

const cases = [
    { guess: 'lagaan', actual: 'Lagaan: Once Upon a Time in India', expected: 'CORRECT' },
    { guess: 'Lagaan', actual: 'Lagaan: Once Upon a Time in India', expected: 'CORRECT' },
    { guess: 'Mission Impossible', actual: 'Mission: Impossible - Fallout', expected: 'CORRECT' },
    { guess: 'inception', actual: 'Inception', expected: 'CORRECT' },
    { guess: 'incep', actual: 'Inception', expected: 'CORRECT' }, // Prefix > 4 chars, is it? "incep" is 5 chars. Wait, "incep" is not a word break.
    { guess: 'The Matrix', actual: 'Matrix', expected: 'CORRECT' },
    { guess: 'Matrix', actual: 'The Matrix', expected: 'CORRECT' },
    { guess: 'harry potter', actual: 'Harry Potter and the Sorcerer\'s Stone', expected: 'CORRECT' },
    { guess: 'bat', actual: 'Batman', expected: 'WRONG' }, // Too short for prefix
];

console.log('🧪 Testing Fuzzy Search Logic...\n');

let passed = 0;

cases.forEach(({ guess, actual, expected }) => {
    const result = validateGuess(guess, actual);
    const success = result === expected;
    if (success) passed++;

    console.log(
        success ? '✅ PASS' : '❌ FAIL',
        `| Guess: "${guess}" | Actual: "${actual}" | Got: ${result} | Expected: ${expected}`
    );
});

console.log(`\nResults: ${passed}/${cases.length} passed.`);
