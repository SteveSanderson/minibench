import { BenchmarkStatus } from '../model/Benchmark.js';

export class BenchmarkDisplay {
    constructor(htmlUi, benchmark) {
        this.benchmark = benchmark;
        this.elem = document.createElement('tr');
        
        const headerCol = this.elem.appendChild(document.createElement('th'));
        headerCol.className = 'pl-4';
        headerCol.textContent = benchmark.name;
        headerCol.setAttribute('scope', 'row');

        const progressCol = this.elem.appendChild(document.createElement('td'));
        this.numExecutionsText = progressCol.appendChild(document.createTextNode(''));

        const timingCol = this.elem.appendChild(document.createElement('td'));
        this.executionDurationText = timingCol.appendChild(document.createElement('span'));
        
        const runCol = this.elem.appendChild(document.createElement('td'));
        runCol.className = 'pr-4';
        runCol.setAttribute('align', 'right');
        this.runButton = document.createElement('a');
        this.runButton.className = 'run-button';
        runCol.appendChild(this.runButton);
        this.runButton.textContent = 'Run';
        this.runButton.onclick = evt => {
            evt.preventDefault();
            this.benchmark.run(htmlUi.globalRunOptions);
        };

        benchmark.on('changed', state => this.updateDisplay(state));
        this.updateDisplay(this.benchmark.state);
    }

    updateDisplay(state) {
        const benchmark = this.benchmark;
        this.elem.className = rowClass(state.status);
        this.runButton.textContent = runButtonText(state.status);
        this.numExecutionsText.textContent = state.numExecutions
            ? `Executions: ${state.numExecutions}` : '';
        this.executionDurationText.innerHTML = state.estimatedExecutionDurationMs
            ? `Duration: <b>${parseFloat(state.estimatedExecutionDurationMs.toPrecision(3))}ms</b>` : '';
        if (state.status === BenchmarkStatus.idle) {
            this.runButton.setAttribute('href', '');
        } else {
            this.runButton.removeAttribute('href');
            if (state.status === BenchmarkStatus.error) {
                this.numExecutionsText.textContent = 'Error - see console';
            }
        }
    }
}

function runButtonText(status) {
    switch (status) {
        case BenchmarkStatus.idle:
        case BenchmarkStatus.error:
            return 'Run';
        case BenchmarkStatus.queued:
            return 'Waiting...';
        case BenchmarkStatus.running:
            return 'Running...';
        default:
            throw new Error(`Unknown status: ${status}`);
    }
}

function rowClass(status) {
    switch (status) {
        case BenchmarkStatus.idle:
            return 'benchmark-idle';
        case BenchmarkStatus.queued:
            return 'benchmark-waiting';
        case BenchmarkStatus.running:
            return 'benchmark-running';
        case BenchmarkStatus.error:
            return 'benchmark-error';
        default:
            throw new Error(`Unknown status: ${status}`);
    }
}
