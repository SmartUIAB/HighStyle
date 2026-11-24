import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

test('hosted browser acceptance uses the reviewed Playwright-compatible runner without weakening the purchase gate', () => {
  const file = fileURLToPath(new URL('../../../.github/workflows/hosted-acceptance.yml', import.meta.url));
  const yaml = readFileSync(file, 'utf8');
  const acceptance = yaml.split('\n  acceptance:\n')[1]?.split('\n  full-purchase-gate:\n')[0] || '';
  const gate = yaml.split('\n  full-purchase-gate:\n')[1] || '';
  assert.match(acceptance, /runs-on: ubuntu-24\.04/);
  assert.match(acceptance, /install --with-deps chromium firefox webkit/);
  assert.match(gate, /if: always\(\)/);
  assert.match(gate, /process\.env\.ACCEPTANCE_RESULT !== 'success'/);
  assert.match(gate, /process\.env\.ACCEPTANCE_MODE !== 'full'/);
});
