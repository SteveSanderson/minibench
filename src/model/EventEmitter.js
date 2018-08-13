export class EventEmitter {
    constructor() {
        this.eventListeners = {};
    }

    on(eventName, callback, options) {
        const listeners = this.eventListeners[eventName] = this.eventListeners[eventName] || [];
        const handler = argsArray => {
            if (options && options.once) {
                const thisIndex = listeners.indexOf(handler);
                listeners.splice(thisIndex, 1);
            }

            callback.apply(null, argsArray);
        };

        listeners.push(handler);
    }

    once(eventName, callback) {
        this.on(eventName, callback, { once: true });
    }

    _emit(eventName, ...args) {
        const listeners = this.eventListeners[eventName];
        listeners && listeners.forEach(l => l.call(null, args));
    }
}
