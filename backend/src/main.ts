import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { WsAdapter } from '@nestjs/platform-ws'
import { GlobalExceptionFilter } from './presentation/middlewares/exception.filter'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.useGlobalFilters(new GlobalExceptionFilter())

  app.setGlobalPrefix('api')
  app.useWebSocketAdapter(new WsAdapter(app))

  app.enableCors({
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })

  const port = process.env.PORT ?? 3000
  await app.listen(port)
  console.log(`Servidor rodando na porta ${port}`)
}
bootstrap()
