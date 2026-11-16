/**
 * Conversion Module
 * CSET302: Automata Theory and Computability - Bennett University
 * Implements mathematically rigorous conversions between Mealy and Moore Machines
 * with step-by-step educational explanations and state splitting logs.
 */

// Support both Node.js CommonJS and Browser environments
let _MealyMachine = (typeof MealyMachine !== 'undefined') ? MealyMachine : null;
let _MooreMachine = (typeof MooreMachine !== 'undefined') ? MooreMachine : null;

if (typeof require !== 'undefined') {
    try {
        const core = require('./automata-core.js');
        if (!_MealyMachine) _MealyMachine = core.MealyMachine;
        if (!_MooreMachine) _MooreMachine = core.MooreMachine;
    } catch (e) {
        // Browser or alternative bundler
    }
}

class AutomataConverter {

    /**
     * Converts a Mealy Machine to an equivalent Moore Machine
     * 
     * Mathematical Foundation:
     * A Mealy machine M = (Q, Σ, Δ, δ, λ, q0)
     * has output associated with transitions: λ(q, a) ∈ Δ.
     * In a Moore machine M' = (Q', Σ, Δ, δ', λ', q'0),
     * output is associated with states: λ'(q') ∈ Δ.
     * 
     * Conversion Algorithm:
     * 1. Analyze incoming transitions for each Mealy state q ∈ Q:
     *    InOutputs(q) = { λ(p, a) | p ∈ Q, a ∈ Σ, δ(p, a) = q }.
     * 2. If a state q receives multiple distinct outputs, it cannot have a single Moore output.
     *    Hence, state q is split into |InOutputs(q)| distinct Moore states:
     *    q_y for each y ∈ InOutputs(q), where λ'(q_y) = y.
     * 3. For start state q0:
     *    The Moore machine emits an output before any input is consumed.
     *    We designate an initial state output y_init (defaulting to the first incoming output,
     *    or outputAlphabet[0]). State (q0, y_init) serves as start state q'0.
     * 4. Transitions in Moore machine:
     *    δ'((q, y), a) = (δ(q, a), λ(q, a)).
     *    The next Moore state is uniquely determined by the Mealy next state and the transition output.
     * 
     * @param {MealyMachine} mealy
     * @param {string} [initialOutputChoice]
     * @returns {{ mooreMachine: MooreMachine, derivation: Object }}
     */
    static mealyToMoore(mealy, initialOutputChoice = '') {
        const validation = mealy.validate();
        if (!validation.isValid) {
            throw new Error('Cannot convert invalid Mealy machine: ' + validation.errors.join('; '));
        }

        const derivation = {
            title: 'Mealy to Moore Machine Conversion',
            steps: [],
            incomingOutputs: {},
            splitStates: {},
            allPotentialStates: [],
            reachableStates: [],
            unreachableStates: [],
            outputLengthNote: ''
        };

        // Step 1: Analyze incoming transition outputs for every state
        const incomingOutputs = {};
        for (const s of mealy.states) {
            incomingOutputs[s] = new Set();
        }

        for (const p of mealy.states) {
            for (const a of mealy.alphabet) {
                const trans = mealy.getTransition(p, a);
                if (trans && trans.nextState && trans.output !== undefined) {
                    incomingOutputs[trans.nextState].add(trans.output);
                }
            }
        }

        // Convert sets to sorted arrays for deterministic display
        const incomingSummary = {};
        for (const s of mealy.states) {
            incomingSummary[s] = Array.from(incomingOutputs[s]).sort();
        }
        derivation.incomingOutputs = incomingSummary;

        derivation.steps.push({
            stepNumber: 1,
            stepTitle: 'Step 1: Analyze Incoming Transition Outputs per State',
            description: 'For each state q ∈ Q, examine all incoming transitions δ(p, a) = q and collect their transition outputs λ(p, a).',
            data: incomingSummary
        });

        // Determine initial state output
        let initialOutput = initialOutputChoice;
        if (!initialOutput || !mealy.outputAlphabet.includes(initialOutput)) {
            // Default: if q0 has incoming outputs, pick the first one; else pick the first output symbol in Δ
            if (incomingSummary[mealy.initialState] && incomingSummary[mealy.initialState].length > 0) {
                initialOutput = incomingSummary[mealy.initialState][0];
            } else {
                initialOutput = mealy.outputAlphabet[0];
            }
        }

        // Ensure start state has initialOutput in its incoming set for state generation
        const stateOutputSets = {};
        for (const s of mealy.states) {
            stateOutputSets[s] = new Set(incomingSummary[s]);
        }
        stateOutputSets[mealy.initialState].add(initialOutput);

        // Step 2: State Splitting Analysis
        const splitStatesLog = {};
        const allNewStates = [];

        for (const s of mealy.states) {
            const outputs = Array.from(stateOutputSets[s]).sort();
            splitStatesLog[s] = {
                originalState: s,
                incomingCount: outputs.length,
                outputs: outputs,
                needsSplitting: outputs.length > 1,
                resultingMooreStates: outputs.map(y => ({
                    name: `${s}_${y}`,
                    baseState: s,
                    output: y
                }))
            };

            for (const item of splitStatesLog[s].resultingMooreStates) {
                allNewStates.push(item);
            }
        }
        derivation.splitStates = splitStatesLog;

        derivation.steps.push({
            stepNumber: 2,
            stepTitle: 'Step 2: Identify State Splitting Requirements',
            description: 'If a Mealy state q receives multiple distinct outputs (e.g., both 0 and 1), it cannot be represented by a single Moore state because Moore state outputs are static. State q must split into q_y for each distinct output y.',
            data: splitStatesLog
        });

        // Step 3: Transition construction & Reachability analysis via BFS from (q0, initialOutput)
        const initialMooreStateName = `${mealy.initialState}_${initialOutput}`;
        const queue = [initialMooreStateName];
        const visited = new Set([initialMooreStateName]);
        const stateOutputMap = {};
        const transitionsMap = {};

        // Helper to parse base state and output from state name "q_y"
        const parseState = (name) => {
            const idx = name.lastIndexOf('_');
            if (idx === -1) return { base: name, out: initialOutput };
            return {
                base: name.substring(0, idx),
                out: name.substring(idx + 1)
            };
        };

        // Construct reachable Moore states
        while (queue.length > 0) {
            const curName = queue.shift();
            const { base, out } = parseState(curName);
            stateOutputMap[curName] = out;
            transitionsMap[curName] = {};

            for (const a of mealy.alphabet) {
                const trans = mealy.getTransition(base, a);
                if (trans && trans.nextState && trans.output !== undefined) {
                    const targetName = `${trans.nextState}_${trans.output}`;
                    transitionsMap[curName][a] = targetName;

                    if (!visited.has(targetName)) {
                        visited.add(targetName);
                        queue.push(targetName);
                    }
                }
            }
        }

        const reachableStateList = Array.from(visited);
        derivation.reachableStates = reachableStateList;

        const allStateNames = allNewStates.map(ns => ns.name);
        derivation.unreachableStates = allStateNames.filter(name => !visited.has(name));

        derivation.steps.push({
            stepNumber: 3,
            stepTitle: 'Step 3: Construct Moore Transitions & Filter Reachable States',
            description: `Starting from initial Moore state "${initialMooreStateName}" with output "${initialOutput}", compute transitions using δ'((q, y), a) = (δ(q, a), λ(q, a)). Discard any unreachable split states to obtain a minimal equivalent Moore machine.`,
            initialMooreState: initialMooreStateName,
            initialOutput,
            reachableCount: reachableStateList.length,
            unreachableCount: derivation.unreachableStates.length
        });

        // Step 4: Mathematical Output Sequence Difference Explanation
        derivation.outputLengthNote = 
            `Output Sequence Length Alignment:\n` +
            `• For any input string w = a1 a2 ... an of length n:\n` +
            `  - The Mealy Machine outputs n symbols: y1 y2 ... yn.\n` +
            `  - The converted Moore Machine outputs (n + 1) symbols: y0 y1 y2 ... yn, ` +
            `where y0 = λ'("${initialMooreStateName}") = "${initialOutput}" is emitted before reading any input.\n` +
            `• Equivalence Property: Omitting the initial output symbol y0 yields exactly the Mealy output sequence: Moore(w)[1..n] = Mealy(w).`;

        derivation.steps.push({
            stepNumber: 4,
            stepTitle: 'Step 4: Output Sequence Equivalence and Alignment',
            description: derivation.outputLengthNote
        });

        // Build the MooreMachine instance
        const MooreClass = _MooreMachine || (typeof MooreMachine !== 'undefined' ? MooreMachine : window.MooreMachine);
        const mooreMachine = new MooreClass({
            states: reachableStateList,
            alphabet: [...mealy.alphabet],
            outputAlphabet: [...mealy.outputAlphabet],
            initialState: initialMooreStateName,
            stateOutputs: stateOutputMap,
            transitions: transitionsMap
        });

        return {
            mooreMachine,
            derivation,
            initialOutput
        };
    }

