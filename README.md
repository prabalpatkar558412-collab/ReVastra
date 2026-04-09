<p align="center">
  <img src="https://img.shields.io/badge/♻️-ReVastra-10b981?style=for-the-badge&labelColor=064e3b&logoColor=white" alt="ReVastra Badge" />
</p>

<h1 align="center">♻️ ReVastra — Smart E-Waste Circular Economy Platform</h1>

<p align="center">
  <b>AI-powered device identification • Transparent valuation • Verified recycler network • Environmental impact tracking</b>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19.2-61DAFB?style=flat-square&logo=react&logoColor=white" />
  <img src="https://img.shields.io/badge/Vite-8.0-646CFF?style=flat-square&logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/TailwindCSS-4.2-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" />
  <img src="https://img.shields.io/badge/Firebase-12.11-FFCA28?style=flat-square&logo=firebase&logoColor=black" />
  <img src="https://img.shields.io/badge/Gemini_AI-Flash-4285F4?style=flat-square&logo=google&logoColor=white" />
  <img src="https://img.shields.io/badge/Express-5.2-000000?style=flat-square&logo=express&logoColor=white" />
  <img src="https://img.shields.io/badge/Node.js-Backend-339933?style=flat-square&logo=node.js&logoColor=white" />
</p>

---

## 📌 About the Project

**ReVastra** is a full-stack web platform that tackles the growing global e-waste crisis by creating a **smart circular economy** for electronic devices. It empowers users to sell their old, damaged, or unused electronics by providing:

- **AI-powered device recognition** using Google Gemini Vision API
- **Transparent, algorithm-driven valuation** based on device type, brand, condition, age, and working status
- **A curated network of verified recyclers** with smart recommendation scoring
- **Doorstep pickup scheduling** for seamless device collection
- **Real-time environmental impact tracking** — CO₂ saved, e-waste diverted, and impact scores
- **Role-based dashboards** for Users, Recyclers, Startup Owners, and Admins

> 🌍 **62 million+ tons** of e-waste are generated globally each year, and less than 25% is properly recycled. ReVastra aims to change that.

---

## 🏗️ Architecture Overview

```
ReVastra/
├── Backend/
│   └── server/
│       ├── server.js          # Express API with Gemini AI integration
│       └── package.json       # Backend dependencies
├── frontend/
│   ├── public/                # Static assets (favicon, icons)
│   ├── src/
│   │   ├── assets/            # Device category images & hero slider images
│   │   ├── components/        # Reusable UI components
│   │   │   ├── home/          # Home page section components
│   │   │   ├── Navbar.jsx     # Responsive navigation with auth state
│   │   │   ├── Footer.jsx     # Rich footer with social links
│   │   │   ├── ProtectedRoute.jsx  # Role-based route guard
│   │   │   ├── Loader.jsx     # Loading spinner component
│   │   │   └── Button.jsx     # Reusable button component
│   │   ├── context/
│   │   │   └── AuthContext.jsx # Firebase Auth state & role management
│   │   ├── data/
│   │   │   └── recyclers.js   # Recycler network seed data
│   │   ├── pages/             # All application pages (13 total)
│   │   ├── services/
│   │   │   └── deviceService.js # Firestore CRUD + Firebase Storage uploads
│   │   ├── utils/
│   │   │   └── pricing.js     # Device valuation algorithm
│   │   ├── Firebase.js        # Firebase app initialization
│   │   ├── App.jsx            # Root router with layout logic
│   │   └── main.jsx           # Application entry point
│   ├── index.html             # HTML template
│   ├── vite.config.js         # Vite + TailwindCSS v4 config
│   └── package.json           # Frontend dependencies
└── README.md
```

---

## 🔄 Application Flow

```
┌──────────┐     ┌──────────┐     ┌─────────────┐     ┌──────────────┐
│  Register │────▶│  Login   │────▶│  Sell Page   │────▶│  AI Analyze  │
│  (Role)   │     │  (Auth)  │     │  (Form+Image)│     │  (Gemini API)│
└──────────┘     └──────────┘     └─────────────┘     └──────┬───────┘
                                                              │
                                                              ▼
┌──────────────┐     ┌───────────────┐     ┌──────────────────────────┐
│  Dashboard   │◀────│  Pickup Page  │◀────│  Estimation Result Page  │
│  (Tracking)  │     │  (Schedule)   │     │  (Valuation + Impact)    │
└──────────────┘     └───────────────┘     └────────────┬─────────────┘
                                                        │
                                                        ▼
                                              ┌─────────────────┐
                                              │  Recyclers Page  │
                                              │  (Compare Offers)│
                                              └─────────────────┘
```

