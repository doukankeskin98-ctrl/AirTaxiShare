import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import helmet from 'helmet';
import * as compression from 'compression';

async function bootstrap() {
    const logger = new Logger('Bootstrap');
    const app = await NestFactory.create(AppModule, {
        logger: ['error', 'warn', 'log', 'debug'],
    });

    // Security headers
    app.use(helmet());

    // Gzip compression (~70% bandwidth reduction)
    app.use(compression());

    // CORS — tighten in production by specifying allowed origins
    app.enableCors({
        origin: process.env.ALLOWED_ORIGINS?.split(',') || true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
        credentials: true,
    });

    // Global input validation pipe — strips unknown fields and validates DTOs
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,            // Strip fields not in DTO
            forbidNonWhitelisted: true, // Reject requests with unknown fields
            transform: true,            // Auto-transform types (e.g., string → number)
            transformOptions: { enableImplicitConversion: true },
        }),
    );

    // Graceful shutdown
    app.enableShutdownHooks();

    const port = process.env.PORT || 3000;
    await app.listen(port);
    logger.log(`🚀 AirTaxiShare API running on port ${port}`);
    logger.log(`📦 Environment: ${process.env.NODE_ENV || 'development'}`);
}

bootstrap().catch((err) => {
    console.error('Fatal startup error:', err);
    process.exit(1);
});
