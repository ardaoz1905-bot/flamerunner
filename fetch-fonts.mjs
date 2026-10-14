// Silkscreen + Pixelify Sans fontlarını indirip www/fonts içine koyar,
// index.html'i internetsiz (offline) çalışacak şekilde günceller.
// Başarısız olursa oyun yine çalışır (çevrimiçi fontlara döner).
import fs from 'node:fs';
import path from 'node:path';

const UA = 'Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Mobile Safari/537.36';
const URLS = [
  'https://fonts.googleapis.com/css2?family=Silkscreen&display=swap',
  'https://fonts.googleapis.com/css2?family=Pixelify+Sans:wght@400;500;600;700&display=swap'
];
const dir = 'www/fonts';

try {
  fs.mkdirSync(dir, { recursive: true });
  let css = '';
  let n = 0;
  for (const u of URLS) {
    const res = await fetch(u, { headers: { 'User-Agent': UA } });
    if (!res.ok) throw new Error('CSS indirilemedi: ' + res.status);
    let t = await res.text();
    const files = [...new Set([...t.matchAll(/url\((https:[^)]+)\)/g)].map(m => m[1]))];
    for (const f of files) {
      const r = await fetch(f);
      if (!r.ok) throw new Error('Font indirilemedi: ' + r.status);
      const name = 'f' + (n++) + '.woff2';
      fs.writeFileSync(path.join(dir, name), Buffer.from(await r.arrayBuffer()));
      t = t.split(f).join(name);
    }
    css += t + '\n';
  }
  fs.writeFileSync(path.join(dir, 'fonts.css'), css);

  let h = fs.readFileSync('www/index.html', 'utf8');
  h = h.replace(/<link rel="preconnect"[^>]*>\s*/g, '')
       .replace(/<link href="https:\/\/fonts\.googleapis\.com[^>]*>\s*/g, '');
  if (!h.includes('fonts/fonts.css')) {
    h = h.replace('<style>', '<link rel="stylesheet" href="fonts/fonts.css">\n<style>');
  }
  fs.writeFileSync('www/index.html', h);
  console.log('Fontlar indirildi (' + n + ' dosya). Oyun artık offline çalışır.');
} catch (e) {
  console.warn('Font indirilemedi, çevrimiçi fontlar kullanılacak: ' + e.message);
}
