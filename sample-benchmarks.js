import { group, benchmark, setup, teardown, HtmlUI } from '../src/minibench.js';

group('Basic functions', () => {
    setup(async () => {
        // Just to show we can do async setup at the group level
        // Runs once before all tests in the group
        console.log('In Basic functions setup');
        await delay(100);
    });

    teardown(async () => {
        // Just to show we can do async teardown at the group level
        // Runs once after all tests in the group
        console.log('In Basic functions teardown');
        await delay(100);
    });

    benchmark('Async operation', async () => {
        await delay(500);
        if (1 + 1 !== 2) { throw new Error('bad'); }
    }, {
        setup: () => console.log('In setup for Async operation'), // Per-benchmark setup
        teardown: () => console.log('In teardown for Async operation'), // Per-benchmark teardown
    });

    benchmark('Sum of logs', () => {
        let result = 0;
        for (var i = 0; i < 100000; i++) {
            result += Math.log(i);
            if (typeof result !== 'number') { throw new Error('fail'); }
        }
    });

    benchmark('No-op', () => { });

    benchmark('requestAnimationFrame callback', () => {
        return new Promise(resolve => requestAnimationFrame(resolve));
    });
});

group('HTTP requests', () => {
    benchmark('Fetch resource from same origin', async () => {
        const readmeResponse = await fetch('README.md');
        const readmeText = await readmeResponse.text();
        if (!readmeText.startsWith('# Minibench')) { throw new Error('fail') };
    });

    benchmark('Fetch resource from remote origin', async () => {
        const response = await fetch('https://api.github.com');
        const responseText = await response.text();
        console.log(responseText);
    });
});

new HtmlUI('Sample benchmarks', '#display');

function delay(duration) {
    return new Promise(resolve => setTimeout(resolve, duration));
}
