let currentPromise = new Promise(resolve => resolve());

export function addToWorkQueue(fn) {
    const cancelHandle = new CancelHandle();
    currentPromise = currentPromise.then(() => cancelHandle.isCancelled || fn());
    return cancelHandle;
}

class CancelHandle {
    cancel() {
        this.isCancelled = true;
    }
}
