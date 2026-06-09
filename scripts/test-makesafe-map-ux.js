#!/usr/bin/env node
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const ops = fs.readFileSync(path.join(__dirname, '..', 'ops.html'), 'utf8');
function has(pattern, message) { assert(pattern.test(ops), message); }
function lacks(pattern, message) { assert(!pattern.test(ops), message); }
has(/id="makesafeMapStatusFilter" onchange="makesafeMapSetStatusFilter\(this\.value\)"/, 'map exposes status/stage filter select');
has(/id="makesafeMapCrewFilter" onchange="makesafeMapSetCrewFilter\(this\.value\)"/, 'map exposes crew/trade filter select');
has(/loadMakesafeMapData\(\\'unassigned\\'\);makesafeMapSetStatusFilter\(\\'unassigned\\'\)/, 'needs-allocation button uses backend filter and local status lens');
has(/loadMakesafeMapData\(\\'waiting_report\\'\);makesafeMapSetStatusFilter\(\\'allocated\\'\)/, 'reports button focuses waiting-report visibility');
has(/loadMakesafeMapData\(\\'to_invoice\\'\);makesafeMapSetStatusFilter\(\\'to_invoice\\'\)/, 'invoice button focuses invoice visibility');
has(/_makesafeMapStatusFilter === 'on_road'/, 'status filter supports on-road visibility');
has(/Crew \/ route picture/, 'side panel leads with crew/route picture');
has(/Grouped by crew or trade first/, 'crew route copy explains allocation-first grouping');
has(/crewColor\(routeKey\)/, 'crew/route cards use crew colours');
has(/red outline = late\/risky/, 'map key explains late/risky outline');
has(/Missing map pins/, 'geocode remains available for missing-location exceptions');
has(/Geocode only appears for missing map pins/, 'top toolbar de-emphasizes geocode instead of making it a primary action');
lacks(/onclick="loadMakesafeMapData\('[^']+'\)/, 'toolbar inline calls keep quotes escaped inside JS strings');
lacks(/Geocode Missing<\/button>/, 'geocode is no longer a dominant top-toolbar action');
lacks(/Area groups/, 'old area-groups panel copy is removed');
const mapRegion = ops.slice(ops.indexOf('function toggleMakesafeMap'), ops.indexOf('function makesafePlannerAttr'));
assert(!/opsPost\(/.test(mapRegion), 'map rendering/filtering remains read-only');
console.log('PASS MakeSafe map UX regression checks');
