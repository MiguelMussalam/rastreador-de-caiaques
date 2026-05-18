#include <Arduino.h>
#include "LoRa_E32.h"
#include <TinyGPS++.h>

LoRa_E32 e32ttl(&Serial2, 15, 4, 5);
TinyGPSPlus gps;

const int CAIAQUE_ID = 1;
unsigned long ultimoEnvio = 0;
const unsigned long intervaloEnvio = 5000;

#define GPS_RX 22
#define GPS_TX 23

void setup() {
  Serial.begin(115200);
  Serial1.begin(9600, SERIAL_8N1, GPS_RX, GPS_TX);
  Serial2.begin(9600, SERIAL_8N1, 16, 17);

  e32ttl.begin();
  Serial.println("Configurando Transmissor...");

  ResponseStructContainer c;
  c = e32ttl.getConfiguration();
  if (c.status.code == 1) {
Configuration configuration = *(Configuration*) c.data;
configuration.OPTION.transmissionPower = POWER_20; 

/// Alterado para 1.2kbps (próximo ao 1kbps solicitado)
configuration.SPED.airDataRate = AIR_DATA_RATE_001_12; 

e32ttl.setConfiguration(configuration, WRITE_CFG_PWR_DWN_SAVE);
Serial.println("Radio configurado: 20dBm, 1.2kbps");
  } else {
    Serial.println("Erro na configuracao do radio.");
  }
}

void loop() {
  while (Serial1.available() > 0) {
    gps.encode(Serial1.read());
  }

  if (millis() - ultimoEnvio >= intervaloEnvio) {
    ultimoEnvio = millis();
    String payload;

    if (gps.location.isValid()) {
      payload = "{\"id\":"  + String(CAIAQUE_ID)            +
                ",\"lat\":" + String(gps.location.lat(), 6) +
                ",\"lng\":" + String(gps.location.lng(), 6) + "}";
    } else {
      Serial.print("Sem fix GPS. Satelites: ");
      Serial.println(gps.satellites.value());

      payload = "{\"id\":"  + String(CAIAQUE_ID) +
                ",\"lat\":null,\"lng\":null}";
    }

    ResponseStatus rs = e32ttl.sendMessage(payload);
    Serial.println(rs.code == 1 ? "Enviado: " + payload : "Falha no envio.");
  }
}
