#!/usr/bin/env node
const assert = require('assert');
const fs = require('fs');
const path = require('path');

const ops = fs.readFileSync(path.join(__dirname, '..', 'ops.html'), 'utf8');

function has(pattern, message) {
  assert(pattern.test(ops), message);
}

has(/function makesafePlannerMemberSetKey\(ids\)/, 'crew planner has a normalized member-set key');
has(/crewSetSeen\[key\]/, 'crew planner drops duplicate persisted crew rows by member set');
has(/Crew row already exists:/, 'crew setup prevents creating the same crew row twice');
has(/state\.jobActions\[jobId\] = \{ mode: 'hold'/, 'Hold action is staged in local planner state');
has(/state\.jobActions\[jobId\] = \{ mode: 'direct_allocate'/, 'Direct Allocate action is staged in local planner state');
has(/state\.jobActions\[jobId\] = \{ mode: 'ring'/, 'Ring the Bell action is staged in local planner state');
has(/No SMS\/email sent\./, 'Ring the Bell copy states no live notification is sent');
has(/<option value="makesafe_capable">MakeSafe-capable trades<\/option><option value="same_suburb">Same suburb \/ nearby crew<\/option><option value="unallocated_pool">Unallocated crew pool<\/option>/, 'Ring the Bell has an explicit audience selector');
has(/<button onclick="makesafePlannerSaveFromBacklog[\s\S]*?>Direct Allocate<\/button>/, 'backlog exposes Direct Allocate button');
has(/<button onclick="makesafePlannerHoldJob[\s\S]*?>Hold<\/button>/, 'backlog exposes Hold button');
has(/<button onclick="makesafePlannerRingBell[\s\S]*?>Ring the Bell<\/button>/, 'backlog exposes Ring the Bell button');

const crewWeekRegion = ops.slice(ops.indexOf('function makesafePlannerPlanJob'), ops.indexOf('async function loadMakesafeCrewDay'));
assert(!/opsPost\(/.test(crewWeekRegion), 'Crew Week planner affordances remain frontend/local-only and do not call opsPost');

console.log('PASS MakeSafe Crew Week planner regression checks');
