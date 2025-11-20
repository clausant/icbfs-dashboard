const fs = require('fs');
const path = require('path');

const levelsDir = path.join(__dirname, 'src', 'pages', 'dashboard', 'levels');

const files = [
  'categoria.js',
  'centro.js',
  'cliente.js',
  'canal.js',
  'direccion.js',
  'especialidad.js',
  'familia.js',
  'gerencia.js',
  'holding.js',
  'jefe_categoria.js',
  'marca.js',
  'numero_factura.js',
  'origen.js',
  'region.js',
  'sociedad.js',
  'sucursal.js',
  'um_venta.js',
  'vendedor.js',
  'zona.js'
];

files.forEach(file => {
  const filePath = path.join(levelsDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Cambiar width: 170 a width: 280 solo en la primera columna (que tiene pinned: 'left')
  // El patrón busca: width: 170, seguido de pinned: 'left'
  content = content.replace(
    /(width:\s*)170(,\s*pinned:\s*'left')/g,
    '$1280$2'
  );

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Actualizado: ${file}`);
});

console.log('Todos los archivos actualizados correctamente.');
