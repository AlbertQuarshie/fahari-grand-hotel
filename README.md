# Fahari Grand Hotel & Suites - Frontend

## A. Contributor

* **Albert Junior Quarshie**

---

## B. Overview

* **Fahari Grand Hotel & Suites** is a hotel and accommodation booking system frontend built using React and Vite, serving a Nairobi-based hotel.

* The system supports four distinct user roles — Guest, Receptionist, Admin, and Housekeeper — each with a dedicated dashboard tailored to their responsibilities within the hotel's operations.

* Guests can browse available rooms, make bookings, and pay via M-Pesa. Receptionists manage check-ins/check-outs and walk-in bookings. Housekeeping staff track room status and cleaning tasks. Admins oversee rooms, staff, pricing, and reporting.

---

## C. Requirements

The following software should be installed before running the project:

1. Node.js v18+

2. npm or yarn

3. Fahari Backend (running locally or deployed on Render)

---

## D. Installation

### 1. Clone the Repository

```bash
git clone https://github.com/AlbertQuarshie/fahari-grand-hotel.git
cd fahari-grand-hotel
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the project root and set the following:

```bash
VITE_API_BASE_URL=http://localhost:8000/api
```

- Note: All environment variables must be prefixed with `VITE_` to be accessible in the browser. For production, set `VITE_API_BASE_URL` to your live Render backend URL.

### 4. Start the Development Server

```bash
npm run dev
```

App will be available at `http://localhost:5173`.

---

## E. Usage

### 1. User Registration

* Guests can register for an account to make bookings; staff accounts are created by the Admin.

### 2. Login

* Sign in using registered credentials. Role-based access determines the dashboard and available actions.

### 3. Browse Rooms

* View available rooms, filter by date, room type, and price.

### 4. Make a Booking

* Reserve a room for selected check-in and check-out dates.

### 5. Make Payment

* Pay for a booking via M-Pesa (Daraja API), triggered directly from the booking flow.

### 6. Manage Stay (Staff)

* Receptionists handle check-in/check-out; Housekeeping updates room cleaning status; Admins manage rooms, rates, and staff.

---

## F. Features

### 1. User Authentication & Role-Based Access

* Secure login and registration with JWT token management.
* Four roles: Guest, Receptionist, Admin, Housekeeper, each routed to a scoped dashboard.
* Tokens stored in localStorage; Axios instance auto-attaches `Authorization` headers.

### 2. Room Browsing

* View and filter available rooms by date, type, and price.
* Room detail pages with images, amenities, and pricing.

### 3. Booking Management

* Create, view, modify, and cancel bookings from the Guest dashboard.
* Booking summary and confirmation flow before payment.

### 4. Payments

* Integrated with M-Pesa Daraja API via the backend.
* Payment status tracked and linked to bookings in real time.

### 5. Check-In / Check-Out

* Receptionist dashboard tools to process guest arrivals and departures.

### 6. Housekeeping

* Housekeepers can view assigned rooms and update cleaning/maintenance status.

### 7. Admin Dashboard

* Manage staff accounts, room inventory, pricing, and view booking reports.

### 8. Landing Page

* Hero section with tagline *"Where magnificence lives."*
* Stats trust bar, "The Fahari Difference" section, room previews, and a full footer with hotel contact info.

---

## G. Project Structure

```
fahari-frontend/
├── public/
├── src/
│   ├── assets/                   # Images, icons, brand assets
│   ├── components/               # Reusable UI components
│   ├── context/
│   │   ├── AuthContext.jsx       # Auth context provider
│   │   └── useAuth.js            # useAuth hook (separate file for Vite HMR compatibility)
│   ├── pages/
│   │   ├── LandingPage.jsx
│   │   ├── LoginPage.jsx
│   │   ├── RegisterPage.jsx
│   │   ├── GuestDashboard.jsx
│   │   ├── ReceptionistDashboard.jsx
│   │   ├── AdminDashboard.jsx
│   │   └── HousekeeperDashboard.jsx
│   ├── services/
│   │   └── api.js                # Axios instance & API helpers
│   ├── App.jsx
│   └── main.jsx
├── .env
├── .env.example
├── index.html
├── vite.config.js
└── package.json
```

---

## H. Tech Stack

| Layer          | Technology              |
| -------------- | ----------------------- |
| Framework      | React                   |
| Build Tool     | Vite                    |
| Routing        | React Router Dom        |
| Payments       | M-Pesa Daraja API       |
| Deployment     | Vercel                  |