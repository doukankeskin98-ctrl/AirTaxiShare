import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';
import { Logger } from '@nestjs/common';

export class RedisIoAdapter extends IoAdapter {
    private adapterConstructor: ReturnType<typeof createAdapter>;
    private logger = new Logger(RedisIoAdapter.name);

    async connectToRedis(): Promise<void> {
        const redisUrl = process.env.REDIS_URL;
        if (!redisUrl) {
            this.logger.warn('REDIS_URL is not defined. Falling back to in-memory adapter.');
            return;
        }

        try {
            const pubClient = createClient({ url: redisUrl });
            const subClient = pubClient.duplicate();

            await Promise.all([pubClient.connect(), subClient.connect()]);

            this.adapterConstructor = createAdapter(pubClient, subClient);
            this.logger.log('Connected to Redis for WebSockets Adapter');
        } catch (error) {
            this.logger.error('Failed to connect to Redis for WebSockets Adapter', error);
            throw error;
        }
    }

    createIOServer(port: number, options?: ServerOptions): any {
        const server = super.createIOServer(port, options);
        if (this.adapterConstructor) {
            server.adapter(this.adapterConstructor);
        }
        return server;
    }
}
