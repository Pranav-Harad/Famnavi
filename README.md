# FamNavi 🌍
A real-time family tracker & communication app

<p align="center">
  <img src="https://img.shields.io/badge/React-18.2.0-61DAFB?logo=react&logoColor=white&style=for-the-badge" />
  <img src="https://img.shields.io/badge/Node.js-20.3.0-339933?logo=node.js&logoColor=white&style=for-the-badge" />
  <img src="https://img.shields.io/badge/MySQL-8.0-blue?logo=mysql&logoColor=white&style=for-the-badge" />
  <img src="https://img.shields.io/badge/TailwindCSS-3.5-cyan?logo=tailwind-css&logoColor=white&style=for-the-badge" />
  <img src="https://img.shields.io/badge/Socket.IO-4.6.2-orange?logo=socket.io&logoColor=white&style=for-the-badge" />
</p>

**FamNavi** is a **web application designed to keep families connected** through **real-time location tracking** and **group communication**. Users can create or join family groups, monitor members' locations on an interactive Google Map, and communicate via real-time group chat.

With a modern, animated interface and a dark-themed starry background, FamNavi ensures the **safety and connectivity of your loved ones** in a fun and engaging way. 👨‍👩‍👧‍👦✨

---

## ✨ Dynamic Features ✨

FamNavi comes packed with powerful features to keep you connected and secure:

### 🔐 User Authentication
- Secure signup and login using **bcrypt** for robust password hashing.
- Seamless session management via **local storage**.

### 🤝 Group Management
- Effortlessly create family groups, each with a unique **6-digit join code**.
- Join existing groups or leave/delete groups with ease.

### 📍 Real-Time Location Tracking
- Location updates every **60 seconds** using the browser's geolocation API.
- Visualize all group members on an interactive **Google Map** with labeled markers.

### 💬 Instant Group Chat
- Real-time messaging powered by **Socket.IO**.
- All messages are securely stored in **MySQL** for persistence.

### 🎨 Interactive & Responsive UI
- Smooth, delightful animations with **Framer Motion** and **Lottie**.
- A captivating starry, dark-themed background with a radial gradient.
- Fully **responsive design** ensures a consistent experience on any device, thanks to **Tailwind CSS**.

### 📴 Smart Offline Support
- Locations are intelligently stored in **local storage** and automatically synced once connectivity is restored.

---

## 🚀 Tech Stack Under the Hood 🚀

FamNavi is built with a robust and modern technology stack:

### Frontend 🌐 (Client-Side Magic)
* **React** ⚛️: Building dynamic and reactive user interfaces.
* **React Router** 🛣️: Navigating through the application with intuitive client-side routing.
* **Framer Motion** 🎬: Bringing the UI to life with smooth, declarative animations (e.g., typing effects, robot movements).
* **Lottie** 🤖: Integrating beautiful, lightweight animated robot graphics.
* **Tailwind CSS** 🎨: Rapidly styling the application with utility-first CSS for a stunning, responsive design.
* **Google Maps API** 🗺️: Powering interactive maps for real-time location visualization.
* **Socket.IO Client** 💬: Enabling instant, bidirectional communication for real-time chat.
* **Axios** 🔄: Making efficient HTTP requests to the backend.

### Backend 🖥️ (Server-Side Power)
* **Express.js** ⚡: The fast, unopinionated, minimalist web framework for building robust APIs.
* **MySQL** 🗄️: The reliable relational database storing all users, groups, locations, and messages.
* **Socket.IO** 📨: Facilitating real-time, event-based communication for group chat.
* **bcrypt** 🛡️: Securely hashing passwords to protect user credentials.
* **jsonwebtoken** 🔑: (Potential) Implementing secure, stateless authentication for API requests.
* **cors** 🌐: Handling Cross-Origin Resource Sharing for seamless frontend-backend interaction.
* **dotenv** ⚙️: Managing environment variables for sensitive configurations.

### Database 🗃️ (Data at a Glance)

**Database Name:** `family_tracker`

| Table           | Purpose                                                                 |
| :-------------- | :---------------------------------------------------------------------- |
| `users`         | Stores essential user information (`id`, `email`, `password`, `fullname`) |
| `groups`        | Manages group data (`id`, `join_code`, `group_name`, `created_by`)      |
| `group_members` | Links users to groups (`group_id`, `user_id`, `joined_at`)              |
| `locations`     | Records user geographical data (`user_id`, `latitude`, `longitude`, `updated_at`) |
| `messages`      | Stores all group chat messages (`id`, `group_id`, `user_id`, `content`, `sent_at`) |

---

## 🏃‍♀️ How to Use FamNavi 🏃‍♂️

Getting started with FamNavi is simple and intuitive:

### 1. Sign Up / Log In 🔐
Navigate to the landing page and either create a new account or log in with your existing credentials.

### 2. Create or Join a Group 🤝
* **Create:** Give your group a name, and FamNavi will auto-generate a unique **6-digit join code** for you.
* **Join:** Use a friend's or family member's join code to instantly become part of their group.

### 3. Track Locations 📍
Grant browser geolocation permissions to securely share your location. Then, watch your family members appear on the interactive Google Map.

### 4. Chat Away! 💬
Open the chat modal within your group to send and receive **real-time messages** with everyone.

---

## 🌳 Project Structure 🌳

A clear overview of the FamNavi repository:

```text
famnavi/
├── client/ # Frontend 🌐
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Landing.jsx     # Landing page 🏠
│   │   │   └── Joinfamily.jsx  # Group management & map 🗺️
│   │   ├── assets/           # Lottie animations 🤖
│   │   ├── App.js            # Main app with routes 🛤️
│   │   ├── App.css           # App-specific styles 🎨
│   │   ├── index.js          # React entry point ⚛️
│   │   └── index.css         # Global styles with Tailwind 🎨
├── server/ # Backend 🖥️
│   ├── routes/
│   │   ├── auth.js         # Auth routes 🔐
│   │   ├── groups.js       # Group routes 👥
│   │   ├── locations.js    # Location updates 📍
│   │   └── chat.js         # Chat routes 💬
│   ├── db.js             # MySQL connection 🗄️
│   ├── index.js          # Backend entry point & Socket.IO 📡
│   ├── .env              # Environment variables 🔧
│   └── package.json      # Backend dependencies 📦
└── README.md             # Project documentation 📜
```



---

## Potential Improvements 💡

### Security 🔒
- Implement **JWT authentication** for API requests.
- Secure `.env` secrets using a secrets manager.
- Add **input validation & sanitization** to prevent injection attacks.

### Google Maps 🗺️
- Secure API key using environment variables.

### Scalability 📈
- Optimize **Socket.IO** for large groups.
- Introduce **Redis caching** for frequent queries.

### UX 🎨
- Geofencing alerts for location-based events.
- Improved mobile responsiveness.
- Enhanced accessibility (ARIA labels).

### Offline Support 📴
- Queue multiple location updates for syncing.
- Use **service workers** for better offline experience.

---

## Contributing 🤝
1. Fork the repository.
2. Create a feature branch:  
   `git checkout -b feature/your-feature`
3. Commit your changes:  
   `git commit -m 'Add your feature'`
4. Push to the branch:  
   `git push origin feature/your-feature`
5. Open a **pull request**.

---


---

## Author 👨‍💻
Made with ❤️ by **Pranav**  
Keep your family safe and connected with FamNavi! 🌟
