import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface PasswordStrength {
  score: number;
  feedback: string[];
}

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [generalError, setGeneralError] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({ score: 0, feedback: [] });
  
  const { register, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const checkPasswordStrength = (password: string): PasswordStrength => {
    const feedback: string[] = [];
    let score = 0;
    
    if (password.length >= 8) score += 1;
    else feedback.push('At least 8 characters');
    
    if (/[a-z]/.test(password)) score += 1;
    else feedback.push('Include lowercase letters');
    
    if (/[A-Z]/.test(password)) score += 1;
    else feedback.push('Include uppercase letters');
    
    if (/[0-9]/.test(password)) score += 1;
    else feedback.push('Include numbers');
    
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    else feedback.push('Include special characters');
    
    return { score, feedback };
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    } else if (formData.firstName.trim().length < 2) {
      newErrors.firstName = 'First name must be at least 2 characters';
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    } else if (formData.lastName.trim().length < 2) {
      newErrors.lastName = 'Last name must be at least 2 characters';
    }
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
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
    
    if (name === 'password') {
      setPasswordStrength(checkPasswordStrength(value));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setLoading(true);
    setGeneralError('');
    
    try {
      await register(formData.firstName, formData.lastName, formData.email, formData.password);
      navigate('/');
    } catch (err) {
      setGeneralError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = (field: 'password' | 'confirmPassword') => {
    if (field === 'password') {
      setShowPassword(!showPassword);
    } else {
      setShowConfirmPassword(!showConfirmPassword);
    }
  };

  const getPasswordStrengthColor = (score: number) => {
    if (score <= 2) return '#dc3545';
    if (score <= 3) return '#ffc107';
    if (score <= 4) return '#17a2b8';
    return '#28a745';
  };

  const getPasswordStrengthText = (score: number) => {
    if (score <= 2) return 'Weak';
    if (score <= 3) return 'Fair';
    if (score <= 4) return 'Good';
    return 'Strong';
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
          <h2 className="auth-title">Sign up now</h2>
          
          {generalError && (
            <div className="error-message general-error">
              {generalError}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="firstName">First name</label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className={`form-input ${errors.firstName ? 'error' : ''}`}
                  placeholder="Enter your first name"
                  aria-describedby={errors.firstName ? 'firstName-error' : undefined}
                  aria-invalid={!!errors.firstName}
                  aria-required="true"
                />
                {errors.firstName && (
                  <div id="firstName-error" className="error-message field-error">
                    {errors.firstName}
                  </div>
                )}
              </div>
              
              <div className="form-group">
                <label htmlFor="lastName">Last name</label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className={`form-input ${errors.lastName ? 'error' : ''}`}
                  placeholder="Enter your last name"
                  aria-describedby={errors.lastName ? 'lastName-error' : undefined}
                  aria-invalid={!!errors.lastName}
                  aria-required="true"
                />
                {errors.lastName && (
                  <div id="lastName-error" className="error-message field-error">
                    {errors.lastName}
                  </div>
                )}
              </div>
            </div>
            
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
                  onClick={() => togglePasswordVisibility('password')}
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
              
              {formData.password && (
                <div className="password-strength" aria-live="polite">
                  <div className="strength-bar">
                    <div 
                      className="strength-fill" 
                      style={{ 
                        width: `${(passwordStrength.score / 5) * 100}%`,
                        backgroundColor: getPasswordStrengthColor(passwordStrength.score)
                      }}
                    ></div>
                  </div>
                  <div className="strength-info">
                    <span className="strength-text">
                      {getPasswordStrengthText(passwordStrength.score)}
                    </span>
                    {passwordStrength.feedback.length > 0 && (
                      <div className="strength-feedback">
                        {passwordStrength.feedback.map((tip, index) => (
                          <div key={index} className="feedback-tip">• {tip}</div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <div className="password-input-wrapper">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                  placeholder="Confirm your password"
                  aria-describedby={errors.confirmPassword ? 'confirmPassword-error' : undefined}
                  aria-invalid={!!errors.confirmPassword}
                  aria-required="true"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => togglePasswordVisibility('confirmPassword')}
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
              {errors.confirmPassword && (
                <div id="confirmPassword-error" className="error-message field-error">
                  {errors.confirmPassword}
                </div>
              )}
            </div>
            
            <div className="form-options">
              <label className="checkbox-wrapper">
                <input type="checkbox" name="newsletter" />
                <span className="checkmark"></span>
                Subscribe to our newsletter
              </label>
              <label className="checkbox-wrapper">
                <input type="checkbox" name="terms" required />
                <span className="checkmark"></span>
                I agree to the <Link to="/terms" className="terms-link">Terms of Service</Link> and <Link to="/privacy" className="terms-link">Privacy Policy</Link>
              </label>
            </div>
            
            <button
              type="submit"
              className="auth-button"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="loading-spinner"></div>
                  Signing up...
                </>
              ) : (
                'Sign up'
              )}
            </button>
          </form>
          
          <div className="auth-divider">
            <span>or sign up with:</span>
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
              Already have an account?{' '}
              <Link to="/login" className="auth-link">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
