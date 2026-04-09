import fs from 'fs';

async function run() {
  const fetch = (await import('node-fetch')).default;
  
  const resMes = await fetch('https://docs.google.com/spreadsheets/d/1wf3hR0gX28TspJQqeaRNOMP1p4vU8ln9YSF37It9s8k/export?format=csv&gid=1168579076');
  const textMes = await resMes.text();
  console.log("--- Facturacion Mes ---");
  console.log(textMes.split('\n').slice(0, 5).join('\n'));

  const resObj = await fetch('https://docs.google.com/spreadsheets/d/1wf3hR0gX28TspJQqeaRNOMP1p4vU8ln9YSF37It9s8k/export?format=csv&gid=1915087423');
  const textObj = await resObj.text();
  console.log("\n--- Objetivos ---");
  console.log(textObj.split('\n').slice(0, 5).join('\n'));
}
run();
