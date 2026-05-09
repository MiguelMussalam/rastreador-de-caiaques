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

// URL do backend no Railway (troque pela URL real após o deploy)
// Exemplo: "https://rastreador-backend-production.up.railway.app/api/tracking"
const char* BACKEND_URL = "https://SEU-BACKEND.railway.app/api/tracking";
// ============================================================

LoRa_E32 e32ttl(&Serial2, 15, 4, 5);

WiFiClientSecure secureClient;

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

  // Desabilita verificação SSL (adequado para TCC/desenvolvimento)
  secureClient.setInsecure();
}

void enviarAoBackend(const String& json) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("[HTTP] Sem WiFi, pulando envio");
    return;
  }

  HTTPClient http;
  http.begin(secureClient, BACKEND_URL);
  http.addHeader("Content-Type", "application/json");

  int httpCode = http.POST(json);

  if (httpCode > 0) {
    Serial.printf("[HTTP] Resposta: %d\n", httpCode);
  } else {
    Serial.printf("[HTTP] Erro: %s\n", http.errorToString(httpCode).c_str());
  }

  http.end();
}

void loop() {
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
