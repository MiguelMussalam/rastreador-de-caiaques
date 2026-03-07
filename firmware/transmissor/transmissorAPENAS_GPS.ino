#include <TinyGPS++.h> // Biblioteca para decodificar dados NMEA

// --- MAPEAMENTO DE PINOS GPS NEO-6M ---
// GPS TX -> ESP32 GPIO 16 (RX2)
// GPS RX -> ESP32 GPIO 17 (TX2)
#define RXD2 16
#define TXD2 17

TinyGPSPlus gps;              // Cria o objeto de controle do GPS

void setup() {
  Serial.begin(115200);       // Monitor Serial (USB)
  
  // Inicia a Serial2 dedicada ao GPS na velocidade de 9600 bps
  Serial2.begin(9600, SERIAL_8N1, RXD2, TXD2);
  
  Serial.println("--- TESTE 2.2: LEITURA GPS ---");
}

void loop() {
  // Lê cada caractere vindo do módulo GPS
  while (Serial2.available() > 0) {
    // Alimenta o 'cérebro' da biblioteca com os dados brutos
    gps.encode(Serial2.read());
  }

  // Se a biblioteca conseguir decodificar uma localização válida e nova
  if (gps.location.isUpdated()) {
    Serial.print("Sats: "); Serial.print(gps.satellites.value());
    Serial.print(" | Lat: "); Serial.print(gps.location.lat(), 6);
    Serial.print(" | Lon: "); Serial.println(gps.location.lng(), 6);
  }

  // Alerta de erro se não houver comunicação elétrica com o GPS
  if (millis() > 5000 && gps.charsProcessed() < 10) {
    Serial.println("ERRO: GPS não detectado. Verifique os fios TX/RX!");
    delay(5000);
  }
}