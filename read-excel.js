const XLSX = require('xlsx');

const workbook = XLSX.readFile('XcellCamCloud  VSaaS  Quote Calc.xlsx');
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(worksheet);

console.log('Excel data:');
console.log(JSON.stringify(data, null, 2));
