import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { roleOptions } from '../../utils/roles';

function LoginPage() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({ email: '', password: '', role: 'admin' });
  const [error, setError] = useState('');

  const handleChange = (event) => {
    setFormData((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    try {
      await login(formData);
      navigate(location.state?.from?.pathname || '/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'Unable to login. Please check your credentials.');
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-card card border-0 shadow-lg">
        <div className="card-body p-4 p-md-5">
          <div className="text-center mb-4">
            <div className="auth-icon mx-auto mb-3">
              <i className="bi bi-heart-pulse-fill"></i>
            </div>
            <h1 className="h3 fw-bold">Welcome Back</h1>
            <p className="text-secondary mb-0">Sign in to manage transplant workflows.</p>
          </div>
          {error && <div className="alert alert-danger">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Email</label>
              <input className="form-control" type="email" name="email" value={formData.email} onChange={handleChange} required />
            </div>
            <div className="mb-3">
              <label className="form-label">Password</label>
              <input className="form-control" type="password" name="password" value={formData.password} onChange={handleChange} required />
            </div>
            <div className="mb-4">
              <label className="form-label">Role</label>
              <select className="form-select" name="role" value={formData.role} onChange={handleChange}>
                {roleOptions.map((role) => (
                  <option key={role.value} value={role.value}>{role.label}</option>
                ))}
              </select>
            </div>
            <button className="btn btn-primary w-100" type="submit" disabled={loading}>
              {loading ? 'Signing in...' : 'Login'}
            </button>
          </form>
          <p className="text-center text-secondary mt-4 mb-0">
            New coordinator? <Link to="/register">Create an account</Link>
          </p>
        </div>
      </div>
    </main>
  );
}

export default LoginPage;
