/**
 * State Diagram Renderer with Explicit Vector Arrowheads
 * CSET302: Automata Theory and Computability - Bennett University
 * Uses direct SVG polygons for arrowheads to guarantee 100% visibility across all tabs.
 */

class StateDiagramRenderer {
    constructor({ container, type = 'mealy', width = 600, height = 380 }) {
        this.container = typeof container === 'string' ? document.getElementById(container) : container;
        this.type = type;
        this.width = width;
        this.height = height;

        this.machine = null;
        this.nodePositions = {};
        this.activeState = null;
        this.activeTransition = null; // { from, to, symbol }

        this.scale = 1;
        this.panX = 0;
        this.panY = 0;
        this.isPanning = false;
        this.panStart = { x: 0, y: 0 };

        this.draggedNode = null;
        this.dragOffset = { x: 0, y: 0 };

        this.nodeRadius = 40; // larger, clearer circles

        this.initDOM();
    }

    initDOM() {
        if (!this.container) return;
        this.container.innerHTML = '';
        this.container.style.position = 'relative';
        this.container.style.overflow = 'hidden';
        this.container.style.userSelect = 'none';

        // Toolbar
        this.toolbar = document.createElement('div');
        this.toolbar.className = 'diagram-toolbar';
        this.toolbar.innerHTML = `
            <div class="diagram-type-badge">${this.type.toUpperCase()} MACHINE</div>
            <div class="diagram-controls-group">
                <button type="button" class="btn-icon" data-action="zoom-in" title="Zoom In">➕</button>
                <button type="button" class="btn-icon" data-action="zoom-out" title="Zoom Out">➖</button>
                <button type="button" class="btn-icon" data-action="reset-view" title="Reset View">↺</button>
            </div>
        `;
        this.container.appendChild(this.toolbar);

        // SVG Canvas
        this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        this.svg.setAttribute('width', '100%');
        this.svg.setAttribute('height', '100%');
        this.svg.setAttribute('viewBox', `0 0 ${this.width} ${this.height}`);
        this.svg.style.cursor = 'grab';

        // Root Group
        this.rootGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        this.svg.appendChild(this.rootGroup);

        this.edgesGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        this.rootGroup.appendChild(this.edgesGroup);

        this.nodesGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        this.rootGroup.appendChild(this.nodesGroup);

        this.container.appendChild(this.svg);
        this.bindEvents();
    }

    bindEvents() {
        this.toolbar.addEventListener('click', (e) => {
            const btn = e.target.closest('button[data-action]');
            if (!btn) return;
            const action = btn.dataset.action;
            if (action === 'zoom-in') this.zoom(1.15);
            if (action === 'zoom-out') this.zoom(0.85);
            if (action === 'reset-view') this.resetView();
        });

        this.svg.addEventListener('wheel', (e) => {
            e.preventDefault();
            this.zoom(e.deltaY < 0 ? 1.1 : 0.9);
        }, { passive: false });

        this.svg.addEventListener('mousedown', (e) => {
            const targetNode = e.target.closest('.diagram-node');
            if (targetNode) {
                const state = targetNode.dataset.state;
                this.draggedNode = state;
                const pos = this.nodePositions[state];
                const pt = this.getSVGPoint(e);
                this.dragOffset = { x: pt.x - pos.x, y: pt.y - pos.y };
            } else {
                this.isPanning = true;
                this.panStart = { x: e.clientX - this.panX, y: e.clientY - this.panY };
                this.svg.style.cursor = 'grabbing';
            }
        });

        window.addEventListener('mousemove', (e) => {
            if (this.draggedNode) {
                const pt = this.getSVGPoint(e);
                const pos = this.nodePositions[this.draggedNode];
                if (pos) {
                    pos.x = pt.x - this.dragOffset.x;
                    pos.y = pt.y - this.dragOffset.y;
                    this.render();
                }
            } else if (this.isPanning) {
                this.panX = e.clientX - this.panStart.x;
                this.panY = e.clientY - this.panStart.y;
                this.updateTransform();
            }
        });

        window.addEventListener('mouseup', () => {
            this.draggedNode = null;
            if (this.isPanning) {
                this.isPanning = false;
                this.svg.style.cursor = 'grab';
            }
        });
    }

    getSVGPoint(e) {
        const pt = this.svg.createSVGPoint();
        pt.x = e.clientX;
        pt.y = e.clientY;
        const ctm = this.rootGroup.getScreenCTM();
        if (ctm) {
            return pt.matrixTransform(ctm.inverse());
        }
        return { x: e.clientX, y: e.clientY };
    }

