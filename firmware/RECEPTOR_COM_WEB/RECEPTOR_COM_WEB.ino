#include <Arduino.h>
#include <WiFi.h>
#include <WebSocketsServer.h>
#include "LoRa_E32.h"

const char* ssid     = "iPhone";
const char* password = "pedro123";

LoRa_E32 e32ttl(&Serial2, 15, 4, 5);
WebSocketsServer wsServer(81);

void onWsEvent(uint8_t num, WStype_t type, uint8_t* payload, size_t length) {
  if (type == WStype_CONNECTED) {
    Serial.printf("[WS] Cliente %d conectado\n", num);
  } else if (type == WStype_DISCONNECTED) {
    Serial.printf("[WS] Cliente %d desconectado\n", num);
  }
}

void setup() {
  Serial.begin(115200);
  Serial2.begin(9600, SERIAL_8N1, 16, 17);
  e32ttl.begin();

  ResponseStructContainer c = e32ttl.getConfiguration();
  if (c.status.code == 1) {
    Configuration config = *(Configuration*)c.data;
    config.SPED.airDataRate = AIR_DATA_RATE_010_24;
    e32ttl.setConfiguration(config, WRITE_CFG_PWR_DWN_SAVE);
    Serial.println("Radio OK");
  }

  WiFi.begin(ssid, password);
  Serial.print("Conectando");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println();
  // *** ESTE IP VAI NO caiaques.service.ts ***
  Serial.println("ESP32 IP: " + WiFi.localIP().toString());

  wsServer.begin();
  wsServer.onEvent(onWsEvent);
  Serial.println("WebSocket ativo na porta 81");
}

void loop() {
  wsServer.loop();

  if (e32ttl.available() > 1) {
    ResponseContainer rs = e32ttl.receiveMessage();

    if (rs.status.code == 1) {
      String json = rs.data;
      json.trim();

      Serial.println("[LoRa] " + json);

      // Só transmite se for JSON válido
      if (json.startsWith("{") && json.endsWith("}")) {
        wsServer.broadcastTXT(json);
      }
    }
  }
}