### Step-by-Step User Journey

1. **Register** — User creates an account choosing a role (User / Recycler)
2. **Login** — Firebase Authentication with role-based redirect (Admin → Admin Panel, Recycler → Recycler Dashboard, User → Sell or Dashboard)
3. **Sell Device** — Upload a device image → AI analyzes it via Gemini Vision → Form auto-fills with detected device type, brand, model, condition → User reviews and submits
4. **Estimation** — The pricing algorithm calculates fair market value with a detailed breakdown (base price × brand × condition × working × age multipliers) plus environmental impact score
5. **Recycler Selection** — Smart recommendation engine ranks recyclers by rating, distance, pickup availability, and bonus offer
6. **Pickup Scheduling** — User fills in address, contact, date, and notes → Booking confirmed with a unique ID
7. **Dashboard** — Track all submitted devices, total earnings, e-waste diverted, and pickup progress

---

## ✨ Key Features

### 🤖 AI-Powered Device Recognition
- Upload a photo of any electronic device
- **Google Gemini Flash** vision model identifies device type, brand, model, and physical condition
- Confidence scoring with reliability indicators
- Auto-fills the sell form — users just review and submit

### 💰 Smart Valuation Engine
The pricing algorithm (`utils/pricing.js`) computes fair estimates using:

| Factor | Description |
|--------|-------------|
| **Base Price** | Device-type base values (Phone: ₹18,000, Laptop: ₹32,000, Tablet: ₹14,000, Headphones: ₹5,000) |
| **Brand Multiplier** | Premium brands score higher (Apple: 1.25×, Samsung: 1.12×, Xiaomi: 1.0×, etc.) |
| **Condition Multiplier** | Excellent: 1.0×, Good: 0.88×, Damaged: 0.62×, Dead: 0.35× |
| **Working Multiplier** | Yes: 1.0×, Partially: 0.82×, No: 0.55× |
| **Age Depreciation** | Annual depreciation rates per device type (Phone: 14%, Laptop: 12%, etc.) |

Also generates: **Suggested Path** (Resale / Repair / Recycle) and **Impact Score**.

### ♻️ Recycler Recommendation Engine
- Scores recyclers based on: pickup availability, rating, proximity, and bonus offer
- Highlights "Best Match" recycler
- Seamless flow to pickup scheduling

### 📊 Role-Based Dashboards

| Role | Dashboard | Capabilities |
|------|-----------|--------------|
| **User** | `/dashboard` | View submitted devices, estimated earnings, e-waste diverted, pickup progress |
| **Recycler** | `/dashboard/recycler` | Manage all device requests, update statuses (Accept → Schedule → Pick → Complete / Reject), search & filter |
| **Admin** | `/admin` | View all users, change user roles (User / Recycler / Startup Owner / Admin) |
| **Startup Owner** | `/dashboard/startup` | Future-ready dashboard for startup ecosystem partners |

### 🔐 Authentication & Security
- Firebase Authentication (email/password)
- Role-based route protection via `ProtectedRoute` component
- Auth state managed globally via React Context (`AuthContext`)
- Automatic redirects for unauthenticated users

### 🌍 Environmental Impact Tracking
- **Impact Score** per device (65% – 92% based on condition)
- **CO₂ Saved** estimates (Laptop: ~450g, Phone: ~180g)
- **E-Waste Diverted** tracking (Laptop: 1.2kg, Phone: 0.4kg)

---

## 🛠️ Tech Stack

### Frontend
| Technology | Version | Purpose |
|-----------|---------|---------|
| React | 19.2 | UI framework with hooks |
| Vite | 8.0 | Build tool & dev server |
| TailwindCSS | 4.2 | Utility-first CSS framework |
| React Router DOM | 7.14 | Client-side routing |
| Framer Motion | 12.38 | Animations |
| Lucide React | 1.8 | Icon library |
| React Icons | 5.6 | Additional icon sets |
| Firebase SDK | 12.11 | Auth, Firestore, Storage |
| @google/generative-ai | 0.24 | Gemini AI (frontend helper) |

### Backend
| Technology | Version | Purpose |
|-----------|---------|---------|
| Express.js | 5.2 | REST API server |
| @google/genai | 1.49 | Gemini Vision AI for device analysis |
| Multer | 2.1 | Image upload middleware (in-memory) |
| Firebase Admin | 12.11 | Server-side Firestore access |
| CORS | 2.8 | Cross-origin resource sharing |
| dotenv | 17.4 | Environment variable management |

