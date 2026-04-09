import fs from 'fs';
async function run() {
  const res = await fetch('https://docs.google.com/spreadsheets/d/1wf3hR0gX28TspJQqeaRNOMP1p4vU8ln9YSF37It9s8k/htmlview');
  const text = await res.text();
  fs.writeFileSync('htmlview.html', text);
}
run();
