const fs = require('fs');
const path = require('path');

// Read current version.json
const versionPath = path.join(__dirname, '..', 'version.json');
const packagePath = path.join(__dirname, '..', 'package.json');

const versionData = JSON.parse(fs.readFileSync(versionPath, 'utf-8'));
const packageData = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));

// Increment build number
versionData.build = (versionData.build || 0) + 1;
versionData.date = new Date().toISOString();

// Update package.json version string
const baseVersion = versionData.version;
packageData.version = `${baseVersion}-build.${versionData.build}`;

// Write updated files
fs.writeFileSync(versionPath, JSON.stringify(versionData, null, 2) + '\n');
fs.writeFileSync(packagePath, JSON.stringify(packageData, null, 2) + '\n');

console.log(`Build incremented to #${versionData.build}`);
console.log(`Version: ${packageData.version}`);
