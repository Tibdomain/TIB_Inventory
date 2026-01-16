import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogOut, User } from 'lucide-react';
import { Store } from 'lucide-react';

export const NavBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinkStyles = "relative px-4 py-2 text-gray-100 hover:text-white rounded-lg transition-all duration-300 ease-in-out group";
  const activeNavLinkStyles = "text-white before:absolute before:bottom-0 before:left-0 before:w-full before:h-0.5 before:bg-white";

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300  ${
      scrolled 
      ? 'bg-gradient-to-r from-emerald-700 via-green-700 to-teal-700 shadow-lg backdrop-blur-sm bg-opacity-90'
      : 'bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"> 
        <div className="flex justify-between items-center h-16"> 
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center space-x-2">
            <NavLink to="/" className="group flex items-center space-x-2">
              <span className="text-2xl font-bold text-white tracking-wider group-hover:scale-105 transition-transform duration-300">
                T.I.B Inventory
              </span>
            </NavLink>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center">
            <nav className="flex space-x-1 mr-6">
              <NavLink 
                to="/" 
                className={({ isActive }) => 
                  `${navLinkStyles} ${isActive ? activeNavLinkStyles : ''}`
                }
              >
                <span className="relative z-10 flex items-center space-x-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  <span>Home</span>
                </span>
              </NavLink>
              
              <NavLink 
                to="/query-data"
                className={({ isActive }) => 
                  `${navLinkStyles} ${isActive ? activeNavLinkStyles : ''}`
                }
              >
                <span className="relative z-10 flex items-center space-x-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <span>Query Data</span>
                </span>
              </NavLink>
              
              <NavLink 
                to="/add-data"
                className={({ isActive }) => 
                  `${navLinkStyles} ${isActive ? activeNavLinkStyles : ''}`
                }
              >
                <span className="relative z-10 flex items-center space-x-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>Add Data</span>
                </span>
              </NavLink>

              <NavLink 
                to="/assembly"
                className={({ isActive }) => 
                  `${navLinkStyles} ${isActive ? activeNavLinkStyles : ''}`
                }
              >
                <span className="relative z-10 flex items-center space-x-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  <span>Assembly</span>
                </span>
              </NavLink>
              
              {/* Add Vendor Management NavLink */}
              <NavLink 
                to="/vendor-management"
                className={({ isActive }) => 
                  `${navLinkStyles} ${isActive ? activeNavLinkStyles : ''}`
                }
              >
                <span className="relative z-10 flex items-center space-x-1">
                  <Store className="w-4 h-4" />
                  <span>Vendors</span>
                </span>
              </NavLink>
            </nav>

            {/* User info and logout button */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-white">
                <User className="h-4 w-4 mr-2" />
                <span className="text-sm font-medium">{user?.username}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center px-3 py-2 rounded-md text-sm font-medium bg-white/10 hover:bg-white/20 text-white transition-colors duration-200"
              >
                <LogOut className="h-4 w-4 mr-1" />
                <span>Logout</span>
              </button>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-lg text-gray-100 hover:text-white hover:bg-white/10 focus:outline-none transition-colors duration-200"
              aria-label="Menu"
            >
              <svg
                className="h-6 w-6 transition-transform duration-200 ease-in-out"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 24 24"
                style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0)' }}
              >
                {isOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div
        className={`md:hidden transition-all duration-300 ease-in-out ${
          isOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
        } overflow-hidden`}
      >
        <div className="px-2 pt-2 pb-3 space-y-1 bg-gradient-to-r from-emerald-800 via-green-800 to-teal-800">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `block px-3 py-2 rounded-lg text-base font-medium transition-all duration-200 ${
                isActive 
                  ? 'bg-white/20 text-white' 
                  : 'text-gray-100 hover:bg-white/10 hover:text-white'
              }`
            }
            onClick={() => setIsOpen(false)}
          >
            <span className="flex items-center space-x-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span>Home</span>
            </span>
          </NavLink>
          <NavLink
            to="/query-data"
            className={({ isActive }) =>
              `block px-3 py-2 rounded-lg text-base font-medium transition-all duration-200 ${
                isActive 
                  ? 'bg-white/20 text-white' 
                  : 'text-gray-100 hover:bg-white/10 hover:text-white'
              }`
            }
            onClick={() => setIsOpen(false)}
          >
            <span className="flex items-center space-x-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span>Query Data</span>
            </span>
          </NavLink>
          <NavLink
            to="/add-data"
            className={({ isActive }) =>
              `block px-3 py-2 rounded-lg text-base font-medium transition-all duration-200 ${
                isActive 
                  ? 'bg-white/20 text-white' 
                  : 'text-gray-100 hover:bg-white/10 hover:text-white'
              }`
            }
            onClick={() => setIsOpen(false)}
          >
            <span className="flex items-center space-x-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>Add Data</span>
            </span>
          </NavLink>
          <NavLink
            to="/assembly"
            className={({ isActive }) =>
              `block px-3 py-2 rounded-lg text-base font-medium transition-all duration-200 ${
                isActive 
                  ? 'bg-white/20 text-white' 
                  : 'text-gray-100 hover:bg-white/10 hover:text-white'
              }`
            }
            onClick={() => setIsOpen(false)}
          >
            <span className="flex items-center space-x-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <span>Assembly</span>
            </span>
          </NavLink>
          
          {/* Add Vendor Management to mobile menu */}
          <NavLink
            to="/vendor-management"
            className={({ isActive }) =>
              `block px-3 py-2 rounded-lg text-base font-medium transition-all duration-200 ${
                isActive 
                  ? 'bg-white/20 text-white' 
                  : 'text-gray-100 hover:bg-white/10 hover:text-white'
              }`
            }
            onClick={() => setIsOpen(false)}
          >
            <span className="flex items-center space-x-2">
              <Store className="w-4 h-4" />
              <span>Vendors</span>
            </span>
          </NavLink>
          
          {/* User info and logout in mobile menu */}
          <div className="border-t border-white/10 pt-2 mt-2">
            <div className="flex items-center px-3 py-2 text-gray-100">
              <User className="h-4 w-4 mr-2" />
              <span>{user?.username}</span>
            </div>
            <button
              onClick={() => {
                handleLogout();
                setIsOpen(false);
              }}
              className="flex w-full items-center px-3 py-2 rounded-lg text-base font-medium bg-white/10 hover:bg-white/20 text-white transition-colors duration-200"
            >
              <LogOut className="h-4 w-4 mr-2" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

