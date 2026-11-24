const fs = require('node:fs');
const assert = require('node:assert/strict');
const path = require('node:path');
const root = path.resolve(__dirname, '../../../..');
const { launchChrome } = require(root + '/tests/cdp.js');
const engine = require(root + '/quiz-engine.js');
const html = fs.readFileSync(root + '/index.html').toString('base64');
const engineSource = fs.readFileSync(root + '/quiz-engine.js').toString('base64');
const report = { method: 'Original HTML in Chrome; all requests intercepted before transmission; only HTML and quiz-engine.js fulfilled from local files', cases:[], errors:[] };
let page;
(async()=>{
    page = await launchChrome({chromePath:'/usr/bin/google-chrome'});
    page.on('Runtime.exceptionThrown',({exceptionDetails})=>report.errors.push(exceptionDetails.exception?.description || exceptionDetails.text));
    page.on('Fetch.requestPaused',({requestId,request,resourceType})=>{
        const url=new URL(request.url);
        let body=null,type='text/html; charset=utf-8';
        if(resourceType==='Document') body=html;
        else if(url.pathname==='/quiz-engine.js') {body=engineSource;type='application/javascript';}
        const promise=body!==null?page.send('Fetch.fulfillRequest',{requestId,responseCode:200,responseHeaders:[{name:'Content-Type',value:type}],body}):page.send('Fetch.failRequest',{requestId,errorReason:'BlockedByClient'});
        promise.catch(error=>report.errors.push(error.message));
    });
    await page.send('Fetch.enable',{patterns:[{urlPattern:'*',requestStage:'Request'}]});
    await page.send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
    const addresses=[
        'https://quiz-audit.invalid/?preview','https://quiz-audit.invalid/?preview=1',
        'https://quiz-audit.invalid/?preview=false','https://quiz-audit.invalid/#preview',
        'https://quiz-audit.invalid/?utm_campaign=preview_newsletter',
        'https://quiz-audit.invalid/?utm_content=preview','https://quiz-audit.invalid/?notpreview=1',
        'http://localhost/','http://127.0.0.1/','http://127.0.0.2/','http://[::1]/'
    ];
    for(const address of addresses){
        await page.navigate(address);
        await page.waitFor('!isPreview || Boolean(document.querySelector("#resultSummary")?.textContent)');
        const result=await page.evaluate(`({hostname:location.hostname,preview:window.isPreview,collection:window.coletaHabilitada,commands:dataLayer.filter(x=>x&&typeof x[0]==='string').map(x=>Array.from(x)),tagCount:document.querySelectorAll('script[src*="googletagmanager.com/gtag/js"]').length,results:document.querySelectorAll('.results').length})`);
        report.cases.push({address,...result});
    }
    await page.navigate('https://quiz-audit.invalid/');
    await page.evaluate('document.querySelector("#startButton").click()');
    await page.waitFor('Boolean(document.querySelector("#options > *")) && !isTransitioning');
    const answers={gamesPerYear:15,gamesHistory:'unknown',wantsGuaranteedTicket:true,buysTwoTickets:false,kidsCount:0,needsPriority:true,wantsParticipation:true,wantsStoreDiscount:true,gameFrequency:'always',digitalExperience:true,budget:200,preferredSector:'blue'};
    for(let i=0;i<engine.questions.length;i++){
        const q=engine.questions[i], value=answers[q.key];
        if(q.type==='range'){
            if(value==='unknown') await page.evaluate('document.querySelector("#unknownToggle").click()');
            else await page.evaluate(`(()=>{const input=document.querySelector('#rangeInput');input.value=${JSON.stringify(String(value))};input.dispatchEvent(new Event('input',{bubbles:true}));})()`);
        }else{
            const index=q.options.findIndex(x=>Object.is(x.value,value));assert.ok(index>=0,q.key);
            await page.evaluate(`document.querySelector('.option[data-option-index="${index}"]').click()`);
        }
        await page.evaluate('document.querySelector("#nextButton").click()');
        if(i<engine.questions.length-1)await page.waitFor(`state.step===${i+1} && document.querySelector('#stepCounter')?.textContent.trim()==='Pergunta ${i+2} de 12' && !isTransitioning`);
    }
    await page.waitFor('Boolean(document.querySelector("#resultSummary")?.textContent) && !isTransitioning');
    const events=await page.evaluate('dataLayer.filter(x=>x&&x[0]==="event").map(x=>({name:x[1],params:x[2]}))');
    const complete=events.filter(x=>x.name==='quiz_complete');assert.equal(complete.length,1);
    assert.equal(complete[0].params.rules_version,engine.recommendPlans(answers).rulesVersion);
    assert.equal(complete[0].params.catalog_version,engine.CATALOG_VERSION);
    assert.equal(events.filter(x=>x.name==='quiz_start').length,1);
    assert.equal(events.filter(x=>x.name==='quiz_answer').length,12);
    report.normalFlow={eventCounts:Object.fromEntries(['quiz_start','quiz_answer','quiz_complete'].map(name=>[name,events.filter(x=>x.name===name).length])),complete:complete[0].params,customParamCount:Object.keys(complete[0].params).length};
    report.analyticsResponses=page.analyticsResponses;
    assert.deepEqual(report.analyticsResponses,[]);assert.deepEqual(report.errors,[]);
    fs.writeFileSync(path.join(__dirname, 'verificacao-isolada.json'),JSON.stringify(report,null,2)+'\n');
    console.log(JSON.stringify(report,null,2));
})().catch(error=>{console.error(error);process.exitCode=1}).finally(async()=>{await page?.close()});
