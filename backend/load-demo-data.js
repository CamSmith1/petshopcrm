// Script to load demo data directly
const { addDemoData } = require('./demo-data');

// Run the demo data loader
(async () => {
  console.log('Loading demo data...');
  await addDemoData();
  console.log('Demo data loading complete. You can now exit this script (Ctrl+C).');
})();