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

    runAll() {
        this.benchmarks.forEach(b => b.run());
    }

    stopAll() {
        this.benchmarks.forEach(b => b.stop());
    }

    get status() {
        return this.benchmarks.reduce(
            (prev, next) => Math.max(prev, next.state.status),
            BenchmarkStatus.idle
        );
    }
}
