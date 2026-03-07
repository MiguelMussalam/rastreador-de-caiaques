#include <SPI.h>
#include <LoRa.h>
#include <TinyGPS++.h>

// --- PINOS LORA ---
const int csPin = 5; const int resetPin = 14; const int irqPin = 2;

// --- PINOS GPS ---
#define RXD2 16
#define TXD2 17

TinyGPSPlus gps;
unsigned long tempoAnterior = 0;

void setup() {
  Serial.begin(115200);
  Serial2.begin(9600, SERIAL_8N1, RXD2, TXD2); // Inicia GPS
  
  LoRa.setPins(csPin, resetPin, irqPin);       // Configura rádio
  if (!LoRa.begin(433E6)) {
    Serial.println("Falha no Hardware LoRa!");
    while (1);
  }
  Serial.println("Telemetria LoRa+GPS iniciada!");
}

void loop() {
  // Passo 1: Ler dados do GPS constantemente para não perder o sinal
  while (Serial2.available() > 0) {
    gps.encode(Serial2.read());
  }

  // Passo 2: A cada 10 segundos, enviar o pacote via LoRa
  if (millis() - tempoAnterior > 10000) {
    String mensagem = "Oi LoRa! ";
    
    // Se o GPS tiver sinal, anexa coordenadas
    if (gps.location.isValid()) {
      mensagem += "Lat:" + String(gps.location.lat(), 6);
      mensagem += " Lon:" + String(gps.location.lng(), 6);
    } else {
      mensagem += "Sem sinal GPS";
    }

    Serial.println("Enviando: " + mensagem);

    // Envio via rádio Ra-02
    LoRa.beginPacket();
    LoRa.print(mensagem);
    LoRa.endPacket();

    tempoAnterior = millis(); // Reinicia o cronômetro
  }
}