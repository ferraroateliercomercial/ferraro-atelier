// Inicia o Playwright MCP. Na nuvem do Claude Code (Chromium em /opt/pw-browsers,
// rodando como root) usa o navegador da máquina sem sandbox; no seu computador,
// roda o servidor normal.
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";

const cloudChrome = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const args = ["--yes", "@playwright/mcp@latest"];
if (existsSync(cloudChrome)) args.push("--headless", "--no-sandbox", "--executable-path", cloudChrome);

const child = spawn("npx", args, { stdio: "inherit", shell: process.platform === "win32" });
child.on("exit", (code) => process.exit(code ?? 0));
