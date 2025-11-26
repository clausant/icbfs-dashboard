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

export const especialidad = {
  0: {
    dimensions: ["detalle_factura.id_grupo_cliente", "detalle_factura.grupo_cliente"],
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
      "detalle_factura.cliente_count",
      "detalle_factura.ratio_sku_cliente",
      "detalle_factura.combinacion_sku_cliente"
    ],
    columnDefs: [
      {
        headerName: "Especialidad",
        field: "especialidad_concat",
        valueGetter: p => {
          if (!p.data) return '';
          const id = p.data["detalle_factura.id_grupo_cliente"] || '';
          const nombre = p.data["detalle_factura.grupo_cliente"] || '';
          return id && nombre ? `${id} - ${nombre}` : (nombre || id || '');
        },
        enableRowGroup: true,
        filter: 'agSetColumnFilter',
        width: 250,
        pinned: 'left',
        cellStyle: { fontSize: '12px' }
      },
      { headerName: "Venta$", field: "detalle_factura.valor_neto_sum", valueGetter: p => p.data ? Number(p.data["detalle_factura.valor_neto_sum"]) : 0, aggFunc: 'sum', enableValue: true, valueFormatter: p => currencyFormatter.format(p.value), sort: 'desc', cellStyle: { fontSize: '12px' } },
      { headerName: "VentasProy$", field: "detalle_factura.ventas_proyeccion", valueGetter: p => p.data ? Number(p.data["detalle_factura.ventas_proyeccion"]) : 0, aggFunc: 'sum', enableValue: true, valueFormatter: p => currencyFormatter.format(p.value), cellStyle: { fontSize: '12px' } },
      { headerName: "PrecioUnit$", field: "detalle_factura.precio_unitario", valueGetter: p => p.data ? (Number(p.data["detalle_factura.precio_unitario"]) || 0) : 0, aggFunc: 'avg', enableValue: true, valueFormatter: p => currencyFormatter.format(p.value), cellStyle: { fontSize: '12px' } },
      { headerName: "Kilos", field: "detalle_factura.peso_neto_sum", valueGetter: p => p.data ? Number(p.data["detalle_factura.peso_neto_sum"]) : 0, aggFunc: 'sum', enableValue: true, valueFormatter: p => `${kilosFormatter.format(p.value || 0)}`, cellStyle: { fontSize: '12px' } },
      { headerName: "KilosProy", field: "detalle_factura.kilos_proyeccion", valueGetter: p => p.data ? Number(p.data["detalle_factura.kilos_proyeccion"]) : 0, aggFunc: 'sum', enableValue: true, valueFormatter: p => `${kilosFormatter.format(p.value || 0)}`, cellStyle: { fontSize: '12px' } },
      { headerName: "MargenUnit$", field: "detalle_factura.margen_unitario", valueGetter: p => p.data ? (Number(p.data["detalle_factura.margen_unitario"]) || 0) : 0, aggFunc: 'avg', enableValue: true, valueFormatter: p => currencyFormatter.format(p.value), cellStyle: { fontSize: '12px' } },
      { headerName: "Margen%", field: "detalle_factura.margen_porcentaje", valueGetter: p => p.data ? Number(p.data["detalle_factura.margen_porcentaje"]) : 0, aggFunc: 'avg', enableValue: true, valueFormatter: p => Number(p.value).toFixed(2), cellStyle: { fontSize: '12px' } },
      { headerName: "Margen$", field: "detalle_factura.margen_valor", valueGetter: p => p.data ? Number(p.data["detalle_factura.margen_valor"]) : 0, aggFunc: 'sum', enableValue: true, valueFormatter: p => currencyFormatter.format(p.value), cellStyle: { fontSize: '12px' } },
      { headerName: "MargenProy$", field: "detalle_factura.margen_proyeccion", valueGetter: p => p.data ? Number(p.data["detalle_factura.margen_proyeccion"]) : 0, aggFunc: 'sum', enableValue: true, valueFormatter: p => currencyFormatter.format(p.value), cellStyle: { fontSize: '12px' } },
      { headerName: "PFoco$", field: "detalle_factura.producto_foco_valor", valueGetter: p => p.data ? Number(p.data["detalle_factura.producto_foco_valor"]) : 0, aggFunc: 'sum', enableValue: true, valueFormatter: p => currencyFormatter.format(p.value), cellStyle: { fontSize: '12px' } },
      { headerName: "#Cliente", field: "detalle_factura.cliente_count", valueGetter: p => p.data ? Number(p.data["detalle_factura.cliente_count"]) : 0, aggFunc: 'sum', enableValue: true, valueFormatter: p => numberFormatter.format(p.value), cellStyle: { fontSize: '12px' } },
      { headerName: "#SKU", field: "detalle_factura.sku_count", valueGetter: p => p.data ? Number(p.data["detalle_factura.sku_count"]) : 0, aggFunc: 'sum', enableValue: true, valueFormatter: p => numberFormatter.format(p.value), cellStyle: { fontSize: '12px' } },
      { headerName: "#SKU/Cliente", field: "detalle_factura.ratio_sku_cliente", valueGetter: p => p.data ? Number(p.data["detalle_factura.ratio_sku_cliente"]) : 0, aggFunc: 'sum', enableValue: true, cellStyle: { fontSize: '12px' } },
      { headerName: "CombSKU/Cliente#", field: "detalle_factura.combinacion_sku_cliente", valueGetter: p => p.data ? Number(p.data["detalle_factura.combinacion_sku_cliente"]) : 0, aggFunc: 'sum', enableValue: true, valueFormatter: p => numberFormatter.format(p.value), cellStyle: { fontSize: '12px' } },
    ],
    drillDownField: "detalle_factura.grupo_cliente",
  },
};
