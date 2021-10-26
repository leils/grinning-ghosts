const char sensorPins[] = {
  A0, A2, A3, A6, A7 
};
int sensorStatus[] = {
  1,1,1,1,1
};

int pinCount = 5;
int lastCount = 0;
int threshold = 100;

void setup() {
  for (int thisPin = 0; thisPin < pinCount; thisPin++) {
    pinMode(sensorPins[thisPin], INPUT);
  }

  Serial.begin(9600);
}

void loop() {
//  int count = 0;

  for (int pinIndex = 0; pinIndex < pinCount; pinIndex++) {
    int pinReading = analogRead(sensorPins[pinIndex]);
    int lastStatus = sensorStatus[pinIndex];
    if ((pinReading < threshold) && (lastStatus == HIGH)) { //cross threshold down
//      count++;
      Serial.write(pinIndex);
      sensorStatus[pinIndex] = !sensorStatus[pinIndex];
    } else if ((pinReading > threshold) && (lastStatus == LOW)) { //cross threshold up
      Serial.write(pinIndex);
      sensorStatus[pinIndex] = !sensorStatus[pinIndex];
    }
  }

//  if (count != lastCount){
//    Serial.print('latest count: ');
//    Serial.println(count);
//    lastCount = count;
//  }
}

void calibrate() {
  
}
