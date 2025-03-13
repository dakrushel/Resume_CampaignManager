import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:5050", // Match your backend port
    setupNodeEvents(on, config) {
      // Start the backend using a shell command before tests
      on('before:run', () => {
        console.log('Starting backend...');
        const { exec } = require('child_process');
        exec('npm run start:backend', (err, stdout, stderr) => {
          if (err) {
            console.error(`Error starting backend: ${stderr}`);
          } else {
            console.log(stdout);
          }
        });
      });
    },
  },
});
