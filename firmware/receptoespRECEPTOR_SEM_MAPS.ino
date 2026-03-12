#include <WiFi.h>
#include <ESPAsyncWebServer.h>
#include <LoRa.h>

// --- CONFIGURAÇÃO WI-FI ---
const char* ssid = "iPhone";
const char* password = "pedro123";

// --- PINOS LORA RA-02 (ESP32) ---
const int csPin = 5;
const int resetPin = 14;
const int irqPin = 2;

AsyncWebServer server(80);

// Variáveis de monitoramento
String ultimaMensagem = "Aguardando dados...";
int ultimoRSSI = 0;
float ultimoSNR = 0;

void setup() {
  Serial.begin(115200);

  // Conexão Wi-Fi
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nConectado! IP: " + WiFi.localIP().toString());

  // Configuração LoRa
  LoRa.setPins(csPin, resetPin, irqPin);
  if (!LoRa.begin(433E6)) {
    Serial.println("ERRO: Hardware LoRa não encontrado!");
  }

  // --- ROTA PRINCIPAL (INTERFACE) ---
  server.on("/", HTTP_GET, [](AsyncWebServerRequest *request){
    String html = "<html><head><meta charset='UTF-8'><meta name='viewport' content='width=device-width, initial-scale=1.0'>";
    html += "<title>Receptor LoRa</title><style>";
    html += "body{font-family:sans-serif; text-align:center; background:#121212; color:white; padding:20px;}";
    html += ".card{background:#1e1e1e; padding:20px; border-radius:12px; border:1px solid #333; max-width:400px; margin:auto;}";
    html += "h1{color:#00e676; font-size:1.5em;}";
    html += ".label{color:#888; font-size:0.8em; display:block; margin-top:15px; text-transform:uppercase;}";
    html += ".data{font-size:1.2em; font-weight:bold; display:block; color:#fff; word-wrap:break-word;}";
    html += "</style><script>";
    html += "setInterval(function(){";
    html += "  fetch('/api/data').then(r => r.json()).then(d => {";
    html += "    document.getElementById('msg').innerHTML = d.msg;";
    html += "    document.getElementById('rssi').innerHTML = d.rssi + ' dBm';";
    html += "    document.getElementById('snr').innerHTML = d.snr + ' dB';";
    html += "  });";
    html += "}, 1000);</script></head><body>";
    
    html += "<div class='card'><h1>📡 Terminal LoRa</h1>";
    html += "<span class='label'>Mensagem:</span><span id='msg' class='data'>" + ultimaMensagem + "</span>";
    html += "<span class='label'>Sinal (RSSI):</span><span id='rssi' class='data'>-</span>";
    html += "<span class='label'>Ruído (SNR):</span><span id='snr' class='data'>-</span>";
    html += "</div></body></html>";
    
    request->send(200, "text/html", html);
  });

  // --- ROTA DE DADOS (JSON) ---
  server.on("/api/data", HTTP_GET, [](AsyncWebServerRequest *request){
    String json = "{";
    json += "\"msg\":\"" + ultimaMensagem + "\",";
    json += "\"rssi\":" + String(ultimoRSSI) + ",";
    json += "\"snr\":" + String(ultimoSNR);
    json += "}";
    request->send(200, "application/json", json);
  });

  server.begin();
}

void loop() {
  int packetSize = LoRa.parsePacket();
  if (packetSize) {
    String recebido = "";
    while (LoRa.available()) {
      recebido += (char)LoRa.read();
    }
    
    ultimaMensagem = recebido;
    ultimoRSSI = LoRa.packetRssi();
    ultimoSNR = LoRa.packetSnr();
    
    Serial.printf("Recebido: %s | RSSI: %d\n", ultimaMensagem.c_str(), ultimoRSSI);
  }
}
