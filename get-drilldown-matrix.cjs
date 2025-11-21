const fs = require('fs');
const path = require('path');

const levelsDir = path.join(__dirname, 'src', 'pages', 'dashboard', 'levels');

const vistas = [
  'categoria', 'cliente', 'vendedor', 'canal', 'zona', 'marca',
  'centro', 'numero_factura', 'familia', 'jefe_categoria', 'region',
  'origen', 'sociedad', 'um_venta', 'direccion', 'especialidad',
  'gerencia', 'sucursal', 'holding'
];

console.log('\n=== MATRIZ DE CONFIGURACIÓN DE DRILLDOWN ===\n');
console.log('Vista'.padEnd(20) + '| Niveles | Jerarquía de Drilldown');
console.log('-'.repeat(100));

vistas.forEach(vista => {
  const filePath = path.join(levelsDir, `${vista}.js`);

  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');

    // Contar niveles buscando los objetos numerados (0:, 1:, 2:, etc)
    const levels = [];
    const levelMatches = content.matchAll(/^\s*(\d+):\s*{/gm);

    for (const match of levelMatches) {
      levels.push(parseInt(match[1]));
    }

    // Extraer los nombres de las dimensiones para cada nivel
    const hierarchy = [];
    levels.forEach(level => {
      const regex = new RegExp(`${level}:\\s*{[^}]*dimensions:\\s*\\[["']([^"']+)["']`, 's');
      const match = content.match(regex);
      if (match) {
        const dimension = match[1].replace('detalle_factura.', '');
        hierarchy.push(dimension);
      }
    });

    const maxLevel = Math.max(...levels);
    const totalLevels = maxLevel + 1;

    console.log(
      vista.padEnd(20) +
      '| ' + totalLevels.toString().padEnd(7) +
      ' | ' + hierarchy.join(' → ')
    );
  }
});

console.log('\n');
