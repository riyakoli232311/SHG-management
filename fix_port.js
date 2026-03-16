const { exec } = require('child_process');

exec('netstat -ano | findstr :3001', (err, stdout) => {
  if (err || !stdout) {
    console.log("No process on 3001");
    return;
  }
  const lines = stdout.trim().split('\n');
  if (lines.length > 0) {
    const parts = lines[0].trim().split(/\s+/);
    const pid = parts[parts.length - 1];
    if (pid && pid !== "0") {
      console.log("Killing PID: " + pid);
      exec('taskkill /F /PID ' + pid, (kerr, kout) => {
        console.log("Killed:", kout);
      });
    }
  }
});
