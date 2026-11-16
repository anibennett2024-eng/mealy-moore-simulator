/**
 * Automata Core Module
 * CSET302: Automata Theory and Computability - Bennett University
 * Defines formal data models and execution semantics for Mealy and Moore Machines.
 */

class MealyMachine {
    /**
     * @param {Object} config
     * @param {string[]} config.states
     * @param {string[]} config.alphabet
     * @param {string[]} config.outputAlphabet
     * @param {string} config.initialState
     * @param {Object} [config.transitions] - Format: { [state]: { [symbol]: { nextState: string, output: string } } }
     */
    constructor({ states = [], alphabet = [], outputAlphabet = [], initialState = '', transitions = {} } = {}) {
        this.states = Array.isArray(states) ? [...states] : [];
        this.alphabet = Array.isArray(alphabet) ? [...alphabet] : [];
        this.outputAlphabet = Array.isArray(outputAlphabet) ? [...outputAlphabet] : [];
        this.initialState = initialState || (this.states[0] || '');
        this.transitions = {};

        // Initialize transition table structure
        for (const s of this.states) {
            this.transitions[s] = {};
            for (const a of this.alphabet) {
                if (transitions[s] && transitions[s][a]) {
                    this.transitions[s][a] = {
                        nextState: transitions[s][a].nextState,
                        output: transitions[s][a].output
                    };
                } else {
                    this.transitions[s][a] = { nextState: '', output: '' };
                }
            }
        }
    }

    setTransition(state, symbol, nextState, output) {
        if (!this.transitions[state]) this.transitions[state] = {};
        this.transitions[state][symbol] = { nextState, output };
    }

    getTransition(state, symbol) {
        if (this.transitions[state] && this.transitions[state][symbol]) {
            return this.transitions[state][symbol];
        }
        return null;
    }

    /**
     * Comprehensive validation of the Mealy machine
     * @returns {{ isValid: boolean, errors: string[], warnings: string[] }}
     */
    validate() {
        const errors = [];
        const warnings = [];

        if (!this.states || this.states.length === 0) {
            errors.push('Machine must have at least one state in Q.');
        }

        // Duplicate states check
        const uniqueStates = new Set(this.states);
        if (uniqueStates.size !== this.states.length) {
            errors.push('State set Q contains duplicate state names.');
        }

        if (!this.alphabet || this.alphabet.length === 0) {
            errors.push('Input alphabet Σ must contain at least one symbol.');
        }

        const uniqueAlphabet = new Set(this.alphabet);
        if (uniqueAlphabet.size !== this.alphabet.length) {
            errors.push('Input alphabet Σ contains duplicate symbols.');
        }

        if (!this.outputAlphabet || this.outputAlphabet.length === 0) {
            errors.push('Output alphabet Δ must contain at least one symbol.');
        }

        if (!this.initialState) {
            errors.push('Initial state q0 is not specified.');
        } else if (!this.states.includes(this.initialState)) {
            errors.push(`Initial state "${this.initialState}" does not exist in state set Q.`);
        }

        // Check transition completeness and validity
        for (const state of this.states) {
            for (const sym of this.alphabet) {
                const trans = this.getTransition(state, sym);
                if (!trans || !trans.nextState) {
                    errors.push(`Missing transition: δ(${state}, "${sym}") is undefined.`);
                } else if (!this.states.includes(trans.nextState)) {
                    errors.push(`Invalid target state in transition δ(${state}, "${sym}") → "${trans.nextState}".`);
                }

                if (!trans || trans.output === undefined || trans.output === '') {
                    errors.push(`Missing output: λ(${state}, "${sym}") is undefined.`);
                } else if (!this.outputAlphabet.includes(trans.output)) {
                    errors.push(`Invalid output symbol in λ(${state}, "${sym}") = "${trans.output}" (not in Δ).`);
                }
            }
        }

        // Reachability analysis (warning only)
        if (errors.length === 0 && this.initialState) {
            const visited = new Set([this.initialState]);
            const queue = [this.initialState];
            while (queue.length > 0) {
                const cur = queue.shift();
                for (const sym of this.alphabet) {
                    const trans = this.getTransition(cur, sym);
                    if (trans && trans.nextState && !visited.has(trans.nextState)) {
                        visited.add(trans.nextState);
                        queue.push(trans.nextState);
                    }
                }
            }
            const unreachable = this.states.filter(s => !visited.has(s));
            if (unreachable.length > 0) {
                warnings.push(`Unreachable state(s) detected: ${unreachable.join(', ')}.`);
            }
        }

        return {
            isValid: errors.length === 0,
            errors,
            warnings
        };
    }

