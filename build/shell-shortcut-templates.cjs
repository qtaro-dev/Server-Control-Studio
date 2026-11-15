const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');

const templates = {
  'include/installer.nsh': '0e319437dd01dcbf911f3f48f664fde0cefbaef704f1cdb1739f63d563f5d4a0',
  'installSection.nsh': '74c4dbb4163cdd90ca4850b75d304e916235c882d6af7b5cdad63bffbc977072',
  'uninstaller.nsh': '9ee2dac4593478083e8aa6f8487287ce9401006ccd50ecc538871d133ea4a42c',
};
const calls = {
  SetLnkAUMI: 'SCSSetShortcutAppId',
  UninstShortcut: 'SCSUnpinShortcut',
  UninstAppUserModelId: 'SCSRemoveShortcutHistory',
};
const include = file => {
  const normalized = path.normalize(file);
  if (/["$\r\n]/.test(normalized)) throw new Error('Unsupported NSIS include path');
  return '!include "' + normalized + '"';
};

module.exports = function configureShortcuts(context, target) {
  const upstream = path.join(path.dirname(require.resolve('app-builder-lib/package.json')), 'templates/nsis');
  const dir = fs.mkdtempSync(path.join(context.outDir, 'nsis-shell-'));
  const macros = include(path.join(__dirname, 'shell-shortcuts.nsh'));
  const output = {};
  for (const [name, expectedHash] of Object.entries(templates)) {
    const original = fs.readFileSync(path.join(upstream, name));
    if (createHash('sha256').update(original).digest('hex') !== expectedHash)
      throw new Error('Review the Shell API substitution for the updated NSIS template: ' + name);
    output[name] = path.join(dir, path.basename(name));
    let script = original.toString('utf8');
    if (name === 'installSection.nsh') {
      script = script.replace('!include installer.nsh', include(output['include/installer.nsh']));
    } else {
      script = macros + '\n' + script.replace(/WinShell::(\w+)/g, (_, call) => {
        if (!Object.hasOwn(calls, call)) throw new Error('Unreviewed WinShell call: ' + call);
        return '!insertmacro ' + calls[call];
      });
    }
    fs.writeFileSync(output[name], script);
  }
  const execute = target.executeMakensis.bind(target);
  target.executeMakensis = (defines, commands, script, options) => {
    for (const name of ['installSection.nsh', 'uninstaller.nsh']) {
      const original = '!include "' + name + '"';
      if (!script.includes(original)) throw new Error('Unexpected NSIS entry script: ' + name);
      script = script.replace(original, include(output[name]));
    }
    return execute(defines, commands, script, options);
  };
};
