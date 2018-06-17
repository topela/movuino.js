"use strict";

const EventEmitter = require("events");
const serial = require("./serial");
const pEvent = require("p-event");

class Movuino extends EventEmitter {
  constructor(id) {
    super();
    this.id = id;
    this.comName = null;
    this.OSCSerialPort = null;
    this.lastUdpMessage = null;
    this.button = false;
    this.vibrator = false;
    this.port = 0;
    this.address = "";
    this.udpPort = null;
    this.plugged = false;
    this.online = false;
  }

  promise(...args) {
    return pEvent(this, ...args);
  }

  attachUdpPort(udpPort) {
    this.udpPort = udpPort;
  }

  detachUdpPort() {
    this.udpPort = null;
  }

  attachSerial() {
    return serial.attach(this.comName).then(OSCSerialPort => {
      this.OSCSerialPort = OSCSerialPort;
      return OSCSerialPort;
    });
  }

  detachSerial() {
    return serial.detach(this.OSCSerialPort);
  }

  setWifi(config) {
    return serial.rpc(this.OSCSerialPort, "/set/wifi", [
      { type: "s", value: config.ssid },
      { type: "s", value: config.password },
      { type: "s", value: config.host }
    ]);
  }

  async getWifi() {
    const [ssid, password, host] = await serial.rpc(
      this.OSCSerialPort,
      "/get/wifi"
    );
    return { ssid, password, host };
  }

  setRange(range) {
    return serial.rpc(this.OSCSerialPort, "/set/range", [
      { type: "i", value: range.accel },
      { type: "i", value: range.gyro }
    ]);
  }

  async getRange() {
    const [accel, gyro] = await serial.rpc(this.OSCSerialPort, "/get/range");
    return { accel, gyro };
  }

  async startVibro() {
    this.udpPort.send(
      {
        address: "/vibroNow",
        args: [{ type: "i", value: 1 }]
      },
      this.address,
      this.port
    );
  }

  async stopVibro() {
    this.udpPort.send(
      {
        address: "/vibroNow",
        args: [{ type: "i", value: 0 }]
      },
      this.address,
      this.port
    );
  }
}

module.exports = Movuino;