    /**
     * Executes input string simulation through Mealy machine
     * Output length = length of input string (n)
     * @param {string} inputString
     */
    simulate(inputString = '') {
        const validation = this.validate();
        if (!validation.isValid) {
            return {
                success: false,
                error: 'Cannot simulate invalid machine: ' + validation.errors.join('; '),
                trace: [],
                finalOutput: ''
            };
        }

        // Validate input symbols
        const cleanInput = inputString.trim();
        for (let i = 0; i < cleanInput.length; i++) {
            const char = cleanInput[i];
            if (!this.alphabet.includes(char)) {
                return {
                    success: false,
                    error: `Symbol "${char}" at index ${i} is not in input alphabet Σ = {${this.alphabet.join(', ')}}.`,
                    trace: [],
                    finalOutput: ''
                };
            }
        }

        const trace = [];
        let currentState = this.initialState;
        let finalOutput = '';

        if (cleanInput.length === 0) {
            return {
                success: true,
                trace: [{
                    step: 0,
                    currentState: this.initialState,
                    symbol: 'ε (empty)',
                    nextState: this.initialState,
                    output: 'ε',
                    accumulatedOutput: 'ε'
                }],
                finalOutput: 'ε (empty string gives no output in Mealy machine)',
                isEmpty: true
            };
        }

        for (let step = 0; step < cleanInput.length; step++) {
            const symbol = cleanInput[step];
            const trans = this.getTransition(currentState, symbol);
            const nextState = trans.nextState;
            const output = trans.output;
            finalOutput += output;

            trace.push({
                step: step + 1,
                currentState,
                symbol,
                nextState,
                output,
                accumulatedOutput: finalOutput
            });

            currentState = nextState;
        }

        return {
            success: true,
            trace,
            finalOutput,
            inputLength: cleanInput.length,
            outputLength: finalOutput.length
        };
    }

    clone() {
        return new MealyMachine({
            states: [...this.states],
            alphabet: [...this.alphabet],
            outputAlphabet: [...this.outputAlphabet],
            initialState: this.initialState,
            transitions: JSON.parse(JSON.stringify(this.transitions))
        });
    }
}

class MooreMachine {
    /**
     * @param {Object} config
     * @param {string[]} config.states
     * @param {string[]} config.alphabet
     * @param {string[]} config.outputAlphabet
     * @param {string} config.initialState
     * @param {Object} [config.stateOutputs] - Format: { [state]: output }
     * @param {Object} [config.transitions] - Format: { [state]: { [symbol]: nextState } }
     */
    constructor({ states = [], alphabet = [], outputAlphabet = [], initialState = '', stateOutputs = {}, transitions = {} } = {}) {
        this.states = Array.isArray(states) ? [...states] : [];
        this.alphabet = Array.isArray(alphabet) ? [...alphabet] : [];
        this.outputAlphabet = Array.isArray(outputAlphabet) ? [...outputAlphabet] : [];
        this.initialState = initialState || (this.states[0] || '');
        this.stateOutputs = {};
        this.transitions = {};

        // Initialize state outputs & transition table
        for (const s of this.states) {
            this.stateOutputs[s] = stateOutputs[s] !== undefined ? String(stateOutputs[s]) : '';
            this.transitions[s] = {};
            for (const a of this.alphabet) {
                this.transitions[s][a] = (transitions[s] && transitions[s][a]) ? transitions[s][a] : '';
            }
        }
    }

    setStateOutput(state, output) {
        this.stateOutputs[state] = output;
    }

    getStateOutput(state) {
        return this.stateOutputs[state] !== undefined ? this.stateOutputs[state] : '';
    }

    setTransition(state, symbol, nextState) {
        if (!this.transitions[state]) this.transitions[state] = {};
        this.transitions[state][symbol] = nextState;
    }

    getTransition(state, symbol) {
        if (this.transitions[state] && this.transitions[state][symbol]) {
            return this.transitions[state][symbol];
        }
        return '';
    }

