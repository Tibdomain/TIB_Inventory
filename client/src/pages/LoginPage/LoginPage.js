import React, { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeOff, BoxIcon, ArrowRight } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { login, error, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const vantaRef = useRef(null);
  const vantaEffect = useRef(null);
  const [showMessage, setShowMessage] = useState(false);
  const [showForgotMessage, setShowForgotMessage] = useState(false);
  

// Update the showMessage state handling in the component
const handleNoAccountClick = (e) => {
  e.preventDefault();
  setShowMessage(true);
  

};

  const handleForgotPasswordClick = (e) => {
    e.preventDefault();
    setShowForgotMessage(true);
    
    // Hide the message after 5 seconds
  };


  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  // Get the return URL from location state or default to homepage
  const from = location.state?.from?.pathname || "/";



  useEffect(() => {
    // Load Vanta.js scripts dynamically
    const loadScript = (src) => {
      return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.async = true;
        script.onload = resolve;
        script.onerror = reject;
        document.body.appendChild(script);
      });
    };

    const TypewriterText = ({ texts, speed = 100, delay = 2000 }) => {
      const [displayText, setDisplayText] = useState('');
      const [currentIndex, setCurrentIndex] = useState(0);
      const [isDeleting, setIsDeleting] = useState(false);
      const [textIndex, setTextIndex] = useState(0);
    
      useEffect(() => {
        let timer;
        const currentText = texts[textIndex];
        
        if (isDeleting) {
          // Deleting text
          timer = setTimeout(() => {
            setDisplayText(currentText.substring(0, currentIndex - 1));
            setCurrentIndex(prevIndex => prevIndex - 1);
          }, speed / 2);
          
          if (currentIndex === 0) {
            setIsDeleting(false);
            setTextIndex((prevIndex) => (prevIndex + 1) % texts.length);
          }
        } else {
          // Typing text
          timer = setTimeout(() => {
            setDisplayText(currentText.substring(0, currentIndex + 1));
            setCurrentIndex(prevIndex => prevIndex + 1);
          }, speed);
          
          if (currentIndex === currentText.length) {
            timer = setTimeout(() => {
              setIsDeleting(true);
            }, delay);
          }
        }
        
        return () => clearTimeout(timer);
      }, [currentIndex, isDeleting, textIndex, texts, speed, delay]);
    
      return (
        <h2 className="text-2xl font-bold text-violet-600 mb-2 h-8">
          {displayText}
          <span className="animate-pulse">|</span>
        </h2>
      );
    };


    const initVanta = async () => {
      try {
        // Load Three.js first, then Vanta Globe
        await loadScript('https://cdn.jsdelivr.net/npm/three@0.134.0/build/three.min.js');
        await loadScript('https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.globe.min.js');
        
        // Initialize Vanta effect
        if (window.VANTA) {
          vantaEffect.current = window.VANTA.GLOBE({
            el: vantaRef.current,
            mouseControls: true,
            touchControls: true,
            gyroControls: false,
            minHeight: 200.00,
            minWidth: 200.00,
            scale: 1.00,
            scaleMobile: 1.00,
            color: 0x16a34a, // Green color to match your theme
            color2: 0x23a6d5,
            backgroundColor: 0xf9fafb, // Light background
            size: 1.0
          });
        }
      } catch (error) {
        console.error("Failed to load Vanta.js:", error);
      }
    };

    initVanta();

    // Cleanup function
    return () => {
      if (vantaEffect.current) {
        vantaEffect.current.destroy();
      }
    };
  }, []);

  const onSubmit = async (data) => {
    try {
      await login(data.email, data.password);
      navigate(from, { replace: true });
    } catch (err) {
      // Error is handled in the AuthContext
      console.error("Login failed:", err);
    }
  };

  return (
    <div 
      ref={vantaRef}
      className="min-h-screen flex items-center justify-center p-4"
    >
      <div className="flex w-full max-w-5xl overflow-hidden rounded-2xl shadow-xl">
        {/* Left side - Illustration */}
        <div className="hidden lg:block lg:w-1/2 bg-green-600 p-8 text-white">
          <div className="flex items-center space-x-2 mb-8">
            <BoxIcon className="h-8 w-8" />
            <h1 className="text-2xl font-bold">T.I.B Stock Manager</h1>
          </div>
          
          <div className="mt-16">
            <h2 className="text-3xl font-bold mb-6">Manage your inventory with ease</h2>
            <p className="text-green-100 mb-8">
              Streamline your operations, track inventory in real-time, and make
              data-driven decisions with our comprehensive management system.
            </p>
            
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="bg-green-500 p-1 rounded-full mr-3 mt-1">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                </div>
                <p>Real-time stock tracking and alerts</p>
              </div>
              
              <div className="flex items-start">
                <div className="bg-green-500 p-1 rounded-full mr-3 mt-1">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                </div>
                <p>Detailed reporting and analytics</p>
              </div>
              
              <div className="flex items-start">
                <div className="bg-green-500 p-1 rounded-full mr-3 mt-1">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                </div>
                <p>Secure multi-user access controls</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right side - Login Form */}
        <div className="w-full lg:w-1/2 bg-white p-8 md:p-12">
          <div className="lg:hidden flex items-center space-x-2 mb-8">
            <BoxIcon className="h-6 w-6 text-green-600" />
            <h1 className="text-xl font-bold text-gray-900">T.I.B Stock Manager</h1>
          </div>
          
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome back</h2>
              <p className="text-gray-600">Please sign in to your account</p>
            </div>
            <img 
              src="/tib.jpeg" 
              alt="TIB Logo" 
              className="h-20 w-auto object-contain ml-4 rounded-md shadow-sm"
            />
          </div>
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email
              </label>
              <input
  id="email"
  type="email"
  className={`w-full px-4 py-3 rounded-lg border ${
    errors.email ? "border-red-500" : "border-gray-300"
  } focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900`} // Added text-gray-900 for dark text
  placeholder="staff@email.com"
  {...register("email", {
    required: "Email is required",
    pattern: {
      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
      message: "Invalid email address",
    },
  })}
