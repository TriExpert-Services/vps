import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, User, LogOut, Settings, Server } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <Server className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                TriExpert Services
              </span>
            </Link>
          </div>

          {!user ? (
            <div className="hidden md:flex items-center space-x-4">
              <Link
                to="/#plans"
                className="text-gray-600 hover:text-blue-600 transition-colors duration-200"
              >
                Planes
              </Link>
              <Link
                to="/#about"
                className="text-gray-600 hover:text-blue-600 transition-colors duration-200"
              >
                Nosotros
              </Link>
              <Link
                to="/#contact"
                className="text-gray-600 hover:text-blue-600 transition-colors duration-200"
              >
                Contacto
              </Link>
              <Link
                to="/login"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                Iniciar Sesión
              </Link>
            </div>
          ) : (
            <div className="hidden md:flex items-center space-x-4">
              <Link
                to="/dashboard"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  isActive('/dashboard')
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                Dashboard
              </Link>
              
              {user.role === 'user' && (
                <>
                  <Link
                    to="/vps"
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                      isActive('/vps')
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:text-blue-600'
                    }`}
                  >
                    Mis VPS
                  </Link>
                  <Link
                    to="/billing"
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                      isActive('/billing')
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:text-blue-600'
                    }`}
                  >
                    Facturación
                  </Link>
                  <Link
                    to="/support"
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                      isActive('/support')
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:text-blue-600'
                    }`}
                  >
                    Soporte
                  </Link>
                </>
              )}

              {user.role === 'admin' && (
                <>
                  <Link
                    to="/admin/users"
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                      isActive('/admin/users')
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:text-blue-600'
                    }`}
                  >
                    Usuarios
                  </Link>
                  <Link
                    to="/admin/vps"
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                      isActive('/admin/vps')
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:text-blue-600'
                    }`}
                  >
                    VPS
                  </Link>
                  <Link
                    to="/admin/settings"
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                      isActive('/admin/settings')
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:text-blue-600'
                    }`}
                  >
                    Configuración
                  </Link>
                </>
              )}

              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors duration-200"
                >
                  <User className="h-5 w-5" />
                  <span className="text-sm font-medium">{user.full_name}</span>
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                    <button
                      onClick={handleSignOut}
                      className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left transition-colors duration-200"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Cerrar Sesión</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-600 hover:text-blue-600 transition-colors duration-200"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200">
              {!user ? (
                <>
                  <Link
                    to="/#plans"
                    className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-blue-600 transition-colors duration-200"
                    onClick={() => setIsOpen(false)}
                  >
                    Planes
                  </Link>
                  <Link
                    to="/#about"
                    className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-blue-600 transition-colors duration-200"
                    onClick={() => setIsOpen(false)}
                  >
                    Nosotros
                  </Link>
                  <Link
                    to="/#contact"
                    className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-blue-600 transition-colors duration-200"
                    onClick={() => setIsOpen(false)}
                  >
                    Contacto
                  </Link>
                  <Link
                    to="/login"
                    className="block px-3 py-2 text-base font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                    onClick={() => setIsOpen(false)}
                  >
                    Iniciar Sesión
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/dashboard"
                    className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-blue-600 transition-colors duration-200"
                    onClick={() => setIsOpen(false)}
                  >
                    Dashboard
                  </Link>
                  {user.role === 'user' && (
                    <>
                      <Link
                        to="/vps"
                        className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-blue-600 transition-colors duration-200"
                        onClick={() => setIsOpen(false)}
                      >
                        Mis VPS
                      </Link>
                      <Link
                        to="/billing"
                        className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-blue-600 transition-colors duration-200"
                        onClick={() => setIsOpen(false)}
                      >
                        Facturación
                      </Link>
                      <Link
                        to="/support"
                        className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-blue-600 transition-colors duration-200"
                        onClick={() => setIsOpen(false)}
                      >
                        Soporte
                      </Link>
                    </>
                  )}
                  <button
                    onClick={() => {
                      handleSignOut();
                      setIsOpen(false);
                    }}
                    className="block w-full text-left px-3 py-2 text-base font-medium text-gray-600 hover:text-blue-600 transition-colors duration-200"
                  >
                    Cerrar Sesión
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}