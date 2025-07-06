import * as XLSX from 'xlsx';
import { writeFileSync } from 'fs';
import { join } from 'path';

function generateExampleExcel() {
    try {
        console.log('📊 Generando archivo Excel de ejemplo...');

        // Datos de ejemplo con headers que coinciden con los labels de los campos
        const data = [
            {
                'Nombre del Producto': 'Laptop Gaming',
                'Descripción': 'Laptop para gaming con RTX 4060',
                'Precio': 1299.99,
                'Categoría': 'Electrónicos',
                'Stock Disponible': 12
            },
            {
                'Nombre del Producto': 'Auriculares Sony',
                'Descripción': 'Auriculares inalámbricos con cancelación de ruido',
                'Precio': 299.99,
                'Categoría': 'Electrónicos',
                'Stock Disponible': 25
            },
            {
                'Nombre del Producto': 'Zapatillas Nike',
                'Descripción': 'Zapatillas deportivas para running',
                'Precio': 89.99,
                'Categoría': 'Deportes',
                'Stock Disponible': 50
            },
            {
                'Nombre del Producto': 'Silla de Oficina',
                'Descripción': 'Silla ergonómica para oficina',
                'Precio': 199.99,
                'Categoría': 'Hogar',
                'Stock Disponible': 8
            },
            {
                'Nombre del Producto': 'Camiseta Polo',
                'Descripción': 'Camiseta polo en algodón pima',
                'Precio': 39.99,
                'Categoría': 'Ropa',
                'Stock Disponible': 75
            }
        ];

        // Crear workbook y worksheet
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet(data);

        // Ajustar ancho de columnas
        worksheet['!cols'] = [
            { wch: 20 }, // Nombre del Producto
            { wch: 30 }, // Descripción
            { wch: 12 }, // Precio
            { wch: 15 }, // Categoría
            { wch: 15 }  // Stock Disponible
        ];

        // Agregar worksheet al workbook
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Productos');

        // Generar el archivo
        const filePath = join(process.cwd(), 'productos-ejemplo.xlsx');
        const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });
        writeFileSync(filePath, buffer);

        console.log('✅ Archivo Excel generado exitosamente:');
        console.log(`📁 Ruta: ${filePath}`);
        console.log('\n📋 Headers del archivo:');
        console.log('- Nombre del Producto');
        console.log('- Descripción');
        console.log('- Precio');
        console.log('- Categoría');
        console.log('- Stock Disponible');
        console.log('\n💡 Instrucciones:');
        console.log('1. Descarga el archivo productos-ejemplo.xlsx');
        console.log('2. Ve a la tabla y haz clic en "Crear Registro"');
        console.log('3. Haz clic en "Seleccionar Excel"');
        console.log('4. Selecciona el archivo productos-ejemplo.xlsx');
        console.log('5. Revisa los datos mapeados y crea los registros');

    } catch (error) {
        console.error('❌ Error generando Excel:', error);
    }
}

// Ejecutar el script
generateExampleExcel(); 