
export default function DataGridPage() {

  return (
    <div className="page">
      <div className="page-header">
        <h1>DataGrid Component</h1>
        <p className="subtitle">
          Powerful data grid with sorting, filtering, pagination, and virtual scrolling
        </p>
      </div>

      <div className="content">
        <section className="section">
          <h2>Basic DataGrid</h2>
          <div className="datagrid-container">
          </div>
        </section>

        <section className="section">
          <h2>Features</h2>
          <ul>
            <li>✅ Sorting (click column headers)</li>
            <li>✅ Pagination</li>
            <li>✅ Virtual scrolling for large datasets</li>
            <li>✅ Row selection</li>
            <li>✅ Sticky headers and columns</li>
            <li>✅ Custom cell rendering</li>
            <li>✅ Responsive design</li>
            <li>✅ TypeScript support</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
