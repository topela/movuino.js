#ifndef _MOVUINO_FIRMWARE_CONFIG_H_
#define _MOVUINO_FIRMWARE_CONFIG_H_

#define MAX_CONFIG_STRING_SIZE 120

#include <Arduino.h>
#include "globals.h"

class Config {
private:
  // stays false if there is a problem with SPIFFS on init,
  // thus ignoring calls to load / store.
  bool disabled;

  char initialized[MAX_CONFIG_STRING_SIZE];
  char movuinoId[MAX_CONFIG_STRING_SIZE];

  char ssid[MAX_CONFIG_STRING_SIZE];
  char password[MAX_CONFIG_STRING_SIZE];
  char hostIP[MAX_CONFIG_STRING_SIZE];
  int portIn;
  int portOut;

  int accelRange;
  int gyroRange;

  // for sensors, button and vibrator
  bool useSerial;
  bool useWiFi; //define this behaviour better according to WiFiBootMode
  bool sendSingleFrame;
  // for sensors
  int readMagPeriod;
  int outputFramePeriod;

  // enable / disable features like heartbeat, handshake, etc here

public:
  Config() :
  disabled(true),
  portIn(DEFAULT_OSC_INPUT_PORT),
  portOut(DEFAULT_OSC_OUTPUT_PORT),
  accelRange(3),
  gyroRange(3),
  useSerial(DEFAULT_USE_SERIAL),
  useWiFi(DEFAULT_USE_WIFI),
  readMagPeriod(DEFAULT_READ_MAG_PERIOD),
  outputFramePeriod(DEFAULT_OUTPUT_FRAME_PERIOD) {
    strcpy(initialized, "uninitialized");
    strcpy(movuinoId, "");
    strcpy(ssid, "my_network_ssid");
    strcpy(password, "my_network_pass");
    strcpy(hostIP, "192.168.0.100");
  }

  ~Config() {}

  void init();
  void load();
  void store();

  //========================= ALL GETTERS AND SETTERS ========================//
  bool getInitialized();
  void setInitialized(bool b);

  const char *getMovuinoId();
  // void setMovuinoId(const char *id);

  int getAccelRange();
  void setAccelRange(int r);

  int getGyroRange();
  void setGyroRange(int r);

  const char *getSsid();
  void setSsid(const char *s);

  const char *getPassword();
  void setPassword(const char *p);

  const char *getHostIP();
  void setHostIP(const char *ip);

  int getInputPort();
  void setInputPort(int p);

  int getOutputPort();
  void setOutputPort(int p);

  bool getUseSerial();
  void setUseSerial(bool b);

  bool getUseWiFi();
  void setUseWiFi(bool b);

  bool getSendSingleFrame();
  void setSendSingleFrame(bool b);

  int getReadMagPeriod();
  void setReadMagPeriod(int p);

  int getOutputFramePeriod();
  void setOutputFramePeriod(int p);
};

#endif /* _MOVUINO_FIRMWARE_CONFIG_H_ */
