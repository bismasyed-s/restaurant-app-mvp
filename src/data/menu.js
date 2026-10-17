/**
 * Mock Menu Data for Restaurant App MVP
 * Contains 16 menu items across 4 categories: Starters, Mains, Desserts, Drinks.
 *
 * Each item has the fields required by the SRS:
 * id, name, description, price, category, image, isSpecial, isAvailable
 */

/**
 * SIMULATE_ERROR Flag:
 * When set to true, the fetchMenuData Promise rejects with an error.
 * This allows taking a screenshot of the Error State and testing the Retry button.
 * Default is false for normal operation.
 */
export const SIMULATE_ERROR = false;

export const CATEGORIES = ['All', 'Starters', 'Mains', 'Desserts', 'Drinks'];

export const initialMenuItems = [
  // --- STARTERS (4 items) ---
  {
    id: 'm1',
    name: 'Crispy Calamari',
    description: 'Tender squid rings dusted in seasoned flour, flash-fried, served with garlic aioli.',
    price: 12.50,
    category: 'Starters',
    image: 'calamari.png',
    isSpecial: true, // Daily Special 1
    isAvailable: true,
  },
  {
    id: 'm2',
    name: 'Bruschetta Pomodoro',
    description: 'Grilled sourdough topped with vine tomatoes, fresh basil, garlic, and aged balsamic.',
    price: 9.00,
    category: 'Starters',
    image: 'bruschetta.png',
    isSpecial: false,
    isAvailable: true,
  },
  {
    id: 'm3',
    name: 'Truffle Mushroom Soup',
    description: 'Velvety wild forest mushroom soup finished with white truffle oil and herb croutons.',
    price: 10.50,
    category: 'Starters',
    image: 'mushroom_soup.png',
    isSpecial: false,
    isAvailable: false, // Unavailable 1
  },
  {
    id: 'm4',
    name: 'Chicken Wings BBQ',
    description: 'Glazed chicken wings tossed in tangy house hickory barbecue glaze and sesame seeds.',
    price: 11.00,
    category: 'Starters',
    image: 'chicken_wings.png',
    isSpecial: false,
    isAvailable: true,
  },

  // --- MAINS (4 items) ---
  {
    id: 'm5',
    name: 'Grilled Ribeye Steak',
    description: 'Prime cut 250g ribeye with garlic herb butter, rosemary baby potatoes, and pepper jus.',
    price: 28.00,
    category: 'Mains',
    image: 'ribeye_steak.png',
    isSpecial: true, // Daily Special 2
    isAvailable: true,
  },
  {
    id: 'm6',
    name: 'Smoked Salmon Tagliatelle',
    description: 'Handmade tagliatelle in a dill white wine reduction with Norwegian smoked salmon.',
    price: 21.50,
    category: 'Mains',
    image: 'salmon_tagliatelle.png',
    isSpecial: false,
    isAvailable: true,
  },
  {
    id: 'm7',
    name: 'Classic Smash Burger',
    description: 'Double Angus beef patties, aged cheddar, pickles, and secret house relish in brioche.',
    price: 16.50,
    category: 'Mains',
    image: 'smash_burger.png',
    isSpecial: false,
    isAvailable: true,
  },
  {
    id: 'm8',
    name: 'Pan-Seared Sea Bass',
    description: 'Fresh Mediterranean sea bass fillet served with asparagus and saffron lemon sauce.',
    price: 24.00,
    category: 'Mains',
    image: 'sea_bass.png',
    isSpecial: false,
    isAvailable: false, // Unavailable 2
  },

  // --- DESSERTS (4 items) ---
  {
    id: 'm9',
    name: 'Molten Lava Cake',
    description: 'Warm dark chocolate fondant with a flowing center and artisanal Madagascar vanilla gelato.',
    price: 9.50,
    category: 'Desserts',
    image: 'lava_cake.png',
    isSpecial: true, // Daily Special 3
    isAvailable: true,
  },
  {
    id: 'm10',
    name: 'Classic Italian Tiramisu',
    description: 'Savoiardi soaked in espresso and coffee liqueur layered with mascarpone cream.',
    price: 8.50,
    category: 'Desserts',
    image: 'tiramisu.png',
    isSpecial: false,
    isAvailable: true,
  },
  {
    id: 'm11',
    name: 'New York Cheesecake',
    description: 'Velvety baked cream cheese over buttery graham cracker crust with berry compote.',
    price: 9.00,
    category: 'Desserts',
    image: 'cheesecake.png',
    isSpecial: false,
    isAvailable: true,
  },
  {
    id: 'm12',
    name: 'Raspberry Sorbet Trio',
    description: 'Refreshing dairy-free raspberry, mango, and passion fruit sorbet scoops with mint.',
    price: 7.50,
    category: 'Desserts',
    image: 'raspberry_sorbet.png',
    isSpecial: false,
    isAvailable: false, // Unavailable 3
  },

  // --- DRINKS (4 items) ---
  {
    id: 'm13',
    name: 'Mint Lemon Mojito',
    description: 'Crushed garden spearmint, Persian lime, cane syrup, and sparkling mineral water.',
    price: 6.00,
    category: 'Drinks',
    image: 'mint_mojito.png',
    isSpecial: false,
    isAvailable: true,
  },
  {
    id: 'm14',
    name: 'Iced Caramel Macchiato',
    description: 'Cold brew espresso with cold whole milk, vanilla essence, and buttery caramel drizzle.',
    price: 6.50,
    category: 'Drinks',
    image: 'caramel_macchiato.png',
    isSpecial: false,
    isAvailable: true,
  },
  {
    id: 'm15',
    name: 'Fresh Mango Passion Cooler',
    description: 'Blended Alphonso mango puree with crushed ice, passionfruit pulp, and a splash of soda.',
    price: 7.00,
    category: 'Drinks',
    image: 'mango_cooler.png',
    isSpecial: false,
    isAvailable: true,
  },
  {
    id: 'm16',
    name: 'Dragonfruit Sparkling Fizz',
    description: 'Diced pink pitaya infused with elderflower cordial and chilled botanical tonic.',
    price: 7.50,
    category: 'Drinks',
    image: 'dragonfruit_fizz.png',
    isSpecial: false,
    isAvailable: true,
  },
];

/**
 * Simulates an API call to load the menu data.
 * Returns a Promise that resolves after 1.5 seconds (1500 ms) as specified by Question 4.
 * If SIMULATE_ERROR is true, it rejects with an error for screenshot capture.
 */
export function fetchMenuData() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (SIMULATE_ERROR) {
        reject(new Error('Failed to load menu items. The server could not be reached.'));
      } else {
        resolve(initialMenuItems);
      }
    }, 1500);
  });
}
