#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Get the path to version.json
const versionPath = path.join(__dirname, '../version.json');

// Read the current version.json
let versionData;
try {
  const versionContent = fs.readFileSync(versionPath, 'utf-8');
  versionData = JSON.parse(versionContent);
} catch (error) {
  console.error('Failed to read version.json:', error);
  process.exit(1);
}

// Increment the build number
versionData.build += 1;
versionData.date = new Date().toISOString();

// Write back to version.json
try {
  fs.writeFileSync(versionPath, JSON.stringify(versionData, null, 2), 'utf-8');
  console.log(`Build number incremented to ${versionData.build}`);
  console.log(`Version: ${versionData.version}-build.${versionData.build}`);
} catch (error) {
  console.error('Failed to write version.json:', error);
  process.exit(1);
}