### Cloud Services
| Service | Usage |
|---------|-------|
| **Firebase Authentication** | User registration, login, session management |
| **Cloud Firestore** | NoSQL database for users, devices, and statuses |
| **Firebase Storage** | Device image uploads and CDN delivery |
| **Google Gemini AI** | Vision-based device recognition and analysis |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18 or above)
- **npm** (v9 or above)
- A **Firebase** project with Authentication, Firestore, and Storage enabled
- A **Google Gemini API Key**

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/ReVastra.git
cd ReVastra
```

### 2. Setup the Backend

```bash
cd Backend/server
npm install
```

Create a `.env` file in `Backend/server/`:

```env
GEMINI_API_KEY=your_gemini_api_key_here
PORT=5000
```

Start the backend server:

```bash
npm start
```

The API will be running at `http://localhost:5000`.

### 3. Setup the Frontend

```bash
cd frontend
npm install
```

Start the development server:

```bash
npm run dev
```

The app will be running at `http://localhost:5173`.

### 4. Firebase Configuration

The Firebase config is located in `frontend/src/Firebase.js`. Update it with your own Firebase project credentials if needed:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
};
```

---

## 📡 API Endpoints

### `GET /`
Health check — returns `"Backend is running"`.

### `POST /api/analyze-device`
AI-powered device image analysis.

| Parameter | Type | Description |
|-----------|------|-------------|
| `image` | `file` (multipart) | Device image (JPG/PNG/WEBP, max 5MB) |

**Response:**
```json
{
  "success": true,
  "analysis": {
    "deviceType": "Phone",
    "likelyBrand": "Samsung",
    "likelyModel": "Galaxy S21",
    "visibleCondition": "Good",
    "confidence": 87,
    "reasoning": "The device appears to be a Samsung phone...",
    "exactModelReliable": true
  }
}
```

---

## 📂 Pages & Routes

| Route | Page | Access | Description |
|-------|------|--------|-------------|
| `/` | Home | Public | Landing page with hero section, categories, features, and CTA |
| `/categories` | Categories | Public | Browse e-waste categories (Display, Battery, Speaker, Camera, etc.) |
| `/register` | Register | Public | Create account with role selection (User / Recycler) |
| `/login` | Login | Public | Email/password authentication with role-based redirect |
| `/sell` | Sell Device | Auth | Upload image → AI analysis → Fill form → Submit to Firestore |
| `/estimate` | Estimation Result | Auth | View calculated value, pricing breakdown, impact insights |
| `/recyclers` | Recycler List | Auth | Compare recycler offers, ratings, distance, and pickup availability |
| `/pickup` | Schedule Pickup | Auth | Book doorstep pickup with date, address, and contact |
| `/dashboard` | User Dashboard | Auth (User) | Track submissions, earnings, e-waste diverted |
| `/dashboard/recycler` | Recycler Dashboard | Auth (Recycler) | Manage device requests, update pickup workflow |
| `/admin` | Admin Panel | Auth (Admin) | User management and role assignment |

---

## 🎨 Design System

- **Color Palette**: Emerald/Teal primary, Slate neutrals, with status-specific colors
- **Typography**: System defaults with careful font weight hierarchy
- **Components**: Rounded corners (2xl/3xl), soft shadows, gradient accents
- **Responsive**: Mobile-first design with breakpoints at `sm`, `md`, `lg`, `xl`
- **Interactions**: Hover effects, scale transforms, smooth transitions
- **Icons**: Lucide React + React Icons (Font Awesome set)

---

## 🔮 Future Scope

- [ ] **Real-time notifications** for pickup status updates via Firebase Cloud Messaging
- [ ] **Payment gateway integration** for instant payouts to users
- [ ] **Geolocation-based recycler matching** using Maps API
- [ ] **QR code tracking** for device lifecycle transparency
- [ ] **Startup Owner marketplace** for refurbished parts trading
- [ ] **Detailed analytics dashboard** with charts and trend data
- [ ] **Multi-language support** (Hindi, Marathi, etc.)
- [ ] **Progressive Web App (PWA)** for offline-first mobile experience

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📜 License

This project is open source and available under the [MIT License](LICENSE).

---

## 👥 Team

Built with ❤️ for sustainable technology and a cleaner planet.

---

<p align="center">
  <b>♻️ ReVastra — Because every device deserves a second life.</b>
</p>