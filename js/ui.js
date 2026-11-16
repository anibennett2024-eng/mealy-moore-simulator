/**
 * Simple & Intuitive UI Controller with Animated Simulation
 * CSET302: Automata Theory and Computability - Bennett University
 */

class AutomataUI {
    constructor() {
        this.mealy = null;
        this.moore = null;
        this.convertedMoore = null;
        this.convertedMealy = null;

        this.mealyDiagram = null;
        this.convertedMooreDiagram = null;
        this.mooreDiagram = null;
        this.convertedMealyDiagram = null;

        // Mealy simulation state
        this.mealyTrace = [];
        this.mealyStepIdx = 0;
        this.mealyTimer = null;
        this.lastMealyStr = '';

        // Moore simulation state
        this.mooreTrace = [];
        this.mooreStepIdx = 0;
        this.mooreTimer = null;
        this.lastMooreStr = '';

        this.init();
    }

    init() {
        this.initDiagrams();
        this.bindTabs();
        this.initMealyMode();
        this.initMooreMode();
    }

    initDiagrams() {
        this.mealyDiagram = new StateDiagramRenderer({
            container: 'mealy-diagram-wrap',
            type: 'mealy',
            width: 580,
            height: 380
        });

        this.convertedMooreDiagram = new StateDiagramRenderer({
            container: 'converted-moore-diagram-wrap',
            type: 'moore',
            width: 580,
            height: 380
        });

        this.mooreDiagram = new StateDiagramRenderer({
            container: 'moore-diagram-wrap',
            type: 'moore',
            width: 580,
            height: 380
        });

        this.convertedMealyDiagram = new StateDiagramRenderer({
            container: 'converted-mealy-diagram-wrap',
            type: 'mealy',
            width: 580,
            height: 380
        });
    }

