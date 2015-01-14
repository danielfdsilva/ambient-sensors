
const int tempSensorPin = A0;
const int pirSensorPin = 3;
const int micSensorPin = 5;
const int calibrationTime = 30;
long interval = 20000;
long unsigned int pirPause = 5000;
long unsigned int micPause = 5000;

unsigned long prevTime = 0;
unsigned long currTime = 0;
boolean pirIsTriggered = false;
boolean savePIRTime = false;
long unsigned int pirIn;
boolean micIsTriggered = false;
boolean saveMICTime = false;
long unsigned int micIn;

void setup() {
  Serial.begin(115200);
  pinMode(pirSensorPin, INPUT);
  pinMode(micSensorPin, INPUT);
  

  //give the sensor some time to calibrate
  Serial.print("calibrating sensor ");
  for(int i = 0; i < calibrationTime; i++){
    Serial.print(".");
    delay(1000);
  }
  Serial.println(" done");
  Serial.println("SENSOR ACTIVE");
  delay(50);

  // Setup complete.    
  Serial.println("SN:Setup Complete");
}

void loop() {
  ////
  // MIC
  ////
  if(digitalRead(micSensorPin) == LOW) {
    if (micIsTriggered == false) {
      micIsTriggered = true;
      Serial.println("MIC:1");
    }
    saveMICTime = true;
  }
  if (digitalRead(micSensorPin == HIGH)) {
    if (saveMICTime) {
      micIn = millis();
      saveMICTime = false;
    }
    if (micIsTriggered == true && millis() - micIn > micPause) {
     micIsTriggered = false;
     Serial.println("MIC:0");
    } 
  }
  ////
  // END MIC
  ////
  
  ////
  // PIR
  ////
  if(digitalRead(pirSensorPin) == LOW) {
    if (pirIsTriggered == false) {
      pirIsTriggered = true;
      Serial.println("PIR:1");
    }
    savePIRTime = true;
  }
  if (digitalRead(pirSensorPin == HIGH)) {
    if (savePIRTime) {
      pirIn = millis();
      savePIRTime = false;
    }
    if (pirIsTriggered == true && millis() - pirIn > pirPause) {
     pirIsTriggered = false;
     Serial.println("PIR:0");
    } 
  }
  ////
  // END PIR
  ////
  
  ////
  // Temperature Sensor
  ////
  currTime = millis();
  if (currTime - prevTime > interval) {
    prevTime = currTime;

    int tempSensorVal = analogRead(tempSensorPin);
    float tempSensorVolt = tempSensorVal / 1024.0 * 5.0;
    float temp = (tempSensorVolt - 0.5) * 100;
    Serial.print("TMP:");
    Serial.println(temp);

  }
  ////
  // END Temerature
  ////
}

// HELPER FUNCTIONS
void debug(const char* msg){  
  Serial.print("DBG:");
  Serial.println(msg);
}
void debug(char msg){
  Serial.print("DBG:");
  Serial.println(msg);
}