    /**
     * Comprehensive validation of the Moore machine
     * @returns {{ isValid: boolean, errors: string[], warnings: string[] }}
     */
    validate() {
        const errors = [];
        const warnings = [];

        if (!this.states || this.states.length === 0) {
            errors.push('Machine must have at least one state in Q.');
        }

        const uniqueStates = new Set(this.states);
        if (uniqueStates.size !== this.states.length) {
            errors.push('State set Q contains duplicate state names.');
        }

        if (!this.alphabet || this.alphabet.length === 0) {
            errors.push('Input alphabet Σ must contain at least one symbol.');
        }

        const uniqueAlphabet = new Set(this.alphabet);
        if (uniqueAlphabet.size !== this.alphabet.length) {
            errors.push('Input alphabet Σ contains duplicate symbols.');
        }

        if (!this.outputAlphabet || this.outputAlphabet.length === 0) {
            errors.push('Output alphabet Δ must contain at least one symbol.');
        }

        if (!this.initialState) {
            errors.push('Initial state q0 is not specified.');
        } else if (!this.states.includes(this.initialState)) {
            errors.push(`Initial state "${this.initialState}" does not exist in state set Q.`);
        }

        // Check state outputs
        for (const state of this.states) {
            const out = this.getStateOutput(state);
            if (out === undefined || out === '') {
                errors.push(`Missing state output: λ'(${state}) is undefined.`);
            } else if (!this.outputAlphabet.includes(out)) {
                errors.push(`State output for "${state}" is "${out}", which is not in Δ = {${this.outputAlphabet.join(', ')}}.`);
            }
        }

        // Check transition completeness
        for (const state of this.states) {
            for (const sym of this.alphabet) {
                const nextState = this.getTransition(state, sym);
                if (!nextState) {
                    errors.push(`Missing transition: δ'(${state}, "${sym}") is undefined.`);
                } else if (!this.states.includes(nextState)) {
                    errors.push(`Invalid target state in transition δ'(${state}, "${sym}") → "${nextState}".`);
                }
            }
        }

        // Reachability analysis
        if (errors.length === 0 && this.initialState) {
            const visited = new Set([this.initialState]);
            const queue = [this.initialState];
            while (queue.length > 0) {
                const cur = queue.shift();
                for (const sym of this.alphabet) {
                    const next = this.getTransition(cur, sym);
                    if (next && !visited.has(next)) {
                        visited.add(next);
                        queue.push(next);
                    }
                }
            }
            const unreachable = this.states.filter(s => !visited.has(s));
            if (unreachable.length > 0) {
                warnings.push(`Unreachable state(s) detected: ${unreachable.join(', ')}.`);
            }
        }

        return {
            isValid: errors.length === 0,
            errors,
            warnings
        };
    }

    /**
     * Executes input string simulation through Moore machine
     * Formal Automata Theory:
     * In Moore machine, output of length (n + 1) is produced for input string of length n.
     * The first output symbol y0 = λ'(q0) is produced before reading any input.
     * @param {string} inputString
     */
    simulate(inputString = '') {
        const validation = this.validate();
        if (!validation.isValid) {
            return {
                success: false,
                error: 'Cannot simulate invalid machine: ' + validation.errors.join('; '),
                trace: [],
                finalOutput: '',
                synchronizedOutput: ''
            };
        }

        const cleanInput = inputString.trim();
        for (let i = 0; i < cleanInput.length; i++) {
            const char = cleanInput[i];
            if (!this.alphabet.includes(char)) {
                return {
                    success: false,
                    error: `Symbol "${char}" at index ${i} is not in input alphabet Σ = {${this.alphabet.join(', ')}}.`,
                    trace: [],
                    finalOutput: '',
                    synchronizedOutput: ''
                };
            }
        }

        const trace = [];
        let currentState = this.initialState;
        const initialOut = this.getStateOutput(currentState);
        let finalOutput = initialOut;

        // Step 0: Initial state before any input is read
        trace.push({
            step: 0,
            currentState,
            symbol: '— (initial state)',
            nextState: currentState,
            output: initialOut,
            accumulatedOutput: finalOutput,
            note: 'Initial state output before reading input'
        });

        for (let step = 0; step < cleanInput.length; step++) {
            const symbol = cleanInput[step];
            const nextState = this.getTransition(currentState, symbol);
            const output = this.getStateOutput(nextState);
            finalOutput += output;

            trace.push({
                step: step + 1,
                currentState,
                symbol,
                nextState,
                output,
                accumulatedOutput: finalOutput,
                note: `Transition to ${nextState} emits output ${output}`
            });

            currentState = nextState;
        }

        // Synchronized output corresponds to Mealy output (ignoring step 0 initial state output)
        const synchronizedOutput = finalOutput.slice(1);

        return {
            success: true,
            trace,
            finalOutput,
            synchronizedOutput,
            initialOutput: initialOut,
            inputLength: cleanInput.length,
            outputLength: finalOutput.length
        };
    }

    clone() {
        return new MooreMachine({
            states: [...this.states],
            alphabet: [...this.alphabet],
            outputAlphabet: [...this.outputAlphabet],
            initialState: this.initialState,
            stateOutputs: { ...this.stateOutputs },
            transitions: JSON.parse(JSON.stringify(this.transitions))
        });
    }
}

// Export for ES modules and browser global window
if (typeof window !== 'undefined') {
    window.MealyMachine = MealyMachine;
    window.MooreMachine = MooreMachine;
}
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { MealyMachine, MooreMachine };
}
