# Mealy–Moore Machine Conversion Simulator

**Course:** CSET302 – Automata Theory and Computability  
**Institution:** Bennett University, Greater Noida  
**Department:** School of Computer Science Engineering and Technology (SCSET)  
**Academic Session:** 2026–2027  

---

## 1. Project Overview
The **Mealy–Moore Machine Conversion Simulator** is an interactive, browser-based academic software application designed to model, simulate, and convert Finite State Transducers with output. Built specifically for CSET302 at Bennett University, the application provides an educational environment for undergraduate computer science students to visualize state transition diagrams, trace input sequence executions, and mathematically verify bidirectional conversions between Mealy and Moore automata models.

---

## 2. Implemented Features
- **Bidirectional Mathematical Conversion:**
  - **Mealy $\to$ Moore:** Implements incoming transition output analysis, automated state splitting whenever a state receives conflicting outputs ($|InOutputs(q)| > 1$), start state initial output assignment, and reachability pruning via graph traversal.
  - **Moore $\to$ Mealy:** Implements transition output deduction based on the destination state's output ($\lambda_{Mealy}(q, a) = \lambda'_{Moore}(\delta'(q, a))$) while preserving exact state count.
- **Dynamic Transition Table Editors:**
  - Full configuration of states ($Q$), input alphabet ($\Sigma$), output alphabet ($\Delta$), and start state ($q_0$).
  - Dynamic cell inputs that adapt instantly when states or symbols are modified.
- **Vector SVG State Diagram Renderer:**
  - Crisp vector graphics rendered using SVG.
  - Distinct state representations: Moore machines render divided circles ($q \mid y$); Mealy machines render centered state labels with $a / y$ transition labels.
  - Direct vector polygon arrowheads ensuring 100% visibility across all views without SVG marker scoping bugs.
  - Circular layout positioning, curved reciprocal edges, and self-loop arcs.
  - Interactive drag-and-drop: users can freely drag nodes to customize the diagram layout.
- **Interactive String Simulation Engine:**
  - Supports arbitrary input strings of any length (not restricted to presets).
  - **Simulate (Auto-Play):** Plays through the string step by step with animated transition highlighting and glowing state pulses.
  - **Step (Manual Walkthrough):** Advances the machine one symbol at a time for detailed viva presentation.
  - Comprehensive trace table recording: `Step # | Current State | Read Symbol | Next State | Output | Accumulated Output`.
- **Dual Equivalence Verification:**
  - Real-time side-by-side string simulation testing both original and converted machines simultaneously to verify identical computation.
- **Preset Library & Custom General Mode:**
  - Includes `★ General / Custom Machine (Build Your Own)` for open-ended machine creation.
  - General letter alphabet preset ($\Sigma = \{a, b\}$, $\Delta = \{x, y\}$).
  - Academic benchmark presets: '101' sequence detector, state-splitting demonstration, 2's complement generator, 1's complement inverter, parity bit generator, '01' substring detector, and modulo-3 residue counter.

---

## 3. Technology Stack
- **Frontend / Core:** HTML5, CSS3, Vanilla JavaScript (ES6+ standard).
- **Graphics Engine:** Scalable Vector Graphics (SVG) with mathematical geometry calculations (tangents, curvature offsets, polygon arrowheads).
- **Testing Framework:** Node.js automated test runner.
- **External Dependencies:** **Zero.** The entire application runs natively in any standard web browser without npm packages, backend servers, or internet connectivity.

---

## 4. Folder Structure
```text
simulator/
├── index.html                   # Main application interface (dual-mode tabs)
├── README.md                    # Project documentation & execution guide
├── Test_Cases_and_Results.md    # Complete test matrix and verification logs
├── css/
│   └── style.css                # Academic blue, purple, and slate styling
├── js/
│   ├── automata-core.js         # Formal 6-tuple data models & simulation engines
│   ├── conversion.js            # Mealy <-> Moore conversion algorithms
│   ├── diagram.js               # Interactive SVG state diagram renderer
│   ├── samples.js               # Preset benchmark machines and general templates
│   ├── ui.js                    # UI controller, table generators, and simulation loop
│   └── app.js                   # Application bootstrap
├── screenshots/                 # Authentic application screenshots
│   ├── preset_dropdown.png      # Preset and custom mode selector
│   ├── moore_interface.jpg      # Moore studio layout
│   ├── diagram_simulation.png   # State diagram and simulation trace
│   └── convert_banner.png       # Conversion action banner
└── tests/
    ├── test-automata.js         # Automated mathematical verification test suite (55 tests)
    └── check-dom-ids.js         # DOM ID integrity test suite (47 elements)
```

---

## 5. Important Functions and Modules

### `js/automata-core.js`
- `MealyMachine`: Class encapsulating tuple $(Q, \Sigma, \Delta, \delta, \lambda, q_0)$.
  - `validate()`: Comprehensive verification of non-empty sets, uniqueness, completeness, and symbol membership.
  - `simulate(inputString)`: Executes input string, producing trace records and output of length $n$.
- `MooreMachine`: Class encapsulating tuple $(Q', \Sigma, \Delta, \delta', \lambda', q'_0)$.
  - `simulate(inputString)`: Emits initial state output at Step 0, producing full output of length $n+1$ and synchronized output of length $n$.

### `js/conversion.js`
- `AutomataConverter.mealyToMoore(mealy, initialOutput)`:
  - Collects incoming outputs per state: $InOutputs(q) = \{ \lambda(p, a) \mid \delta(p, a) = q \}$.
  - Splits state $q$ into $q_y$ for all distinct outputs $y \in InOutputs(q)$.
  - Constructs transition function: $\delta'((q, y), a) = (\delta(q, a), \lambda(q, a))$.
  - Performs BFS reachability from start state $(q_0, y_{init})$ and discards unreachable states.
- `AutomataConverter.mooreToMealy(moore)`:
  - Preserves state set $Q$ and initial state $q_0$.
  - Assigns destination state output to transitions: $\lambda_{Mealy}(q, a) = \lambda'_{Moore}(\delta'(q, a))$.

