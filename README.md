FamNavi 🌍

FamNavi is a web application designed to keep families connected through real-time location tracking and group communication. Users can create or join family groups, monitor members' locations on an interactive Google Map, and communicate via real-time group chat. With a modern, animated user interface and a dark-themed, starry background, FamNavi offers a user-friendly and engaging experience for ensuring the safety and connectivity of loved ones. 👨‍👩‍👧‍👦✨

Features 🚀





User Authentication 🔐: Secure signup and login with password hashing (bcrypt) and session management via local storage.



Group Management 👥: Create family groups with unique 6-digit join codes, join existing groups, or leave/delete groups.



Real-Time Location Tracking 📍: Periodically updates user locations (every 60 seconds) using the browser's geolocation API, displayed on a Google Map with labeled markers.



Group Chat 💬: Real-time messaging within groups using Socket.IO, with messages stored in a MySQL database.



Interactive UI 🎨: Features animations (Framer Motion, Lottie), a starry background with a radial gradient, and responsive design with Tailwind CSS.



Offline Support 📴: Stores locations in local storage for syncing when connectivity is restored.

Tech Stack 🛠️

Front End 🌐





React ⚛️: For building the user interface.



React Router 🛤️: For client-side routing.



Framer Motion 🎥: For animations (e.g., typing effects, robot movements).



Lottie 🤖: For animated robot graphics.



Tailwind CSS 🎨: For responsive styling.



Google Maps API 🗺️: For location visualization.



Socket.IO Client 📡: For real-time chat.



Axios 🌐: For HTTP requests.

Back End 🖥️





Express.js 🚀: Web framework for API routes.



MySQL 🗄️: Database for storing users, groups, locations, and messages.



Socket.IO 📨: For real-time group chat.



bcrypt 🔒: For password hashing.



jsonwebtoken 🔑: For potential JWT-based authentication (not fully implemented).



cors 🔗: For cross-origin requests from the frontend.



dotenv 🌍: For environment variable management.

Database 🗃️





MySQL (database: family_tracker):





users: Stores user data (id, email, password, fullname).



groups: Stores group data (id, join_code, group_name, created_by).



group_members: Manages group memberships (group_id, user_id, joined_at).



locations: Stores user locations (user_id, latitude, longitude, updated_at).



messages: Stores chat messages (id, group_id, user_id, content, sent_at).

Usage 📱





Sign Up / Log In 🔐:





Visit the landing page and create an account or log in.



Create or Join a Group 👥:





Navigate to the group management page to create a group with a name (generates a unique join code) or join a group using a code.



Track Locations 📍:





Allow browser geolocation to share your location.



View group members' locations on the Google Map by clicking "Track".



Chat 💬:





Open the chat modal for a group to send and receive real-time messages.

Project Structure 📂

famnavi/
├── client/                    # Frontend (React) 🌐
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Landing.jsx    # Landing page with signup/login 🏠
│   │   │   ├── Joinfamily.jsx # Group management and map 🗺️
│   │   ├── App.js             # Main app with routes 🛤️
│   │   ├── App.css            # App-specific styles 🎨
│   │   ├── index.js           # React entry point ⚛️
│   │   ├── index.css          # Global styles with Tailwind 🎨
│   │   ├── assets/            # Lottie animation files (e.g., robot.json) 🤖
├── server/                    # Backend (Express.js) 🖥️
│   ├── routes/
│   │   ├── auth.js            # Authentication routes 🔐
│   │   ├── groups.js          # Group management routes 👥
│   │   ├── locations.js       # Location update routes 📍
│   │   ├── chat.js            # Chat message routes 💬
│   ├── db.js                  # MySQL connection setup 🗄️
│   ├── index.js               # Backend entry point with Socket.IO 📡
│   ├── .env                   # Environment variables 🔧
│   ├── package.json           # Backend dependencies and scripts 📦
├── README.md                  # Project documentation 📜

Potential Improvements 💡





Security 🔒:





Implement JWT authentication for API requests.



Secure .env secrets using a secrets manager.



Add input validation/sanitization to prevent injection attacks.



Google Maps 🗺️:





Secure the API key using environment variables.



Scalability 📈:





Optimize Socket.IO for large groups.



Use Redis for caching frequent database queries.



UX 🎨:





Add geofencing alerts for location-based events.



Improve mobile responsiveness.



Enhance accessibility (e.g., ARIA labels).



Offline Support 📴:





Queue multiple location updates for syncing.



Implement service workers for better offline UX.

Contributing 🤝

Contributions are welcome! Please:





Fork the repository.



Create a feature branch (git checkout -b feature/your-feature).



Commit changes (git commit -m 'Add your feature').



Push to the branch (git push origin feature/your-feature).



Open a pull request.

License 📝

This project is licensed under the ISC License.

Author 👨‍💻

Made with ❤️ by Pranav