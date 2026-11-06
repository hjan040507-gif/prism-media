import { loginAndSave } from './common.mjs';
await loginAndSave(process.argv[2] || 'HEAD');
