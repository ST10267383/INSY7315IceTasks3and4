import { Link, Outlet, useNavigate } from 'react-router-dom';

export default function Layout() {
  const navigate = useNavigate();
  const isAuthed = !!localStorage.getItem('token');

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="app-shell">
      <div className="container">
        <nav className="nav">
          <div className="nav-left">
            <Link to="/">Home</Link>
          </div>

          <div className="nav-right">
            {isAuthed ? (
              <>
                <Link to="/dashboard">Dashboard</Link>
                <button className="btn-link" onClick={logout}>Logout</button>
              </>
            ) : (
              <>
                <Link to="/register">Register</Link>
                <Link to="/login">Login</Link>
              </>
            )}
          </div>
        </nav>
      </div>

      <main className="container content">
        <Outlet />
      </main>
    </div>
  );
}