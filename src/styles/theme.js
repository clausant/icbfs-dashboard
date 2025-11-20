import { themeAlpine } from "ag-grid-enterprise";

export const themeCostum = themeAlpine.withParams({
  // Colores principales
  accentColor: "#ef4444",
  backgroundColor: "#f5f5f5",
  foregroundColor: "#1e293b",

  // Bordes y líneas
  borderColor: "#d1d5db",
  borderRadius: "0.5rem",

  // Encabezados
  headerBackgroundColor: "#e5e7eb",
  headerTextColor: "#374151",
  headerFontWeight: 600,

  // Filas
  rowHoverColor: "#e5e7eb",
  oddRowBackgroundColor: "#f9fafb",

  // Colores de selección
  selectedRowBackgroundColor: "#fee2e2",

  // Filas fijadas (totales)
  pinnedRowBackgroundColor: "#d1d5db",

  // Espaciado
  spacing: "0.5rem",
  cellHorizontalPadding: "0.2rem",

  // Fuentes
  fontSize: "0.850rem",
  dataFontSize: "0.810rem", // Añadido para controlar el tamaño de fuente de las celdas
  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",

  // Iconos y controles
  iconSize: "1rem",
  checkboxBorderRadius: "0.25rem",

  // Panel lateral
  sideBarBackgroundColor: "#ffffff",
  panelBackgroundColor: "#f8fafc",

  // Inputs y filtros
  inputBorderColor: "#e2e8f0",
  inputBackgroundColor: "#ffffff",
  inputFocusBorderColor: "#ef4444",

  // Sombras
  cardShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
})