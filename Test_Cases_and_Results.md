# Test Cases and Verification Results
## CSET302: Automata Theory and Computability
### Bennett University — School of Computer Science Engineering and Technology
**Project Title:** Mealy–Moore Machine Conversion Simulator  
**Team Members:**  
- Animesh Kumar (S24CSEU2293)  
- Tansiha (S24CSEU2257)  
- Aditi (S24CSEU2262)  
- Shreya (S24CSEU2253)  

---

## 1. Overview of Testing Methodology
Testing was conducted at three complementary levels to guarantee mathematical correctness and user experience:
1. **Mathematical Unit & Integration Tests (`tests/test-automata.js`):** 55 automated headless test assertions verifying machine transitions, state splitting correctness, output generation, and round-trip equivalence.
2. **DOM Controller Integrity Tests (`tests/check-dom-ids.js`):** Static and dynamic DOM reference analysis verifying all 44 elements and interactive controls.
3. **Interactive End-to-End Simulation Tests:** Real-time browser tests executing arbitrary input sequences across both Mealy and Moore engines.

---

## 2. Comprehensive Test Execution Matrix

| Test ID | Test Category | Target Machine / Module | Input Data | Expected Output | Actual Output | Status |
|---|---|---|---|---|---|---|
| **TC-01** | Validation | Mealy Definition | Empty state set $Q = \emptyset$ | Reject with validation error | Error: "Machine must have at least one state in Q" | **PASS** |
| **TC-02** | Validation | Mealy Definition | Duplicate states $Q = \{q0, q0, q1\}$ | Reject duplicate states | Error: "State set Q contains duplicate state names" | **PASS** |
| **TC-03** | Validation | Mealy Definition | Missing initial state $q_0 = \text{""}$ | Reject empty start state | Error: "Initial state q0 is not specified" | **PASS** |
| **TC-04** | Validation | Moore Definition | State output not in $\Delta$ | Reject invalid output symbol | Error: "State output for q0 is not in $\Delta$" | **PASS** |
| **TC-05** | Validation | Input String Validation | Mealy alphabet $\Sigma = \{0, 1\}$, String = `"102"` | Reject symbol '2' | Error: "Symbol '2' at index 2 is not in input alphabet $\Sigma$" | **PASS** |
| **TC-06** | Simulation | Mealy '101' Detector | Empty string $\epsilon$ | Output $\epsilon$, No state change | Output: $\epsilon$, Step: 0 | **PASS** |
| **TC-07** | Simulation | Mealy '101' Detector | String `"101"` | Output `"001"` (length 3) | Output: `"001"` | **PASS** |
| **TC-08** | Simulation | Mealy '101' Detector | String `"10101"` (overlapping) | Output `"00101"` (length 5) | Output: `"00101"` | **PASS** |
| **TC-09** | Simulation | Mealy '101' Detector | String `"1101011"` | Output `"0001010"` | Output: `"0001010"` | **PASS** |
| **TC-10** | Simulation | Mealy '101' Detector | String `"000"` (no match) | Output `"000"` | Output: `"000"` | **PASS** |
| **TC-11** | Simulation | Moore '01' Detector | String `"01"` | Full: `"001"` (len 3), Synch: `"01"` | Full: `"001"`, Synch: `"01"` | **PASS** |
| **TC-12** | Simulation | Moore '01' Detector | String `"0101"` | Full: `"00101"`, Synch: `"0101"` | Full: `"00101"`, Synch: `"0101"` | **PASS** |
| **TC-13** | Simulation | Moore Parity Checker | String `"1"` | Full: `"10"`, Synch: `"0"` | Full: `"10"`, Synch: `"0"` | **PASS** |
| **TC-14** | Simulation | Moore Parity Checker | String `"11"` | Full: `"101"`, Synch: `"01"` | Full: `"101"`, Synch: `"01"` | **PASS** |
| **TC-15** | Conversion | Mealy $\to$ Moore (Splitting) | State-Splitting Demo ($q_1$ receives 0 & 1) | $q_1$ splits into $q_{1\_0}$ & $q_{1\_1}$ | Confirmed split into $q_{1\_0}$ & $q_{1\_1}$ | **PASS** |
| **TC-16** | Equivalence | Mealy $\to$ Moore (Splitting) | String `"0101"` | Mealy: `"0000"` == Moore synch: `"0000"` | Mealy: `"0000"`, Moore synch: `"0000"` | **PASS** |
| **TC-17** | Equivalence | Mealy $\to$ Moore (Splitting) | String `"1010"` | Mealy: `"0101"` == Moore synch: `"0101"` | Mealy: `"0101"`, Moore synch: `"0101"` | **PASS** |
| **TC-18** | Equivalence | Mealy $\to$ Moore (Splitting) | String `"0011"` | Mealy: `"0011"` == Moore synch: `"0011"` | Mealy: `"0011"`, Moore synch: `"0011"` | **PASS** |
| **TC-19** | Equivalence | Mealy $\to$ Moore (Splitting) | String `"11001"` | Mealy: `"01100"` == Moore synch: `"01100"` | Mealy: `"01100"`, Moore synch: `"01100"` | **PASS** |
| **TC-20** | Equivalence | Mealy $\to$ Moore (101 Detector) | String `"101"` | Mealy: `"001"` == Moore synch: `"001"` | Mealy: `"001"`, Moore synch: `"001"` | **PASS** |
| **TC-21** | Equivalence | Mealy $\to$ Moore (101 Detector) | String `"10101"` | Mealy: `"00101"` == Moore synch: `"00101"` | Mealy: `"00101"`, Moore synch: `"00101"` | **PASS** |
| **TC-22** | Conversion | Moore $\to$ Mealy | Moore '01' Detector | $|Q_{Mealy}| = |Q_{Moore}| = 3$ | States preserved: $\{q0, q1, q2\}$ | **PASS** |
| **TC-23** | Conversion | Moore $\to$ Mealy | Transition $\delta(q1, 1) = q2$ with $\lambda'(q2)=1$ | Mealy transition output = 1 | $\lambda_{Mealy}(q1, 1) = 1$ | **PASS** |
| **TC-24** | Equivalence | Moore $\to$ Mealy | String `"01"` | Moore synch: `"01"` == Mealy: `"01"` | Moore synch: `"01"`, Mealy: `"01"` | **PASS** |
| **TC-25** | Equivalence | Moore $\to$ Mealy | String `"001"` | Moore synch: `"001"` == Mealy: `"001"` | Moore synch: `"001"`, Mealy: `"001"` | **PASS** |
| **TC-26** | Equivalence | Moore $\to$ Mealy (Parity) | String `"10101"` | Moore synch: `"00110"` == Mealy: `"00110"` | Moore synch: `"00110"`, Mealy: `"00110"` | **PASS** |
| **TC-27** | Round-Trip | Mealy $\to$ Moore $\to$ Mealy | String `"101"` | Original Mealy == Converted Mealy | Output: `"001"` | **PASS** |
| **TC-28** | Round-Trip | Mealy $\to$ Moore $\to$ Mealy | String `"10101"` | Original Mealy == Converted Mealy | Output: `"00101"` | **PASS** |
| **TC-29** | Round-Trip | Mealy $\to$ Moore $\to$ Mealy | String `"1101011"` | Original Mealy == Converted Mealy | Output: `"0001010"` | **PASS** |
| **TC-30** | Alphabet | General Custom Alphabet | $\Sigma = \{a, b\}$, $\Delta = \{x, y\}$, String `"aba"` | Correct transition and output mapping | Output generated in $\{x, y\}$ | **PASS** |

