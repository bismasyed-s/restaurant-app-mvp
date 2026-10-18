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

## Q6 note

Context suits authentication and theme state because many screens need the same user and palette.
Providers make that shared data available without passing props through every navigator and screen.
A login updates one shared user value, and logout clears it for the whole navigation tree.
A theme toggle updates one shared palette, so all subscribed screens can change together.
This keeps screen props focused on screen-specific data and actions.
One drawback is that all consumers re-render when a context value they use changes.

## Q7 cart reducer cases

| Action | Initial state | Expected state |
| --- | --- | --- |
| `ADD_ITEM` (m1) | `items: []` | m1 added with quantity 1 and an empty note |
| `ADD_ITEM` (m1 again) | m1 quantity 1 | m1 quantity becomes 2, with one cart row |
| `INCREMENT` (m1) | m1 quantity 1 | m1 quantity becomes 2 |
| `DECREMENT` (m1) | m1 quantity 1 | m1 row is removed at quantity zero |
| `UPDATE_NOTE` (m1, "no onions") | m1 note empty | m1 note becomes "no onions" |
| `REMOVE_ITEM` (m1) | cart contains m1 | items becomes empty |
| `APPLY_PROMO` (`WELCOME10`) | no promo | promo is `WELCOME10`, discount is 10% |
| `APPLY_PROMO` (`INVALID`) | no promo | state is unchanged; Cart shows an invalid-code alert |
| `CLEAR_CART` | items and promo set | items empty, promo cleared, discount is 0% |
| `REMOVE_PROMO` | promo is `FEAST20` | promo cleared, discount is 0% |

### useReducer and useState for the cart

`useReducer` keeps related cart changes together as named actions.
The reducer makes quantity, note, and promo transitions predictable and easy to review.
`useState` would work for a very small cart with only one or two independent values.
As cart features grow, separate state setters can spread related rules across the screen.

## Q8 optimization note

Avoid `useMemo` for cheap calculations or `useCallback` for handlers that do not affect memoized children; their dependency tracking adds complexity.
Use them when profiling shows an expensive calculation repeats or a stable callback helps a memoized child skip work.
Keep straightforward values and handlers simple until repeated work is measurable.

## Q10 demo recording

Demo video URL (maximum three minutes): Pending recording; paste the share link here after recording the customer and manager flow.

## Hook map

| Hook or feature | Used in |
| --- | --- |
| `useState` | Login, Menu, Cart, Reservation, Profile, Manager Dashboard |
| `useEffect` | Menu loading and cleanup, persisted `OrdersProvider` data, Order Tracking timers |
| `useRef` | Menu search input, debounce timer, FlatList, previous query, render counter |
| `useContext` through custom hooks | `useAuth`, `useTheme`, `useCart`, and `useOrders` across screens |
| `useReducer` | CartProvider and OrdersProvider |
| `useMemo` | Menu derived list, theme styles, Cart and Order Summary calculations, dashboard styles |
| `useCallback` and `React.memo` | Menu handlers and `MenuItemCard` |

## Screenshots Directory

Current screenshots in `screenshots/`:
- `q3-validation-errors.jpeg`
- `q3-successful-customer-login.jpeg`
- `q3-manager-login.jpeg`
- `q5-render-counter.jpeg`

Q8 console comparisons and the Q10 demo recording still need to be captured from a running app and added here.

## GitHub handoff

The working branch is `main`, and this checkout has an `origin` remote configured. Review `git status --short`, then stage and commit the assignment files and push `main` to your GitHub repository. `.env` files are ignored; confirm the staged file list contains no private configuration before pushing.
