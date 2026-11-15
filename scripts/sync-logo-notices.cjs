// Generic Tabler glyph attribution only; official module logos are not part of the UI or manual.
const fs=require('fs');
const icons=require('../app/data/module-icon-attributions.json');
const heading='汎用モジュールアイコンの出典・ライセンス';
const esc=s=>String(s??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const iconList=icons.items.map(i=>`<li>${esc(i.id)}: ${esc(i.icon)} — <a href="${esc(i.sourceUrl)}">Tabler SVG</a></li>`).join('');
const section=`<section><h2>${heading}</h2><p>${esc(icons.attribution)}</p><ul>${iconList}</ul><p><a href="third-party/TABLER-ICONS-LICENSE.txt">${esc(icons.licenseLabel)} 全文</a></p></section>`;
const head='<!doctype html><html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src \'none\'; img-src \'self\'; style-src \'self\' \'unsafe-inline\'; script-src \'self\'; connect-src \'none\'; base-uri \'none\'; form-action \'none\'"><title>'+heading+'</title><link rel="stylesheet" href="manual.css"></head>';
fs.writeFileSync('docs/manual/logo-notices.html',head+`<body><main class="logo-credits"><h1>${heading}</h1><p>このツールは汎用のアウトラインアイコンを使用します。対象プロジェクトの公式ロゴ画像は掲載していません。</p><nav><a href="index.html">操作マニュアル</a> · <a href="recipes.html">レシピ集</a></nav>${section}<p><a href="THIRD_PARTY_NOTICES.txt">第三者著作権表示</a> · <a href="LICENSE.txt">アプリ本体の利用許諾</a></p></main></body></html>`);
for(const page of ['index.html','recipes.html']){
  let text=fs.readFileSync('docs/manual/'+page,'utf8');
  const block=`<aside class="note module-logo-attributions" id="module-logo-attributions"><strong>${heading}</strong><p>${esc(icons.attribution)}</p><a href="logo-notices.html">アイコンの出典・ライセンス全文</a></aside>`;
  text=text.replace(/<aside class="note module-logo-attributions"[\s\S]*?<\/aside>/,'');
  text=text.replace('<footer',block+'<footer');
  fs.writeFileSync('docs/manual/'+page,text);
}
console.log('Generated generic module icon attribution only.');
