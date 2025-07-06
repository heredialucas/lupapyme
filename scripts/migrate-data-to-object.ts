import { PrismaClient } from '../packages/database/generated/client/index.js';

const prisma = new PrismaClient();

async function migrateDataToObject() {
    try {
        console.log('🔄 Iniciando migración de datos de array a objeto...');

        // Obtener todos los registros
        const registros = await prisma.registro.findMany();
        console.log(`📊 Encontrados ${registros.length} registros para migrar`);

        let migratedCount = 0;
        let skippedCount = 0;

        for (const registro of registros) {
            const data = registro.data as any;

            // Solo migrar si los datos están en formato array
            if (Array.isArray(data)) {
                console.log(`🔄 Migrando registro ${registro.id}:`, data);

                // Obtener la definición del modelo para este registro
                const modelDefinition = await prisma.modelDefinition.findFirst({
                    where: { tenantId: registro.tenantId, tipo: registro.tipo }
                });

                if (!modelDefinition) {
                    console.log(`⚠️ No se encontró definición de modelo para ${registro.tenantId}/${registro.tipo}`);
                    skippedCount++;
                    continue;
                }

                // Convertir array a objeto usando los campos de la definición
                const campos = modelDefinition.campos as any[];
                const dataAsObject: Record<string, any> = {};

                campos.forEach((campo: any, index: number) => {
                    const value = data[index];
                    if (value !== undefined) {
                        dataAsObject[campo.name] = value;
                    }
                });

                console.log(`✅ Convertido a objeto:`, dataAsObject);

                // Actualizar el registro con el nuevo formato
                await prisma.registro.update({
                    where: { id: registro.id },
                    data: { data: dataAsObject }
                });

                migratedCount++;
            } else {
                console.log(`⏭️ Registro ${registro.id} ya está en formato objeto, saltando...`);
                skippedCount++;
            }
        }

        console.log(`✅ Migración completada:`);
        console.log(`   - Migrados: ${migratedCount}`);
        console.log(`   - Saltados: ${skippedCount}`);
        console.log(`   - Total: ${migratedCount + skippedCount}`);

    } catch (error) {
        console.error('❌ Error durante la migración:', error);
    } finally {
        await prisma.$disconnect();
    }
}

// Ejecutar la migración
migrateDataToObject(); 