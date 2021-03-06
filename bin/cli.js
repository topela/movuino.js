#!/usr/bin/env node

/* eslint-disable node/shebang */

"use strict";

process.title = "movuino";

const movuinojs = require("..");
const program = require("commander");
const Table = require("cli-table");
const chalk = require("chalk");
const pkg = require("../package.json");

const table = new Table({
  head: ["id", "online", "plugged"].map(h => chalk.magenta.bold(h))
});

program.version(pkg.version);

program
  .command("list")
  .description("list movuinos")
  .action(async () => {
    await movuinojs.listen();
    const { movuinos } = movuinojs;

    movuinos.forEach(movuino => {
      table.push([
        chalk.magenta.bold(movuino.id),
        movuino.online ? chalk.green("✔") : chalk.red("✖"),
        movuino.plugged ? chalk.green("✔") : chalk.red("✖")
      ]);
    });
    process.stdout.write(table.toString() + "\n");
    await movuinojs.unlisten();
  });

program
  .command("connect [ssid] [password] [host]")
  .description("connect movuinos to wifi")
  .action(async (ssid, password, host) => {
    await movuinojs.listen();
    const { movuinos } = movuinojs;

    await Promise.all(
      movuinos.map(async movuino => {
        await movuino.attachSerial();
        await movuino.setWifi({ ssid, password, host });
        await movuino.detachSerial();
      })
    );

    await movuinojs.unlisten();
  });

program.parse(process.argv);
