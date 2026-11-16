/**
 * Academic Samples Library
 * CSET302: Automata Theory and Computability - Bennett University
 * Standard benchmark machines and general custom templates.
 */

const AUTOMATA_SAMPLES = {
    mealy: [
        {
            id: 'general_custom',
            name: "★ General / Custom Machine (Build Your Own)",
            description: "A clean general template with customizable states, inputs, and outputs.",
            testStrings: ['01', '101', '0110', '1100'],
            machine: {
                states: ['q0', 'q1'],
                alphabet: ['0', '1'],
                outputAlphabet: ['0', '1'],
                initialState: 'q0',
                transitions: {
                    q0: {
                        '0': { nextState: 'q0', output: '0' },
                        '1': { nextState: 'q1', output: '1' }
                    },
                    q1: {
                        '0': { nextState: 'q0', output: '1' },
                        '1': { nextState: 'q1', output: '0' }
                    }
                }
            }
        },
        {
            id: 'general_ab',
            name: "General Machine (Alphabet: a, b → x, y)",
            description: "General 3-state machine using letter alphabets {a, b} and outputs {x, y}.",
            testStrings: ['ab', 'aba', 'aab', 'bba'],
            machine: {
                states: ['q0', 'q1', 'q2'],
                alphabet: ['a', 'b'],
                outputAlphabet: ['x', 'y'],
                initialState: 'q0',
                transitions: {
                    q0: {
                        'a': { nextState: 'q1', output: 'x' },
                        'b': { nextState: 'q0', output: 'y' }
                    },
                    q1: {
                        'a': { nextState: 'q2', output: 'y' },
                        'b': { nextState: 'q1', output: 'x' }
                    },
                    q2: {
                        'a': { nextState: 'q0', output: 'x' },
                        'b': { nextState: 'q2', output: 'y' }
                    }
                }
            }
        },
        {
            id: 'mealy_seq_101',
            name: "Sequence Detector for '101' (Overlapping)",
            description: "Outputs '1' every time the bit subsequence '101' is detected in the input stream, and '0' otherwise.",
            testStrings: ['101', '10101', '1101011', '0010100', '111000'],
            machine: {
                states: ['q0', 'q1', 'q2'],
                alphabet: ['0', '1'],
                outputAlphabet: ['0', '1'],
                initialState: 'q0',
                transitions: {
                    q0: {
                        '0': { nextState: 'q0', output: '0' },
                        '1': { nextState: 'q1', output: '0' }
                    },
                    q1: {
                        '0': { nextState: 'q2', output: '0' },
                        '1': { nextState: 'q1', output: '0' }
                    },
                    q2: {
                        '0': { nextState: 'q0', output: '0' },
                        '1': { nextState: 'q1', output: '1' }
                    }
                }
            }
        },
        {
            id: 'mealy_state_splitting',
            name: "State-Splitting Demonstration Machine",
            description: "Demonstrates state splitting where state q1 receives both outputs 0 and 1.",
            testStrings: ['0101', '1010', '0011', '11001'],
            machine: {
                states: ['q1', 'q2', 'q3'],
                alphabet: ['0', '1'],
                outputAlphabet: ['0', '1'],
                initialState: 'q1',
                transitions: {
                    q1: {
                        '0': { nextState: 'q3', output: '0' },
                        '1': { nextState: 'q2', output: '0' }
                    },
                    q2: {
                        '0': { nextState: 'q1', output: '1' },
                        '1': { nextState: 'q2', output: '1' }
                    },
                    q3: {
                        '0': { nextState: 'q2', output: '0' },
                        '1': { nextState: 'q1', output: '0' }
                    }
                }
            }
        },
        {
            id: 'mealy_twos_complement',
            name: "2's Complement Generator (LSB to MSB)",
            description: "Copies bits until first 1, then inverts all subsequent bits.",
            testStrings: ['0010', '1000', '1010', '0110', '1101'],
            machine: {
                states: ['q0', 'q1'],
                alphabet: ['0', '1'],
                outputAlphabet: ['0', '1'],
                initialState: 'q0',
                transitions: {
                    q0: {
                        '0': { nextState: 'q0', output: '0' },
                        '1': { nextState: 'q1', output: '1' }
                    },
                    q1: {
                        '0': { nextState: 'q1', output: '1' },
                        '1': { nextState: 'q1', output: '0' }
                    }
                }
            }
        },
        {
            id: 'mealy_ones_complement',
            name: "1's Complement Generator (Inverter)",
            description: "Single-state machine that inverts every input bit.",
            testStrings: ['0101', '1111', '0000', '10110'],
            machine: {
                states: ['q0'],
                alphabet: ['0', '1'],
                outputAlphabet: ['0', '1'],
                initialState: 'q0',
                transitions: {
                    q0: {
                        '0': { nextState: 'q0', output: '1' },
                        '1': { nextState: 'q0', output: '0' }
                    }
                }
            }
        },
        {
            id: 'mealy_parity',
            name: "Odd Parity Bit Stream",
            description: "Maintains running parity of binary input.",
            testStrings: ['0110', '1001', '1111', '0001'],
            machine: {
                states: ['qEven', 'qOdd'],
                alphabet: ['0', '1'],
                outputAlphabet: ['0', '1'],
                initialState: 'qEven',
                transitions: {
                    qEven: {
                        '0': { nextState: 'qEven', output: '0' },
                        '1': { nextState: 'qOdd', output: '1' }
                    },
                    qOdd: {
                        '0': { nextState: 'qOdd', output: '1' },
                        '1': { nextState: 'qEven', output: '0' }
                    }
                }
            }
        }
    ],

    moore: [
        {
            id: 'general_custom_moore',
            name: "★ General / Custom Machine (Build Your Own)",
            description: "A clean general Moore template with customizable states, inputs, and outputs.",
            testStrings: ['01', '101', '0011', '1100'],
            machine: {
                states: ['q0', 'q1'],
                alphabet: ['0', '1'],
                outputAlphabet: ['0', '1'],
                initialState: 'q0',
                stateOutputs: {
                    q0: '0',
                    q1: '1'
                },
                transitions: {
                    q0: { '0': 'q0', '1': 'q1' },
                    q1: { '0': 'q1', '1': 'q0' }
                }
            }
        },
        {
            id: 'general_ab_moore',
            name: "General Machine (Alphabet: a, b → x, y)",
            description: "General 3-state Moore machine using letters {a, b} and outputs {x, y}.",
            testStrings: ['ab', 'aba', 'aab', 'bba'],
            machine: {
                states: ['q0', 'q1', 'q2'],
                alphabet: ['a', 'b'],
                outputAlphabet: ['x', 'y'],
                initialState: 'q0',
                stateOutputs: {
                    q0: 'x',
                    q1: 'y',
                    q2: 'x'
                },
                transitions: {
                    q0: { 'a': 'q1', 'b': 'q0' },
                    q1: { 'a': 'q2', 'b': 'q1' },
                    q2: { 'a': 'q0', 'b': 'q2' }
                }
            }
        },
        {
            id: 'moore_seq_01',
            name: "Substring Detector for '01'",
            description: "Outputs '1' at state q2 when substring '01' has just been read.",
            testStrings: ['01', '001', '101', '0101', '1100'],
            machine: {
                states: ['q0', 'q1', 'q2'],
                alphabet: ['0', '1'],
                outputAlphabet: ['0', '1'],
                initialState: 'q0',
                stateOutputs: {
                    q0: '0',
                    q1: '0',
                    q2: '1'
                },
                transitions: {
                    q0: { '0': 'q1', '1': 'q0' },
                    q1: { '0': 'q1', '1': 'q2' },
                    q2: { '0': 'q1', '1': 'q0' }
                }
            }
        },
        {
            id: 'moore_parity',
            name: "Even/Odd 1s Parity Detector",
            description: "Outputs '1' when number of 1s is even, '0' when odd.",
            testStrings: ['00', '1', '10', '11', '101', '111', '1111'],
            machine: {
                states: ['qEven', 'qOdd'],
                alphabet: ['0', '1'],
                outputAlphabet: ['0', '1'],
                initialState: 'qEven',
                stateOutputs: {
                    qEven: '1',
                    qOdd: '0'
                },
                transitions: {
                    qEven: { '0': 'qEven', '1': 'qOdd' },
                    qOdd: { '0': 'qOdd', '1': 'qEven' }
                }
            }
        },
        {
            id: 'moore_mod3',
            name: "Modulo-3 Binary Residue Calculator",
            description: "Computes remainder modulo 3 for binary inputs.",
            testStrings: ['0', '1', '10', '11', '100', '101', '110', '111'],
            machine: {
                states: ['q0', 'q1', 'q2'],
                alphabet: ['0', '1'],
                outputAlphabet: ['0', '1', '2'],
                initialState: 'q0',
                stateOutputs: {
                    q0: '0',
                    q1: '1',
                    q2: '2'
                },
                transitions: {
                    q0: { '0': 'q0', '1': 'q1' },
                    q1: { '0': 'q2', '1': 'q0' },
                    q2: { '0': 'q1', '1': 'q2' }
                }
            }
        }
    ]
};

if (typeof window !== 'undefined') {
    window.AUTOMATA_SAMPLES = AUTOMATA_SAMPLES;
}
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AUTOMATA_SAMPLES };
}
