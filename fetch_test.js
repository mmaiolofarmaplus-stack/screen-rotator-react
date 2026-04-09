const fetch = require('node-fetch');
async function run() {
  const res = await fetch('https://docs.google.com/spreadsheets/d/1wf3hR0gX28TspJQqeaRNOMP1p4vU8ln9YSF37It9s8k/export?format=csv&gid=1915087423');
  const text = await res.text();
  console.log(text.substring(0, 500));
}
run();
