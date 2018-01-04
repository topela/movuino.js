"use strict";

const Movuino = require("./Movuino");
const movuinos = require("./movuinos");
const WebSocket = require("faye-websocket");
const http = require("http");

const PORT = 7500;

const server = http.createServer();
server.on("upgrade", (request, socket, body) => {
  if (WebSocket.isWebSocket(request)) {
    let ws = new WebSocket(request, socket, body, ["movuino"]);

    let movuino;

    ws.on("message", ({ data }) => {
      const [id, isBtn, isVibro, accel, gyro, ...motions] = JSON.parse(data);

      if (!movuino) {
        movuino = new Movuino(id);
        movuinos.movuinos.push(movuino);
        movuinos.emit("movuino", movuino);
      }

      const button = Boolean(isBtn);
      if (movuino.button === false && button === true) {
        movuino.emit("button-down");
      } else if (movuino.button === true && button === false) {
        movuino.emit("button-up");
      }
      movuino.button = button;

      const vibrator = Boolean(isVibro);
      if (movuino.vibrator === false && vibrator === true) {
        movuino.emit("vibrator-on");
      } else if (movuino.vibrator === true && vibrator === false) {
        movuino.emit("vibrator-off");
      }
      movuino.vibrator = vibrator;

      if (motions.length > 0) {
        movuino.emit("data", motions);
      }

      movuino.accel = accel;
      movuino.gyro = gyro;
    });

    ws.on("close", () => {
      movuino.online = false;
      movuino.emit("offline");
      ws = null;
    });
  }
});

module.exports.listen = () => {
  return new Promise((resolve, reject) => {
    server.listen(PORT, (err, res) => {
      if (err) reject(err);
      else resolve(res);
    });
  });
};

module.exports.unlisten = () => {
  return new Promise((resolve, reject) => {
    server.close((err, res) => {
      if (err) reject(err);
      else resolve(res);
    });
  });
};
