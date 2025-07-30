import { useEffect, useState, useRef, useCallback } from "react";
import { motion, useAnimation } from "framer-motion";
import Lottie from "lottie-react";
import robotAnim from "../assets/robot.json";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import io from "socket.io-client";

// Connect to Socket.IO server
const socket = io("http://localhost:5000"); // Adjust to your backend URL

export default function JoinFamily() {
  const currentUser = JSON.parse(localStorage.getItem("currentUser")) || null;
  const [groupCode, setGroupCode] = useState("");
  const [groupName, setGroupName] = useState("");
  const [joinedGroups, setJoinedGroups] = useState([]);
  const [createdGroups, setCreatedGroups] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [showAlert, setShowAlert] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [isCreateForm, setIsCreateForm] = useState(true);
  const [selectedGroupId, setSelectedGroupId] = useState(null); // Track selected group for chat
  const [isChatOpen, setIsChatOpen] = useState(false); // Control chat modal
  const [messages, setMessages] = useState([]); // Store chat messages
  const [newMessage, setNewMessage] = useState(""); // Input for new message
  const canvasRef = useRef(null);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const chatContainerRef = useRef(null); // Ref for chat scroll
  const location = useLocation();
  const navigate = useNavigate();
  const headerControls = useAnimation();
  const lastUpdateRef = useRef(0);
  const retryCountRef = useRef(0);
  const intervalIdRef = useRef(null);

  // Load Google Maps API dynamically
  useEffect(() => {
    if (!window.google) {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places`;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
      script.onload = () => console.log("Google Maps API loaded");
      script.onerror = () => console.error("Failed to load Google Maps API");
      return () => document.head.removeChild(script);
    }
  }, []);

  // Fetch chat messages for a group
  const fetchMessages = useCallback(async (groupId) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/chat/messages?groupId=${groupId}`);
      setMessages(response.data);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  }, []);

  // Socket.IO: Join group room and handle incoming messages
  useEffect(() => {
    if (selectedGroupId) {
      socket.emit("join_group", selectedGroupId);
      fetchMessages(selectedGroupId);
    }

    socket.on("receive_message", (message) => {
      setMessages((prev) => [...prev, message]);
    });

    return () => {
      socket.off("receive_message");
    };
  }, [selectedGroupId, fetchMessages]);

  // Scroll to bottom of chat when messages update
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Handle sending a message
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedGroupId) return;
    socket.emit("send_message", {
      groupId: selectedGroupId,
      userId: currentUser.id,
      content: newMessage,
    });
    setNewMessage("");
  };

  // Existing useEffect hooks
  useEffect(() => {
    headerControls.start({
      y: 0,
      opacity: 1,
      transition: { duration: 0.8, ease: "easeOut" },
    });
  }, [headerControls]);

  useEffect(() => {
    if (location?.state?.successMessage) {
      setSuccessMessage(`${location.state.successMessage} as ${currentUser?.fullname || "User"}`);
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 2000);
    }
  }, [location, currentUser]);

  const fetchJoinedGroups = useCallback(async () => {
    if (!currentUser?.id) return;
    try {
      const response = await axios.get(`http://localhost:5000/api/groups/members?userId=${currentUser.id}`);
      setJoinedGroups(response.data);
    } catch (error) {
      console.error("Error fetching joined groups:", error);
    }
  }, [currentUser]);

  const fetchCreatedGroups = useCallback(async () => {
    if (!currentUser?.id) return;
    try {
      const response = await axios.get(`http://localhost:5000/api/groups/created?userId=${currentUser.id}`);
      setCreatedGroups(response.data);
    } catch (error) {
      console.error("Error fetching created groups:", error);
    }
  }, [currentUser]);

  const updateLocation = useCallback(async (latitude, longitude) => {
    if (!currentUser?.id) return;
    const offlineLocation = { userId: currentUser.id, latitude, longitude, timestamp: Date.now() };
    localStorage.setItem(`location_${currentUser.id}`, JSON.stringify(offlineLocation));
    try {
      await axios.post("http://localhost:5000/api/locations/update", {
        userId: currentUser.id,
        latitude,
        longitude,
      });
      setSuccessMessage("Location updated successfully");
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
      retryCountRef.current = 0;
      localStorage.removeItem(`location_${currentUser.id}`);
    } catch (error) {
      console.error("Error updating location:", error);
      setSuccessMessage("Location stored offline (no network)");
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
    }
  }, [currentUser]);

  const generateJoinCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!currentUser?.id || !groupName.trim()) {
      setSuccessMessage("Group name is required");
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
      return;
    }
    const joinCode = generateJoinCode();
    try {
      await axios.post("http://localhost:5000/api/groups/create", {
        userId: currentUser.id,
        joinCode,
        groupName,
      });
      setSuccessMessage(`Group created! Share this code: ${joinCode}`);
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
      setGroupName("");
      fetchCreatedGroups();
    } catch (error) {
      console.error("Error creating group:", error);
      setSuccessMessage("Failed to create group");
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
    }
  };

  const handleJoinGroup = async (e) => {
    e.preventDefault();
    if (!currentUser?.id || !groupCode.trim()) {
      setSuccessMessage("Join code is required");
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
      return;
    }
    try {
      const response = await axios.post("http://localhost:5000/api/groups/join", {
        userId: currentUser.id,
        joinCode: groupCode,
      });
      setSuccessMessage(`Joined group: ${response.data.groupName}`);
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
      setGroupCode("");
      fetchJoinedGroups();
    } catch (error) {
      console.error("Error joining group:", error);
      setSuccessMessage("Invalid join code");
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
    }
  };

  const handleDeleteGroup = async (groupId) => {
    try {
      await axios.delete(`http://localhost:5000/api/groups/delete`, {
        data: { userId: currentUser.id, groupId },
      });
      setSuccessMessage("Group deleted successfully");
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
      fetchCreatedGroups();
    } catch (error) {
      console.error("Error deleting group:", error);
      setSuccessMessage("Failed to delete group");
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
    }
  };

  const handleLeaveGroup = async (groupId) => {
    try {
      await axios.delete(`http://localhost:5000/api/groups/leave`, {
        data: { userId: currentUser.id, groupId },
      });
      setSuccessMessage("Left group successfully");
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
      fetchJoinedGroups();
    } catch (error) {
      console.error("Error leaving group:", error);
      setSuccessMessage("Failed to leave group");
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
    }
  };

  const handleTrack = (member) => {
    try {
      if (!window.google || !mapInstanceRef.current || !member.location?.latitude || !member.location?.longitude) {
        console.error("Track failed: Google Maps API not loaded or invalid member location");
        return;
      }
      const latitude = parseFloat(member.location.latitude);
      const longitude = parseFloat(member.location.longitude);
      if (isNaN(latitude) || isNaN(longitude)) {
        console.error("Invalid coordinates for member:", { latitude, longitude, member });
        throw new Error("Invalid latitude or longitude values");
      }
      console.log("Tracking member:", member.fullname, [latitude, longitude]);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.setCenter({ lat: latitude, lng: longitude });
        mapInstanceRef.current.setZoom(12);
        // eslint-disable-next-line no-undef
        new google.maps.Marker({
          position: { lat: latitude, lng: longitude },
          map: mapInstanceRef.current,
          title: `${member.fullname} is here`,
          label: member.fullname.charAt(0),
        });
      }
      // Scroll to map container
      if (mapRef.current) {
        mapRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    } catch (error) {
      console.error("Error in handleTrack:", error);
      setSuccessMessage("Failed to track member");
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
    }
  };

  useEffect(() => {
    if (!currentUser) return;
    let isUpdating = false;

    const updateLocationPeriodically = () => {
      if (isUpdating || Date.now() - lastUpdateRef.current < 60000) return;
      isUpdating = true;
      if (navigator.geolocation) {
        let options = { maximumAge: 0, timeout: 20000 };
        if (retryCountRef.current === 0) options.enableHighAccuracy = true;
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            setUserLocation([latitude, longitude]);
            updateLocation(latitude, longitude);
            lastUpdateRef.current = Date.now();
            if (mapInstanceRef.current) {
              // eslint-disable-next-line no-undef
              new google.maps.Marker({
                position: { lat: latitude, lng: longitude },
                map: mapInstanceRef.current,
                title: "You are here",
                label: currentUser?.fullname?.charAt(0) || "U",
              });
              mapInstanceRef.current.setCenter({ lat: latitude, lng: longitude });
            }
            isUpdating = false;
          },
          (error) => {
            console.error("Geolocation error:", error);
            setSuccessMessage(`Geolocation failed: ${error.message}`);
            setShowAlert(true);
            setTimeout(() => setShowAlert(false), 3000);
            if (error.code === 3 && retryCountRef.current < 2) {
              retryCountRef.current += 1;
              setTimeout(updateLocationPeriodically, 2000);
            } else {
              const offlineLocation = localStorage.getItem(`location_${currentUser.id}`);
              if (offlineLocation) {
                const { latitude, longitude } = JSON.parse(offlineLocation);
                setUserLocation([latitude, longitude]);
                updateLocation(latitude, longitude);
              }
              retryCountRef.current = 0;
              isUpdating = false;
            }
          },
          options
        );
      } else {
        setSuccessMessage("Geolocation not supported");
        setShowAlert(true);
        setTimeout(() => setShowAlert(false), 3000);
        isUpdating = false;
      }
    };

    updateLocationPeriodically();
    intervalIdRef.current = setInterval(updateLocationPeriodically, 60000);

    return () => {
      if (intervalIdRef.current) clearInterval(intervalIdRef.current);
    };
  }, [currentUser, updateLocation]);

  // Canvas animation
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = document.documentElement.scrollHeight;
    const stars = Array.from({ length: 150 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 2 + 1,
      speedX: (Math.random() - 0.5) * 0.2,
      speedY: (Math.random() - 0.5) * 0.2,
      opacity: Math.random(),
    }));
    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, Math.max(canvas.width, canvas.height) / 2);
      gradient.addColorStop(0, "rgba(249, 115, 22, 0.6)");
      gradient.addColorStop(0.3, "rgba(234, 88, 12, 0.5)");
      gradient.addColorStop(0.5, "rgba(194, 65, 12, 0.4)");
      gradient.addColorStop(0.7, "rgba(244, 114, 22, 0.3)");
      gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      stars.forEach((star) => {
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
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
      canvas.height = document.documentElement.scrollHeight;
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (currentUser) {
      fetchJoinedGroups();
      fetchCreatedGroups();
    }
  }, [currentUser, fetchJoinedGroups, fetchCreatedGroups]);

  // Map initialization
  useEffect(() => {
    const initMap = () => {
      if (!mapRef.current || mapInstanceRef.current || !window.google) return;
      // eslint-disable-next-line no-undef
      mapInstanceRef.current = new google.maps.Map(mapRef.current, {
        center: { lat: 28.7041, lng: 77.1025 },
        zoom: 4,
        styles: [
          { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
          { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
          { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
          {
            featureType: "administrative.locality",
            elementType: "labels.text.fill",
            stylers: [{ color: "#d59563" }],
          },
          {
            featureType: "poi",
            elementType: "labels.text.fill",
            stylers: [{ color: "#d59563" }],
          },
          {
            featureType: "poi.park",
            elementType: "geometry",
            stylers: [{ color: "#263c3f" }],
          },
          {
            featureType: "road",
            elementType: "geometry",
            stylers: [{ color: "#38414e" }],
          },
          {
            featureType: "road",
            elementType: "geometry.stroke",
            stylers: [{ color: "#212a37" }],
          },
          {
            featureType: "road",
            elementType: "labels.text.fill",
            stylers: [{ color: "#9ca5b3" }],
          },
          {
            featureType: "water",
            elementType: "geometry",
            stylers: [{ color: "#17263c" }],
          },
          {
            featureType: "water",
            elementType: "labels.text.fill",
            stylers: [{ color: "#515c6d" }],
          },
        ],
      });
      const offlineLocation = localStorage.getItem(`location_${currentUser?.id}`);
      if (offlineLocation && !userLocation) {
        const { latitude, longitude } = JSON.parse(offlineLocation);
        if (latitude && longitude && !isNaN(latitude) && !isNaN(longitude)) {
          // eslint-disable-next-line no-undef
          new google.maps.Marker({
            position: { lat: latitude, lng: longitude },
            map: mapInstanceRef.current,
            title: "Last known location (offline)",
            label: currentUser?.fullname?.charAt(0) || "U",
          });
        }
      }
      const allMembers = joinedGroups.flatMap((group) => group.members);
      const uniqueMembers = Array.from(new Map(allMembers.map((m) => [m.id, m])).values());
      uniqueMembers.forEach((member) => {
        if (member.location && member.location.latitude && member.location.longitude) {
          const lat = parseFloat(member.location.latitude);
          const lng = parseFloat(member.location.longitude);
          if (!isNaN(lat) && !isNaN(lng)) {
            // eslint-disable-next-line no-undef
            new google.maps.Marker({
              position: { lat, lng },
              map: mapInstanceRef.current,
              title: `${member.fullname} is here`,
              label: member.fullname.charAt(0),
            });
          }
        }
      });
      if (userLocation) {
        mapInstanceRef.current.setCenter({ lat: userLocation[0], lng: userLocation[1] });
        mapInstanceRef.current.setZoom(12);
        // eslint-disable-next-line no-undef
        new google.maps.Marker({
          position: { lat: userLocation[0], lng: userLocation[1] },
          map: mapInstanceRef.current,
          title: "You are here",
          label: currentUser?.fullname?.charAt(0) || "U",
        });
      }
    };

    if (window.google) {
      initMap();
    } else {
      const checkGoogle = setInterval(() => {
        if (window.google) {
          clearInterval(checkGoogle);
          initMap();
        }
      }, 100);
      return () => clearInterval(checkGoogle);
    }
  }, [joinedGroups, userLocation, currentUser]);

  return (
    <div className="relative min-h-screen overflow-hidden font-sans text-white" style={{ background: "transparent" }}>
      <canvas ref={canvasRef} className="absolute inset-0 z-0" />
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={headerControls}
        className="relative z-10 w-full px-6 py-6 flex justify-between items-center border-b border-gray-800 bg-transparent"
      >
        <h1 className="text-3xl font-extrabold tracking-tight text-white">FamNavi</h1>
        <div>
          {currentUser ? (
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center text-2xl font-bold text-white transition-transform hover:scale-110">
                {currentUser.fullname.charAt(0).toUpperCase()}
              </div>
              <span className="text-white">{currentUser.fullname}</span>
            </div>
          ) : (
            <div className="space-x-2">
              <button
                onClick={() => navigate("/")}
                className="px-6 py-2 bg-transparent border-2 border-orange-500 text-white font-bold rounded-full hover:bg-orange-500 hover:text-white transition"
              >
                Login
              </button>
              <button
                onClick={() => navigate("/")}
                className="px-6 py-2 bg-transparent border-2 border-orange-500 text-white font-bold rounded-full hover:bg-orange-500 hover:text-white transition"
              >
                Signup
              </button>
            </div>
          )}
        </div>
      </motion.header>

      <main className="relative z-10 container mx-auto px-6 py-12 flex flex-col items-center">
        <div className="w-full max-w-xl mx-auto">
          <div className="relative mb-6">
            <div className="flex bg-gray-800 rounded-full overflow-hidden shadow-lg">
              <button
                onClick={() => setIsCreateForm(true)}
                className={`flex-1 py-3 text-center font-semibold transition-colors duration-300 ${
                  isCreateForm ? "bg-orange-500 text-white hover:bg-orange-600" : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
              >
                Create
              </button>
              <button
                onClick={() => setIsCreateForm(false)}
                className={`flex-1 py-3 text-center font-semibold transition-colors duration-300 ${
                  !isCreateForm ? "bg-orange-500 text-white hover:bg-orange-600" : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
              >
                Join
              </button>
            </div>
          </div>

          <div className="bg-gray-900 p-6 rounded-lg shadow-lg">
            {isCreateForm ? (
              <div className="border border-orange-500 p-4 rounded-lg">
                <div className="flex flex-col items-center gap-4 mb-4">
                  <div className="w-40 h-32">
                    <Lottie animationData={robotAnim} loop={true} />
                  </div>
                  <div className="bg-gray-900/70 border border-gray-700/50 px-4 py-2 rounded-lg shadow-lg backdrop-blur-md bg-opacity-80 text-white font-semibold text-base text-center w-full">
                    Create a new group to connect with your family!
                  </div>
                </div>
                <form onSubmit={handleCreateGroup} className="space-y-4">
                  <input
                    type="text"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    placeholder="Enter Group Name"
                    className="w-full p-2 border border-gray-700 rounded bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:border-orange-500"
                  />
                  <button
                    type="submit"
                    className="w-full py-2 bg-transparent border-2 border-orange-500 text-white font-bold rounded-full hover:bg-orange-500 hover:text-white transition"
                  >
                    Create Group
                  </button>
                </form>
                {createdGroups.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <h3 className="text-lg font-semibold">Your Created Groups:</h3>
                    {createdGroups.map((group) => (
                      <div key={group.id} className="p-2 bg-gray-800 rounded flex justify-between items-center">
                        <span>{group.group_name} (Code: {group.join_code})</span>
                        <button
                          onClick={() => handleDeleteGroup(group.id)}
                          className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
                        >
                          Delete
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="border border-orange-500 p-4 rounded-lg">
                <div className="flex flex-col items-center gap-4 mb-4">
                  <div className="w-40 h-32">
                    <Lottie animationData={robotAnim} loop={true} />
                  </div>
                  <div className="bg-gray-900/70 border border-gray-700/50 px-4 py-2 rounded-lg shadow-lg backdrop-blur-md bg-opacity-80 text-white font-semibold text-base text-center w-full">
                    Join an existing group with a code!
                  </div>
                </div>
                <form onSubmit={handleJoinGroup} className="space-y-4">
                  <input
                    type="text"
                    value={groupCode || ""}
                    onChange={(e) => setGroupCode(e.target.value)}
                    placeholder="Enter Join Code"
                    className="w-full p-2 border border-gray-700 rounded bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:border-orange-500"
                  />
                  <button
                    type="submit"
                    className="w-full py-2 bg-transparent border-2 border-orange-500 text-white font-bold rounded-full hover:bg-orange-500 hover:text-white transition"
                  >
                    Join Group
                  </button>
                </form>
                {joinedGroups.length > 0 && (
                  <div className="mt-4 space-y-4">
                    {joinedGroups.map((group) => (
                      <div key={group.id} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <h3 className="text-lg font-semibold">Joined Group: {group.group_name}</h3>
                          <button
                            onClick={() => {
                              setSelectedGroupId(group.id);
                              setIsChatOpen(true);
                            }}
                            className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                          >
                            Chat
                          </button>
                        </div>
                        {group.members.map((member) => (
                          <div key={member.id} className="p-2 bg-gray-800 rounded flex justify-between items-center">
                            <span>{member.fullname}</span>
                            <div className="space-x-2">
                              <button
                                className="px-2 py-1 bg-orange-500 text-white rounded hover:bg-orange-600 transition"
                                onClick={() => handleTrack(member)}
                              >
                                Track
                              </button>
                              {member.id === currentUser.id && (
                                <button
                                  onClick={() => handleLeaveGroup(group.id)}
                                  className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
                                >
                                  Leave
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="w-full mt-8 z-10 flex justify-center">
          <div
            ref={mapRef}
            style={{
              height: "400px",
              width: "800px",
              border: "2px solid #f97316",
              borderRadius: "10px",
            }}
          />
        </div>
      </main>

      {showAlert && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
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
                <svg
                  className="w-10 h-10 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <p className="mt-2 text-white text-center">{successMessage}</p>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Chat Modal */}
      {isChatOpen && selectedGroupId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          onClick={() => {
            setIsChatOpen(false);
            setSelectedGroupId(null);
          }}
        >
          <div
            className="relative bg-gray-900 shadow-lg rounded-lg p-8 w-full max-w-xl glossy-chat-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => {
                setIsChatOpen(false);
                setSelectedGroupId(null);
              }}
              className="absolute top-2 right-2 text-gray-400 hover:text-white"
            >
              ✕
            </button>
            <h3 className="text-lg font-semibold mb-4">
              Chat in {joinedGroups.find((g) => g.id === selectedGroupId)?.group_name || "Group"}
            </h3>
            <div
              ref={chatContainerRef}
              className="h-96 overflow-y-auto bg-gray-800 p-4 rounded-lg mb-4 glossy-chat-container"
            >
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`mb-2 p-2 rounded-lg ${
                    msg.user_id === currentUser.id
                      ? "ml-auto bg-orange-500 text-white"
                      : "mr-auto bg-gray-700 text-white"
                  } max-w-[70%]`}
                >
                  <p className="text-sm font-semibold">{msg.fullname}</p>
                  <p>{msg.content}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(msg.sent_at).toLocaleTimeString()}
                  </p>
                </div>
              ))}
            </div>
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 p-2 border border-gray-700 rounded bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:border-orange-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition"
              >
                Send
              </button>
            </form>
          </div>
        </div>
      )}

      <footer className="relative z-10 p-6 text-center text-gray-500" style={{ background: "transparent" }}>
        Made with ❤️ by Pranav
      </footer>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap');
        .font-sans { font-family: 'Poppins', sans-serif; }
        @media (max-width: 768px) {
          main { flex-direction: column; align-items: center; }
          .max-w-xl { width: 100% !important; }
          div[style*="height: 400px"] { width: 100% !important; height: 300px !important; }
        }
        .glossy-chat-modal {
          background-color: rgba(26, 26, 26, 0.3);
          backdrop-filter: blur(5px);
          box-shadow: inset 0 2px 4px rgba(255, 255, 255, 0.3), 0 2px 6px rgba(0, 0, 0, 0.4);
          border-radius: 10px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .glossy-chat-container {
          background-color: rgba(26, 26, 26, 0.3);
          backdrop-filter: blur(5px);
          box-shadow: inset 0 2px 4px rgba(255, 255, 255, 0.3), 0 2px 6px rgba(0, 0, 0, 0.4);
          border-radius: 10px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
      `}</style>
    </div>
  );
}