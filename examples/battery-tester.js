"use strict";

const movuinojs = require("..");
const delay = require("../lib/delay");

movuinojs.listen();

(async () => {
  const movuino = await movuinojs.promise("movuino");
  console.log("movuino", movuino.id);

  await delay(1000);

  if (!movuino.online) {
    console.log("please connect movuino to wifi");
  } else if (!movuino.plugged) {
    console.log("please connect movuino to usb port");
  }

  await Promise.all([movuino.promise("online"), movuino.promise("plugged")]);

  console.log("all good, please disconnect USB cable");

  await movuino.promise("unplugged");
  const date = Date.now();
  console.log(
    "movuino unplugged, time will be displayed once the movuino will disconnect (battery drain)"
  );

  await movuino.promise("offline");
  console.log(Date.now() - date + "ms");

  return movuinojs.unlisten();
})().catch(console.error);
