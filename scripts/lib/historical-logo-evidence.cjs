// Read the previously audited original bytes without packaging or checking them out.
const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const { createHash } = require('node:crypto');

const auditedCommit = '1d812957b23b50b0805b1e2890710891225164fa';
const evidenceDirectory = 'tools/release/logo-review-20261031/downloads';

module.exports = function verifyHistoricalLogo(root, file, expectedSha256) {
  assert.match(file, /^[a-z]+\.png$/);
  const blob = execFileSync('git', ['show', `${auditedCommit}:${evidenceDirectory}/${file}`], { cwd: root });
  assert.equal(createHash('sha256').update(blob).digest('hex'), expectedSha256, `Historical official logo differs: ${file}`);
};
