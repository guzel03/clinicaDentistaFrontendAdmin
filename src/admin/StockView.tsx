export default function StockView() {
  return (
    <div className="admin-seccion">
      <div className="admin-section-header">
        <div>
          <h2>Stock</h2>
          <p className="page-subtitle">Controla el inventario de productos.</p>
        </div>
      </div>
      <div className="empty-box">
        <p className="empty">No hay productos registrados.</p>
      </div>
    </div>
  )
}