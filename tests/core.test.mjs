import {test} from 'node:test';
import assert from 'node:assert/strict';
import {dailyTotals,validateSession,duration,escapeHTML} from '../public/core.js';
test('splits midnight with one occurrence per touched day',()=>{const start=new Date(2025,0,1,23,30).getTime(),end=new Date(2025,0,2,1).getTime();assert.deepEqual(dailyTotals([{start,end}]),{'2025-01-01':{ms:1800000,count:1},'2025-01-02':{ms:3600000,count:1}});});
test('midnight end does not create empty day',()=>{assert.equal(Object.keys(dailyTotals([{start:new Date(2025,0,1,23).getTime(),end:new Date(2025,0,2).getTime()}])).length,1);});
test('frequency counts sessions, duration sums',()=>{assert.deepEqual(Object.values(dailyTotals([{start:1000,end:61000},{start:1000,end:61000}]))[0],{ms:120000,count:2});});
test('rejects invalid reversed future and oversized intervals',()=>{for(const pair of [[NaN,1],[2,1],[1,1],[Date.now(),Date.now()+120000],[1,8*86400000]])assert.throws(()=>validateSession(...pair));});
test('accepts historical session and formats duration',()=>{validateSession(1000,61000);assert.equal(duration(3660000),'1시간 1분');});
test('untrusted names are escaped',()=>assert.equal(escapeHTML('<img "x">'), '&lt;img &quot;x&quot;&gt;'));
