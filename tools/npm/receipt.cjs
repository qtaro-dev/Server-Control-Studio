// Runs only after Electron installation and the reviewed temp compatibility patch have succeeded.
const fs=require('node:fs'),env=require('./environment.cjs');
env.verifyInvocation();fs.writeFileSync(env.receipt,JSON.stringify({npm:env.config.npmVersion,lockHash:env.hash(env.root+'/package-lock.json')},null,2));
