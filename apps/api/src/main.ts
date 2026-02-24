import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';
// Use require for CJS middlewares to ensure runtime compatibility on Render/Linux
const helmet = require('helmet');
const compression = require('compression');

async function bootstrap() {
    const logger = new Logger('Bootstrap');
    const app = await NestFactory.create(AppModule, {
        logger: ['error', 'warn', 'log', 'debug'],
        bodyParser: true,
    });

    // Increase body size limit to 10mb (default is 100kb — too small for profile photos)
    app.use(require('express').json({ limit: '10mb' }));
    app.use(require('express').urlencoded({ limit: '10mb', extended: true }));

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
