#include <SPI.h>    // Biblioteca para comunicação SPI
#include <LoRa.h>   // Biblioteca do rádio LoRa

// --- MAPEAMENTO DE PINOS LORA RA-02 (Igual ao seu Receptor) ---
const int csPin = 5;          // NSS (Chip Select)
const int resetPin = 14;       // RST (Reset)
const int irqPin = 2;          // DIO0 (Interrupção)

int counter = 0;

void setup() {
  Serial.begin(115200);       // Inicia monitor serial
  while (!Serial);            // Aguarda a conexão USB

  Serial.println("--- TESTE 1.1: EMISSOR LORA ---");

  // Configura os pinos do rádio conforme sua montagem
  LoRa.setPins(csPin, resetPin, irqPin);

  // Inicializa o rádio em 433MHz (Mesma frequência do receptor)
  if (!LoRa.begin(433E6)) {   
    Serial.println("ERRO: Hardware LoRa não encontrado!");
    while (1);                // Trava o código se houver erro
  }
  
  Serial.println("LoRa pronto para transmitir!");
}

void loop() {
  Serial.print("Transmitindo pacote: ");
  Serial.println(counter);

  // --- INÍCIO DO ENVIO ---
  LoRa.beginPacket();         // Abre o pacote para escrita
  LoRa.print("Olá LORA #"); 
  LoRa.print(counter);        // Envia o valor do contador
  LoRa.endPacket();           // Fecha o pacote e envia via rádio
  // --- FIM DO ENVIO ---

  counter++;
  delay(1000);                // Envia a cada 5 segundos
}
