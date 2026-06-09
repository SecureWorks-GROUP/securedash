#!/usr/bin/env node
const fs = require('fs')
const assert = require('assert')

const html = fs.readFileSync('trade.html', 'utf8')

function extractFunction(name) {
  const marker = `function ${name}`
  const start = html.indexOf(marker)
  assert(start !== -1, `${name} exists`)
  const next = html.indexOf('\n  function ', start + marker.length)
  return html.slice(start, next === -1 ? html.length : next)
}

const wrapper = extractFunction('renderTradeCardFacts')
const makesafeFacts = extractFunction('renderMakesafeTradeCardFacts')
const standardFacts = extractFunction('renderStandardTradeCardFacts')
const cardFact = extractFunction('renderTradeCardFact')

assert(wrapper.includes("if (type === 'makesafe') return renderMakesafeTradeCardFacts"), 'facts renderer branches explicitly for MakeSafe')
assert(wrapper.includes('return renderStandardTradeCardFacts'), 'facts renderer sends non-MakeSafe jobs to standard path')

assert(makesafeFacts.includes("'MakeSafe type'"), 'MakeSafe cards show MakeSafe type')
assert(makesafeFacts.includes("'Builder ref'") && makesafeFacts.includes('builderRef'), 'MakeSafe cards may show real builder/work-order reference')
assert(makesafeFacts.includes("'External ref'") && makesafeFacts.includes('externalRef'), 'MakeSafe cards may show real external reference')
assert(makesafeFacts.includes('hideEmpty: true'), 'MakeSafe optional refs are hidden when empty')

assert(!standardFacts.includes('MakeSafe type'), 'standard cards never display MakeSafe type')
assert(standardFacts.includes("'Job type'"), 'standard cards display generic job type/scope instead')
assert(!standardFacts.includes('Builder #') && !standardFacts.includes('External #'), 'standard cards do not show empty builder/external database fields')
assert(standardFacts.includes("'Suburb'") && standardFacts.includes("'Client'") && standardFacts.includes("'SW #'"), 'standard cards retain the useful field-crew facts')
assert(cardFact.includes('if (missing && opts.hideEmpty) return'), 'fact helper can hide empty/TBC noise')

const todayIdx = html.indexOf('data-filter="today"')
const allIdx = html.indexOf('data-filter="all"')
assert(todayIdx !== -1 && allIdx !== -1 && todayIdx < allIdx, 'Today tab remains first/default before All')
assert(html.includes("var _jobFilter = 'today'"), 'Jobs view still defaults to Today')
assert(html.includes("_jobFilter === 'today' && sec.key === 'today' && runListId"), 'run-list controls remain gated to Today only')

console.log('PASS trade card field matrix regression checks')
