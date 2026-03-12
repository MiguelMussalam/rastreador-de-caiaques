#include <WiFi.h>
#include <ESPAsyncWebServer.h>
#include <SPIFFS.h>
#include <LoRa.h>
#include <math.h>

const char* ssid = "iPhone";
const char* password = "pedro123";

// Pinos LoRa
const int csPin = 5;
const int resetPin = 14;
const int irqPin = 2;

AsyncWebServer server(80);

String ultimaMensagem = "Aguardando GPS...";
float ultimoRSSI = 0;
float latAtual = 0;
float lonAtual = 0;

void setup() {
  Serial.begin(115200);
  if(!SPIFFS.begin(true)) Serial.println("Erro SPIFFS");

  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) { delay(500); Serial.print("."); }

  LoRa.setPins(csPin, resetPin, irqPin);
  if (!LoRa.begin(433E6)) Serial.println("Erro LoRa");

  server.on("/", HTTP_GET, [](AsyncWebServerRequest *request){
    String html = "<html><head><meta charset='UTF-8'><meta name='viewport' content='width=device-width, initial-scale=1.0'>";
    html += "<style>body{font-family:sans-serif;text-align:center;background:#121212;color:white;padding:20px;}";
    html += ".card{background:#1e1e1e;padding:20px;border-radius:20px;box-shadow:0 4px 20px rgba(0,0,0,0.5);}";
    html += ".distancia{font-size:3.5em;color:#00e676;font-weight:bold;margin:20px 0;}";
    html += "button{width:100%;padding:15px;font-size:1.2em;border-radius:10px;border:none;background:#2979ff;color:white;font-weight:bold;cursor:pointer;}";
    html += "button:active{background:#1565c0;} .info{color:#bbb;font-size:0.9em;margin-top:10px;}</style>";
    
    html += "<script>";
    html += "let latRef = null; let lonRef = null;";
    html += "function calcularDistancia(lat1, lon1, lat2, lon2) {";
    html += "  const R = 6371e3; const p1 = lat1 * Math.PI/180; const p2 = lat2 * Math.PI/180;";
    html += "  const dp = (lat2-lat1) * Math.PI/180; const dl = (lon2-lon1) * Math.PI/180;";
    html += "  const a = Math.sin(dp/2) * Math.sin(dp/2) + Math.cos(p1) * Math.cos(p2) * Math.sin(dl/2) * Math.sin(dl/2);";
    html += "  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); return R * c;";
    html += "}";
    
    html += "function marcarPonto() {";
    html += "  fetch('/api/data').then(r => r.json()).then(d => {";
    html += "    if(d.lat != 0) { latRef = d.lat; lonRef = d.lon; alert('Ponto A marcado!'); }";
    html += "    else { alert('Aguardando sinal GPS válido...'); }";
    html += "  });";
    html += "}";

    html += "setInterval(() => {";
    html += "  fetch('/api/data').then(r => r.json()).then(d => {";
    html += "    if(latRef && d.lat != 0) {";
    html += "      let dist = calcularDistancia(latRef, lonRef, d.lat, d.lon);";
    html += "      document.getElementById('display').innerHTML = dist.toFixed(2) + ' m';";
    html += "    }";
    html += "    document.getElementById('status').innerHTML = 'Sinal: ' + d.rssi + ' dBm';";
    html += "  });";
    html += "}, 1000);</script></head><body>";
    
    html += "<div class='card'><h2>Medidor de Distância</h2>";
    html += "<div id='display' class='distancia'>0.00 m</div>";
    html += "<button onclick='marcarPonto()'>MARCAR PONTO A</button>";
    html += "<p class='info'>Clique em MARCAR, ande com o emissor e veja a distância aumentar.</p>";
    html += "<div id='status' class='info'>-</div></div></body></html>";
    
    request->send(200, "text/html", html);
  });

  server.on("/api/data", HTTP_GET, [](AsyncWebServerRequest *request){
    String json = "{\"lat\":" + String(latAtual, 6) + ",\"lon\":" + String(lonAtual, 6) + ",\"rssi\":" + String(ultimoRSSI) + "}";
    request->send(200, "application/json", json);
  });

  server.begin();
}

void loop() {
  int packetSize = LoRa.parsePacket();
  if (packetSize) {
    String msg = "";
    while (LoRa.available()) msg += (char)LoRa.read();
    ultimoRSSI = LoRa.packetRssi();

    // Extração simples de Lat e Lon da String enviada pelo seu emissor
    int latPos = msg.indexOf("Lat:");
    int lonPos = msg.indexOf("Lon:");
    if (latPos != -1 && lonPos != -1) {
      latAtual = msg.substring(latPos + 4, msg.indexOf(" ", latPos)).toFloat();
      lonAtual = msg.substring(lonPos + 4).toFloat();
    }
  }
}
