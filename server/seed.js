require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('./config/db');
const User = require('./models/User');
const MenuItem = require('./models/MenuItem');
const Table = require('./models/Table');
const Reservation = require('./models/Reservation');
const Order = require('./models/Order');

const menuItems = [
  { name: 'Crispy Calamari', description: 'Tender squid rings with garlic aioli.', price: 12.5, category: 'Starters', image: 'calamari.png', isSpecial: true, isAvailable: true },
  { name: 'Bruschetta Pomodoro', description: 'Grilled sourdough with tomatoes and basil.', price: 9, category: 'Starters', image: 'bruschetta.png' },
  { name: 'Truffle Mushroom Soup', description: 'Wild mushroom soup with truffle oil.', price: 10.5, category: 'Starters', image: 'mushroom_soup.png', isAvailable: false },
  { name: 'Chicken Wings BBQ', description: 'Chicken wings with house barbecue glaze.', price: 11, category: 'Starters', image: 'chicken_wings.png' },
  { name: 'Grilled Ribeye Steak', description: 'Ribeye with herb butter and potatoes.', price: 28, category: 'Mains', image: 'ribeye_steak.png', isSpecial: true },
  { name: 'Smoked Salmon Tagliatelle', description: 'Tagliatelle with smoked salmon.', price: 21.5, category: 'Mains', image: 'salmon_tagliatelle.png' },
  { name: 'Classic Smash Burger', description: 'Angus beef, cheddar, pickles, and relish.', price: 16.5, category: 'Mains', image: 'smash_burger.png' },
  { name: 'Pan-Seared Sea Bass', description: 'Sea bass with asparagus and lemon sauce.', price: 24, category: 'Mains', image: 'sea_bass.png', isAvailable: false },
  { name: 'Molten Lava Cake', description: 'Warm chocolate cake with vanilla gelato.', price: 9.5, category: 'Desserts', image: 'lava_cake.png', isSpecial: true },
  { name: 'Classic Italian Tiramisu', description: 'Espresso soaked savoiardi and mascarpone.', price: 8.5, category: 'Desserts', image: 'tiramisu.png' },
  { name: 'New York Cheesecake', description: 'Baked cheesecake with berry compote.', price: 9, category: 'Desserts', image: 'cheesecake.png' },
  { name: 'Raspberry Sorbet Trio', description: 'Raspberry, mango, and passion fruit sorbet.', price: 7.5, category: 'Desserts', image: 'raspberry_sorbet.png', isAvailable: false },
  { name: 'Mint Lemon Mojito', description: 'Mint, lime, cane syrup, and sparkling water.', price: 6, category: 'Drinks', image: 'mint_mojito.png' },
  { name: 'Iced Caramel Macchiato', description: 'Cold brew with milk and caramel.', price: 6.5, category: 'Drinks', image: 'caramel_macchiato.png' },
  { name: 'Fresh Mango Passion Cooler', description: 'Mango and passionfruit cooler.', price: 7, category: 'Drinks', image: 'mango_cooler.png' },
  { name: 'Dragonfruit Sparkling Fizz', description: 'Dragonfruit with elderflower and tonic.', price: 7.5, category: 'Drinks', image: 'dragonfruit_fizz.png' },
];

async function seed() {
  try {
    await connectDB();
    await Promise.all([User.deleteMany({}), MenuItem.deleteMany({}), Table.deleteMany({}), Reservation.deleteMany({}), Order.deleteMany({})]);
    const password = await bcrypt.hash('Pass1234', 10);
    await User.create([
      { name: 'Test Customer', email: 'customer@test.com', password, role: 'customer' },
      { name: 'Restaurant Manager', email: 'manager@test.com', password, role: 'manager' },
    ]);
    await MenuItem.insertMany(menuItems);
    await Table.insertMany([
      { number: 1, seats: 2 }, { number: 2, seats: 2 }, { number: 3, seats: 4 },
      { number: 4, seats: 4 }, { number: 5, seats: 6 }, { number: 6, seats: 8 },
    ]);
    console.log('Seeded 2 users, 16 menu items, and 6 tables');
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

seed();
