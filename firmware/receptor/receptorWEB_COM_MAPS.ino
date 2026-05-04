#include <WiFi.h>
#include <ESPAsyncWebServer.h>
#include <SPIFFS.h>
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
float ultimoRSSI = 0;
float ultimoSNR = 0;

void setup() {
  Serial.begin(115200);

  if(!SPIFFS.begin(true)){
    Serial.println("Erro ao montar SPIFFS");
  }

  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nConectado! IP: " + WiFi.localIP().toString());

  LoRa.setPins(csPin, resetPin, irqPin);
  if (!LoRa.begin(433E6)) {
    Serial.println("ERRO: Hardware LoRa não encontrado!");
  }

  // --- ROTAS DO SERVIDOR ---

  server.on("/", HTTP_GET, [](AsyncWebServerRequest *request){
    String html = "<html><head><meta charset='UTF-8'><meta name='viewport' content='width=device-width, initial-scale=1.0'>";
    html += "<title>Monitor GPS LoRa</title><style>";
    html += "body{font-family:sans-serif;text-align:center;background:#f0f2f5;margin:0;padding:20px;}";
    html += ".card{background:white;padding:25px;border-radius:15px;display:inline-block;box-shadow:0 4px 15px rgba(0,0,0,0.1);width:100%;max-width:400px;}";
    html += "h1{color:#1a73e8;margin-bottom:20px;} .label{color:#70757a;font-size:0.85em;text-transform:uppercase;display:block;margin-top:15px;}";
    html += ".data{font-size:1.4em;color:#202124;font-weight:bold;display:block;word-wrap:break-word;}";
    html += ".btn{display:inline-block;margin-top:20px;padding:12px 24px;background:#1a73e8;color:white;text-decoration:none;border-radius:8px;font-weight:bold;}";
    html += "</style><script>";
    html += "function updateData(){";
    html += "  fetch('/api/data').then(r => r.json()).then(d => {";
    html += "    document.getElementById('msg').innerHTML = d.msg;";
    html += "    document.getElementById('rssi').innerHTML = d.rssi + ' dBm';";
    html += "    document.getElementById('snr').innerHTML = d.snr + ' dB';";
    // Extrai coordenadas se existirem na string para criar o link do mapa
    html += "    let coords = d.msg.match(/Lat:([-?0-9.]+) Lon:([-?0-9.]+)/);";
    html += "    if(coords){";
    html += "      document.getElementById('mapBtn').href = 'https://www.google.com/maps?q=' + coords[1] + ',' + coords[2];";
    html += "      document.getElementById('mapBtn').style.display = 'inline-block';";
    html += "    } else { document.getElementById('mapBtn').style.display = 'none'; }";
    html += "  });";
    html += "}";
    html += "setInterval(updateData, 2000);</script></head><body>";
    html += "<div class='card'><h1>📡 Rastreador GPS</h1>";
    html += "<span class='label'>Dados Recebidos:</span><span id='msg' class='data'>Aguardando...</span>";
    html += "<a id='mapBtn' href='#' target='_blank' class='btn' style='display:none;'>📍 Ver no Google Maps</a>";
    html += "<hr style='border:0;border-top:1px solid #eee;margin:20px 0;'>";
    html += "<span class='label'>Sinal (RSSI):</span><span id='rssi' class='data'>-</span>";
    html += "<span class='label'>Qualidade (SNR):</span><span id='snr' class='data'>-</span>";
    html += "</div></body></html>";
    
    request->send(200, "text/html", html);
  });

  server.on("/api/data", HTTP_GET, [](AsyncWebServerRequest *request){
    String json = "{";
    json += "\"msg\":\"" + ultimaMensagem + "\",";
    json += "\"rssi\":" + String(ultimoRSSI) + ",";
    json += "\"snr\":" + String(ultimoSNR);
    json += "}";
    request->send(200, "application/json", json);
  });

  server.begin();
  Serial.println("Servidor Online!");
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
    
    Serial.printf("Pacote: %s | RSSI: %.1f\n", ultimaMensagem.c_str(), ultimoRSSI);
  }
}
a#include <WiFi.h>
#include <HTTPClient.h>
#include <ESPAsyncWebServer.h>
#include <SPIFFS.h>
#include <LoRa.h>

// --- CONFIGURAÇÃO WI-FI ---
const char* ssid = "iPhone";
const char* password = "pedro123";

// --- URL DO BACKEND (troque pelo IP da sua máquina) ---
const char* backendUrl = "http://192.168.15.56:3000/api/v1/tracking";

// --- ID DO CAIAQUE (UUID gerado pelo backend ao criar o caiaque) ---
const char* kayakId = "COLE-AQUI-O-UUID-DO-CAIAQUE";

// --- PINOS LORA RA-02 (ESP32) ---
const int csPin = 5;
const int resetPin = 14;
const int irqPin = 2;

AsyncWebServer server(80);

// Variáveis de monitoramento
String ultimaMensagem = "Aguardando dados...";
float ultimoRSSI = 0;
float ultimoSNR = 0;
float latAtual = 0;
float lonAtual = 0;

