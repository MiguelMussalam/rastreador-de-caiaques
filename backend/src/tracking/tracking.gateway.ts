import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets'
import { Server, WebSocket } from 'ws'

@WebSocketGateway({ path: '/ws', cors: { origin: '*' } })
export class TrackingGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server

  handleConnection(client: WebSocket) {
    console.log('[WS] Browser conectado')
    client.send(JSON.stringify({ tipo: 'conectado' }))
  }

  handleDisconnect() {
    console.log('[WS] Browser desconectado')
  }

  broadcast(dados: unknown): void {
    if (!this.server) return
    const msg = JSON.stringify(dados)
    this.server.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(msg)
      }
    })
  }
}
