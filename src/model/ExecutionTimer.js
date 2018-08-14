import { nextTickPromise } from './NextTick.js';

/*
    To work around browsers' current nonsupport for high-resolution timers
    (since Spectre etc.), the approach used here is to group executions into
    blocks of roughly fixed duration.
    
    - In each block, we execute the test code as many times as we can until
      the end of the block duration, without even yielding the thread if
      it's a synchronous call. We count how many executions completed. It
      will always be at least 1, even if the single call duration is longer
      than the intended block duration.
    - Since each block is of a significant duration (e.g., 0.5 sec), the low
      resolution of the timer doesn't matter. We can divide the measured block
      duration by the measured number of executions to estimate the per-call
      duration.
    - Each block will give us a different estimate. We want to return the *best*
      timing, not the mean or median. That's the most accurate predictor of the
      true execution cost, as hopefully there will have been at least one block
      during which there was no unrelated GC cycle or other background contention.
    - We keep running blocks until some larger timeout occurs *and* we've done
      at least some minimum number of executions.
    
    Note that this approach does *not* allow for per-execution setup/teardown
    logic whose timing is separated from the code under test. Because of the
    low timer precision, there would be no way to separate the setup duration
    from the test code duration if they were interleaved too quickly (e.g.,
    if the test code was < 1ms). We do support per-benchmark setup/teardown,
    but not per-execution.
*/

const totalDurationMs = 6000;
const blockDurationMs = 400;
const minExecutions = 10;

export class ExecutionTimer {
    constructor(fn) {
        this._fn = fn;
    }

    async run(progressCallback, runOptions) {
        this._isAborted = false;
        this.numExecutions = 0;
        this.bestExecutionsPerMs = null;

        // 'verify only' means just do a single execution to check it doesn't error
        const targetBlockDuration = runOptions.verifyOnly ? 1 : blockDurationMs;
        const targetMinExecutions = runOptions.verifyOnly ? 1 : minExecutions;
        const targetTotalDuration = runOptions.verifyOnly ? 0 : totalDurationMs;

        const endTime = performance.now() + targetTotalDuration;
        while (performance.now() < endTime || this.numExecutions < targetMinExecutions) {
            if (this._isAborted) {
                this.numExecutions = 0;
                this.bestExecutionsPerMs = null;
                break;
            }

            const { blockDuration, blockExecutions } = await this._runBlock(targetBlockDuration);
            this.numExecutions += blockExecutions;

            const blockExecutionsPerMs = blockExecutions / blockDuration;
            if (blockExecutionsPerMs > this.bestExecutionsPerMs) {
                this.bestExecutionsPerMs = blockExecutionsPerMs;
            }

            progressCallback && progressCallback();
        }
    }

    abort() {
        this._isAborted = true;
    }

    async _runBlock(targetBlockDuration) {
        await nextTickPromise();

        const blockStartTime = performance.now();
        const blockEndTime = blockStartTime + targetBlockDuration;
        let executions = 0;

        while ((performance.now() < blockEndTime) && !this._isAborted) {
            const syncResult = this._fn();

            // Only yield the thread if we really have to
            if (syncResult instanceof Promise) {
                await syncResult;
            }

            executions++;
        }

        return {
            blockDuration: performance.now() - blockStartTime,
            blockExecutions: executions
        };
    }
}
