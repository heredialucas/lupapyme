/*
  Warnings:

  - Added the required column `tenantId` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- Paso 1: Agregar la columna como nullable
ALTER TABLE "User" ADD COLUMN "tenantId" TEXT;

-- Paso 2: Actualizar los usuarios existentes con los tenantId correctos
UPDATE "User" SET "tenantId" = 'tenant-a' WHERE email = 'clienteA@mail.com';
UPDATE "User" SET "tenantId" = 'tenant-b' WHERE email = 'clienteB@mail.com';

-- Si tienes más usuarios, asigna el tenantId correspondiente aquí

-- Paso 3: Hacer la columna NOT NULL
ALTER TABLE "User" ALTER COLUMN "tenantId" SET NOT NULL;