/>
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>
            
            <div className="space-y-2 relative">
              <div className="flex justify-between">
                <label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Password
                </label>
                <button 
                  type="button"
                  className="text-sm text-green-600 hover:text-green-800"
                  onClick={handleForgotPasswordClick}
                >
                  Forgot password? 
                </button>
              </div>
              <div className="relative">
              <input
  id="password"
  type={showPassword ? "text" : "password"}
  className={`w-full px-4 py-3 rounded-lg border ${
    errors.password ? "border-red-500" : "border-gray-300"
  } focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900`} // Added text-gray-900 for dark text
  placeholder="••••••••"
  {...register("password", {
    required: "Password is required",
    minLength: {
      value: 6,
      message: "Password must be at least 6 characters",
    },
  })}
/>
                <button
                  type="button"
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
              )}
              
              {showForgotMessage && (
  <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 backdrop-blur-sm">
    <div className="bg-white p-6 rounded-xl shadow-xl max-w-md transform transition-all duration-300 ease-in-out scale-100 animate-fadeIn border border-purple-200">
      <div className="flex flex-col items-center">
        <img
          src="/aura.gif"
          alt="Magical Aura"
          className="h-32 w-auto mb-4 rounded-md object-cover"
        />
        <h3 className="text-lg font-semibold text-purple-700 mb-2">Insufficient Aura Points</h3>
        <p className="text-center text-gray-700">
          You need 1000 more aura points to recover your password! ✨
        </p>
        <p className="text-center text-gray-500 text-sm mt-2 italic">
          Try turning it off and on again... or just remember your password!
        </p>
        <button 
          onClick={() => setShowForgotMessage(false)}
          className="mt-4 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors duration-200 font-medium text-sm"
        >
          I'll try to remember
        </button>
      </div>
    </div>
  </div>
)}

            </div>
            
            <div className="flex items-center">
              <input
                id="remember"
                type="checkbox"
                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                {...register("remember")}
              />
              <label htmlFor="remember" className="ml-2 block text-sm text-gray-700">
                Remember me
              </label>
            </div>
            
            <button
              type="submit"
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
              disabled={loading}
            >
              {loading ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <>
                  Sign in
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </button>
          </form>
          
          <div className="mt-8 text-center relative">
            <p className="text-sm text-gray-600">
              <button 
                type="button"
                className="font-medium text-green-600 hover:text-green-500"
                onClick={handleNoAccountClick}
              >
                Don't have an account?
              </button>
            </p>
            
            {showMessage && (
  <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 backdrop-blur-sm">
    <div className="bg-white p-6 rounded-xl shadow-xl max-w-md transform transition-all duration-300 ease-in-out scale-100 animate-fadeIn border border-yellow-200">
      <div className="flex flex-col items-center">
        <img
          src="/Admin.gif"
          alt="Admin Access"
          className="h-32 w-auto mb-4 rounded-md object-cover"
        />
        <h3 className="text-lg font-semibold text-yellow-700 mb-2">Admin Access Only</h3>
        <p className="text-center text-gray-700">
          Sorry, we can't give you an account! It's only for admins 🔒👑
        </p>
        <p className="text-center text-gray-500 text-sm mt-2 italic">
          "Don't have an account?" is just for the aesthetics 🥰
        </p>
        <button 
          onClick={() => setShowMessage(false)}
          className="mt-4 px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors duration-200 font-medium text-sm"
        >
          I understand
        </button>
      </div>
    </div>
  </div>
)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
