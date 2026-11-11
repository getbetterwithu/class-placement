const fs = require('fs');
const vm = require('vm');

const path = require('path');
const baseDir = path.resolve(__dirname, '..');

const preamble = fs.readFileSync(path.join(baseDir, 'tools/preamble.html'), 'utf8');
const assets = fs.readFileSync(path.join(baseDir, 'src/assets.js'), 'utf8');
const sample = fs.readFileSync(path.join(baseDir, 'src/sample_data.js'), 'utf8');
const app = fs.readFileSync(path.join(baseDir, 'src/app.jsx'), 'utf8');

// Extract Babel script (script index 2)
const scripts = [];
const re = /<script[^>]*>([\s\S]*?)<\/script>/gi;
let m;
while ((m = re.exec(preamble)) !== null) {
    scripts.push(m[1]);
}

console.log('Total scripts found in preamble:', scripts.length);
const babelCode = scripts[2];
console.log('Babel code length:', babelCode.length);

const sandbox = {
    window: {},
    document: {},
    navigator: { userAgent: 'node' },
    console: console,
};
sandbox.window = sandbox;
sandbox.global = sandbox;
vm.createContext(sandbox);

try {
    vm.runInContext(babelCode, sandbox);
    console.log('Babel loaded in sandbox!');
} catch (e) {
    console.error('Failed to load Babel:', e);
    process.exit(1);
}

const Babel = sandbox.Babel || sandbox.window.Babel;
if (!Babel) {
    console.error('Babel object not found in sandbox');
    console.log('Available keys:', Object.keys(sandbox).filter(k => !['window','document','navigator','console','global'].includes(k)));
    process.exit(1);
}

console.log('Babel available! Testing compilation of assets + sample + app...');
const fullCode = assets + '\n' + sample + '\n' + app;

try {
    const res = Babel.transform(fullCode, { presets: ['react'] });
    console.log('✅ Babel compilation SUCCESS! Output length:', res.code.length);
} catch (err) {
    console.error('❌ BABEL COMPILATION ERROR:');
    console.error(err.message);
    if (err.loc) {
        console.error('Location: line', err.loc.line, 'col', err.loc.column);
        const lines = fullCode.split('\n');
        const start = Math.max(0, err.loc.line - 5);
        const end = Math.min(lines.length, err.loc.line + 5);
        for (let i = start; i < end; i++) {
            console.error(`${i + 1}: ${lines[i]}`);
        }
    }
}
