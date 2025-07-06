import { PrismaClient } from '@repo/database/generated/client';
const prisma = new PrismaClient();

async function main() {
    // Tenants
    const tenantA = 'tenant-a';
    const tenantB = 'tenant-b';

    // Usuarios
    await prisma.user.upsert({
        where: { email: 'clienteA@mail.com' },
        update: {},
        create: {
            email: 'clienteA@mail.com',
            name: 'Cliente',
            lastName: 'A',
            password: 'hashedpasswordA', // Usa hash real en prod
            role: 'user',
            permissions: [],
            tenantId: tenantA,
        },
    });
    await prisma.user.upsert({
        where: { email: 'clienteB@mail.com' },
        update: {},
        create: {
            email: 'clienteB@mail.com',
            name: 'Cliente',
            lastName: 'B',
            password: 'hashedpasswordB',
            role: 'user',
            permissions: [],
            tenantId: tenantB,
        },
    });

    // ModelDefinition para cada tenant
    await prisma.modelDefinition.createMany({
        data: [
            {
                tenantId: tenantA,
                tipo: 'orders',
                campos: [
                    { nombre: 'producto', tipo: 'string' },
                    { nombre: 'cantidad', tipo: 'number' },
                ],
            },
            {
                tenantId: tenantB,
                tipo: 'orders',
                campos: [
                    { nombre: 'producto', tipo: 'string' },
                    { nombre: 'precio', tipo: 'number' },
                ],
            },
        ],
        skipDuplicates: true,
    });

    // Registros para cada tenant
    await prisma.registro.createMany({
        data: [
            {
                tenantId: tenantA,
                tipo: 'orders',
                data: { producto: 'Manzana', cantidad: 10 },
            },
            {
                tenantId: tenantB,
                tipo: 'orders',
                data: { producto: 'Banana', precio: 20 },
            },
        ],
    });
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect()); 