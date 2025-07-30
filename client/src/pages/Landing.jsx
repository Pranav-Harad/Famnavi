import { useNavigate } from "react-router-dom";
import Lottie from "lottie-react";
import { motion, useAnimation } from "framer-motion";
import { useEffect, useState, useRef, useMemo } from "react";
import robotAnim from "../assets/robot.json";
import axios from 'axios';

export default function Landing() {
  const navigate = useNavigate();
  const controls = useAnimation();
  const headerControls = useAnimation();
  const [isGreeting, setIsGreeting] = useState(false);
  const [displayedText, setDisplayedText] = useState("");
  const [isTypingComplete, setIsTypingComplete] = useState(false);
  const [isParagraphVisible, setIsParagraphVisible] = useState(false);
  const [isButtonVisible, setIsButtonVisible] = useState(false);
  const [robotMessage, setRobotMessage] = useState("");
  const [msgIndex, setMsgIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignupOpen, setIsSignupOpen] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [signupForm, setSignupForm] = useState({ email: '', password: '', confirmPassword: '', fullname: '' });
  const [loginError, setLoginError] = useState('');
  const [signupError, setSignupError] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const fullText = "Track Your Loved Ones";
  const canvasRef = useRef(null);
  const howItWorksRef = useRef(null);

  const messages = useMemo(() => [
    "Welcome to FamNavi!",
    "Stay safe with real-time tracking.",
    "Invite your family easily.",
    "Explore the map features.",
    "Get support anytime.",
    "Enjoy peace of mind."
  ], []);

  useEffect(() => {
    let currentIndex = 0;
    const typingInterval = setInterval(() => {
      if (currentIndex <= fullText.length) {
        setDisplayedText(fullText.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(typingInterval);
        setIsTypingComplete(true);
      }
    }, 50);
    return () => clearInterval(typingInterval);
  }, []);

  useEffect(() => {
    if (isTypingComplete) setIsParagraphVisible(true);
  }, [isTypingComplete]);

  useEffect(() => {
    if (isParagraphVisible) {
      setTimeout(() => setIsButtonVisible(true), 1000);
    }
  }, [isParagraphVisible]);

  useEffect(() => {
    headerControls.start({
      y: 0,
      opacity: 1,
      transition: { duration: 0.8, ease: "easeOut" },
    });
  }, [headerControls]);

  useEffect(() => {
    controls
      .start({ x: "50vw", y: "50vh", scale: 1.5, opacity: 1, zIndex: 50 })
      .then(() => {
        return controls.start({
          x: 0,
          y: 0,
          scale: 1,
          zIndex: 10,
          transition: { duration: 0.8, ease: "easeOut" },
        });
      })
      .then(() => {
        setIsGreeting(true);
      });
  }, [controls]);

  useEffect(() => {
    if (!isGreeting) return;

    let charIndex = 0;
    let isTyping = true;

    const typingInterval = setInterval(() => {
      if (isTyping) {
        if (charIndex <= messages[msgIndex].length) {
          setRobotMessage(messages[msgIndex].slice(0, charIndex));
          charIndex++;
        } else {
          isTyping = false;
          setTimeout(() => {
            charIndex = 0;
            setMsgIndex((prev) => (prev + 1) % messages.length);
            setRobotMessage("");
            isTyping = true;
          }, 2000);
        }
      }
    }, 100);

    return () => clearInterval(typingInterval);
  }, [isGreeting, msgIndex, messages]);

  const handleHover = () => {
    if (isHovering) return;
    setIsHovering(true);

    const robotWidth = window.innerWidth < 768 ? 300 : 400;
    const robotHeight = robotWidth;
    const maxX = window.innerWidth - robotWidth - 20;
    const maxY = window.innerHeight - robotHeight - 20;
    const randomX = Math.random() * maxX;
    const randomY = Math.random() * maxY;

    controls
      .start({
        x: randomX,
        y: randomY,
        scale: 1.2,
        transition: { duration: 0.8, ease: "easeInOut" },
      })
      .then(() => {
        return controls.start({
          x: 0,
          y: 0,
          scale: 1,
          transition: { duration: 0.8, ease: "easeInOut" },
        });
      })
      .then(() => {
        setIsHovering(false);
      });
  };

  const handleLoginChange = (e) => {
    setLoginForm({ ...loginForm, [e.target.name]: e.target.value });
    setLoginError('');
  };

  const handleSignupChange = (e) => {
    setSignupForm({ ...signupForm, [e.target.name]: e.target.value });
    setSignupError('');
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', loginForm);
      console.log('Login response:', response.data);
      const { userId, fullname } = response.data;
      if (!userId || !fullname) throw new Error("Invalid user data from server");
      setSuccessMessage('Login successful!');
      setShowSuccessAlert(true);
      setCurrentUser({ id: userId, fullname });
      localStorage.setItem('currentUser', JSON.stringify({ id: userId, fullname }));
      setTimeout(() => {
        setShowSuccessAlert(false);
        navigate('/joinfamily');
      }, 2000);
    } catch (error) {
      setLoginError(error.response?.data?.message || 'Login failed');
      console.error('Login error details:', error.response?.data || error);
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    if (signupForm.password !== signupForm.confirmPassword) {
      setSignupError('Passwords do not match');
      return;
    }
    console.log('Sending signup data:', signupForm);
    try {
      const response = await axios.post('http://localhost:5000/api/auth/signup', {
        email: signupForm.email,
        password: signupForm.password,
        fullname: signupForm.fullname,
      });
      console.log('Signup response:', response.data);
      const { userId, fullname } = response.data;
      if (!userId || !fullname) throw new Error("Invalid user data from server");
      setSuccessMessage('Signup successful!');
      setShowSuccessAlert(true);
      setCurrentUser({ id: userId, fullname });
      localStorage.setItem('currentUser', JSON.stringify({ id: userId, fullname }));
      setTimeout(() => {
        setShowSuccessAlert(false);
        navigate('/joinfamily');
      }, 2000);
    } catch (error) {
      setSignupError(error.response?.data?.message || 'Server error');
      console.error('Signup error details:', error.response?.data || error);
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = document.documentElement.scrollHeight; // Ensure canvas covers full page height
    const stars = Array.from({ length: 150 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 2 + 1,
      speedX: (Math.random() - 0.5) * 0.2,
      speedY: (Math.random() - 0.5) * 0.2,
      opacity: Math.random(),
    }));

    function animate() {
      // Clear the canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Solid black background
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Radial gradient centered in the middle with orange tones
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, Math.max(canvas.width, canvas.height) / 2);
      gradient.addColorStop(0, 'rgba(249, 115, 22, 0.6)'); // Orange-500 (60% opacity) at center
      gradient.addColorStop(0.3, 'rgba(234, 88, 12, 0.5)'); // Orange-600 (50% opacity)
      gradient.addColorStop(0.5, 'rgba(194, 65, 12, 0.4)'); // Orange-800 (40% opacity)
      gradient.addColorStop(0.7, 'rgba(244, 114, 22, 0.3)'); // Translucent orange-500 (30% opacity)
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)'); // Transparent at edges
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw and animate stars
      stars.forEach(star => {
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`; // White stars
        ctx.fill();

        star.x += star.speedX;
        star.y += star.speedY;

        if (star.x < 0 || star.x > canvas.width) star.speedX *= -1;
        if (star.y < 0 || star.y > canvas.height) star.speedY *= -1;

        star.opacity = Math.sin(Date.now() * 0.001 + star.x) * 0.5 + 0.5;
      });

      requestAnimationFrame(animate);
    }

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = document.documentElement.scrollHeight; // Update height on resize
    };
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden font-sans text-white" style={{ background: 'transparent' }}>
      <canvas ref={canvasRef} className="absolute inset-0 z-0" />
      {/* Header */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={headerControls}
        className="relative z-10 w-full px-6 py-6 flex justify-between items-center border-b border-gray-800"
      >
        <h1 className="text-3xl font-extrabold tracking-tight text-white">FamNavi</h1>
        <div>
          {currentUser ? (
            <span className="text-white">Welcome, {currentUser.fullname}!</span>
          ) : (
            <>
              <button
                onClick={() => { setIsLoginOpen(true); setIsSignupOpen(false); }}
                className="px-6 py-2 mr-2 bg-transparent border-2 border-orange-500 text-white font-bold rounded-full hover:bg-orange-500 hover:text-white transition"
              >
                Login
              </button>
              <button
                onClick={() => { setIsSignupOpen(true); setIsLoginOpen(false); }}
                className="px-6 py-2 bg-transparent border-2 border-orange-500 text-white font-bold rounded-full hover:bg-orange-500 hover:text-white transition"
              >
                Signup
              </button>
            </>
          )}
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-6 py-12 flex flex-col md:flex-row items-center justify-between">
        <div className="max-w-lg text-center md:text-left mb-12 md:mb-0">
          <h2 className="text-5xl font-bold bg-gradient-to-r from-[#C0C0C0] to-[#E0E0E0] bg-clip-text text-transparent mb-4" style={{ WebkitBackgroundClip: 'text' }}>
            {displayedText}
            <span className={displayedText.length < fullText.length ? "animate-blink" : ""}>|</span>
          </h2>
          <motion.p
            className="text-gray-400 mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: isParagraphVisible ? 1 : 0 }}
            transition={{ duration: 1, ease: "easeIn" }}
          >
            Stay connected with your family in real-time. With FamNavi, you’ll always know where your people are safe, secure, and just a tap away.
          </motion.p>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isButtonVisible ? 1 : 0 }}
            transition={{ duration: 1, ease: "easeIn" }}
          >
            <button
              onClick={() => { setIsLoginOpen(true); setIsSignupOpen(false); }}
              className="inline-block px-6 py-3 bg-transparent border-2 border-orange-500 text-white font-semibold rounded-full hover:bg-orange-500 hover:text-white transition"
            >
              Get Started
            </button>
          </motion.div>
        </div>
        <motion.div
          animate={controls}
          initial={{ x: 300, opacity: 0, scale: 0.5 }}
          onHoverStart={handleHover}
          className="w-[300px] md:w-[400px] relative pointer-events-auto"
        >
          <Lottie animationData={robotAnim} loop={true} />
          {isGreeting && robotMessage && (
            <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-gray-900 border border-gray-700 px-4 py-2 rounded-lg shadow-md text-white font-semibold text-base glossy-robot-message">
              {robotMessage}
              <span className={robotMessage.length < messages[msgIndex].length ? "animate-blink" : ""}>|</span>
            </div>
          )}
        </motion.div>
      </main>

      {/* How It Works Section */}
      <section ref={howItWorksRef} className="relative z-10 container mx-auto px-6 py-12">
        <motion.h3
          className="text-4xl font-bold bg-gradient-to-r from-[#C0C0C0] to-[#E0E0E0] bg-clip-text text-transparent mb-8 text-center"
          style={{ WebkitBackgroundClip: 'text' }}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: isButtonVisible ? 1 : 0, y: isButtonVisible ? 0 : 50 }}
          transition={{ duration: 0.5 }}
        >
          🧭 How It Works
        </motion.h3>
        <div className="space-y-6">
          <motion.div
            className="bg-gray-900 p-6 rounded-lg shadow-lg glossy-step"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: isButtonVisible ? 1 : 0, y: isButtonVisible ? 0 : 50 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h4 className="text-xl font-semibold text-gray-300 mb-2">Sign Up / Log In</h4>
            <p className="text-gray-500">Create an account or log in to securely access your family location dashboard.</p>
          </motion.div>
          <motion.div
            className="bg-gray-900 p-6 rounded-lg shadow-lg glossy-step"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: isButtonVisible ? 1 : 0, y: isButtonVisible ? 0 : 50 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h4 className="text-xl font-semibold text-gray-300 mb-2">Create or Join a Family Group</h4>
            <p className="text-gray-500">Create a group and share the unique code, or join an existing one using a code from a family member.</p>
          </motion.div>
          <motion.div
            className="bg-gray-900 p-6 rounded-lg shadow-lg glossy-step"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: isButtonVisible ? 1 : 0, y: isButtonVisible ? 0 : 50 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h4 className="text-xl font-semibold text-gray-300 mb-2">Connect & Track</h4>
            <p className="text-gray-500">Once in a group, see your family members’ real-time locations on an interactive Google Map.</p>
          </motion.div>
          <motion.div
            className="bg-gray-900 p-6 rounded-lg shadow-lg glossy-step"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: isButtonVisible ? 1 : 0, y: isButtonVisible ? 0 : 50 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <h4 className="text-xl font-semibold text-gray-300 mb-2">Stay Connected Anytime, Anywhere</h4>
            <p className="text-gray-500">Whether you're traveling or at home, know where your loved ones are safely and instantly.</p>
          </motion.div>
        </div>
      </section>

      {/* Login Modal */}
      {isLoginOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          onClick={() => setIsLoginOpen(false)}
        >
          <div
            className="relative bg-gray-900 shadow-lg rounded-lg p-8 w-80"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsLoginOpen(false)}
              className="absolute top-2 right-2 text-gray-400 hover:text-white"
            >
              ✕
            </button>
            <h2 className="text-2xl font-semibold bg-gradient-to-r from-[#C0C0C0] to-[#E0E0E0] bg-clip-text text-transparent mb-6 text-center" style={{ WebkitBackgroundClip: 'text' }}>
              Login
            </h2>
            <form onSubmit={handleLoginSubmit}>
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={loginForm.email}
                onChange={handleLoginChange}
                className="w-full mb-4 p-2 border border-gray-700 rounded bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:border-orange-500"
                required
              />
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={loginForm.password}
                onChange={handleLoginChange}
                className="w-full mb-4 p-2 border border-gray-700 rounded bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:border-orange-500"
                required
              />
              {loginError && <p className="text-red-500 text-sm mb-4">{loginError}</p>}
              <button type="submit" className="w-full bg-transparent border-2 border-orange-500 text-white font-semibold p-2 rounded-full hover:bg-orange-500 hover:text-white transition">
                Login
              </button>
            </form>
            <p className="mt-4 text-center text-sm text-gray-400">
              Don't have an account? <button onClick={() => { setIsLoginOpen(false); setIsSignupOpen(true); }} className="text-orange-500 hover:underline">Sign up</button>
            </p>
          </div>
        </div>
      )}

      {/* Signup Modal */}
      {isSignupOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          onClick={() => setIsSignupOpen(false)}
        >
          <div
            className="relative bg-gray-900 shadow-lg rounded-lg p-8 w-80"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsSignupOpen(false)}
              className="absolute top-2 right-2 text-gray-400 hover:text-white"
            >
              ✕
            </button>
            <h2 className="text-2xl font-semibold bg-gradient-to-r from-[#C0C0C0] to-[#E0E0E0] bg-clip-text text-transparent mb-6 text-center" style={{ WebkitBackgroundClip: 'text' }}>
              Signup
            </h2>
            <form onSubmit={handleSignupSubmit}>
              <input
                type="text"
                name="fullname"
                placeholder="Full Name"
                value={signupForm.fullname}
                onChange={handleSignupChange}
                className="w-full mb-4 p-2 border border-gray-700 rounded bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:border-orange-500"
                required
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={signupForm.email}
                onChange={handleSignupChange}
                className="w-full mb-4 p-2 border border-gray-700 rounded bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:border-orange-500"
                required
              />
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={signupForm.password}
                onChange={handleSignupChange}
                className="w-full mb-4 p-2 border border-gray-700 rounded bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:border-orange-500"
                required
              />
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                value={signupForm.confirmPassword}
                onChange={handleSignupChange}
                className="w-full mb-4 p-2 border border-gray-700 rounded bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:border-orange-500"
                required
              />
              {signupError && <p className="text-red-500 text-sm mb-4">{signupError}</p>}
              <button type="submit" className="w-full bg-transparent border-2 border-orange-500 text-white font-semibold p-2 rounded-full hover:bg-orange-500 hover:text-white transition">
                Signup
              </button>
            </form>
            <p className="mt-4 text-center text-sm text-gray-400">
              Already have an account? <button onClick={() => { setIsSignupOpen(false); setIsLoginOpen(true); }} className="text-orange-500 hover:underline">Log in</button>
            </p>
          </div>
        </div>
      )}

      {/* Success Alert */}
      {showSuccessAlert && (
        <motion.div
          className="fixed inset-0 z-60 flex items-center justify-center bg-black bg-opacity-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="relative bg-transparent p-4 rounded-lg shadow-lg flex items-center justify-center"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="relative">
              <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <p className="mt-2 text-white text-center">{successMessage}</p>
            </div>
          </motion.div>
        </motion.div>
      )}

      <footer className="relative z-10 p-6 text-center text-gray-400">
        Made with ❤️ by Pranav
      </footer>

      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap');

          .font-sans {
            font-family: 'Poppins', sans-serif;
          }

          .animate-blink {
            animation: blink 0.7s step-end infinite;
          }

          @keyframes blink {
            50% { opacity: 0; }
          }

          .container {
            max-width: 1200px;
          }

          .bg-gray-900 {
            background-color: #0f0f0f;
          }

          .glossy-robot-message {
            background-color: rgba(26, 26, 26, 0.3);
            backdrop-filter: blur(5px);
            box-shadow: inset 0 2px 4px rgba(255, 255, 255, 0.3), 0 2px 6px rgba(0, 0, 0, 0.4);
            border-radius: 10px;
            border: 1px solid rgba(255, 255, 255, 0.1);
          }

          .glossy-step {
            background-color: rgba(26, 26, 26, 0.3);
            backdrop-filter: blur(5px);
            box-shadow: inset 0 2px 4px rgba(255, 255, 255, 0.3), 0 2px 6px rgba(0, 0, 0, 0.4);
            border-radius: 10px;
            border: 1px solid rgba(255, 255, 255, 0.1);
          }
        `}
      </style>
    </div>
  );
}