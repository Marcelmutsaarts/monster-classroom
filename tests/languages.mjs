import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { createServer } from 'node:http';
const html=await readFile('index.html');
const server=createServer((req,res)=>{res.setHeader('Content-Type','text/html; charset=utf-8');res.end(html);});
await new Promise(r=>server.listen(4173,'127.0.0.1',r));
const browser=await chromium.launch({headless:true,args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const page=await browser.newPage({viewport:{width:1440,height:1000}});
const errors=[];
page.on('pageerror',e=>errors.push(e.message));
await page.addInitScript(()=>{
 window.__speech=[];
 window.speechSynthesis.speak=u=>window.__speech.push({text:u.text,lang:u.lang});
 window.print=()=>{window.__printed=document.querySelector('#printSigns').innerText;};
});
await mkdir('test-results',{recursive:true});
const lang=async value=>{await page.locator('.language-select:visible').selectOption(value);assert.equal(await page.locator('html').getAttribute('lang'),value);};
const text=async(sel,expected)=>assert.ok((await page.locator(sel).innerText()).includes(expected),sel+' expected '+expected);
const go=async id=>{await page.goto('http://127.0.0.1:4173/#'+id);await page.waitForFunction(()=>!!window.__mc);};
try{
 await go('');
 await text('#v-home','Voor elke groep');
 await text('#gridAll','Geluidsmonster');
 await page.screenshot({path:'test-results/home-nl.png',fullPage:true});
 await lang('en');await text('#v-home','For every class');await text('#gridAll','Noise Monster');
 await page.reload();await page.waitForFunction(()=>!!window.__mc);
 assert.equal(await page.locator('html').getAttribute('lang'),'en');
 await lang('nl');

 await go('noise');await text('#nBubble','Kunnen jullie mij laten slapen?');
 // Permission is not requested: exercise the app's existing demo state in this isolated test.
 await page.evaluate(()=>{window.__mc.N.demo=true;document.querySelector('#nDemo').value='100';window.__mc.step(180,1/60);});
 await text('#nBubble','TE LUID');
 await lang('en');await text('#nBubble',"TOO LOUD");
 await lang('nl');
 await go('tidy');await page.locator('#tGo').click();await text('#tGo','Pauze');
 await lang('en');await text('#tGo','Pause');
 assert.ok(await page.evaluate(()=>window.__mc.T.run));
 await lang('nl');
 await page.evaluate(()=>{window.__mc.step(2,130);});
 await text('.tdone','Alles opgeruimd');
 await text('#tGo','Opnieuw');
 await go('ten');await page.locator('#fQs button[data-v="more"]').click();await page.locator('#fGo').click();await page.locator('#fRev').click();
 await text('#fAns','is tien');
 const n=await page.evaluate(()=>window.__mc.F.n);
 await lang('en');await text('#fAns','make ten');assert.equal(await page.evaluate(()=>window.__mc.F.n),n);
 await lang('nl');await page.locator('#fRev').click();
 assert.ok((await page.evaluate(()=>window.__speech)).some(u=>u.lang==='nl-NL'&&u.text.includes('is tien')));

 await go('names');await page.locator('#gEdit').click();await page.locator('#gText').fill('Sun\nEarth\nNoor');await page.locator('#gSave').click();
 await text('#gGrid','Sun');await text('#gGrid','Earth');
 await lang('en');await text('#gCount','0 of 3');
 await lang('nl');await text('#gCount','0 van 3');await text('#gGrid','Earth');
 await page.locator('#gGo').click();await page.waitForSelector('#gWin.open');
 await text('#gCount','1 van 3');await lang('en');await text('#gCount','1 of 3');
 await page.locator('#gClose').click();await lang('nl');
 await page.reload();await page.waitForFunction(()=>!!window.__mc);assert.equal(await page.locator('.ncard').count(),3);

 await go('planets');await page.waitForFunction(()=>document.querySelectorAll('#pLabels .plbl').length===9,{timeout:30000});
 await text('#pLabels','Aarde');
 await page.locator('#pLine').click();
 await text('#pSub','Elke meter');
 await page.locator('#pTl button[data-i="2"]').click();await text('#pInfo','Aarde');await text('#pInfo','365 dagen');
 await page.screenshot({path:'test-results/planets-nl.png'});
 const position=await page.evaluate(()=>window.__mc.P.pos);
 await lang('en');await text('#pInfo','Earth');await text('#pInfo','365 days');assert.equal(await page.evaluate(()=>window.__mc.P.pos),position);
 await page.locator('#pInfoX').click();await lang('nl');
 await page.locator('#pPrint').click();await page.waitForFunction(()=>!!window.__printed);
 assert.ok((await page.evaluate(()=>window.__printed)).includes('Neptunus'));
 assert.ok((await page.evaluate(()=>window.__printed)).includes('Op deze schaal'));

 for(const id of ['', 'noise','tidy','ten','names','planets']){
  await page.setViewportSize({width:390,height:844});
  await go(id);
  await page.screenshot({path:'test-results/mobile-'+(id||'home')+'.png',fullPage:true});
  const bounds=await page.locator('.language-select:visible').boundingBox();
  assert.ok(bounds&&bounds.x>=0&&bounds.x+bounds.width<=390,'Language switch fits mobile: '+id);
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'No horizontal overflow: '+id);
  await lang('en');await lang('nl');
 }
 assert.deepEqual(errors,[]);
 console.log('PASS: Dutch default, English fallback, persistence, all five tools, state preservation, names, speech language, planet cards and mobile layout.');
}finally{await writeFile('test-results/errors.json',JSON.stringify(errors,null,2));await browser.close();server.close();}
