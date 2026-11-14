// Transforma cada HTML de branding/src/html em PDF (cores de tela), converte para CMYK para a gráfica
// (branding/pdf) e gera as prévias em PNG (branding/previa).
// Rodar da raiz do repositório, com um servidor estático nela na porta 8771:
//   python3 -m http.server 8771 --bind 127.0.0.1 &
//   node branding/src/render.mjs
import { chromium } from 'playwright';
import { execFileSync } from 'node:child_process';
import { readdirSync, mkdirSync, rmSync, renameSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const htmlDir = join(root, 'branding/src/html');
const tmp = join(root, 'branding/src/out');
const pdfDir = join(root, 'branding/pdf');
const prevDir = join(root, 'branding/previa');
for (const d of [tmp, pdfDir, prevDir]) mkdirSync(d, { recursive: true });

const only = process.argv[2];
const files = readdirSync(htmlDir).filter((f) => f.endsWith('.html') && (!only || f.startsWith(only)));
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
for (const f of files) {
  const name = f.replace('.html', '');
  const p = await b.newPage();
  await p.goto(`http://127.0.0.1:8771/branding/src/html/${f}`, { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(300);
  const rgb = join(tmp, `${name}-rgb.pdf`);
  await p.pdf({ path: rgb, preferCSSPageSize: true, printBackground: true });
  await p.close();
  // CMYK para a gráfica (as cores e as imagens são convertidas; as fontes ficam embutidas)
  const cmyk = join(pdfDir, `${name}.pdf`);
  execFileSync('gs', ['-q', '-o', cmyk, '-sDEVICE=pdfwrite', '-dPDFSETTINGS=/prepress', '-dCompatibilityLevel=1.6',
    '-sColorConversionStrategy=CMYK', '-sProcessColorModel=DeviceCMYK', '-dAutoRotatePages=/None', rgb]);
  // prévias de cada página, a partir do arquivo CMYK (é o que a gráfica vai receber)
  for (const old of readdirSync(prevDir).filter((x) => x.startsWith(name + '-'))) rmSync(join(prevDir, old));
  execFileSync('pdftoppm', ['-r', '150', '-png', cmyk, join(prevDir, name)]);
  const pages = readdirSync(prevDir).filter((x) => x.startsWith(name + '-')).sort();
  const labels = pages.length === 2 ? ['frente', 'verso'] : pages.map((_, i) => `pagina-${i + 1}`);
  pages.forEach((x, i) => renameSync(join(prevDir, x), join(prevDir, `${name}-${labels[i]}.png`)));
  console.log('ok', name, pages.length, 'página(s)');
}
await b.close();
