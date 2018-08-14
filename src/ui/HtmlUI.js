import { groups } from '../model/Registry.js';
import { GroupDisplay } from './GroupDisplay.js';
import { BenchmarkStatus } from '../model/Benchmark.js';

export class HtmlUI {
    constructor(title, selector) {
        this.containerElement = document.querySelector(selector);

        const headerDiv = this.containerElement.appendChild(document.createElement('div'));
        headerDiv.className = 'd-flex align-items-center';

        const header = headerDiv.appendChild(document.createElement('h2'));
        header.className = 'mx-3 flex-grow-1';
        header.textContent = title;

        const verifyCheckboxLabel = document.createElement('label');
        verifyCheckboxLabel.className = 'ml-auto mr-5';
        headerDiv.appendChild(verifyCheckboxLabel);
        this.verifyCheckbox = verifyCheckboxLabel.appendChild(document.createElement('input'));
        this.verifyCheckbox.type = 'checkbox';
        this.verifyCheckbox.className = 'mr-2';
        verifyCheckboxLabel.appendChild(document.createTextNode('Verify only'));

        this.runButton = document.createElement('button');
        this.runButton.className = 'btn btn-success ml-auto px-4 run-button';
        headerDiv.appendChild(this.runButton);
        this.runButton.textContent = 'Run all';
        this.runButton.onclick = () => {
            groups.forEach(g => g.runAll(this.globalRunOptions));
        };

        this.stopButton = document.createElement('button');
        this.stopButton.className = 'btn btn-danger ml-auto px-4 stop-button';
        headerDiv.appendChild(this.stopButton);
        this.stopButton.textContent = 'Stop';
        this.stopButton.onclick = () => {
            groups.forEach(g => g.stopAll());
        };

        groups.forEach(group => {
            const groupDisplay = new GroupDisplay(this, group);
            this.containerElement.appendChild(groupDisplay.elem);
            group.on('changed', () => this.updateDisplay());
        });

        this.updateDisplay();
    }

    updateDisplay() {
        const isAnyRunning = groups.reduce(
            (prev, next) => prev || next.status === BenchmarkStatus.running,
            false
        );
        this.runButton.style.display = isAnyRunning ? 'none' : 'block';
        this.stopButton.style.display = isAnyRunning ? 'block' : 'none';
    }

    get globalRunOptions() {
        return { verifyOnly: this.verifyCheckbox.checked };
    }
}
