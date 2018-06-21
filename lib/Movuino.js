"use strict";

const EventEmitter = require("events");
const serial = require("./serial");

class Movuino extends EventEmitter {
  /**
   * Creates a new Movuino instance
   * @class
   * @param {string} id - Movuino instance id
   */
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

  /**
   * Attach UDP port.
   * @method
   * @param {object} udpPort - The port to attach to.
   */
  attachUdpPort(udpPort) {
    this.udpPort = udpPort;
  }

  /**
   * Detach current UDP port.
   * @method
   */
  detachUdpPort() {
    this.udpPort = null;
  }

  /**
   * Attach serial port.
   */
  attachSerial() {
    return serial.attach(this.comName).then(OSCSerialPort => {
      this.OSCSerialPort = OSCSerialPort;
      return OSCSerialPort;
    });
  }

  /**
   * Detach serial port.
   */
  detachSerial() {
    return serial.detach(this.OSCSerialPort);
  }

  /**
   * Set WiFi credentials.
   * @param {object} config - An object containing 3 fields named
   * ssid, password and host, with corresponding string values.
   */
  setWifi(config) {
    return serial.rpc(this.OSCSerialPort, "/set/wifi", [
      { type: "s", value: config.ssid },
      { type: "s", value: config.password },
      { type: "s", value: config.host }
    ]);
  }

  /**
   * Get WiFi credentials
   * @async
   * @return {Promise<object>} An object containing 3 fields named
   * ssid, password and host, corresponding to the network's credentials and
   * the OSC target IP.
   */
  async getWifi() {
    const [ssid, password, host] = await serial.rpc(
      this.OSCSerialPort,
      "/get/wifi"
    );
    return { ssid, password, host };
  }

  /**
   * Set accelerometer and gyroscope sensitivity range values.
   * @param {object} range - An object containing two fields named
   * accel and gyro, with corresponding range values.
   */
  setRange(range) {
    return serial.rpc(this.OSCSerialPort, "/set/range", [
      { type: "i", value: range.accel },
      { type: "i", value: range.gyro }
    ]);
  }

  /**
   *  Get accelerometer and gyroscope sensitivity range values.
   * @async
   * @return {Promise<object>} An object containing two fields named
   * accel and gyro, with the actual sensors' range values.
   */
  async getRange() {
    const [accel, gyro] = await serial.rpc(this.OSCSerialPort, "/get/range");
    return { accel, gyro };
  }

  /**
   * Start vibrating (sending an OSC message via UDP)
   * @async
   */
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

  /**
   * Stop vibrating (sending an OSC message via UDP)
   * @async
   */
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
