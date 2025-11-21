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

  // Cambiar valueFormatter de Margen% para eliminar el " %"
  // De: valueFormatter: p => `${Number(p.value).toFixed(2)} %`
  // A: valueFormatter: p => Number(p.value).toFixed(2)
  content = content.replace(
    /valueFormatter:\s*p\s*=>\s*`\$\{Number\(p\.value\)\.toFixed\(2\)\}\s+%`/g,
    'valueFormatter: p => Number(p.value).toFixed(2)'
  );

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Actualizado: ${file}`);
});

console.log('% eliminado de los datos de Margen% en todos los archivos.');
