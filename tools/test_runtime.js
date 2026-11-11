const fs = require('fs');
const { JSDOM } = require('jsdom');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');

const errors = [];
const logs = [];

const dom = new JSDOM(html, {
    runScripts: 'dangerously',
    resources: 'usable',
    url: 'https://getbetterwithu.github.io/class-placement/',
    beforeParse(window) {
        window.addEventListener('error', (e) => {
            console.error('WINDOW ERROR:', e.error || e.message);
            errors.push(e.error ? (e.error.stack || e.error.message) : e.message);
        });
        window.console.error = (...args) => {
            console.error('CONSOLE ERROR:', ...args);
            errors.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '));
        };
        window.console.warn = (...args) => {
            console.warn('CONSOLE WARN:', ...args);
        };
        window.console.log = (...args) => {
            logs.push(args.join(' '));
        };
    }
});

// Wait for Babel to compile and React to render
setTimeout(() => {
    const root = dom.window.document.getElementById('root');
    console.log('\n--- ROOT HTML PREVIEW ---');
    console.log(root ? root.innerHTML.slice(0, 500) : 'ROOT NOT FOUND');
    console.log('\n--- TOTAL ERRORS ---:', errors.length);
    if (errors.length > 0) {
        console.error('Encountered errors:');
        errors.forEach((err, i) => console.error(`[${i}]`, err));
        process.exit(1);
    } else if (!root || root.innerHTML.trim() === '') {
        console.error('Root is empty! Rendering did not happen.');
        process.exit(1);
    } else {
        console.log('✅ Runtime rendering test passed! Root has content length:', root.innerHTML.length);
        process.exit(0);
    }
}, 6000);
