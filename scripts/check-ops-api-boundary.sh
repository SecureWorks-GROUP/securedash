#!/usr/bin/env bash
# Guardrail: securedash is UX/screens only. Production ops-api source/deploys
# must stay in SecureWorks-GROUP/secureworks-backend.
set -euo pipefail

BASE_REF="${BASE_REF:-origin/main}"
HEAD_REF="${HEAD_REF:-HEAD}"

fail=0
say_fail() { echo "::error::$*"; fail=1; }

changed_files=""
if git rev-parse --verify "$BASE_REF" >/dev/null 2>&1; then
  changed_files="$(git diff --name-only --diff-filter=ACM "${BASE_REF}...${HEAD_REF}" || true)"
else
  changed_files="$(git diff --name-only --diff-filter=ACM "${HEAD_REF}~1" "${HEAD_REF}" || true)"
fi

if printf '%s\n' "$changed_files" | grep -E '^supabase/functions/ops-api/' >/dev/null; then
  echo "$changed_files" | grep -E '^supabase/functions/ops-api/' | sed 's/^/blocked ops-api source change: /'
  say_fail "securedash must not change supabase/functions/ops-api; backend owns production ops-api."
fi

# The disabled workflow may exist, but it must not actually deploy ops-api.
if grep -RInE 'supabase[[:space:]]+functions[[:space:]]+deploy[[:space:]]+ops-api|functions[[:space:]]+deploy[[:space:]]+ops-api' .github workflows scripts 2>/dev/null | grep -v 'check-ops-api-boundary.sh' >/tmp/ops-api-deploy-hits.txt; then
  cat /tmp/ops-api-deploy-hits.txt
  say_fail "securedash must not contain commands that deploy production ops-api."
fi

# Resolved stale aliases from Mission 1.5C. These should stay replaced by
# canonical backend actions: job_detail, list_po_communications, add_note.
python3 - <<'PY' || fail=1
from pathlib import Path
import re, sys
root = Path('.')
blocked = {'job_by_id': 'job_detail', 'read_po_emails': 'list_po_communications', 'add_event': 'add_note'}
files = [p for p in root.rglob('*') if p.suffix in {'.html', '.js'} and '.git' not in p.parts]
patterns = [
    re.compile(r"\b(?:opsFetch|opsPost|opsApiGet|opsApiPost|api)\s*\(\s*['\"]([^'\"]+)['\"]"),
    re.compile(r"/functions/v1/ops-api\?action=([a-zA-Z0-9_:-]+)"),
]
hits=[]
for p in files:
    text = p.read_text(errors='ignore')
    for i,line in enumerate(text.splitlines(), 1):
        if line.strip().startswith('//'):
            continue
        for pat in patterns:
            for action in pat.findall(line):
                if action in blocked:
                    hits.append((p, i, action, blocked[action], line.strip()))
if hits:
    for p,i,action,replacement,line in hits:
        print(f"::error file={p},line={i}::stale ops-api action '{action}' must use '{replacement}' instead. Line: {line[:180]}")
    sys.exit(1)
print('ops-api boundary guard passed')
PY

if [[ "$fail" -ne 0 ]]; then
  echo "ops-api boundary guard failed"
  exit 1
fi

echo "ops-api boundary guard passed"