    bindTabs() {
        const buttons = document.querySelectorAll('.tab-btn');
        buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                buttons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const targetTab = btn.dataset.tab;
                document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
                document.getElementById(`tab-${targetTab}`).classList.add('active');

                setTimeout(() => {
                    if (targetTab === 'mealy-mode') {
                        if (this.mealyDiagram.machine) this.mealyDiagram.render();
                        if (this.convertedMooreDiagram.machine) this.convertedMooreDiagram.render();
                    } else {
                        if (this.mooreDiagram.machine) this.mooreDiagram.render();
                        if (this.convertedMealyDiagram.machine) this.convertedMealyDiagram.render();
                    }
                }, 50);
            });
        });
    }

    // ================= MEALY MODE =================
    initMealyMode() {
        const select = document.getElementById('mealy-sample-select');
        select.innerHTML = AUTOMATA_SAMPLES.mealy.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
        select.addEventListener('change', (e) => this.loadMealySample(e.target.value));

        document.getElementById('mealy-update-btn').addEventListener('click', () => this.updateMealyFromInputs());

        // Simulation controls
        document.getElementById('mealy-sim-run-btn').addEventListener('click', () => this.toggleMealySim());
        document.getElementById('mealy-sim-step-btn').addEventListener('click', () => this.stepMealySim());
        document.getElementById('mealy-sim-reset-btn').addEventListener('click', () => this.resetMealySim());

        document.getElementById('convert-to-moore-btn').addEventListener('click', () => this.convertToMoore());
        document.getElementById('m2m-test-btn').addEventListener('click', () => this.runM2MTest());

        this.loadMealySample(AUTOMATA_SAMPLES.mealy[0].id);
    }

    loadMealySample(id) {
        const sample = AUTOMATA_SAMPLES.mealy.find(s => s.id === id);
        if (!sample) return;

        this.mealy = new MealyMachine(sample.machine);
        document.getElementById('mealy-states').value = this.mealy.states.join(', ');
        document.getElementById('mealy-alphabet').value = this.mealy.alphabet.join(', ');
        document.getElementById('mealy-out-alphabet').value = this.mealy.outputAlphabet.join(', ');
        document.getElementById('mealy-start').value = this.mealy.initialState;

        this.renderMealyTable();
        this.mealyDiagram.setMachine(this.mealy);
        this.resetMealySim();
        this.checkMealyStatus();
    }

    updateMealyFromInputs() {
        const parse = (v) => v.split(',').map(s => s.trim()).filter(Boolean);
        const states = parse(document.getElementById('mealy-states').value);
        const alphabet = parse(document.getElementById('mealy-alphabet').value);
        const outputAlphabet = parse(document.getElementById('mealy-out-alphabet').value);
        const start = document.getElementById('mealy-start').value.trim();

        if (states.length === 0 || alphabet.length === 0 || outputAlphabet.length === 0) {
            alert('Please provide states and alphabets.');
            return;
        }

        const old = this.mealy.transitions;
        const transitions = {};
        for (const s of states) {
            transitions[s] = {};
            for (const a of alphabet) {
                if (old[s] && old[s][a] && states.includes(old[s][a].nextState) && outputAlphabet.includes(old[s][a].output)) {
                    transitions[s][a] = old[s][a];
                } else {
                    transitions[s][a] = { nextState: states[0], output: outputAlphabet[0] };
                }
            }
        }

        this.mealy = new MealyMachine({
            states,
            alphabet,
            outputAlphabet,
            initialState: states.includes(start) ? start : states[0],
            transitions
        });

        document.getElementById('mealy-start').value = this.mealy.initialState;
        this.renderMealyTable();
        this.mealyDiagram.setMachine(this.mealy);
        this.resetMealySim();
        this.checkMealyStatus();
    }

    renderMealyTable() {
        const wrap = document.getElementById('mealy-table-wrap');
        const { states, alphabet, outputAlphabet } = this.mealy;

        let html = `
            <table class="simple-table">
                <thead>
                    <tr>
                        <th>State</th>
                        ${alphabet.map(a => `<th>Input: ${a} (Next / Out)</th>`).join('')}
                    </tr>
                </thead>
                <tbody>
        `;

        for (const s of states) {
            const isStart = (s === this.mealy.initialState);
            html += `<tr><td><strong>${isStart ? '→ ' : ''}${s}</strong></td>`;
            for (const a of alphabet) {
                const tr = this.mealy.getTransition(s, a) || { nextState: states[0], output: outputAlphabet[0] };
                html += `
                    <td>
                        <select class="m-next" data-s="${s}" data-a="${a}">
                            ${states.map(st => `<option value="${st}" ${st === tr.nextState ? 'selected' : ''}>${st}</option>`).join('')}
                        </select>
                        /
                        <select class="m-out" data-s="${s}" data-a="${a}">
                            ${outputAlphabet.map(o => `<option value="${o}" ${o === tr.output ? 'selected' : ''}>${o}</option>`).join('')}
                        </select>
                    </td>
                `;
            }
            html += `</tr>`;
        }
        html += `</tbody></table>`;
        wrap.innerHTML = html;

        wrap.querySelectorAll('.m-next, .m-out').forEach(sel => {
            sel.addEventListener('change', () => {
                const s = sel.dataset.s;
                const a = sel.dataset.a;
                const next = wrap.querySelector(`.m-next[data-s="${s}"][data-a="${a}"]`).value;
                const out = wrap.querySelector(`.m-out[data-s="${s}"][data-a="${a}"]`).value;
                this.mealy.setTransition(s, a, next, out);
                this.mealyDiagram.render();
                this.checkMealyStatus();
            });
        });
    }

    checkMealyStatus() {
        const val = this.mealy.validate();
        const msg = document.getElementById('mealy-status');
        if (val.isValid) {
            msg.className = 'status-msg valid';
            msg.textContent = `✓ Valid Mealy Machine (${this.mealy.states.length} states)`;
        } else {
            msg.className = 'status-msg invalid';
            msg.textContent = `⚠ ${val.errors[0]}`;
        }
    }

    // Animated Simulation for Mealy
    toggleMealySim() {
        const btn = document.getElementById('mealy-sim-run-btn');
        if (this.mealyTimer) {
            // Pause
            clearInterval(this.mealyTimer);
            this.mealyTimer = null;
            btn.textContent = 'Simulate';
            return;
        }

        const str = document.getElementById('mealy-sim-input').value.trim();
        if (!str) {
            alert('Please enter an input string to simulate (e.g. 0110).');
            return;
        }

        const res = this.mealy.simulate(str);
        if (!res.success) {
            alert('Simulation Error: ' + res.error);
            return;
        }

        // If completed or new string, reset to step 0
        if (this.mealyStepIdx >= this.mealyTrace.length || this.lastMealyStr !== str) {
            this.mealyTrace = res.trace;
            this.lastMealyStr = str;
            this.mealyStepIdx = 0;
            this.clearTraceTable('mealy-trace-table');
            document.getElementById('mealy-sim-output').textContent = '—';
            this.mealyDiagram.setSimulationState(this.mealy.initialState);
        }

        btn.textContent = '⏸ Pause';

        this.mealyTimer = setInterval(() => {
            if (this.mealyStepIdx < this.mealyTrace.length) {
                this.stepMealyForward();
            } else {
                clearInterval(this.mealyTimer);
                this.mealyTimer = null;
                btn.textContent = 'Simulate';
            }
        }, 750);
    }

    stepMealySim() {
        if (this.mealyTimer) {
            clearInterval(this.mealyTimer);
            this.mealyTimer = null;
            document.getElementById('mealy-sim-run-btn').textContent = 'Simulate';
        }

        const str = document.getElementById('mealy-sim-input').value.trim();
        if (!str) {
            alert('Please enter an input string to step through.');
            return;
        }

        if (this.mealyTrace.length === 0 || this.lastMealyStr !== str) {
            const res = this.mealy.simulate(str);
            if (!res.success) {
                alert('Simulation Error: ' + res.error);
                return;
            }
            this.mealyTrace = res.trace;
            this.lastMealyStr = str;
            this.mealyStepIdx = 0;
            this.clearTraceTable('mealy-trace-table');
            document.getElementById('mealy-sim-output').textContent = '—';
        }

        if (this.mealyStepIdx < this.mealyTrace.length) {
            this.stepMealyForward();
        }
    }

    stepMealyForward() {
        const cur = this.mealyTrace[this.mealyStepIdx];
        this.mealyStepIdx++;

        // Live diagram update: highlight state and edge taken
        this.mealyDiagram.setSimulationState(cur.nextState, {
            from: cur.currentState,
            to: cur.nextState,
            symbol: cur.symbol
        });

        document.getElementById('mealy-sim-output').textContent = cur.accumulatedOutput;
        this.appendTraceRow('mealy-trace-table', cur, this.mealyStepIdx === this.mealyTrace.length);
    }

    resetMealySim() {
        if (this.mealyTimer) {
            clearInterval(this.mealyTimer);
            this.mealyTimer = null;
        }
        document.getElementById('mealy-sim-run-btn').textContent = 'Simulate';
        this.mealyTrace = [];
        this.mealyStepIdx = 0;
        this.lastMealyStr = '';
        document.getElementById('mealy-sim-output').textContent = '—';
        this.clearTraceTable('mealy-trace-table');
        this.mealyDiagram.setSimulationState(null);
    }

    convertToMoore() {
        const res = AutomataConverter.mealyToMoore(this.mealy);
        this.convertedMoore = res.mooreMachine;
        const initOut = res.initialOutput;

        const resultArea = document.getElementById('moore-result-area');
        resultArea.style.display = 'block';

        const expl = document.getElementById('mealy-to-moore-explanation');
        let splitText = [];
        for (const [st, info] of Object.entries(res.derivation.splitStates)) {
            if (info.needsSplitting) {
                splitText.push(`<li><strong>State ${st}</strong> splits into <strong>${info.resultingMooreStates.map(r => `${r.name} (out: ${r.output})`).join(' and ')}</strong> because it receives multiple outputs: {${info.outputs.join(', ')}}.</li>`);
            } else {
                splitText.push(`<li>State ${st} does not split (receives output ${info.outputs[0] || initOut}).</li>`);
            }
        }
        expl.innerHTML = `
            <p><strong>Step 1: State Splitting Decision:</strong></p>
            <ul>${splitText.join('')}</ul>
            <p style="margin-top: 0.5rem;"><strong>Step 2: Start State & Output Alignment:</strong><br>
            Initial Moore state is <code>${this.convertedMoore.initialState}</code> with initial output <code>${initOut}</code>. For any input of length n, Mealy produces n outputs while Moore produces n+1 (including the initial output).</p>
        `;

        const wrap = document.getElementById('converted-moore-table-wrap');
        wrap.innerHTML = `
            <table class="simple-table">
                <thead>
                    <tr>
                        <th>Moore State</th>
                        <th>Output</th>
                        ${this.convertedMoore.alphabet.map(a => `<th>Next (${a})</th>`).join('')}
                    </tr>
                </thead>
                <tbody>
                    ${this.convertedMoore.states.map(s => `
                        <tr>
                            <td><strong>${s === this.convertedMoore.initialState ? '→ ' : ''}${s}</strong></td>
                            <td><strong style="color:var(--purple)">${this.convertedMoore.getStateOutput(s)}</strong></td>
                            ${this.convertedMoore.alphabet.map(a => `<td>${this.convertedMoore.getTransition(s, a)}</td>`).join('')}
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;

        this.convertedMooreDiagram.setMachine(this.convertedMoore);
        this.runM2MTest();
        resultArea.scrollIntoView({ behavior: 'smooth' });
    }

    runM2MTest() {
        if (!this.convertedMoore) return;
        const str = document.getElementById('m2m-test-input').value.trim();
        const mealyRes = this.mealy.simulate(str);
        const mooreRes = this.convertedMoore.simulate(str);

        if (!mealyRes.success || !mooreRes.success) {
            alert('Error: ' + (mealyRes.error || mooreRes.error));
            return;
        }

        const isMatch = (mealyRes.finalOutput === mooreRes.synchronizedOutput);
        const box = document.getElementById('m2m-comparison-result');
        box.innerHTML = `
            <div><strong>Mealy Output (${mealyRes.inputLength} symbols):</strong> <code>${mealyRes.finalOutput}</code></div>
            <div><strong>Moore Output (${mooreRes.outputLength} symbols):</strong> <code>${mooreRes.finalOutput}</code></div>
            <div><strong>Moore Discarding Initial '${mooreRes.initialOutput}':</strong> <code>${mooreRes.synchronizedOutput}</code></div>
            <div class="${isMatch ? 'match' : 'text-danger'}">
                ${isMatch ? '✓ Verified: Outputs match perfectly!' : '✗ Mismatch detected'}
            </div>
        `;
    }

    // ================= MOORE MODE =================
    initMooreMode() {
        const select = document.getElementById('moore-sample-select');
        select.innerHTML = AUTOMATA_SAMPLES.moore.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
        select.addEventListener('change', (e) => this.loadMooreSample(e.target.value));

        document.getElementById('moore-update-btn').addEventListener('click', () => this.updateMooreFromInputs());

        // Simulation controls
        document.getElementById('moore-sim-run-btn').addEventListener('click', () => this.toggleMooreSim());
        document.getElementById('moore-sim-step-btn').addEventListener('click', () => this.stepMooreSim());
        document.getElementById('moore-sim-reset-btn').addEventListener('click', () => this.resetMooreSim());

        document.getElementById('convert-to-mealy-btn').addEventListener('click', () => this.convertToMealy());
        document.getElementById('m2mealy-test-btn').addEventListener('click', () => this.runM2MealyTest());

        this.loadMooreSample(AUTOMATA_SAMPLES.moore[0].id);
    }

    loadMooreSample(id) {
        const sample = AUTOMATA_SAMPLES.moore.find(s => s.id === id);
        if (!sample) return;

        this.moore = new MooreMachine(sample.machine);
        document.getElementById('moore-states').value = this.moore.states.join(', ');
        document.getElementById('moore-alphabet').value = this.moore.alphabet.join(', ');
        document.getElementById('moore-out-alphabet').value = this.moore.outputAlphabet.join(', ');
        document.getElementById('moore-start').value = this.moore.initialState;

        this.renderMooreTable();
        this.mooreDiagram.setMachine(this.moore);
        this.resetMooreSim();
        this.checkMooreStatus();
    }

    updateMooreFromInputs() {
        const parse = (v) => v.split(',').map(s => s.trim()).filter(Boolean);
        const states = parse(document.getElementById('moore-states').value);
        const alphabet = parse(document.getElementById('moore-alphabet').value);
        const outputAlphabet = parse(document.getElementById('moore-out-alphabet').value);
        const start = document.getElementById('moore-start').value.trim();

        if (states.length === 0 || alphabet.length === 0 || outputAlphabet.length === 0) {
            alert('Please provide states and alphabets.');
            return;
        }

        const oldOut = this.moore.stateOutputs;
        const oldTrans = this.moore.transitions;
        const stateOutputs = {};
        const transitions = {};

        for (const s of states) {
            stateOutputs[s] = (oldOut[s] && outputAlphabet.includes(oldOut[s])) ? oldOut[s] : outputAlphabet[0];
            transitions[s] = {};
            for (const a of alphabet) {
                transitions[s][a] = (oldTrans[s] && states.includes(oldTrans[s][a])) ? oldTrans[s][a] : states[0];
            }
        }

        this.moore = new MooreMachine({
            states,
            alphabet,
            outputAlphabet,
            initialState: states.includes(start) ? start : states[0],
            stateOutputs,
            transitions
        });

        document.getElementById('moore-start').value = this.moore.initialState;
        this.renderMooreTable();
        this.mooreDiagram.setMachine(this.moore);
        this.resetMooreSim();
        this.checkMooreStatus();
    }

    renderMooreTable() {
        const wrap = document.getElementById('moore-table-wrap');
        const { states, alphabet, outputAlphabet } = this.moore;

        let html = `
            <table class="simple-table">
                <thead>
                    <tr>
                        <th>State</th>
                        <th>State Output</th>
                        ${alphabet.map(a => `<th>Next (${a})</th>`).join('')}
                    </tr>
                </thead>
                <tbody>
        `;

        for (const s of states) {
            const isStart = (s === this.moore.initialState);
            const curOut = this.moore.getStateOutput(s);
            html += `
                <tr>
                    <td><strong>${isStart ? '→ ' : ''}${s}</strong></td>
                    <td>
                        <select class="moore-out-sel" data-s="${s}">
                            ${outputAlphabet.map(o => `<option value="${o}" ${o === curOut ? 'selected' : ''}>${o}</option>`).join('')}
                        </select>
                    </td>
            `;
            for (const a of alphabet) {
                const next = this.moore.getTransition(s, a) || states[0];
                html += `
                    <td>
                        <select class="moore-next-sel" data-s="${s}" data-a="${a}">
                            ${states.map(st => `<option value="${st}" ${st === next ? 'selected' : ''}>${st}</option>`).join('')}
                        </select>
                    </td>
                `;
            }
            html += `</tr>`;
        }
        html += `</tbody></table>`;
        wrap.innerHTML = html;

        wrap.querySelectorAll('.moore-out-sel').forEach(sel => {
            sel.addEventListener('change', (e) => {
                this.moore.setStateOutput(e.target.dataset.s, e.target.value);
                this.mooreDiagram.render();
            });
        });

        wrap.querySelectorAll('.moore-next-sel').forEach(sel => {
            sel.addEventListener('change', (e) => {
                this.moore.setTransition(e.target.dataset.s, e.target.dataset.a, e.target.value);
                this.mooreDiagram.render();
            });
        });
    }

    checkMooreStatus() {
        const val = this.moore.validate();
        const msg = document.getElementById('moore-status');
        if (val.isValid) {
            msg.className = 'status-msg valid';
            msg.textContent = `✓ Valid Moore Machine (${this.moore.states.length} states)`;
        } else {
            msg.className = 'status-msg invalid';
            msg.textContent = `⚠ ${val.errors[0]}`;
        }
    }

    // Animated Simulation for Moore
    toggleMooreSim() {
        const btn = document.getElementById('moore-sim-run-btn');
        if (this.mooreTimer) {
            clearInterval(this.mooreTimer);
            this.mooreTimer = null;
            btn.textContent = 'Simulate';
            return;
        }

        const str = document.getElementById('moore-sim-input').value.trim();
        if (!str) {
            alert('Please enter an input string to simulate (e.g. 011).');
            return;
        }

        const res = this.moore.simulate(str);
        if (!res.success) {
            alert('Simulation Error: ' + res.error);
            return;
        }

        if (this.mooreStepIdx >= this.mooreTrace.length - 1 || this.lastMooreStr !== str) {
            this.mooreTrace = res.trace;
            this.lastMooreStr = str;
            this.mooreStepIdx = 0;
            this.clearTraceTable('moore-trace-table');
            // Show initial state row
            this.appendTraceRow('moore-trace-table', this.mooreTrace[0], false);
            this.mooreDiagram.setSimulationState(this.mooreTrace[0].currentState);
            document.getElementById('moore-sim-output').textContent = this.mooreTrace[0].output;
        }

        btn.textContent = '⏸ Pause';

        this.mooreTimer = setInterval(() => {
            if (this.mooreStepIdx < this.mooreTrace.length - 1) {
                this.stepMooreForward();
            } else {
                clearInterval(this.mooreTimer);
                this.mooreTimer = null;
                btn.textContent = 'Simulate';
            }
        }, 750);
    }

    stepMooreSim() {
        if (this.mooreTimer) {
            clearInterval(this.mooreTimer);
            this.mooreTimer = null;
            document.getElementById('moore-sim-run-btn').textContent = 'Simulate';
        }

        const str = document.getElementById('moore-sim-input').value.trim();
        if (!str) {
            alert('Please enter an input string to step through.');
            return;
        }

        if (this.mooreTrace.length === 0 || this.lastMooreStr !== str) {
            const res = this.moore.simulate(str);
            if (!res.success) {
                alert('Simulation Error: ' + res.error);
                return;
            }
            this.mooreTrace = res.trace;
            this.lastMooreStr = str;
            this.mooreStepIdx = 0;
            this.clearTraceTable('moore-trace-table');
            this.appendTraceRow('moore-trace-table', this.mooreTrace[0], false);
            this.mooreDiagram.setSimulationState(this.mooreTrace[0].currentState);
            document.getElementById('moore-sim-output').textContent = this.mooreTrace[0].output;
            return;
        }

        if (this.mooreStepIdx < this.mooreTrace.length - 1) {
            this.stepMooreForward();
        }
    }

    stepMooreForward() {
        this.mooreStepIdx++;
        const cur = this.mooreTrace[this.mooreStepIdx];

        this.mooreDiagram.setSimulationState(cur.nextState, {
            from: cur.currentState,
            to: cur.nextState,
            symbol: cur.symbol
        });

        document.getElementById('moore-sim-output').textContent = `${cur.accumulatedOutput} (aligned: ${cur.accumulatedOutput.slice(1)})`;
        this.appendTraceRow('moore-trace-table', cur, this.mooreStepIdx === this.mooreTrace.length - 1);
    }

    resetMooreSim() {
        if (this.mooreTimer) {
            clearInterval(this.mooreTimer);
            this.mooreTimer = null;
        }
        document.getElementById('moore-sim-run-btn').textContent = 'Simulate';
        this.mooreTrace = [];
        this.mooreStepIdx = 0;
        this.lastMooreStr = '';
        document.getElementById('moore-sim-output').textContent = '—';
        this.clearTraceTable('moore-trace-table');
        this.mooreDiagram.setSimulationState(null);
    }

    convertToMealy() {
        const res = AutomataConverter.mooreToMealy(this.moore);
        this.convertedMealy = res.mealyMachine;

        const resultArea = document.getElementById('mealy-result-area');
        resultArea.style.display = 'block';

        const expl = document.getElementById('moore-to-mealy-explanation');
        expl.innerHTML = `
            <p><strong>Rule:</strong> In Moore to Mealy, the states do not split. Each transition takes the output of its destination state:</p>
            <p><code>λ_Mealy(q, a) = λ_Moore(δ_Moore(q, a))</code></p>
        `;

        const wrap = document.getElementById('converted-mealy-table-wrap');
        wrap.innerHTML = `
            <table class="simple-table">
                <thead>
                    <tr>
                        <th>Mealy State</th>
                        ${this.convertedMealy.alphabet.map(a => `<th>Input: ${a} (Next / Out)</th>`).join('')}
                    </tr>
                </thead>
                <tbody>
                    ${this.convertedMealy.states.map(s => `
                        <tr>
                            <td><strong>${s === this.convertedMealy.initialState ? '→ ' : ''}${s}</strong></td>
                            ${this.convertedMealy.alphabet.map(a => {
                                const tr = this.convertedMealy.getTransition(s, a);
                                return `<td>${tr.nextState} / <strong style="color:var(--primary)">${tr.output}</strong></td>`;
                            }).join('')}
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;

        this.convertedMealyDiagram.setMachine(this.convertedMealy);
        this.runM2MealyTest();
        resultArea.scrollIntoView({ behavior: 'smooth' });
    }

    runM2MealyTest() {
        if (!this.convertedMealy) return;
        const str = document.getElementById('m2mealy-test-input').value.trim();
        const mooreRes = this.moore.simulate(str);
        const mealyRes = this.convertedMealy.simulate(str);

        if (!mooreRes.success || !mealyRes.success) {
            alert('Error: ' + (mooreRes.error || mealyRes.error));
            return;
        }

        const isMatch = (mooreRes.synchronizedOutput === mealyRes.finalOutput);
        const box = document.getElementById('m2mealy-comparison-result');
        box.innerHTML = `
            <div><strong>Moore Output (${mooreRes.outputLength} symbols):</strong> <code>${mooreRes.finalOutput}</code></div>
            <div><strong>Moore Discarding Initial '${mooreRes.initialOutput}':</strong> <code>${mooreRes.synchronizedOutput}</code></div>
            <div><strong>Converted Mealy Output (${mealyRes.inputLength} symbols):</strong> <code>${mealyRes.finalOutput}</code></div>
            <div class="${isMatch ? 'match' : 'text-danger'}">
                ${isMatch ? '✓ Verified: Outputs match perfectly!' : '✗ Mismatch detected'}
            </div>
        `;
    }

    // Helper table methods
    clearTraceTable(tableId) {
        const tbody = document.getElementById(tableId).querySelector('tbody');
        tbody.innerHTML = '';
    }

    appendTraceRow(tableId, stepData, isLast = false) {
        const tbody = document.getElementById(tableId).querySelector('tbody');
        
        // Remove previous highlight
        tbody.querySelectorAll('tr').forEach(r => r.style.background = '');

        const tr = document.createElement('tr');
        tr.style.background = '#fef3c7'; // Active step highlight
        tr.innerHTML = `
            <td><strong>${stepData.step}</strong></td>
            <td><code>${stepData.currentState}</code></td>
            <td><strong>${stepData.symbol}</strong></td>
            <td><code>${stepData.nextState}</code></td>
            <td><strong style="color:var(--primary)">${stepData.output}</strong></td>
            <td>${stepData.accumulatedOutput}</td>
        `;
        tbody.appendChild(tr);

        // Auto scroll to bottom of table
        const parentWrap = tbody.closest('.table-wrap');
        if (parentWrap) parentWrap.scrollTop = parentWrap.scrollHeight;
    }
}

if (typeof window !== 'undefined') {
    window.AutomataUI = AutomataUI;
}
