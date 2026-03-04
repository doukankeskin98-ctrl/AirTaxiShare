import { Controller, Get } from '@nestjs/common';
import {
    HealthCheckService,
    HealthCheck,
    TypeOrmHealthIndicator,
} from '@nestjs/terminus';

@Controller('health')
export class HealthController {
    constructor(
        private health: HealthCheckService,
        private db: TypeOrmHealthIndicator,
    ) { }

    @Get()
    @HealthCheck()
    check() {
        return this.health.check([
            // 5s timeout to handle cross-region latency (API: Frankfurt, DB: Oregon)
            () => this.db.pingCheck('database', { timeout: 5000 }),
        ]);
    }
}
