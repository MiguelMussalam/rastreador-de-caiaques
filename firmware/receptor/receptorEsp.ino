#include <SPI.h>    // Biblioteca para comunicação SPI
#include <LoRa.h>   // Biblioteca do rádio LoRa

// --- MAPEAMENTO DE PINOS LORA RA-02 ---
// SCK: 18 | MISO: 19 | MOSI: 23 (Padrão ESP32)
const int csPin = 5;          // NSS (Chip Select)
const int resetPin = 14;       // RST (Reset)
const int irqPin = 2;          // DIO0 (Interrupção)

void setup() {
  Serial.begin(115200);       // Inicia monitor serial para o PC
  while (!Serial);            // Aguarda a conexão USB ser estabelecida

  Serial.println("--- TESTE 1.1: RECEPTOR LORA ---");

  // Configura os pinos do rádio
  LoRa.setPins(csPin, resetPin, irqPin);

  // Inicializa o rádio em 433MHz
  if (!LoRa.begin(433E6)) {   
    Serial.println("ERRO: Hardware LoRa não encontrado!");
    while (1);                // Trava o código se houver erro de fiação
  }
  Serial.println("Aguardando mensagens...");
}

void loop() {
  // Verifica se chegou algum pacote de rádio
  int packetSize = LoRa.parsePacket();
  
  if (packetSize) {           // Se o tamanho for maior que zero, algo chegou
    Serial.print("Recebido: ");

    // Enquanto houver bytes no buffer do rádio, lê e imprime
    while (LoRa.available()) {
      char c = (char)LoRa.read(); 
      Serial.print(c);
    }

    // Exibe a força do sinal (RSSI). Quanto mais perto de 0, melhor o sinal.
    Serial.print(" | RSSI: ");
    Serial.println(LoRa.packetRssi());
  }
}