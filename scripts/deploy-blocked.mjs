const target = process.argv[2] ?? 'this environment';

console.error(`Local ${target} deploys are disabled.`);
console.error('Deploy AeAre through the configured Cloudflare build hooks only.');
process.exit(1);
