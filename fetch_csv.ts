import fs from 'fs';

async function run() {
  try {
    const html = fs.readFileSync('new_sheet.html', 'utf8');
    let p = 0;
    while (true) {
      const index1 = html.indexOf('Acumulado Clientes', p);
      if (index1 === -1) break;
      console.log("Found at", index1);
      console.log(html.substring(index1 - 100, index1 + 100));
      p = index1 + 1;
    }
  } catch (e) {
    console.error(e);
  }
}
run();