    zoom(factor) {
        this.scale = Math.min(Math.max(this.scale * factor, 0.4), 2.5);
        this.updateTransform();
    }

    resetView() {
        this.scale = 1;
        this.panX = 0;
        this.panY = 0;
        this.autoLayout();
        this.updateTransform();
    }

    updateTransform() {
        this.rootGroup.setAttribute('transform', `translate(${this.panX}, ${this.panY}) scale(${this.scale})`);
    }

    autoLayout() {
        if (!this.machine || !this.machine.states || this.machine.states.length === 0) return;

        const states = this.machine.states;
        const n = states.length;
        const centerX = this.width / 2;
        const centerY = this.height / 2;

        this.nodePositions = {};

        if (n === 1) {
            this.nodePositions[states[0]] = { x: centerX, y: centerY };
        } else if (n === 2) {
            // Generous spacing between 2 states
            this.nodePositions[states[0]] = { x: centerX - 130, y: centerY };
            this.nodePositions[states[1]] = { x: centerX + 130, y: centerY };
        } else if (n === 3) {
            this.nodePositions[states[0]] = { x: centerX - 140, y: centerY + 40 };
            this.nodePositions[states[1]] = { x: centerX, y: centerY - 90 };
            this.nodePositions[states[2]] = { x: centerX + 140, y: centerY + 40 };
        } else {
            // Circular layout
            const radius = Math.min(this.width, this.height) * 0.36;
            const angleStep = (2 * Math.PI) / n;
            states.forEach((state, i) => {
                const angle = Math.PI + i * angleStep;
                this.nodePositions[state] = {
                    x: centerX + radius * Math.cos(angle),
                    y: centerY + radius * Math.sin(angle)
                };
            });
        }

        this.render();
    }

    setMachine(machine) {
        this.machine = machine;
        this.type = (machine instanceof MooreMachine) ? 'moore' : 'mealy';
        const badge = this.toolbar.querySelector('.diagram-type-badge');
        if (badge) badge.textContent = `${this.type.toUpperCase()} MACHINE`;

        this.autoLayout();
    }

    setSimulationState(state, transition = null) {
        this.activeState = state;
        this.activeTransition = transition;
        this.render();
    }

    render() {
        if (!this.machine) return;

        this.edgesGroup.innerHTML = '';
        this.nodesGroup.innerHTML = '';

        this.renderInitialArrow();
        this.renderTransitions();
        this.renderNodes();
    }

    // Direct solid arrowhead helper
    drawArrowhead(parentGroup, tipX, tipY, angle, color = '#475569') {
        const len = 12;
        const width = 6;
        const p1X = tipX - len * Math.cos(angle) + width * Math.sin(angle);
        const p1Y = tipY - len * Math.sin(angle) - width * Math.cos(angle);
        const p2X = tipX - len * Math.cos(angle) - width * Math.sin(angle);
        const p2Y = tipY - len * Math.sin(angle) + width * Math.cos(angle);

        const poly = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        poly.setAttribute('points', `${tipX},${tipY} ${p1X},${p1Y} ${p2X},${p2Y}`);
        poly.setAttribute('fill', color);
        parentGroup.appendChild(poly);
    }

    renderInitialArrow() {
        const init = this.machine.initialState;
        if (!init || !this.nodePositions[init]) return;

        const pos = this.nodePositions[init];
        const startX = pos.x - this.nodeRadius - 55;
        const startY = pos.y;
        const endX = pos.x - this.nodeRadius;
        const endY = pos.y;

        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');

        // Line
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', startX);
        line.setAttribute('y1', startY);
        line.setAttribute('x2', endX - 2);
        line.setAttribute('y2', endY);
        line.setAttribute('stroke', '#2563eb');
        line.setAttribute('stroke-width', '2.5');
        g.appendChild(line);

        // Arrowhead
        this.drawArrowhead(g, endX, endY, 0, '#2563eb');

        // Start Badge
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('x', startX - 42);
        rect.setAttribute('y', startY - 11);
        rect.setAttribute('width', '42');
        rect.setAttribute('height', '22');
        rect.setAttribute('rx', '11');
        rect.setAttribute('fill', '#2563eb');
        g.appendChild(rect);

        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', startX - 21);
        text.setAttribute('y', startY + 4);
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('fill', '#ffffff');
        text.setAttribute('font-size', '11');
        text.setAttribute('font-weight', '700');
        text.textContent = 'Start';
        g.appendChild(text);

        this.edgesGroup.appendChild(g);
    }