---

## 3. Automated Test Suite Execution Summary
Execution of automated test suite `tests/test-automata.js` under Node.js v24.19.0:
```text
=== STARTING AUTOMATA TEST SUITE ===
--- 1. Testing Mealy Machine Simulation ---
✅ PASS: Mealy seq 101 passes validation
✅ PASS: Simulation of "101" succeeds
✅ PASS: Expected "001", got "001"
✅ PASS: Expected "00101", got "00101"
✅ PASS: Empty string simulation succeeds
✅ PASS: Invalid symbol 2 rejected correctly

--- 2. Testing Moore Machine Simulation ---
✅ PASS: Moore seq 01 passes validation
✅ PASS: Moore simulation of "01" succeeds
✅ PASS: Moore full output expected "001", got "001"
✅ PASS: Moore synchronized output expected "01", got "01"

--- 3. Testing Mealy to Moore Conversion & State Splitting ---
✅ PASS: Converted Moore machine is valid
✅ PASS: State q1 correctly identified as needing splitting
Reachable converted Moore states: [ 'q1_0', 'q3_0', 'q2_0', 'q1_1', 'q2_1' ]
✅ PASS: String "0101": Mealy("0000") == Converted Moore synch("0000")
✅ PASS: String "1010": Mealy("0101") == Converted Moore synch("0101")
✅ PASS: String "0011": Mealy("0011") == Converted Moore synch("0011")
✅ PASS: String "11001": Mealy("01100") == Converted Moore synch("01100")
✅ PASS: String "0": Mealy("0") == Converted Moore synch("0")
✅ PASS: String "1": Mealy("0") == Converted Moore synch("0")
✅ PASS: String "0000": Mealy("0010") == Converted Moore synch("0010")
✅ PASS: String "1111": Mealy("0111") == Converted Moore synch("0111")
✅ PASS: String "01010101": Mealy("00000000") == Converted Moore synch("00000000")

--- 4. Testing Mealy to Moore Conversion on 101 Detector ---
✅ PASS: 101 Detector string "101": Mealy("001") == Converted Moore("001")
✅ PASS: 101 Detector string "10101": Mealy("00101") == Converted Moore("00101")
✅ PASS: 101 Detector string "1101011": Mealy("0001010") == Converted Moore("0001010")
✅ PASS: 101 Detector string "0010100": Mealy("0000100") == Converted Moore("0000100")
✅ PASS: 101 Detector string "111000": Mealy("000000") == Converted Moore("000000")
✅ PASS: 101 Detector string "010": Mealy("000") == Converted Moore("000")
✅ PASS: 101 Detector string "100": Mealy("000") == Converted Moore("000")
✅ PASS: 101 Detector string "000": Mealy("000") == Converted Moore("000")

--- 5. Testing Moore to Mealy Conversion ---
✅ PASS: Converted Mealy machine is valid
✅ PASS: State count unchanged in Moore to Mealy
✅ PASS: String "01": Moore synch("01") == Converted Mealy("01")
✅ PASS: String "001": Moore synch("001") == Converted Mealy("001")
✅ PASS: String "101": Moore synch("001") == Converted Mealy("001")
✅ PASS: String "0101": Moore synch("0101") == Converted Mealy("0101")
✅ PASS: String "1100": Moore synch("0000") == Converted Mealy("0000")
✅ PASS: String "000": Moore synch("000") == Converted Mealy("000")
✅ PASS: String "111": Moore synch("000") == Converted Mealy("000")
✅ PASS: String "010101": Moore synch("010101") == Converted Mealy("010101")

--- 6. Testing Moore to Mealy on Parity Detector ---
✅ PASS: Parity string "0": Moore synch("1") == Mealy("1")
✅ PASS: Parity string "1": Moore synch("0") == Mealy("0")
✅ PASS: Parity string "00": Moore synch("11") == Mealy("11")
✅ PASS: Parity string "11": Moore synch("01") == Mealy("01")
✅ PASS: Parity string "101": Moore synch("001") == Mealy("001")
✅ PASS: Parity string "111": Moore synch("010") == Mealy("010")
✅ PASS: Parity string "10101": Moore synch("00110") == Mealy("00110")
✅ PASS: Parity string "1111": Moore synch("0101") == Mealy("0101")

--- 7. Testing Round-Trip Equivalence: Mealy -> Moore -> Mealy ---
✅ PASS: Round-trip string "101": Orig Mealy("001") == Converted Mealy("001")
✅ PASS: Round-trip string "10101": Orig Mealy("00101") == Converted Mealy("00101")
✅ PASS: Round-trip string "1101011": Orig Mealy("0001010") == Converted Mealy("0001010")
✅ PASS: Round-trip string "0010100": Orig Mealy("0000100") == Converted Mealy("0000100")
✅ PASS: Round-trip string "111000": Orig Mealy("000000") == Converted Mealy("000000")
✅ PASS: Round-trip string "010": Orig Mealy("000") == Converted Mealy("000")
✅ PASS: Round-trip string "100": Orig Mealy("000") == Converted Mealy("000")
✅ PASS: Round-trip string "000": Orig Mealy("000") == Converted Mealy("000")

========================================
ALL 55 OF 55 TESTS PASSED WITH 100% SUCCESS!
========================================
```

---

## 4. Verification Conclusion
The testing matrix demonstrates complete coverage across state splitting, reachability analysis, destination state output assignment, and output sequence synchronization. The simulator conforms 100% to formal automata theory specifications.
