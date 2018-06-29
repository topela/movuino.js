#include "I2Cdev.h"
#include "Config.h"
#include "Router.h"
#include "Sensors.h"

//================================= TIMER ====================================//

void
MagTimer::setPeriod(unsigned long p) {
  // divide by 2 as 1 read operation takes 2 cycles :
  Timer::setPeriod((int) (p * 0.5));
}

/**
 * adapted to be non blocking using a state flag
 * from the original sparkun / Jeff Rowberg MPU6050 library:
 * MPU6050::getMag(int16_t *mx, int16_t *my, int16_t *mz)
 * there used to be delay(10)'s between calls to writeByte and readBytes,
 * this function is now called in a non-blocking loop (a period of 10 ms works fine)
 * and keeps its own state up to date.
 */
void
MagTimer::callback() {
  if (readMagState == 0) {
    // set i2c bypass enable pin to true to access magnetometer
    I2Cdev::writeByte(MPU6050_DEFAULT_ADDRESS, MPU6050_RA_INT_PIN_CFG, 0x02);
    readMagState = 1;
  } else if (readMagState == 1) {
    // enable the magnetometer
    I2Cdev::writeByte(MPU9150_RA_MAG_ADDRESS, 0x0A, 0x01);
    readMagState = 2;
  } else {
    // read it !
    I2Cdev::readBytes(MPU9150_RA_MAG_ADDRESS, MPU9150_RA_MAG_XOUT_L, 6, magBuffer);
    uint16_t mx = (((int16_t)magBuffer[1]) << 8) | magBuffer[0];
    uint16_t my = (((int16_t)magBuffer[3]) << 8) | magBuffer[2];
    uint16_t mz = (((int16_t)magBuffer[5]) << 8) | magBuffer[4];

    sensors->setRawMagValues(mx, my, mz);
    readMagState = 0;

    // reset i2c bypass enable pin as soon as we are done
    // therefore it take a total of (2 * timer period) to read new magnetometer values
    callback();
  }
}

void
OSCOutTimer::callback() {
  sensors->sendSensorValues();
}

//================================ SENSORS ===================================//

void
Sensors::init(Config *c, Router *r) {
  config = c;
  router = r;

  mpu.initialize();
  setAccelRange(config->getAccelRange());
  setGyroRange(config->getGyroRange());

  readMagTimer->setPeriod(config->getReadMagPeriod());
  oscOutTimer->setPeriod(config->getOutputFramePeriod());

  readMagTimer->start();
  oscOutTimer->start();
}

void
Sensors::update() {
  mpu.getMotion6(&ax, &ay, &az, &gx, &gy, &gz);
  updateAccelGyroValues();
  readMagTimer->update();
  oscOutTimer->update();
}

////////// SENSOR RANGES

int
Sensors::getAccelRange() {
  return mpu.getFullScaleAccelRange();
}

void
Sensors::setAccelRange(int r) {
  mpu.setFullScaleAccelRange(r);
}

int
Sensors::getGyroRange() {
  return mpu.getFullScaleGyroRange();
}

void
Sensors::setGyroRange(int r) {
  mpu.setFullScaleGyroRange(r);
}

//-------------------------------- PRIVATE -----------------------------------//

////////// MagTimer callback :
void
Sensors::setRawMagValues(uint16_t x, uint16_t y, uint16_t z) {
  mx = x;
  my = y;
  mz = z;

  // update only on real data change
  updateMagValues();
}

////////// OSCOutTimer callback :
void
Sensors::sendSensorValues() {
  router->onNewSensorValues(&(values[0]));
}

void
Sensors::updateAccelGyroValues() {
  values[0] = ax / float(32768);
  values[1] = ay / float(32768);
  values[2] = az / float(32768);

  values[3] = gx / float(32768);
  values[4] = gy / float(32768);
  values[5] = gz / float(32768);
}

/**
 * TODO: bring back Adrien's recalibration here and test it more
 */
void
Sensors::updateMagValues() {
  values[6] = mx / float(100);
  values[7] = my / float(100);
  values[8] = mz / float(100);
}
