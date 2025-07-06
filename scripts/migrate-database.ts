import { execSync } from 'child_process';
import { join } from 'path';

const rootDir = join(__dirname, '..');

async function migrateDatabase() {
    try {
        console.log('🔄 Generando migración de Prisma...');

        // Generar migración
        execSync('npx prisma migrate dev --name new_schema', {
            cwd: rootDir,
            stdio: 'inherit'
        });

        console.log('✅ Migración completada');

        console.log('🔄 Generando cliente de Prisma...');

        // Generar cliente
        execSync('npx prisma generate', {
            cwd: rootDir,
            stdio: 'inherit'
        });

        console.log('✅ Cliente de Prisma generado');

        console.log('🎉 Base de datos migrada exitosamente');

    } catch (error) {
        console.error('❌ Error durante la migración:', error);
        process.exit(1);
    }
}

migrateDatabase(); 