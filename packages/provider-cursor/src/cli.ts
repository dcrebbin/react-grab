#!/usr/bin/env node
import { join } from "node:path";
import { execa } from "execa";
import pc from "picocolors";
import { DEFAULT_PORT, DEFAULT_HOST } from "./constants.js";

declare const __dirname: string;

const VERSION = process.env.VERSION ?? "0.0.0";

const port = process.env.REACT_GRAB_PORT ?? String(DEFAULT_PORT);
const host = process.env.REACT_GRAB_HOST ?? DEFAULT_HOST;
const sslCert = process.env.REACT_GRAB_SSL_CERT ?? "";
const sslKey = process.env.REACT_GRAB_SSL_KEY ?? "";

const serverPath = join(__dirname, "server.cjs");
execa(process.execPath, [serverPath], {
  detached: true,
  stdio: "ignore",
  cleanup: false,
  env: {
    ...process.env,
    REACT_GRAB_PORT: port,
    REACT_GRAB_HOST: host,
    REACT_GRAB_SSL_CERT: sslCert,
    REACT_GRAB_SSL_KEY: sslKey,
  },
}).unref();

const useSSL = sslCert && sslKey;
const protocol = useSSL ? "https" : "http";
const displayHost = host === "0.0.0.0" ? "localhost" : host;

console.log(
  `${pc.magenta("✿")} ${pc.bold("React Grab")} ${pc.gray(VERSION)} ${pc.dim("(Cursor)")}`,
);
console.log(`- Local:    ${pc.cyan(`${protocol}://${displayHost}:${port}`)}`);
if (host === "0.0.0.0") {
  console.log(`- Network:  ${pc.cyan(`${protocol}://0.0.0.0:${port}`)}`);
}
