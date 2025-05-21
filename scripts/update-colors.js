#!/usr/bin/env node

/**
 * Color Update Script
 * 
 * This script updates all gold colors to the new purple color scheme
 * throughout the codebase.
 * 
 * Usage: node scripts/update-colors.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Color mapping
const colorMap = {
  // Main gold colors to purple
  '#552a47': '#552a47', // Main gold to main purple
  '#552a47': '#552a47', // Another gold shade to main purple
  '#7a3e68': '#7a3e68', // Gold to lighter purple
  '#693658': '#693658', // Gold hover to purple hover
  
  // Background and subtle colors
  '#f4ebf1': '#f4ebf1', // Light gold bg to light purple bg
  '#f4ebf1': '#f4ebf1', // Another light gold bg
  '#e5d6e0': '#e5d6e0', // Gold border to purple border
  '#f4ebf1': '#f4ebf1', // Another light gold
  '#f9f4f7': '#f9f4f7', // Very light gold to very light purple
  
  // Text colors
  '#8a7a85': '#8a7a85', // Gold text to purple text
  
  // Gradients and transparent colors
  'linear-gradient(180deg, #552a47 0%, #3d1f33 100%)': 'linear-gradient(180deg, #552a47 0%, #3d1f33 100%)',
  '#552a4733': '#552a4733', // Transparent gold to transparent purple
  '#552a4733': '#552a4733', // Another transparent gold
};

// File extensions to process
const extensions = ['.tsx', '.ts', '.js', '.jsx', '.css', '.scss', '.html'];

// Directories to exclude
const excludeDirs = ['node_modules', '.git', '.meteor', 'public'];

// Find all files to process
function findFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !excludeDirs.includes(file)) {
      findFiles(filePath, fileList);
    } else if (stat.isFile() && extensions.includes(path.extname(file))) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// Process a single file
function processFile(filePath) {
  console.log(`Processing ${filePath}...`);
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;
  
  // Replace all color occurrences
  for (const [oldColor, newColor] of Object.entries(colorMap)) {
    if (content.includes(oldColor)) {
      content = content.split(oldColor).join(newColor);
      changed = true;
    }
  }
  
  // Save file if changed
  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`  Updated colors in ${filePath}`);
    return true;
  }
  
  return false;
}

// Main function
function main() {
  const rootDir = path.resolve(__dirname, '..');
  console.log(`Searching for files in ${rootDir}...`);
  
  const files = findFiles(rootDir);
  console.log(`Found ${files.length} files to process.`);
  
  let updatedCount = 0;
  
  files.forEach(file => {
    if (processFile(file)) {
      updatedCount++;
    }
  });
  
  console.log(`\nColor update complete! Updated ${updatedCount} files.`);
}

// Run the script
main();
