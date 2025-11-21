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

// Mapeo de reemplazos para eliminar puntos
const replacements = [
  { old: '"VentasProy.\\$"', new: '"VentasProy$"' },
  { old: '"PrecioUnit.\\$"', new: '"PrecioUnit$"' },
  { old: '"KilosProy."', new: '"KilosProy"' },
  { old: '"MargenUnit.\\$"', new: '"MargenUnit$"' },
  { old: '"MargenProy.\\$"', new: '"MargenProy$"' },
  { old: '"P.Foco\\$"', new: '"PFoco$"' },
];

files.forEach(file => {
  const filePath = path.join(levelsDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Aplicar todos los reemplazos
  replacements.forEach(({ old, new: newVal }) => {
    content = content.replace(new RegExp(old, 'g'), newVal);
  });

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Actualizado: ${file}`);
});

console.log('Todos los puntos eliminados de los headers correctamente.');
