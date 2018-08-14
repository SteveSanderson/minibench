import { EventEmitter } from './EventEmitter.js';
import { BenchmarkStatus } from './Benchmark.js';

export class Group extends EventEmitter {
    constructor(name) {
        super();
        this.name = name;
        this.benchmarks = [];
    }

    add(benchmark) {
        this.benchmarks.push(benchmark);
        benchmark.on('changed', () => this._emit('changed'));
    }

    runAll(runOptions) {
        this.benchmarks.forEach((benchmark, index) => {
            benchmark.run(Object.assign({
                skipGroupSetup: index > 0,
                skipGroupTeardown: index < this.benchmarks.length - 1,
            }, runOptions));
        });
    }

    stopAll() {
        this.benchmarks.forEach(b => b.stop());
    }

    async runSetup() {
        this.setup && await this.setup();
    }

    async runTeardown() {
        this.teardown && await this.teardown();
    }

    get status() {
        return this.benchmarks.reduce(
            (prev, next) => Math.max(prev, next.state.status),
            BenchmarkStatus.idle
        );
    }
}