// --- FUNÇÃO QUE ENVIA OS DADOS PRO BACKEND ---
void enviarParaBackend(float lat, float lon) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi desconectado, pulando envio...");
    return;
  }

  HTTPClient http;
  http.begin(backendUrl);
  http.addHeader("Content-Type", "application/json");

  String json = "{";
  json += "\"kayakId\":\"" + String(kayakId) + "\",";
  json += "\"latitude\":" + String(lat, 6) + ",";
  json += "\"longitude\":" + String(lon, 6);
  json += "}";

  Serial.println("Enviando para backend: " + json);

  int httpCode = http.POST(json);

  if (httpCode > 0) {
    Serial.printf("Backend respondeu: %d\n", httpCode);
  } else {
    Serial.printf("Erro ao enviar: %s\n", http.errorToString(httpCode).c_str());
  }

  http.end();
}

void setup() {
  Serial.begin(115200);

  if(!SPIFFS.begin(true)){
    Serial.println("Erro ao montar SPIFFS");
  }

  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nConectado! IP: " + WiFi.localIP().toString());

  LoRa.setPins(csPin, resetPin, irqPin);
  if (!LoRa.begin(433E6)) {
    Serial.println("ERRO: Hardware LoRa não encontrado!");
  }

  // --- ROTAS DO SERVIDOR WEB ---

  server.on("/", HTTP_GET, [](AsyncWebServerRequest *request){
    String html = "<html><head><meta charset='UTF-8'><meta name='viewport' content='width=device-width, initial-scale=1.0'>";
    html += "<title>Monitor GPS LoRa</title><style>";
    html += "body{font-family:sans-serif;text-align:center;background:#f0f2f5;margin:0;padding:20px;}";
    html += ".card{background:white;padding:25px;border-radius:15px;display:inline-block;box-shadow:0 4px 15px rgba(0,0,0,0.1);width:100%;max-width:400px;}";
    html += "h1{color:#1a73e8;margin-bottom:20px;} .label{color:#70757a;font-size:0.85em;text-transform:uppercase;display:block;margin-top:15px;}";
    html += ".data{font-size:1.4em;color:#202124;font-weight:bold;display:block;word-wrap:break-word;}";
    html += ".btn{display:inline-block;margin-top:20px;padding:12px 24px;background:#1a73e8;color:white;text-decoration:none;border-radius:8px;font-weight:bold;}";
    html += "</style><script>";
    html += "function updateData(){";
    html += "  fetch('/api/data').then(r => r.json()).then(d => {";
    html += "    document.getElementById('msg').innerHTML = d.msg;";
    html += "    document.getElementById('rssi').innerHTML = d.rssi + ' dBm';";
    html += "    document.getElementById('snr').innerHTML = d.snr + ' dB';";
    html += "    let coords = d.msg.match(/Lat:([-?0-9.]+) Lon:([-?0-9.]+)/);";
    html += "    if(coords){";
    html += "      document.getElementById('mapBtn').href = 'https://www.google.com/maps?q=' + coords[1] + ',' + coords[2];";
    html += "      document.getElementById('mapBtn').style.display = 'inline-block';";
    html += "    } else { document.getElementById('mapBtn').style.display = 'none'; }";
    html += "  });";
    html += "}";
    html += "setInterval(updateData, 2000);</script></head><body>";
    html += "<div class='card'><h1>📡 Rastreador GPS</h1>";
    html += "<span class='label'>Dados Recebidos:</span><span id='msg' class='data'>Aguardando...</span>";
    html += "<a id='mapBtn' href='#' target='_blank' class='btn' style='display:none;'>📍 Ver no Google Maps</a>";
    html += "<hr style='border:0;border-top:1px solid #eee;margin:20px 0;'>";
    html += "<span class='label'>Sinal (RSSI):</span><span id='rssi' class='data'>-</span>";
    html += "<span class='label'>Qualidade (SNR):</span><span id='snr' class='data'>-</span>";
    html += "</div></body></html>";
    
    request->send(200, "text/html", html);
  });

  server.on("/api/data", HTTP_GET, [](AsyncWebServerRequest *request){
    String json = "{";
    json += "\"msg\":\"" + ultimaMensagem + "\",";
    json += "\"rssi\":" + String(ultimoRSSI) + ",";
    json += "\"snr\":" + String(ultimoSNR);
    json += "}";
    request->send(200, "application/json", json);
  });

  server.begin();
  Serial.println("Servidor Online!");
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

    Serial.printf("Pacote: %s | RSSI: %.1f\n", ultimaMensagem.c_str(), ultimoRSSI);

    // Extrai Lat e Lon e envia pro backend
    int latPos = recebido.indexOf("Lat:");
    int lonPos = recebido.indexOf("Lon:");

    if (latPos != -1 && lonPos != -1) {
      latAtual = recebido.substring(latPos + 4, recebido.indexOf(" ", latPos)).toFloat();
      lonAtual = recebido.substring(lonPos + 4).toFloat();

      enviarParaBackend(latAtual, lonAtual);
    }
  }
}
