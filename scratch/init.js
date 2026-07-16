const { spawn } = require('child_process');

const catalystCliPath = 'C:\\Users\\Ashwin\\AppData\\Roaming\\npm\\node_modules\\zcatalyst-cli\\lib\\bin\\catalyst.js';

console.log('Spawning catalyst init...');
const child = spawn('node', [catalystCliPath, 'init'], {
  cwd: 'z:\\data_hackthon',
  stdio: ['pipe', 'pipe', 'pipe']
});

child.stdout.on('data', (data) => {
  const output = data.toString();
  console.log('STDOUT:', JSON.stringify(output));
  
  if (output.includes('Associate a Catalyst project') || output.includes('Use existing project')) {
    console.log('Sending: enter (selecting Yes)');
    child.stdin.write('\n');
  } else if (output.includes('Select the project')) {
    // Let's see what projects are listed.
  }
});

child.stderr.on('data', (data) => {
  console.log('STDERR:', data.toString());
});

child.on('close', (code) => {
  console.log(`Process exited with code ${code}`);
});