    renderTransitions() {
        const aggregated = {};

        for (const fromState of this.machine.states) {
            for (const sym of this.machine.alphabet) {
                let toState = '';
                let output = '';

                if (this.type === 'mealy') {
                    const tr = this.machine.getTransition(fromState, sym);
                    if (tr && tr.nextState) {
                        toState = tr.nextState;
                        output = tr.output;
                    }
                } else {
                    toState = this.machine.getTransition(fromState, sym);
                    if (toState) {
                        output = this.machine.getStateOutput(toState);
                    }
                }

                if (toState && this.nodePositions[fromState] && this.nodePositions[toState]) {
                    const key = `${fromState}->${toState}`;
                    if (!aggregated[key]) {
                        aggregated[key] = { from: fromState, to: toState, items: [] };
                    }
                    aggregated[key].items.push({ symbol: sym, output });
                }
            }
        }

        for (const key in aggregated) {
            const edge = aggregated[key];
            const isSelf = (edge.from === edge.to);
            const reverseKey = `${edge.to}->${edge.from}`;
            const hasReverse = !isSelf && !!aggregated[reverseKey];

            let isActive = false;
            if (this.activeTransition && this.activeTransition.from === edge.from && this.activeTransition.to === edge.to) {
                isActive = true;
            }

            if (isSelf) {
                this.renderSelfLoop(edge, isActive);
            } else {
                this.renderCurvedEdge(edge, hasReverse, isActive);
            }
        }
    }

    renderSelfLoop(edge, isActive) {
        const pos = this.nodePositions[edge.from];
        const r = this.nodeRadius;
        const strokeColor = isActive ? '#f59e0b' : '#475569';

        // Loop arc above node
        const x1 = pos.x - r * 0.4;
        const y1 = pos.y - r * 0.92;
        const x2 = pos.x + r * 0.4;
        const y2 = pos.y - r * 0.92;

        const loopHeight = 45;
        const d = `M ${x1} ${y1} C ${pos.x - 40} ${pos.y - r - loopHeight}, ${pos.x + 40} ${pos.y - r - loopHeight}, ${x2} ${y2}`;

        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');

        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', d);
        path.setAttribute('fill', 'none');
        path.setAttribute('stroke', strokeColor);
        path.setAttribute('stroke-width', isActive ? '4' : '2.5');
        g.appendChild(path);

        // Arrowhead pointing down-left at (x2, y2)
        const angle = Math.PI * 0.65;
        this.drawArrowhead(g, x2, y2, angle, strokeColor);

        // Text label
        const labelText = edge.items.map(it => this.type === 'mealy' ? `${it.symbol}/${it.output}` : `${it.symbol}`).join(', ');
        const labelY = pos.y - r - loopHeight + 4;

        // Label background pill
        const pillWidth = Math.max(labelText.length * 8 + 14, 28);
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('x', pos.x - pillWidth / 2);
        rect.setAttribute('y', labelY - 14);
        rect.setAttribute('width', pillWidth);
        rect.setAttribute('height', '18');
        rect.setAttribute('rx', '4');
        rect.setAttribute('fill', isActive ? '#fef3c7' : '#f1f5f9');
        rect.setAttribute('stroke', strokeColor);
        rect.setAttribute('stroke-width', '1');
        g.appendChild(rect);

        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', pos.x);
        text.setAttribute('y', labelY);
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('font-size', '12');
        text.setAttribute('font-weight', '700');
        text.setAttribute('fill', isActive ? '#b45309' : '#1e293b');
        text.textContent = labelText;
        g.appendChild(text);

        this.edgesGroup.appendChild(g);
    }

    renderCurvedEdge(edge, hasReverse, isActive) {
        const p1 = this.nodePositions[edge.from];
        const p2 = this.nodePositions[edge.to];
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist === 0) return;

        const nx = -dy / dist;
        const ny = dx / dist;

        const curve = hasReverse ? 38 : 16;
        const midX = (p1.x + p2.x) / 2 + nx * curve;
        const midY = (p1.y + p2.y) / 2 + ny * curve;

        // Vector from mid to p2
        const v2x = p2.x - midX;
        const v2y = p2.y - midY;
        const v2dist = Math.sqrt(v2x * v2x + v2y * v2y);

        // Start point on p1 perimeter
        const v1x = midX - p1.x;
        const v1y = midY - p1.y;
        const v1dist = Math.sqrt(v1x * v1x + v1y * v1y);
        const startX = p1.x + (v1x / v1dist) * this.nodeRadius;
        const startY = p1.y + (v1y / v1dist) * this.nodeRadius;

        // End point on p2 perimeter
        const endX = p2.x - (v2x / v2dist) * this.nodeRadius;
        const endY = p2.y - (v2y / v2dist) * this.nodeRadius;

