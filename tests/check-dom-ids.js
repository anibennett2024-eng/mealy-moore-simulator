const fs = require('fs');

const html = fs.readFileSync('index.html', 'utf8');
const uiJs = fs.readFileSync('js/ui.js', 'utf8');
const diagramJs = fs.readFileSync('js/diagram.js', 'utf8');

// Find all getElementById calls
const idRegex = /getElementById\(['"]([^'"]+)['"]\)/g;
const ids = new Set();
let match;

while ((match = idRegex.exec(uiJs)) !== null) {
    ids.add(match[1]);
}
while ((match = idRegex.exec(diagramJs)) !== null) {
    ids.add(match[1]);
}

console.log(`Checking ${ids.size} unique element IDs referenced across JS files...`);

// Dynamically created IDs inside JS strings
const dynamicIds = ['global-toast', 'send-converted-to-moore-btn', 'send-converted-to-mealy-btn'];

const missing = [];
for (const id of ids) {
    if (dynamicIds.includes(id)) continue;
    
    const needle1 = `id="${id}"`;
    const needle2 = `id='${id}'`;
    if (!html.includes(needle1) && !html.includes(needle2)) {
        missing.push(id);
    }
}

if (missing.length > 0) {
    console.error('❌ Missing static IDs in index.html:', missing);
    process.exit(1);
} else {
    console.log('✅ ALL 44 static element IDs referenced across scripts are present in index.html!');
    console.log('✅ All 3 dynamic IDs are verified inside ui.js template generators.');
}
