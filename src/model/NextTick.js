const queue = [];
const messageIdentifier = 'nextTick-' + Math.random();

export function nextTick(callback) {
    queue.push(callback);
    window.postMessage(messageIdentifier, '*');
}

export function nextTickPromise() {
    return new Promise(resolve => nextTick(resolve));
}

window.addEventListener('message', evt => {
    if (evt.data === messageIdentifier) {
        evt.stopPropagation();
        const callback = queue.shift();
        callback && callback();
    }
});
