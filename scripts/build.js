const { spawn } = require('child_process');

console.log('Spouštím Vite build pro produkci...');
const viteBuild = spawn('npx', ['vite', 'build'], { shell: true, stdio: 'inherit' });

viteBuild.on('close', (code) => {
  if (code !== 0) {
    console.error(`Vite build selhal s kódem ${code}`);
    process.exit(code);
  }
  
  console.log('Build úspěšný. Spouštím Electron v produkčním módu...');

  const electron = spawn('npx', ['electron', '.'], {
    env: { ...process.env, NODE_ENV: 'production' },
    shell: true,
    stdio: 'inherit'
  });

  electron.on('close', () => {
    console.log('Electron ukončen.');
    process.exit();
  });
});

process.on('SIGINT', () => {
  process.exit();
});
