// Build in a separate output directory with mock catalogue data. Never touches Atlas.
const { spawn } = require("node:child_process");

const child = spawn(process.execPath, ["node_modules/next/dist/bin/next", "build", "--webpack"], {
  stdio: "inherit",
  windowsHide: true,
  env: {
    ...process.env,
    MONGODB_URI: "",
    NEXT_TELEMETRY_DISABLED: "1",
    VMC_LOCAL_SMOKE: "1",
  },
});

child.on("exit", (code, signal) => {
  if (signal) console.error(`Production build stopped by ${signal}.`);
  process.exitCode = code ?? 1;
});
