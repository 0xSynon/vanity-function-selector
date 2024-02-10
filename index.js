#!/usr/bin/env node

process.argv.shift();
process.argv.shift();

if (process.argv.length < 2) {
  console.log('Usages: npx vanity-function-selector <pattern|byte-difficulty> <function-name> [ARG_TYPE]...\n');
  console.log('Examples:');
  console.log('  $ npx vanity-function-selector 2 mint');
  console.log('  $ npx vanity-function-selector 0xf0f0 bridge address address uint256');
  process.exit(1);
}

const { ethers } = require('ethers');

let start;

const byteDifficultyOrPattern = process.argv.shift();
const byteDifficulty = parseInt(byteDifficultyOrPattern);
if (!/^0x[0-9a-fA-F]{0,8}$/.test(byteDifficultyOrPattern)) {
  if (isNaN(byteDifficulty)) {
    console.error('[FATAL] Invalid byte difficulty or pattern', byteDifficultyOrPattern);
    process.exit(1);
  }
  if (byteDifficulty > 4) {
    console.error('[FATAL] Byte difficulty cannot be higher than 4');
    process.exit(1);
  }
  start = '0x' + '0'.repeat(byteDifficulty * 2);
} else {
  start = byteDifficultyOrPattern;
}

const functionName = process.argv.shift();

if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(functionName)) {
  console.error('[FATAL] Invalid function name', functionName);
  process.exit(1);
}

const functionArgTypes = Array.from(process.argv);
if (functionArgTypes.length > 0) {
  console.warn('[WARN] Argument types are not checked for validity. I hope you know what you are doing');
}

process.stdout.write('Computing... ');


function getHash(input) {
  return ethers.utils.solidityKeccak256(['string'], [input]);
}

function getFQFN(suffix) {
  return `${functionName}${suffix}(${functionArgTypes.join(',')})`;;
}

async function findSuffix() {
  console.log(`Looking for a suffix for function ${functionName}(${functionArgTypes.join(',')}) to get a signature starting with ${start}`);
  const characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_';
  let suffix = '';
  let hash = getHash(getFQFN(suffix));
  let attempts = 0;

  // Function to generate all possible combinations of the characters
  function* generateCombinations(length, prefix = '') {
    if (length === 0) {
      yield prefix;
    } else {
      for (let i = 0; i < characters.length; i++) {
        yield* generateCombinations(length - 1, prefix + characters[i]);
      }
    }
  }

  for (let length = 1; !hash.startsWith(start); length++) {
    for (let combo of generateCombinations(length)) {
      suffix = combo;
      const fqfn = getFQFN(suffix);
      hash = getHash(fqfn);
      attempts++;
      if (hash.startsWith(start)) break;
    }
  }

  return { suffix, hash, attempts };
}

if (require.main === module) {
  findSuffix().then(({ suffix, hash, attempts }) => {
    console.log(`Found suffix: "${suffix}" after ${attempts} attempts`);
    console.log(hash.substr(0, 10), ':', getFQFN(suffix));
  }).catch(e => {
    console.error(e);
    process.exitCode = 1;
  });
}
