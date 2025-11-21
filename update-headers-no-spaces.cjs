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

// Mapeo de reemplazos
const replacements = [
  { old: '"Venta $"', new: '"Venta$"' },
  { old: '"Ventas Proy. $"', new: '"VentasProy.$"' },
  { old: '"Precio Unit. $"', new: '"PrecioUnit.$"' },
  { old: '"Kilos Proy."', new: '"KilosProy."' },
  { old: '"Margen Unit. $"', new: '"MargenUnit.$"' },
  { old: '"Margen %"', new: '"Margen%"' },
  { old: '"Margen $"', new: '"Margen$"' },
  { old: '"Margen Proy. $"', new: '"MargenProy.$"' },
  { old: '"P. Foco $"', new: '"P.Foco$"' },
  { old: '"Comb. SKU - Cliente"', new: '"Comb.SKU-Cliente#"' },
];

files.forEach(file => {
  const filePath = path.join(levelsDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Aplicar todos los reemplazos
  replacements.forEach(({ old, new: newVal }) => {
    content = content.replace(new RegExp(old.replace(/\$/g, '\\$'), 'g'), newVal);
  });

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Actualizado: ${file}`);
});

console.log('Todos los headers actualizados correctamente.');
