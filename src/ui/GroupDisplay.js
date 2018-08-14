import { BenchmarkDisplay } from './BenchmarkDisplay.js';
import { BenchmarkStatus } from '../model/Benchmark.js';

export class GroupDisplay {
    constructor(htmlUi, group) {
        this.group = group;

        this.elem = document.createElement('div');
        this.elem.className = 'my-3 py-2 bg-white rounded shadow-sm';
        
        const headerContainer = this.elem.appendChild(document.createElement('div'));
        headerContainer.className = 'd-flex align-items-baseline px-4';
        const header = headerContainer.appendChild(document.createElement('h5'));
        header.className = 'py-2';
        header.textContent = group.name;

        this.runButton = document.createElement('a');
        this.runButton.className = 'ml-auto run-button';
        this.runButton.setAttribute('href', '');
        headerContainer.appendChild(this.runButton);
        this.runButton.textContent = 'Run all';
        this.runButton.onclick = evt => {
            evt.preventDefault();
            group.runAll(htmlUi.globalRunOptions);
        };

        const table = this.elem.appendChild(document.createElement('table'));
        table.className = 'table mb-0 benchmarks';
        const tbody = table.appendChild(document.createElement('tbody'));

        group.benchmarks.forEach(benchmark => {
            const benchmarkDisplay = new BenchmarkDisplay(htmlUi, benchmark);
            tbody.appendChild(benchmarkDisplay.elem);
        });

        group.on('changed', () => this.updateDisplay());
        this.updateDisplay();
    }

    updateDisplay() {
        const canRun = this.group.status === BenchmarkStatus.idle;
        this.runButton.style.display = canRun ? 'block' : 'none';
    }
}
