import { Group } from './Group.js';
import { Benchmark } from './Benchmark.js';

export const groups = [];

export function group(name, configure) {
    groups.push(new Group(name));
    configure && configure();
}

export function benchmark(name, fn, options) {
    const group = groups[groups.length - 1];
    group.add(new Benchmark(group, name, fn, options));
}

export function setup(fn) {
    groups[groups.length - 1].setup = fn;
}

export function teardown(fn) {
    groups[groups.length - 1].teardown = fn;
}
