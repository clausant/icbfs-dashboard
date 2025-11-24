const currencyFormatter = new Intl.NumberFormat('es-CL', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const kilosFormatter = new Intl.NumberFormat('es-CL', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat('es-CL', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const dateFormatter = (dateString) => {
  if (!dateString) return '';
  // Extraer solo la parte de la fecha (YYYY-MM-DD) del formato ISO
  const datePart = dateString.split('T')[0];
  const [year, month, day] = datePart.split('-');
  return `${day}-${month}-${year}`;
};

// Comparador para ordenar fechas correctamente
const dateComparator = (date1, date2) => {
  if (!date1) return -1;
  if (!date2) return 1;

  // Extraer la fecha del formato ISO (antes del formateador)
  const d1 = new Date(date1.split('T')[0]);
  const d2 = new Date(date2.split('T')[0]);

  return d1.getTime() - d2.getTime();
};

export const fecha = {
  0: {
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
      { headerName: "Fecha", field: "detalle_factura.fecha_factura", valueFormatter: p => {
        if (!p.data) return '';
        // Si la fila es pinned (TOTAL), devolver el valor tal cual
        if (p.node && p.node.rowPinned) return p.data["detalle_factura.fecha_factura"];
        // Si no, formatear la fecha para display
        return dateFormatter(p.value || p.data["detalle_factura.fecha_factura"]);
      }, comparator: (date1, date2, node1, node2) => dateComparator(node1.data["detalle_factura.fecha_factura"], node2.data["detalle_factura.fecha_factura"]), enableRowGroup: true, filter: false, width: 150, pinned: 'left', sort: 'asc' },
      { headerName: "Venta$", field: "detalle_factura.valor_neto_sum", valueGetter: p => p.data ? Number(p.data["detalle_factura.valor_neto_sum"]) : 0, aggFunc: 'sum', enableValue: true, valueFormatter: p => currencyFormatter.format(p.value), sort: 'desc', width: 110, suppressHeaderMenuButton: true },
      { headerName: "VentasProy$", field: "detalle_factura.ventas_proyeccion", valueGetter: p => p.data ? Number(p.data["detalle_factura.ventas_proyeccion"]) : 0, aggFunc: 'sum', enableValue: true, valueFormatter: p => currencyFormatter.format(p.value), width: 120, suppressHeaderMenuButton: true },
      { headerName: "PrecioUnit$", field: "detalle_factura.precio_unitario", valueGetter: p => p.data ? Number(p.data["detalle_factura.precio_unitario"]) : 0, aggFunc: 'avg', enableValue: true, valueFormatter: p => currencyFormatter.format(p.value), width: 120, suppressHeaderMenuButton: true },
      { headerName: "Kilos", field: "detalle_factura.peso_neto_sum", valueGetter: p => p.data ? Number(p.data["detalle_factura.peso_neto_sum"]) : 0, aggFunc: 'sum', enableValue: true, valueFormatter: p => `${kilosFormatter.format(p.value || 0)}`, width: 120, suppressHeaderMenuButton: true },
      { headerName: "KilosProy", field: "detalle_factura.kilos_proyeccion", valueGetter: p => p.data ? Number(p.data["detalle_factura.kilos_proyeccion"]) : 0, aggFunc: 'sum', enableValue: true, valueFormatter: p => `${kilosFormatter.format(p.value || 0)}`, width: 120, suppressHeaderMenuButton: true },
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
};
