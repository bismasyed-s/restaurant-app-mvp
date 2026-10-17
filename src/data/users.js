/**
 * Mock Users Database
 * Holds initial user accounts for authentication in the MVP
 * Both customer and manager credentials: Pass1234
 */

export const initialUsers = [
  {
    id: 'u1',
    fullName: 'Jane Customer',
    email: 'customer@test.com',
    password: 'Pass1234',
    role: 'customer', // 'customer' or 'manager'
  },
  {
    id: 'u2',
    fullName: 'Chef Manager',
    email: 'manager@test.com',
    password: 'Pass1234',
    role: 'manager',
  },
];
