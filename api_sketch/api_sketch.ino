#include <HTTPClient.h>
#include <WiFi.h>
#include <ArduinoJson.h>

const char* ssid = "POCO F6";
const char* password = "123456789tan";

char jsonOutput [128];
int i = 0;
float temp1 = 30.22, temp2 = 50.21;
float voltage1 = 22.36, voltage2 = 15.84;

void setup() {
    Serial.begin (115200);
    WiFi.begin (ssid, password);
    
    while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.println("Connecting to WiFi..");
  }
    Serial.println ("\nConnected to the WiFi network");

}

void loop() {
  // put your main code here, to run repeatedly:
  if (!i){
    HTTPClient http;
    WiFiClient client;

    http.begin (client, "https://nicolas-solar-effrdwf3bsepashq.eastasia-01.azurewebsites.net/api-docs/#/DATA/post_postData");
    http.addHeader ("Content-Type", "application/json");
    int httpResponseCode = http.POST("{\"temp1\":temp1,\"voltage1\":voltage1,\"temp2\":temp2,\"voltage2\":voltage2}");
    i = i + 1;
  }

}
