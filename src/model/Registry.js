import { Group } from './Group.js';
import { Benchmark } from './Benchmark.js';

let currentGroupSetup;
let currentGroupTeardown;

export const groups = [];

export function group(name, configure) {
    currentGroupSetup = null;
    currentGroupTeardown = null;

    groups.push(new Group(name));
    configure && configure();
}

export function benchmark(name, fn, options) {
    options = Object.assign({
        setup: currentGroupSetup,
        teardown: currentGroupTeardown,
    }, options);

    groups[groups.length - 1].add(new Benchmark(name, fn, options));
}

export function setup(fn) {
    currentGroupSetup = fn;
}

export function teardown(fn) {
    currentGroupTeardown = fn;
}
