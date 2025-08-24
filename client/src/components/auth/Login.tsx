import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Login: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showPassword, setShowPassword] = useState(false);
  const [generalError, setGeneralError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    if (generalError) {
      setGeneralError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setLoading(true);
    setGeneralError('');
    
    try {
      await login(formData.email, formData.password);
      navigate('/');
    } catch (err) {
      setGeneralError(err instanceof Error ? err.message : 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  if (authLoading) {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <div className="auth-loading">
            <div className="loading-spinner"></div>
            <p>Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page mdb-style">
      <div className="bg-image" style={{backgroundImage: 'url(https://mdbootstrap.com/img/new/textures/full/171.jpg)'}}></div>
      
      <div className="auth-card">
        <div className="auth-card-body">
          <h2 className="auth-title">Sign in</h2>
          
          {generalError && (
            <div className="error-message general-error">
              {generalError}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`form-input ${errors.email ? 'error' : ''}`}
                placeholder="Enter your email"
                aria-describedby={errors.email ? 'email-error' : undefined}
                aria-invalid={!!errors.email}
                aria-required="true"
              />
              {errors.email && (
                <div id="email-error" className="error-message field-error">
                  {errors.email}
                </div>
              )}
            </div>
            
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`form-input ${errors.password ? 'error' : ''}`}
                  placeholder="Enter your password"
                  aria-describedby={errors.password ? 'password-error' : undefined}
                  aria-invalid={!!errors.password}
                  aria-required="true"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={togglePasswordVisibility}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
              {errors.password && (
                <div id="password-error" className="error-message field-error">
                  {errors.password}
                </div>
              )}
            </div>
            
            <div className="form-options">
              <label className="checkbox-wrapper">
                <input type="checkbox" name="remember" />
                <span className="checkmark"></span>
                Remember me
              </label>
              <Link to="/forgot-password" className="forgot-link">
                Forgot password?
              </Link>
            </div>
            
            <button
              type="submit"
              className="auth-button"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="loading-spinner"></div>
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </button>
          </form>
          
          <div className="auth-divider">
            <span>or sign in with:</span>
          </div>
          
          <div className="social-auth">
            <button className="social-btn facebook">
              <span className="social-icon">📘</span>
              Facebook
            </button>
            <button className="social-btn twitter">
              <span className="social-icon">🐦</span>
              Twitter
            </button>
            <button className="social-btn google">
              <span className="social-icon">🔍</span>
              Google
            </button>
            <button className="social-btn github">
              <span className="social-icon">🐙</span>
              GitHub
            </button>
          </div>
          
          <div className="auth-footer">
            <p>
              Don't have an account?{' '}
              <Link to="/register" className="auth-link">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
