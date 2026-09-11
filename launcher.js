const { spawn } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const env={...process.env};
const envFile=path.join(__dirname,'.env');
if(fs.existsSync(envFile)){
  for(const line of fs.readFileSync(envFile,'utf8').split(/\r?\n/)){
    const m=line.match(/^([A-Z0-9_]+)=(.*)$/);if(m&&!env[m[1]])env[m[1]]=m[2].trim();
  }
}
const args=[];
const wantsProxy=Boolean(env.HTTPS_PROXY||env.HTTP_PROXY);
if(wantsProxy&&process.allowedNodeEnvironmentFlags?.has('--use-env-proxy'))args.push('--use-env-proxy');
args.push(path.join(__dirname,'server.js'));
const child=spawn(process.execPath,args,{stdio:'inherit',env});
child.on('exit',code=>process.exit(code??0));
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>child.kill(signal));
