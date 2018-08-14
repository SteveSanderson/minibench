import { addToWorkQueue } from './WorkQueue.js';
import { EventEmitter } from './EventEmitter.js';
import { ExecutionTimer } from './ExecutionTimer.js';

export class Benchmark extends EventEmitter {
    constructor(group, name, fn, options) {
        super();
        this._group = group;
        this.name = name;
        this._fn = fn;
        this._options = options;
        this._state = { status: BenchmarkStatus.idle };
    }

    get state() {
        return this._state;
    }

    run(runOptions) {
        this._currentRunWasAborted = false;
        if (this._state.status === BenchmarkStatus.idle) {
            this._updateState({ status: BenchmarkStatus.queued });
            this.workQueueCancelHandle = addToWorkQueue(async () => {
                try {
                    if (!(runOptions && runOptions.skipGroupSetup)) {
                        await this._group.runSetup();
                    }

                    this._updateState({ status: BenchmarkStatus.running });
                    this._options && this._options.setup && await this._options.setup();
                    await this._measureTimings(runOptions);

                    this._options && this._options.teardown && await this._options.teardown();
                    if (this._currentRunWasAborted || !(runOptions && runOptions.skipGroupTeardown)) {
                        await this._group.runTeardown();
                    }

                    this._updateState({ status: BenchmarkStatus.idle });
                } catch (ex) {
                    this._updateState({ status: BenchmarkStatus.error });
                    console.error(ex);
                }
            });
        }
    }

    stop() {
        this._currentRunWasAborted = true;
        this.timer && this.timer.abort();
        this.workQueueCancelHandle && this.workQueueCancelHandle.cancel();
        this._updateState({ status: BenchmarkStatus.idle });
    }

    async _measureTimings(runOptions) {
        this._updateState({ numExecutions: 0, estimatedExecutionDurationMs: null });

        this.timer = new ExecutionTimer(this._fn);
        const updateTimingsDisplay = () => {
            this._updateState({
                numExecutions: this.timer.numExecutions,
                estimatedExecutionDurationMs: this.timer.bestExecutionsPerMs ? 1 / this.timer.bestExecutionsPerMs : null
            });
        };

        await this.timer.run(updateTimingsDisplay, { verifyOnly: runOptions.verifyOnly });
        updateTimingsDisplay()
        this.timer = null;
    }

    _updateState(newState) {
        Object.assign(this._state, newState);
        this._emit('changed', this._state);
    }
}

export const BenchmarkStatus = {
    idle: 0,
    queued: 1,
    running: 2,
    error: 3,
};
