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

export const um_venta = {
  0: {
    dimensions: ["detalle_factura.um_venta"],
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
      { headerName: "Unidad Medida Venta", field: "detalle_factura.um_venta", valueGetter: p => p.data ? p.data["detalle_factura.um_venta"] : '', enableRowGroup: true, filter: 'agSetColumnFilter', width: 200, pinned: 'left' },
      { headerName: "Venta$", field: "detalle_factura.valor_neto_sum", valueGetter: p => p.data ? Number(p.data["detalle_factura.valor_neto_sum"]) : 0, aggFunc: 'sum', enableValue: true, valueFormatter: p => currencyFormatter.format(p.value), sort: 'desc', filter: 'agNumberColumnFilter' },
      { headerName: "VentasProy.$", field: "detalle_factura.ventas_proyeccion", valueGetter: p => p.data ? Number(p.data["detalle_factura.ventas_proyeccion"]) : 0, aggFunc: 'sum', enableValue: true, valueFormatter: p => currencyFormatter.format(p.value), filter: 'agNumberColumnFilter' },
      { headerName: "PrecioUnit.$", field: "detalle_factura.precio_unitario", valueGetter: p => p.data ? Number(p.data["detalle_factura.precio_unitario"]) : 0, aggFunc: 'avg', enableValue: true, valueFormatter: p => currencyFormatter.format(p.value), filter: 'agNumberColumnFilter' },
      { headerName: "Kilos", field: "detalle_factura.peso_neto_sum", valueGetter: p => p.data ? Number(p.data["detalle_factura.peso_neto_sum"]) : 0, aggFunc: 'sum', enableValue: true, valueFormatter: p => `${kilosFormatter.format(p.value || 0)}`, filter: 'agNumberColumnFilter' },
      { headerName: "KilosProy.", field: "detalle_factura.kilos_proyeccion", valueGetter: p => p.data ? Number(p.data["detalle_factura.kilos_proyeccion"]) : 0, aggFunc: 'sum', enableValue: true, valueFormatter: p => `${kilosFormatter.format(p.value || 0)}`, filter: 'agNumberColumnFilter' },
      { headerName: "#SKU", field: "detalle_factura.sku_count", valueGetter: p => p.data ? Number(p.data["detalle_factura.sku_count"]) : 0, aggFunc: 'sum', enableValue: true, valueFormatter: p => numberFormatter.format(p.value), filter: 'agNumberColumnFilter' },
      { headerName: "MargenUnit.$", field: "detalle_factura.margen_unitario", valueGetter: p => p.data ? Number(p.data["detalle_factura.margen_unitario"]) : 0, aggFunc: 'avg', enableValue: true, valueFormatter: p => currencyFormatter.format(p.value), filter: 'agNumberColumnFilter' },
      { headerName: "Margen%", field: "detalle_factura.margen_porcentaje", valueGetter: p => p.data ? Number(p.data["detalle_factura.margen_porcentaje"]) : 0, aggFunc: 'avg', enableValue: true, valueFormatter: p => `${Number(p.value).toFixed(2)} %`, filter: 'agNumberColumnFilter' },
      { headerName: "Margen$", field: "detalle_factura.margen_valor", valueGetter: p => p.data ? Number(p.data["detalle_factura.margen_valor"]) : 0, aggFunc: 'sum', enableValue: true, valueFormatter: p => currencyFormatter.format(p.value), filter: 'agNumberColumnFilter' },
      { headerName: "MargenProy.$", field: "detalle_factura.margen_proyeccion", valueGetter: p => p.data ? Number(p.data["detalle_factura.margen_proyeccion"]) : 0, aggFunc: 'sum', enableValue: true, valueFormatter: p => currencyFormatter.format(p.value), filter: 'agNumberColumnFilter' },
      { headerName: "P.Foco$", field: "detalle_factura.producto_foco_valor", valueGetter: p => p.data ? Number(p.data["detalle_factura.producto_foco_valor"]) : 0, aggFunc: 'sum', enableValue: true, valueFormatter: p => currencyFormatter.format(p.value), filter: 'agNumberColumnFilter' },
      { headerName: "#SKU/Cliente", field: "detalle_factura.ratio_sku_cliente", valueGetter: p => p.data ? Number(p.data["detalle_factura.ratio_sku_cliente"]) : 0, aggFunc: 'sum', enableValue: true, filter: 'agNumberColumnFilter' },
      { headerName: "Comb.SKU-Cliente#", field: "detalle_factura.combinacion_sku_cliente", valueGetter: p => p.data ? Number(p.data["detalle_factura.combinacion_sku_cliente"]) : 0, aggFunc: 'sum', enableValue: true, valueFormatter: p => numberFormatter.format(p.value), filter: 'agNumberColumnFilter' },
    ],
    drillDownField: "detalle_factura.um_venta",
  },
};
