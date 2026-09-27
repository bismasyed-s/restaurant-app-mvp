# 🍽️ Restaurant App MVP

Restaurant App MVP — React Native + Expo | Fall 2026

Restaurant App MVP is a frontend-only React Native restaurant application developed as a Mobile Application Development (MAD) assignment. The app provides separate Customer and Manager experiences with menu browsing, search, filtering, cart management, promo codes, ordering, order tracking, table reservations, profile/theme controls, and manager-side restaurant management.

## 📖 About the Project

This project demonstrates practical use of React components, navigation, React Hooks, Context API, reducer-based state management, local persistence, reusable custom hooks, theme switching, and role-based Customer/Manager navigation.

The project is intentionally frontend-only. Application data is provided through local/mock data. No backend server, external database, payment gateway, or remote API is required to run the application.

## ✨ Features

### 👤 Customer Features
- Login and signup with role-based authentication
- Menu browsing with categories (Starters, Mains, Desserts, Drinks)
- Category filtering and debounced search
- Menu item availability (unavailable items disabled)
- Daily Special badges
- Cart management (add/remove, adjust quantity, special instructions)
- Promo code application (e.g. WELCOME10, FEAST20)
- Order summary (subtotal, service charge, tax, discount, total)
- Table reservation with live time-slot and table availability
- Order tracking with live status updates
- Light/Dark theme toggle
- Logout

### 👨‍💼 Manager Features
- Manager-only dashboard (active orders, pending tables)
- Order and reservation management
- Accept/decline reservations
- Add, edit, and toggle availability of menu items
- Manager profile

## 👤 Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Customer | customer@demo.com | Pass1234 |
| Manager | manager@demo.com | Manager123 |

## 🛠️ Technology Stack

| Technology | Purpose |
|---|---|
| React Native | Cross-platform mobile UI |
| Expo SDK 57 | Development runtime and tooling |
| Expo Router | File-based navigation |
| Context API | Shared application state |
| React Hooks | Local state, effects, refs, context, optimization |
| useReducer | Cart and order state transitions |
| AsyncStorage | Local persistence |

## 🧩 React Hooks Used

| Hook | Usage |
|---|---|
| useState | Forms, search, filters, modal visibility |
| useEffect | Initialization, timers, AsyncStorage persistence |
| useRef | Input focus, timers, scroll refs, render counter |
| useContext | Auth, theme, cart, and orders state |
| useReducer | Cart and order state management |
| useMemo | Derived totals and filtered menu |
| useCallback | Stable handlers for memoized components |
| useForm | Reusable form validation logic |
| useDebounce | Delayed search updates |
| useReservation | Reservation availability and creation |

## 🔐 Context API

- **AuthContext** — current user and authentication
- **ThemeContext** — light/dark theme and colors
- **CartContext** — cart data and cart actions
- **OrdersContext** — customer and manager order state
