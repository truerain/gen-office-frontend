import { Routes, Route, Link } from 'react-router-dom';
import HomePage from './pages/HomePage';
import PrimitivesPage from './pages/PrimitivesPage';
import DataGridPage from './pages/DataGridPage';
import './styles/App.css';

function App() {
  return (
    <div className="app">
      <nav className="nav">
        <div className="nav-container">
          <h1 className="nav-title">Gen-Office Demo</h1>
          <ul className="nav-links">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/primitives">Primitives</Link></li>
            <li><Link to="/datagrid">DataGrid</Link></li>
          </ul>
        </div>
      </nav>

      <main className="main">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/primitives" element={<PrimitivesPage />} />
          <Route path="/datagrid" element={<DataGridPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;