# Restaurant App MVP (Frontend Only, React Native)

A mobile restaurant management prototype built with React Native and Expo (SDK 57) for Mobile App Development, Fall 2026.

---

## Installation & Setup

### Prerequisites
- **Node.js**: v20 or v22 LTS recommended
- **Expo Go App**: Version supporting Expo SDK 57 on your mobile device (iOS / Android)

### Installation Steps
1. Clone the repository and navigate to the project directory:
   ```bash
   cd restaurant-app-mvp
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Expo development server:
   ```bash
   npx expo start
   ```
4. Scan the QR code using the **Expo Go** app on your phone.

---

## Mock Login Credentials

The app uses local client-side authentication (`src/data/users.js`) with no backend:

| Role | Email | Password | Destination Screen |
| :--- | :--- | :--- | :--- |
| **Customer** | `customer@test.com` | `Pass1234` | Menu Browsing Screen (`MenuScreen`) |
| **Manager** | `manager@test.com` | `Pass1234` | Manager Dashboard (`DashboardScreen`) |

---

## Q4 note

### What happens if the filtering effect dependency array is left empty?

> In React, if the filtering `useEffect` dependency array is left empty (`[]`), the effect callback executes only once when the component initially mounts. At mount time, `menuItems` is an empty array (`[]`) because the 1.5-second Promise has not yet resolved, and `selectedCategory` is initialized to `'All'`. Consequently, `filteredItems` is set to an empty array and is never updated again. Even when the menu items finish loading or the user taps different category chips (e.g., Starters or Mains), React does not re-run the effect because none of the watched dependencies trigger it. The screen remains completely blank with zero items shown.

---

## Screenshots Directory

All assignment proof screenshots are preserved in [`screenshots/`](screenshots/):
- `q3-validation-errors.png.jpeg`
- `q3-successful-customer-login.png.jpeg`
- `q3-manager-login.png.jpeg`
- `q4-menu-loaded.png` (All categories loaded)
- `q4-category-filtered.png` (Filtered category with updated header count)
- `q4-error-retry.png` (Error screen with Retry button when SIMULATE_ERROR = true)
- `q4-unavailable-items.png` (Greyed-out item with disabled Add button)
