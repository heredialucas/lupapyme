import { PrismaClient } from '../packages/database/generated/client/index.js';

const database = new PrismaClient();

async function checkUsers() {
    console.log('👥 Verificando usuarios existentes...');

    try {
        const users = await database.user.findMany({
            select: {
                id: true,
                name: true,
                lastName: true,
                email: true,
                tenantId: true,
                role: true,
                createdAt: true
            }
        });

        console.log(`📊 Usuarios encontrados: ${users.length}\n`);

        if (users.length === 0) {
            console.log('❌ No hay usuarios en la base de datos');
            console.log('💡 Necesitas crear un usuario primero');
            return;
        }

        console.log('👤 Usuarios disponibles:');
        console.log('='.repeat(80));

        users.forEach((user, index) => {
            console.log(`${index + 1}. ${user.name} ${user.lastName}`);
            console.log(`   Email: ${user.email}`);
            console.log(`   TenantId: ${user.tenantId}`);
            console.log(`   Role: ${user.role}`);
            console.log(`   Creado: ${user.createdAt.toLocaleDateString()}`);
            console.log('');
        });

        // Verificar si hay datos para estos tenantIds
        console.log('🔍 Verificando datos existentes por tenantId:');
        console.log('='.repeat(80));

        for (const user of users) {
            const modelDefinitions = await database.modelDefinition.findMany({
                where: { tenantId: user.tenantId }
            });

            const registros = await database.registro.findMany({
                where: { tenantId: user.tenantId }
            });

            console.log(`\n📋 Usuario: ${user.name} ${user.lastName} (${user.tenantId})`);
            console.log(`   ModelDefinitions: ${modelDefinitions.length}`);
            console.log(`   Registros: ${registros.length}`);

            if (modelDefinitions.length > 0) {
                console.log('   Tipos disponibles:');
                modelDefinitions.forEach(md => {
                    console.log(`     - ${md.tipo} (${(md.campos as any[]).length} campos)`);
                });
            }
        }

        console.log('\n💡 Para conectar los datos:');
        console.log('1. Usa uno de los tenantIds mostrados arriba');
        console.log('2. Ejecuta: pnpm seed-real (cambiando el tenantId en el script)');
        console.log('3. Los datos aparecerán cuando el usuario haga login');

    } catch (error) {
        console.error('❌ Error durante la verificación:', error);
        throw error;
    } finally {
        await database.$disconnect();
    }
}

// Ejecutar el script
checkUsers()
    .then(() => {
        console.log('🎉 Verificación de usuarios completada!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('💥 Error en la verificación:', error);
        process.exit(1);
    }); 