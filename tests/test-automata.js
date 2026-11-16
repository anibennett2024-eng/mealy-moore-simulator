/**
 * Automated Verification Test Suite
 * Tests Mealy and Moore machine implementations, validation, conversion,
 * state splitting, and string equivalence for CSET302.
 */

const { MealyMachine, MooreMachine } = require('../js/automata-core.js');
const { AutomataConverter } = require('../js/conversion.js');
const { AUTOMATA_SAMPLES } = require('../js/samples.js');

let totalTests = 0;
let passedTests = 0;

function assert(condition, message) {
    totalTests++;
    if (!condition) {
        console.error(`❌ FAIL: ${message}`);
        throw new Error(`Assertion failed: ${message}`);
    } else {
        passedTests++;
        console.log(`✅ PASS: ${message}`);
    }
}

console.log('=== STARTING AUTOMATA TEST SUITE ===\n');

// 1. Test Mealy Machine Simulation
console.log('--- 1. Testing Mealy Machine Simulation ---');
const seq101MealySample = AUTOMATA_SAMPLES.mealy.find(s => s.id === 'mealy_seq_101');
const mealySeq101 = new MealyMachine(seq101MealySample.machine);

const valMealy = mealySeq101.validate();
assert(valMealy.isValid, 'Mealy seq 101 passes validation');

// Test string 101 -> expect 001
let res1 = mealySeq101.simulate('101');
assert(res1.success, 'Simulation of "101" succeeds');
assert(res1.finalOutput === '001', `Expected "001", got "${res1.finalOutput}"`);

// Test overlapping 10101 -> expect 00101
let res2 = mealySeq101.simulate('10101');
assert(res2.finalOutput === '00101', `Expected "00101", got "${res2.finalOutput}"`);

// Test empty string
let resEmpty = mealySeq101.simulate('');
assert(resEmpty.success, 'Empty string simulation succeeds');

// Test invalid symbol
let resInvalid = mealySeq101.simulate('102');
assert(!resInvalid.success, 'Invalid symbol 2 rejected correctly');

// 2. Test Moore Machine Simulation
console.log('\n--- 2. Testing Moore Machine Simulation ---');
const seq01MooreSample = AUTOMATA_SAMPLES.moore.find(s => s.id === 'moore_seq_01');
const mooreSeq01 = new MooreMachine(seq01MooreSample.machine);

const valMoore = mooreSeq01.validate();
assert(valMoore.isValid, 'Moore seq 01 passes validation');

// Test "01" -> path: q0 (out 0) -> '0' -> q1 (out 0) -> '1' -> q2 (out 1)
// Full output: "001" (length 3 = 2 + 1)
// Synchronized output: "01"
let resMoore = mooreSeq01.simulate('01');
assert(resMoore.success, 'Moore simulation of "01" succeeds');
assert(resMoore.finalOutput === '001', `Moore full output expected "001", got "${resMoore.finalOutput}"`);
assert(resMoore.synchronizedOutput === '01', `Moore synchronized output expected "01", got "${resMoore.synchronizedOutput}"`);

// 3. Test Mealy to Moore Conversion (State Splitting Demo)
console.log('\n--- 3. Testing Mealy to Moore Conversion & State Splitting ---');
const splitSample = AUTOMATA_SAMPLES.mealy.find(s => s.id === 'mealy_state_splitting');
const mealySplit = new MealyMachine(splitSample.machine);

const convResult = AutomataConverter.mealyToMoore(mealySplit, '0');
const convertedMoore = convResult.mooreMachine;
const derivation = convResult.derivation;

assert(convertedMoore.validate().isValid, 'Converted Moore machine is valid');
assert(derivation.splitStates['q1'].needsSplitting, 'State q1 correctly identified as needing splitting');
console.log('Reachable converted Moore states:', convertedMoore.states);

// Equivalence check across multiple test strings
const testStringsSplit = ['0101', '1010', '0011', '11001', '0', '1', '0000', '1111', '01010101'];
for (const str of testStringsSplit) {
    const mealyOut = mealySplit.simulate(str).finalOutput;
    const mooreOut = convertedMoore.simulate(str).synchronizedOutput;
    assert(mealyOut === mooreOut, `String "${str}": Mealy("${mealyOut}") == Converted Moore synch("${mooreOut}")`);
}

// 4. Test Mealy to Moore Conversion on 101 Detector
console.log('\n--- 4. Testing Mealy to Moore Conversion on 101 Detector ---');
const conv101 = AutomataConverter.mealyToMoore(mealySeq101, '0');
const moore101 = conv101.mooreMachine;

const testStrings101 = ['101', '10101', '1101011', '0010100', '111000', '010', '100', '000'];
for (const str of testStrings101) {
    const mealyOut = mealySeq101.simulate(str).finalOutput;
    const mooreOut = moore101.simulate(str).synchronizedOutput;
    assert(mealyOut === mooreOut, `101 Detector string "${str}": Mealy("${mealyOut}") == Converted Moore("${mooreOut}")`);
}

// 5. Test Moore to Mealy Conversion
console.log('\n--- 5. Testing Moore to Mealy Conversion ---');
const convFromMoore = AutomataConverter.mooreToMealy(mooreSeq01);
const convertedMealy = convFromMoore.mealyMachine;

assert(convertedMealy.validate().isValid, 'Converted Mealy machine is valid');
assert(convertedMealy.states.length === mooreSeq01.states.length, 'State count unchanged in Moore to Mealy');

const testStringsMoore = ['01', '001', '101', '0101', '1100', '000', '111', '010101'];
for (const str of testStringsMoore) {
    const origMooreSynch = mooreSeq01.simulate(str).synchronizedOutput;
    const convMealyOut = convertedMealy.simulate(str).finalOutput;
    assert(origMooreSynch === convMealyOut, `String "${str}": Moore synch("${origMooreSynch}") == Converted Mealy("${convMealyOut}")`);
}

// 6. Test Moore to Mealy Conversion on Parity Detector
console.log('\n--- 6. Testing Moore to Mealy on Parity Detector ---');
const parityMooreSample = AUTOMATA_SAMPLES.moore.find(s => s.id === 'moore_parity');
const mooreParity = new MooreMachine(parityMooreSample.machine);
const convParityMealy = AutomataConverter.mooreToMealy(mooreParity).mealyMachine;

const testStringsParity = ['0', '1', '00', '11', '101', '111', '10101', '1111'];
for (const str of testStringsParity) {
    const origSynch = mooreParity.simulate(str).synchronizedOutput;
    const convMealy = convParityMealy.simulate(str).finalOutput;
    assert(origSynch === convMealy, `Parity string "${str}": Moore synch("${origSynch}") == Mealy("${convMealy}")`);
}

// 7. Test Round-trip conversion: Mealy -> Moore -> Mealy
console.log('\n--- 7. Testing Round-Trip Equivalence: Mealy -> Moore -> Mealy ---');
const roundTripMealy = AutomataConverter.mooreToMealy(moore101).mealyMachine;
for (const str of testStrings101) {
    const origOut = mealySeq101.simulate(str).finalOutput;
    const roundTripOut = roundTripMealy.simulate(str).finalOutput;
    assert(origOut === roundTripOut, `Round-trip string "${str}": Orig Mealy("${origOut}") == Converted Mealy("${roundTripOut}")`);
}

console.log(`\n========================================`);
console.log(`ALL ${passedTests} OF ${totalTests} TESTS PASSED WITH 100% SUCCESS!`);
console.log(`========================================\n`);
