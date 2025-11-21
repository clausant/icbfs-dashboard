const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'pages', 'dashboard', 'levels', 'categoria.js');
let content = fs.readFileSync(filePath, 'utf8');

// Agregar formateador de fecha después de numberFormatter
const dateFormatterCode = `
const dateFormatter = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return \`\${day}-\${month}-\${year}\`;
};
`;

// Insertar el formateador de fecha después de numberFormatter
content = content.replace(
  /(const numberFormatter = new Intl\.NumberFormat[^}]+}\);)/,
  `$1${dateFormatterCode}`
);

// Renumerar todos los niveles de 6 a 0, incrementando en 1
// Empezamos desde el nivel más alto para evitar conflictos
for (let i = 6; i >= 0; i--) {
  const oldLevel = `  ${i}: {`;
  const newLevel = `  ${i + 1}: {`;
  content = content.replace(new RegExp(`^  ${i}: \\{`, 'gm'), newLevel);
}

// Crear el nuevo nivel 0 con fecha
const newLevel0 = `  0: {
    dimensions: ["detalle_factura.fecha_factura"],
    measures: ["detalle_factura.valor_neto_sum",
      "detalle_factura.peso_neto_sum",
      "detalle_factura.sku_count",
      "detalle_factura.margen_porcentaje",
      "detalle_factura.margen_valor",
      "detalle_factura.ventas_proyeccion",
      "detalle_factura.kilos_proyeccion",
      "detalle_factura.margen_proyeccion",
      "detalle_factura.precio_unitario",
      "detalle_factura.margen_unitario",
      "detalle_factura.producto_foco_valor",
      "detalle_factura.ratio_sku_cliente",
      "detalle_factura.combinacion_sku_cliente"
    ],
    columnDefs: [
      { headerName: "Fecha", field: "detalle_factura.fecha_factura", valueGetter: p => p.data ? dateFormatter(p.data["detalle_factura.fecha_factura"]) : '', enableRowGroup: true, filter: false, width: 150, pinned: 'left' },
      { headerName: "Venta$", field: "detalle_factura.valor_neto_sum", valueGetter: p => p.data ? Number(p.data["detalle_factura.valor_neto_sum"]) : 0, aggFunc: 'sum', enableValue: true, valueFormatter: p => currencyFormatter.format(p.value), sort: 'desc', width: 110, suppressHeaderMenuButton: true },
      { headerName: "VentasProy$", field: "detalle_factura.ventas_proyeccion", valueGetter: p => p.data ? Number(p.data["detalle_factura.ventas_proyeccion"]) : 0, aggFunc: 'sum', enableValue: true, valueFormatter: p => currencyFormatter.format(p.value), width: 120, suppressHeaderMenuButton: true },
      { headerName: "PrecioUnit$", field: "detalle_factura.precio_unitario", valueGetter: p => p.data ? Number(p.data["detalle_factura.precio_unitario"]) : 0, aggFunc: 'avg', enableValue: true, valueFormatter: p => currencyFormatter.format(p.value), width: 120, suppressHeaderMenuButton: true },
      { headerName: "Kilos", field: "detalle_factura.peso_neto_sum", valueGetter: p => p.data ? Number(p.data["detalle_factura.peso_neto_sum"]) : 0, aggFunc: 'sum', enableValue: true, valueFormatter: p => \`\${kilosFormatter.format(p.value || 0)}\`, width: 120, suppressHeaderMenuButton: true },
      { headerName: "KilosProy", field: "detalle_factura.kilos_proyeccion", valueGetter: p => p.data ? Number(p.data["detalle_factura.kilos_proyeccion"]) : 0, aggFunc: 'sum', enableValue: true, valueFormatter: p => \`\${kilosFormatter.format(p.value || 0)}\`, width: 120, suppressHeaderMenuButton: true },
      { headerName: "#SKU", field: "detalle_factura.sku_count", valueGetter: p => p.data ? Number(p.data["detalle_factura.sku_count"]) : 0, aggFunc: 'sum', enableValue: true, valueFormatter: p => numberFormatter.format(p.value), width: 120, suppressHeaderMenuButton: true },
      { headerName: "MargenUnit$", field: "detalle_factura.margen_unitario", valueGetter: p => p.data ? Number(p.data["detalle_factura.margen_unitario"]) : 0, aggFunc: 'avg', enableValue: true, valueFormatter: p => currencyFormatter.format(p.value), width: 120, suppressHeaderMenuButton: true },
      { headerName: "Margen%", field: "detalle_factura.margen_porcentaje", valueGetter: p => p.data ? Number(p.data["detalle_factura.margen_porcentaje"]) : 0, aggFunc: 'avg', enableValue: true, valueFormatter: p => Number(p.value).toFixed(2), width: 120, suppressHeaderMenuButton: true },
      { headerName: "Margen$", field: "detalle_factura.margen_valor", valueGetter: p => p.data ? Number(p.data["detalle_factura.margen_valor"]) : 0, aggFunc: 'sum', enableValue: true, valueFormatter: p => currencyFormatter.format(p.value), width: 120, suppressHeaderMenuButton: true },
      { headerName: "MargenProy$", field: "detalle_factura.margen_proyeccion", valueGetter: p => p.data ? Number(p.data["detalle_factura.margen_proyeccion"]) : 0, aggFunc: 'sum', enableValue: true, valueFormatter: p => currencyFormatter.format(p.value), width: 120, suppressHeaderMenuButton: true },
      { headerName: "PFoco$", field: "detalle_factura.producto_foco_valor", valueGetter: p => p.data ? Number(p.data["detalle_factura.producto_foco_valor"]) : 0, aggFunc: 'sum', enableValue: true, valueFormatter: p => currencyFormatter.format(p.value), width: 120, suppressHeaderMenuButton: true },
      { headerName: "#SKU/Cliente", field: "detalle_factura.ratio_sku_cliente", valueGetter: p => p.data ? Number(p.data["detalle_factura.ratio_sku_cliente"]) : 0, aggFunc: 'sum', enableValue: true, width: 120, suppressHeaderMenuButton: true },
      { headerName: "CombSKU/Cliente#", field: "detalle_factura.combinacion_sku_cliente", valueGetter: p => p.data ? Number(p.data["detalle_factura.combinacion_sku_cliente"]) : 0, aggFunc: 'sum', enableValue: true, valueFormatter: p => numberFormatter.format(p.value), width: 120, suppressHeaderMenuButton: true },
    ],
    drillDownField: "detalle_factura.fecha_factura",
  },
`;

// Insertar el nuevo nivel 0 después de "export const categoria = {"
content = content.replace(
  /export const categoria = \{/,
  `export const categoria = {\n${newLevel0}`
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('✅ Nivel de fecha agregado exitosamente a categoria.js');
console.log('📊 Nueva jerarquía: Fecha → Categoría → Familia → Sub Familia → SKU → Holding → Cliente → Sala (8 niveles)');
