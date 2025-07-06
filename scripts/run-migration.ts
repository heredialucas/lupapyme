import { execSync } from 'child_process';
import { join } from 'path';

const rootDir = join(__dirname, '..');

async function runMigration() {
    try {
        console.log('🚀 Iniciando migración completa de base de datos...\n');

        // Paso 1: Generar migración de Prisma
        console.log('📝 Paso 1: Generando migración de Prisma...');
        execSync('npx prisma migrate dev --name new_normalized_schema', {
            cwd: rootDir,
            stdio: 'inherit'
        });
        console.log('✅ Migración de Prisma completada\n');

        // Paso 2: Generar cliente de Prisma
        console.log('🔧 Paso 2: Generando cliente de Prisma...');
        execSync('npx prisma generate', {
            cwd: rootDir,
            stdio: 'inherit'
        });
        console.log('✅ Cliente de Prisma generado\n');

        // Paso 3: Migrar datos existentes
        console.log('📊 Paso 3: Migrando datos existentes...');
        execSync('npx tsx scripts/migrate-data.ts', {
            cwd: rootDir,
            stdio: 'inherit'
        });
        console.log('✅ Datos migrados\n');

        // Paso 4: Verificar integridad
        console.log('🔍 Paso 4: Verificando integridad de datos...');
        execSync('npx tsx scripts/verify-migration.ts', {
            cwd: rootDir,
            stdio: 'inherit'
        });
        console.log('✅ Verificación completada\n');

        console.log('🎉 ¡Migración completada exitosamente!');
        console.log('\n📋 Próximos pasos:');
        console.log('1. Actualizar servicios para usar nuevas tablas');
        console.log('2. Migrar componentes de UI');
        console.log('3. Testing completo');
        console.log('4. Optimizar índices y queries');

    } catch (error) {
        console.error('❌ Error durante la migración:', error);
        console.log('\n🔧 Para resolver problemas:');
        console.log('1. Verificar conexión a base de datos');
        console.log('2. Revisar logs de Prisma');
        console.log('3. Ejecutar: npx prisma db push --force-reset');
        process.exit(1);
    }
}

runMigration(); 