        const d = `M ${startX} ${startY} Q ${midX} ${midY} ${endX} ${endY}`;
        const strokeColor = isActive ? '#f59e0b' : '#475569';

        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');

        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', d);
        path.setAttribute('fill', 'none');
        path.setAttribute('stroke', strokeColor);
        path.setAttribute('stroke-width', isActive ? '4' : '2.5');
        g.appendChild(path);

        // Arrowhead pointing along arrival vector
        const angle = Math.atan2(endY - midY, endX - midX);
        this.drawArrowhead(g, endX, endY, angle, strokeColor);

        // Label
        const labelText = edge.items.map(it => this.type === 'mealy' ? `${it.symbol}/${it.output}` : `${it.symbol}`).join(', ');
        const labelX = midX + nx * 10;
        const labelY = midY + ny * 10;

        const pillWidth = Math.max(labelText.length * 8 + 14, 28);
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('x', labelX - pillWidth / 2);
        rect.setAttribute('y', labelY - 12);
        rect.setAttribute('width', pillWidth);
        rect.setAttribute('height', '18');
        rect.setAttribute('rx', '4');
        rect.setAttribute('fill', isActive ? '#fef3c7' : '#ffffff');
        rect.setAttribute('stroke', strokeColor);
        rect.setAttribute('stroke-width', '1');
        g.appendChild(rect);

        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', labelX);
        text.setAttribute('y', labelY + 2);
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('font-size', '12');
        text.setAttribute('font-weight', '700');
        text.setAttribute('fill', isActive ? '#b45309' : '#0f172a');
        text.textContent = labelText;
        g.appendChild(text);

        this.edgesGroup.appendChild(g);
    }

    renderNodes() {
        for (const state of this.machine.states) {
            const pos = this.nodePositions[state];
            if (!pos) continue;

            const isActive = (this.activeState === state);
            const isStart = (this.machine.initialState === state);

            const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            g.setAttribute('class', 'diagram-node');
            g.setAttribute('data-state', state);
            g.setAttribute('transform', `translate(${pos.x}, ${pos.y})`);
            g.style.cursor = 'move';

            // Active glow
            if (isActive) {
                const glow = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                glow.setAttribute('r', this.nodeRadius + 8);
                glow.setAttribute('fill', 'none');
                glow.setAttribute('stroke', '#f59e0b');
                glow.setAttribute('stroke-width', '5');
                glow.setAttribute('opacity', '0.7');
                g.appendChild(glow);
            }

            // Circle
            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('r', this.nodeRadius);
            circle.setAttribute('fill', isActive ? '#fef3c7' : '#ffffff');
            circle.setAttribute('stroke', isActive ? '#d97706' : (isStart ? '#2563eb' : '#3b82f6'));
            circle.setAttribute('stroke-width', isStart ? '3.5' : '2.5');
            g.appendChild(circle);

            if (this.type === 'moore') {
                // Divided circle
                const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                line.setAttribute('x1', -this.nodeRadius + 4);
                line.setAttribute('y1', '0');
                line.setAttribute('x2', this.nodeRadius - 4);
                line.setAttribute('y2', '0');
                line.setAttribute('stroke', '#cbd5e1');
                line.setAttribute('stroke-width', '1.5');
                g.appendChild(line);

                const tName = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                tName.setAttribute('x', '0');
                tName.setAttribute('y', '-10');
                tName.setAttribute('text-anchor', 'middle');
                tName.setAttribute('font-size', '14');
                tName.setAttribute('font-weight', '700');
                tName.setAttribute('fill', '#0f172a');
                tName.textContent = state;
                g.appendChild(tName);

                const tOut = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                tOut.setAttribute('x', '0');
                tOut.setAttribute('y', '20');
                tOut.setAttribute('text-anchor', 'middle');
                tOut.setAttribute('font-size', '14');
                tOut.setAttribute('font-weight', '700');
                tOut.setAttribute('fill', '#7c3aed');
                tOut.textContent = this.machine.getStateOutput(state) || '—';
                g.appendChild(tOut);
            } else {
                // Centered name
                const tName = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                tName.setAttribute('x', '0');
                tName.setAttribute('y', '6');
                tName.setAttribute('text-anchor', 'middle');
                tName.setAttribute('font-size', '15');
                tName.setAttribute('font-weight', '700');
                tName.setAttribute('fill', '#0f172a');
                tName.textContent = state;
                g.appendChild(tName);
            }

            this.nodesGroup.appendChild(g);
        }
    }
}

if (typeof window !== 'undefined') {
    window.StateDiagramRenderer = StateDiagramRenderer;
}
