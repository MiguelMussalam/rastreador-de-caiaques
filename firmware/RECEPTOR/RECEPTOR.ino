#include <Arduino.h>

// Definindo os pinos da Serial2 do ESP32
#define RXD2 16
#define TXD2 17

void setup() {
  Serial.begin(115200); // Monitor Serial do PC
  
  // Comunicação com o módulo LoRa (9600 baud rate é o padrão de fábrica)
  Serial2.begin(9600, SERIAL_8N1, RXD2, TXD2);

  Serial.println("Receptor LoRa (Modo Transparente) Iniciado!");
  Serial.println("Aguardando mensagens...");
}

void loop() {
  // Verifica se há dados chegando na porta serial do LoRa
  if (Serial2.available()) {
    
    // Lê a mensagem recebida até encontrar a quebra de linha (\n)
    String mensagemRecebida = Serial2.readStringUntil('\n');
    
    // Remove possíveis espaços em branco ou retornos de carro (\r) extras do final
    mensagemRecebida.trim(); 
    
    // Imprime a mensagem na tela do computador
    Serial.print("Recebido do ar: ");
    Serial.println(mensagemRecebida);
  }
}