    /**
     * Converts a Moore Machine to an equivalent Mealy Machine
     * 
     * Mathematical Foundation:
     * A Moore machine M = (Q, Σ, Δ, δ, λ_Moore, q0)
     * has state outputs: λ_Moore(q) ∈ Δ.
     * In equivalent Mealy machine M' = (Q, Σ, Δ, δ, λ_Mealy, q0):
     * The states Q and initial state q0 remain unchanged!
     * The transition function δ remains unchanged!
     * The output function is defined by the destination state's output:
     * λ_Mealy(q, a) = λ_Moore(δ(q, a)).
     * 
     * @param {MooreMachine} moore
     * @returns {{ mealyMachine: MealyMachine, derivation: Object }}
     */
    static mooreToMealy(moore) {
        const validation = moore.validate();
        if (!validation.isValid) {
            throw new Error('Cannot convert invalid Moore machine: ' + validation.errors.join('; '));
        }

        const derivation = {
            title: 'Moore to Mealy Machine Conversion',
            steps: [],
            transitionMap: [],
            outputLengthNote: ''
        };

        derivation.steps.push({
            stepNumber: 1,
            stepTitle: 'Step 1: Retain State Set Q and Initial State q0',
            description: `The state set remains identical: Q_Mealy = Q_Moore = {${moore.states.join(', ')}}. The start state remains q0 = "${moore.initialState}".`
        });

        derivation.steps.push({
            stepNumber: 2,
            stepTitle: 'Step 2: Assign Destination State Output to Each Transition',
            description: 'In a Moore machine, output depends strictly on the current state. Therefore, when transitioning from state q to next state q\' = δ(q, a), the Mealy transition output is defined as λ_Mealy(q, a) = λ_Moore(q\').',
            formula: 'λ_Mealy(q, a) = λ_Moore(δ(q, a))'
        });

        const mealyTransitions = {};
        const mappingTable = [];

        for (const q of moore.states) {
            mealyTransitions[q] = {};
            for (const a of moore.alphabet) {
                const nextState = moore.getTransition(q, a);
                const output = moore.getStateOutput(nextState);

                mealyTransitions[q][a] = {
                    nextState,
                    output
                };

                mappingTable.push({
                    fromState: q,
                    inputSymbol: a,
                    nextState: nextState,
                    destStateOutput: output,
                    transitionLabel: `${a} / ${output}`
                });
            }
        }

        derivation.transitionMap = mappingTable;

        derivation.steps.push({
            stepNumber: 3,
            stepTitle: 'Step 3: Construct Transition Output Mappings',
            description: `Constructed ${mappingTable.length} Mealy transitions. Each transition receives the output value of its target state.`,
            sampleMappings: mappingTable.slice(0, 10)
        });

        derivation.outputLengthNote =
            `Output Sequence Length Alignment:\n` +
            `• For any input string w of length n:\n` +
            `  - The original Moore machine produced (n + 1) outputs, including λ("${moore.initialState}") = "${moore.getStateOutput(moore.initialState)}" at time 0.\n` +
            `  - The converted Mealy machine produces n outputs upon reading each input symbol.\n` +
            `• Equivalence: Mealy(w) matches Moore(w)[1..n] for all strings w ∈ Σ*.`;

        derivation.steps.push({
            stepNumber: 4,
            stepTitle: 'Step 4: Output Sequence Equivalence and Alignment',
            description: derivation.outputLengthNote
        });

        const MealyClass = _MealyMachine || (typeof MealyMachine !== 'undefined' ? MealyMachine : window.MealyMachine);
        const mealyMachine = new MealyClass({
            states: [...moore.states],
            alphabet: [...moore.alphabet],
            outputAlphabet: [...moore.outputAlphabet],
            initialState: moore.initialState,
            transitions: mealyTransitions
        });

        return {
            mealyMachine,
            derivation
        };
    }
}

if (typeof window !== 'undefined') {
    window.AutomataConverter = AutomataConverter;
}
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AutomataConverter };
}
