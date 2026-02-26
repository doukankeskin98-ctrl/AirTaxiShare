import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
dotenv.config();

const dbUrl = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/airtaxi';

const AppDataSource = new DataSource({
    type: 'postgres',
    url: dbUrl,
    ssl: { rejectUnauthorized: false },
});

async function run() {
    await AppDataSource.initialize();
    console.log('DB Connected');

    const passwordHash = await bcrypt.hash('HqAdminPass123!', 10);

    await AppDataSource.query(`
        INSERT INTO users (id, email, "fullName", "passwordHash", role, status, "createdAt", "updatedAt")
        VALUES (
            gen_random_uuid(),
            'hq@airtaxishare.com',
            'HQ Administrator',
            $1,
            'ADMIN',
            'ACTIVE',
            NOW(),
            NOW()
        )
        ON CONFLICT (email) DO UPDATE SET "passwordHash" = $1, role = 'ADMIN';
    `, [passwordHash]);

    console.log('HQ Admin Seeded: hq@airtaxishare.com / HqAdminPass123!');
    await AppDataSource.destroy();
}

run().catch(console.error);
