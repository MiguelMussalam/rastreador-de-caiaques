#include <SPI.h>
#include <LoRa.h>

// --- MAPEAMENTO DE PINOS LORA RA-02 ---
const int csPin = 5;          // NSS
const int resetPin = 14;       // RST
const int irqPin = 2;          // DIO0

void setup() {
  Serial.begin(115200);
  while (!Serial);

  Serial.println("--- TESTE 1.2: RECEPTOR LORA + SNR ---");

  LoRa.setPins(csPin, resetPin, irqPin);

  if (!LoRa.begin(433E6)) {   
    Serial.println("ERRO: Hardware LoRa não encontrado!");
    while (1);
  }
  Serial.println("Aguardando mensagens...");
}

void loop() {
  int packetSize = LoRa.parsePacket();
  
  if (packetSize) {
    Serial.print("Recebido: ");

    while (LoRa.available()) {
      char c = (char)LoRa.read(); 
      Serial.print(c);
    }

    // Exibe as métricas de qualidade do sinal
    Serial.print(" | RSSI: ");
    Serial.print(LoRa.packetRssi());
    Serial.print(" dBm | SNR: ");
    Serial.print(LoRa.packetSnr());
    Serial.println(" dB");
  }
}
