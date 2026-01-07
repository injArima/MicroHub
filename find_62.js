
import { readFileSync } from 'fs';
const data = JSON.parse(readFileSync('output.json', 'utf8'));

function findVal(obj, val, path = '') {
    if (obj === val) {
        console.log(`Found ${val} at: ${path}`);
    }
    if (typeof obj === 'object' && obj !== null) {
        for (const key in obj) {
            findVal(obj[key], val, `${path}.${key}`);
        }
    }
}

findVal(data, 62);
findVal(data, "62");