### `js/diagram.js`
- `StateDiagramRenderer`:
  - `autoLayout()`: Generates circular and symmetrical positions for states.
  - `drawArrowhead(parent, tipX, tipY, angle, color)`: Computes vector polygon vertices and draws sharp, reliable directional arrowheads.
  - `renderCurvedEdge()`, `renderSelfLoop()`: Computes quadratic and cubic Bezier curves with curvature offsets.
  - `setSimulationState(state, transition)`: Dynamically illuminates active state with glowing pulse ring and active transition with high-contrast amber stroke.

---

## 6. Installation & Execution Instructions

### Option 1: Direct Browser Launch (Easiest)
1. Navigate to the project directory: `D:\downloads\simulator`.
2. Double-click **`index.html`**.
3. The simulator opens instantly in Google Chrome, Microsoft Edge, or Mozilla Firefox.

### Option 2: Local HTTP Server (Terminal)
1. Open PowerShell or Command Prompt inside `D:\downloads\simulator`.
2. Start Python's built-in server:
   ```bash
   python -m http.server 8000
   ```
3. Open `http://localhost:8000` in your web browser.

---

## 7. Testing Instructions
To run the automated verification suite:
1. Ensure Node.js is installed.
2. Open terminal in the project directory.
3. Run:
   ```bash
   node tests/test-automata.js
   node tests/check-dom-ids.js
   ```
All 55 mathematical tests and 47 DOM integrity assertions execute and report pass/fail status directly in the console.

---

## 8. Known Limitations
- The visual canvas is optimized for machines up to 10 states; for extremely large synthetic automata ($> 20$ states), manual node dragging is recommended to prevent overlapping edges.
- Non-deterministic Finite Automata (NFA) with $\epsilon$-transitions are outside the current scope of this deterministic transducer simulator.

---

## 9. Team Details & Contributions

| Member Name | Enrollment Number | Core Module Responsibility |
|---|---|---|
| **Animesh Kumar** | S24CSEU2293 | Core Data Architecture & Mathematical Conversion Engine (`automata-core.js`, `conversion.js`) |
| **Tansiha** | S24CSEU2257 | Dynamic Transition Table Editors & Reactive DOM Binding (`ui.js`, `index.html`) |
| **Aditi** | S24CSEU2262 | Interactive SVG Diagram Renderer & Direct Vector Arrowheads (`diagram.js`, `style.css`) |
| **Shreya** | S24CSEU2253 | String Simulation Engine, Preset Library & Quality Assurance (`samples.js`, `tests/`) |

---

## 10. AI Tools Acknowledgement
In accordance with academic integrity guidelines, we transparently acknowledge the supportive use of artificial intelligence tools during project development:
- **ChatGPT & Claude:** Assisted in formulating test edge cases, debugging SVG curve parameterization, and reviewing technical documentation drafts.
- **Google Antigravity:** Assisted in workspace orchestration, iterative refactoring, and headless test validation.

All architectural decisions, mathematical conversion algorithms, automata model designs, and final report verifications remain the original academic work and responsibility of the student project group.
