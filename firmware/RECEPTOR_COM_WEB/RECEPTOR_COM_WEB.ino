#include <Arduino.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <WiFiClientSecure.h>
#include "LoRa_E32.h"

// ============================================================
//  CONFIGURAÇÕES — edite antes de gravar
// ============================================================
const char* SSID     = "iPhone";
const char* PASSWORD = "pedro123";

const char* BACKEND_URL   = "https://rastreador-de-caiaques.onrender.com/api/tracking";
const char* HEARTBEAT_URL = "https://rastreador-de-caiaques.onrender.com/api/tracking/heartbeat";
// ============================================================

LoRa_E32 e32ttl(&Serial2, 15, 4, 5);
WiFiClientSecure secureClient;

unsigned long ultimoHeartbeat = 0;
const unsigned long INTERVALO_HEARTBEAT = 10000; // 10s

void setup() {
  Serial.begin(115200);
  Serial2.begin(9600, SERIAL_8N1, 16, 17);
  e32ttl.begin();

  ResponseStructContainer c = e32ttl.getConfiguration();
  if (c.status.code == 1) {
    Configuration config = *(Configuration*)c.data;
    config.SPED.airDataRate = AIR_DATA_RATE_001_12;
    e32ttl.setConfiguration(config, WRITE_CFG_PWR_DWN_SAVE);
    Serial.println("Radio OK - 1.2kbps");
  }

  WiFi.begin(SSID, PASSWORD);
  Serial.print("Conectando ao WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println();
  Serial.println("WiFi conectado: " + WiFi.localIP().toString());

  secureClient.setInsecure();
}

void enviarHeartbeat() {
  if (WiFi.status() != WL_CONNECTED) return;

  HTTPClient http;
  http.begin(secureClient, HEARTBEAT_URL);
  http.setTimeout(30000);
  int code = http.GET();
  http.end();

  Serial.println(code > 0 ? "[HB] OK" : "[HB] Falhou");
}

void enviarAoBackend(const String& json) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("[HTTP] Sem WiFi, pulando envio");
    return;
  }

  HTTPClient http;
  http.begin(secureClient, BACKEND_URL);
  http.addHeader("Content-Type", "application/json");
  http.setTimeout(30000);

  int httpCode = http.POST(json);

  if (httpCode > 0) {
    Serial.printf("[HTTP] Resposta: %d\n", httpCode);
  } else {
    Serial.printf("[HTTP] Erro: %s\n", http.errorToString(httpCode).c_str());
  }

  http.end();
}

void loop() {
  // Heartbeat independente — avisa o site que a base está online
  if (millis() - ultimoHeartbeat >= INTERVALO_HEARTBEAT) {
    ultimoHeartbeat = millis();
    enviarHeartbeat();
  }

  // Recebe posição dos caiaques via LoRa
  if (e32ttl.available() > 1) {
    ResponseContainer rs = e32ttl.receiveMessage();

    if (rs.status.code == 1) {
      String json = rs.data;
      json.trim();

      Serial.println("[LoRa] " + json);

      if (json.startsWith("{") && json.endsWith("}")) {
        enviarAoBackend(json);
      }
    }
  }
}
