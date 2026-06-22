const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
dotenv.config();

const User = require('./models/User');
const Category = require('./models/Category');
const FoodItem = require('./models/FoodItem');

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/quickbite');
  console.log('✅ Connected to MongoDB');

  await User.deleteMany({});
  await Category.deleteMany({});
  await FoodItem.deleteMany({});
  console.log('🗑  Cleared old data');

  const categories = await Category.insertMany([
    { name: 'Breakfast', icon: '🌅', description: 'Morning specials' },
    { name: 'Rice & Meals', icon: '🍚', description: 'Full meals with rice' },
    { name: 'Snacks', icon: '🍟', description: 'Quick bites' },
    { name: 'Beverages', icon: '☕', description: 'Hot and cold drinks' },
    { name: 'Desserts', icon: '🍰', description: 'Sweet treats' },
    { name: 'Noodles & Pasta', icon: '🍜', description: 'Noodles and pasta' },
    { name: 'Juices & Shakes', icon: '🥤', description: 'Fresh juices and thick shakes' },
    { name: 'Sandwiches', icon: '🥪', description: 'Freshly made sandwiches' },
  ]);

  const cm = {};
  categories.forEach(c => { cm[c.name] = c._id; });
  console.log(`📂 Created ${categories.length} categories`);

  const hp = await bcrypt.hash('password123', 12);
  await User.insertMany([
    { name: 'Canteen Owner', email: 'owner@quickbite.com', password: hp, role: 'owner', phone: '9876543210' },
    { name: 'Arjun Kumar', email: 'student@quickbite.com', password: hp, role: 'customer', phone: '9876543211', collegeId: 'CS2021001' },
  ]);
  console.log('👤 Created 2 users');

  await FoodItem.insertMany([
    // Breakfast
    { name: 'Masala Dosa', description: 'Crispy dosa with spiced potato masala, served with sambar and chutneys', price: 40, category: cm['Breakfast'], imageUrl: '/images/food_1.png', isVeg: true, prepTime: 10, rating: 4.8, tags: ['popular', 'bestseller'], calories: 350 },
    { name: 'Idli Sambar', description: 'Soft steamed rice cakes with piping hot sambar and coconut chutney', price: 28, category: cm['Breakfast'], imageUrl: '/images/food_2.png', isVeg: true, prepTime: 5, rating: 4.6, tags: ['healthy'], calories: 200 },
    { name: 'Poha', description: 'Light flattened rice with onions, mustard seeds and peanuts', price: 20, category: cm['Breakfast'], imageUrl: '/images/food_3.png', isVeg: true, prepTime: 5, rating: 4.3, tags: ['light'], calories: 250 },
    // Rice & Meals
    { name: 'Veg Thali', description: 'Complete meal — dal, 2 sabzis, rice, roti, papad and pickle', price: 64, category: cm['Rice & Meals'], imageUrl: '/images/food_4.png', isVeg: true, prepTime: 15, rating: 4.7, tags: ['popular', 'value'], calories: 700 },
    { name: 'Chicken Biryani', description: 'Aromatic basmati rice cooked with tender chicken and whole spices', price: 96, category: cm['Rice & Meals'], imageUrl: '/images/food_5.png', isVeg: false, prepTime: 20, rating: 4.9, tags: ['bestseller', 'non-veg'], calories: 650 },
    { name: 'Egg Fried Rice', description: 'Wok-tossed rice with scrambled eggs, vegetables and soy sauce', price: 56, category: cm['Rice & Meals'], imageUrl: '/images/food_6.png', isVeg: false, prepTime: 12, rating: 4.4, tags: ['popular'], calories: 480 },
    { name: 'Mutton Biryani', description: 'Rich traditional Indian Mutton Biryani with tender succulent juicy meat chunks bursting out of long grain saffron rice.', price: 120, category: cm['Rice & Meals'], imageUrl: '/images/food_26.png', isVeg: false, prepTime: 25, rating: 4.9, tags: ['bestseller', 'non-veg'], calories: 700 },
    { name: 'Hyderabadi Chicken Biryani', description: 'Authentic spicy Hyderabadi Dum Biryani with bright vibrant layered basmati rice and massive spicy chicken drumsticks.', price: 112, category: cm['Rice & Meals'], imageUrl: '/images/food_27.png', isVeg: false, prepTime: 20, rating: 4.8, tags: ['spicy'], calories: 650 },
    { name: 'Kolkata Biryani', description: 'Classical Kolkata style Biryani featuring a signature golden fried halved potato and a boiled egg nestled alongside fragrant juicy chicken.', price: 104, category: cm['Rice & Meals'], imageUrl: '/images/food_28.png', isVeg: false, prepTime: 20, rating: 4.7, tags: ['popular'], calories: 600 },
    { name: 'Malabar Biryani', description: 'Kerala style Thalassery Biryani using short-grain Kaima rice, spiced greenish masala, roasted cashew nuts, and golden raisins.', price: 128, category: cm['Rice & Meals'], imageUrl: '/images/food_29.png', isVeg: false, prepTime: 25, rating: 4.6, tags: ['chef special'], calories: 550 },
    { name: 'Lucknowi Biryani', description: 'Elegant Awadhi Biryani. Slow-cooked delicate lamb biryani with pure saffron strands on top of fluffy mildly spiced white rice.', price: 136, category: cm['Rice & Meals'], imageUrl: '/images/food_30.png', isVeg: false, prepTime: 30, rating: 4.9, tags: ['premium'], calories: 680 },
    // Snacks
    { name: 'Samosa (2 pcs)', description: 'Crispy pastry triangles stuffed with spiced potatoes and peas', price: 16, category: cm['Snacks'], imageUrl: '/images/food_7.png', isVeg: true, prepTime: 5, rating: 4.5, tags: ['popular'], calories: 300 },
    { name: 'Pav Bhaji', description: 'Spicy mashed vegetable curry with buttered pav buns', price: 48, category: cm['Snacks'], imageUrl: '/images/food_8.png', isVeg: true, prepTime: 10, rating: 4.6, tags: ['popular', 'street food'], calories: 500 },
    { name: 'Bread Pakoda', description: 'Bread stuffed with spiced potato, dipped in batter and deep fried', price: 24, category: cm['Snacks'], imageUrl: '/images/food_9.png', isVeg: true, prepTime: 7, rating: 4.2, tags: ['snack'], calories: 380 },
    { name: 'Chicken Shawarma', description: 'Authentic middle eastern sliced grilled chicken wrapped in soft pita with garlic sauce', price: 88, category: cm['Snacks'], imageUrl: '/images/food_18.png', isVeg: false, prepTime: 8, rating: 4.8, tags: ['popular', 'bestseller'], calories: 480 },
    { name: 'Chicken Kathi Roll', description: 'Spicy chicken tikka wrapped in a flaky paratha flatbread with onions and mint chutney', price: 64, category: cm['Snacks'], imageUrl: '/images/food_19.png', isVeg: false, prepTime: 10, rating: 4.5, tags: ['street food'], calories: 400 },
    { name: 'Butter Chicken Roll', description: 'Rich creamy authentic butter chicken wrapped in a soft roomali roti', price: 76, category: cm['Snacks'], imageUrl: '/images/food_20.png', isVeg: false, prepTime: 12, rating: 4.9, tags: ['bestseller'], calories: 500 },
    // Beverages
    { name: 'Masala Chai', description: 'Strong ginger-cardamom tea brewed with full cream milk', price: 10, category: cm['Beverages'], imageUrl: '/images/food_10.png', isVeg: true, prepTime: 3, rating: 4.8, tags: ['popular', 'hot'], calories: 80 },
    { name: 'Cold Coffee', description: 'Chilled coffee blended with milk and ice cream', price: 36, category: cm['Beverages'], imageUrl: '/images/food_11.png', isVeg: true, prepTime: 5, rating: 4.7, tags: ['cold', 'popular'], calories: 200 },
    { name: 'Fresh Lime Soda', description: 'Freshly squeezed lime with sparkling soda water', price: 20, category: cm['Beverages'], imageUrl: '/images/food_12.png', isVeg: true, prepTime: 2, rating: 4.4, tags: ['refreshing'], calories: 60 },
    // Desserts
    { name: 'Gulab Jamun (2 pcs)', description: 'Soft milk dumplings soaked in rose-flavored sugar syrup', price: 24, category: cm['Desserts'], imageUrl: '/images/food_13.png', isVeg: true, prepTime: 3, rating: 4.6, tags: ['sweet'], calories: 350 },
    // Noodles & Pasta
    { name: 'Veg Noodles', description: 'Stir-fried noodles with mixed vegetables and aromatic spices', price: 44, category: cm['Noodles & Pasta'], imageUrl: '/images/food_14.png', isVeg: true, prepTime: 10, rating: 4.4, tags: ['popular'], calories: 420 },
    { name: 'Chicken Noodles', description: 'Hakka noodles with tender chicken strips, peppers and dark soy', price: 64, category: cm['Noodles & Pasta'], imageUrl: '/images/food_15.png', isVeg: false, prepTime: 12, rating: 4.7, tags: ['bestseller'], calories: 520 },
    { name: 'Chicken Pasta', description: 'Creamy white sauce pasta with tender chicken chunks and Italian herbs', price: 72, category: cm['Noodles & Pasta'], imageUrl: '/images/food_16.png', isVeg: false, prepTime: 15, rating: 4.6, tags: ['new'], calories: 550 },
    { name: 'Veg Pasta', description: 'Red tomato arrabbiata sauce pasta with mixed vegetables and olives', price: 60, category: cm['Noodles & Pasta'], imageUrl: '/images/food_17.png', isVeg: true, prepTime: 12, rating: 4.3, tags: ['new'], calories: 450 },
    // Juices & Shakes
    { name: 'Mango Shake', description: 'Thick creamy mango milkshake topped with fresh mango cubes and mint', price: 48, category: cm['Juices & Shakes'], imageUrl: '/images/food_21.png', isVeg: true, prepTime: 5, rating: 4.8, tags: ['popular', 'summer special'], calories: 350 },
    { name: 'Strawberry Milkshake', description: 'Sweet pink strawberry milkshake topped with whipped cream and a fresh strawberry', price: 52, category: cm['Juices & Shakes'], imageUrl: '/images/food_22.png', isVeg: true, prepTime: 5, rating: 4.7, tags: ['sweet', 'popular'], calories: 380 },
    { name: 'Fresh Orange Juice', description: '100% freshly squeezed orange juice served with ice cubes and a citrus slice', price: 40, category: cm['Juices & Shakes'], imageUrl: '/images/food_23.png', isVeg: true, prepTime: 3, rating: 4.5, tags: ['healthy', 'refreshing'], calories: 120 },
    { name: 'Watermelon Juice', description: 'Freshly blended bright red watermelon juice garnished with mint leaves', price: 36, category: cm['Juices & Shakes'], imageUrl: '/images/food_24.png', isVeg: true, prepTime: 3, rating: 4.6, tags: ['healthy'], calories: 90 },
    { name: 'Chocolate Oreo Shake', description: 'Thick blended chocolate milkshake loaded with crushed Oreos and chocolate syrup', price: 64, category: cm['Juices & Shakes'], imageUrl: '/images/food_25.png', isVeg: true, prepTime: 7, rating: 4.9, tags: ['bestseller', 'sweet'], calories: 500 },
    // Sandwiches
    { name: 'Chicken & Cheese Sandwich', description: 'Juicy grilled chicken breast with melted cheddar cheese, crisp lettuce and tomato in a toasted brioche bun', price: 72, category: cm['Sandwiches'], imageUrl: '/images/food_31.png', isVeg: false, prepTime: 8, rating: 4.7, tags: ['popular', 'bestseller'], calories: 450 },
    { name: 'Grilled Veg Sandwich', description: 'Multigrain bread with grilled zucchini, bell peppers, mushrooms, melted mozzarella and pesto sauce', price: 56, category: cm['Sandwiches'], imageUrl: '/images/food_32.png', isVeg: true, prepTime: 8, rating: 4.4, tags: ['healthy'], calories: 320 },
    { name: 'Club Sandwich', description: 'Triple-decker toasted sandwich with grilled chicken, crispy bacon, fresh lettuce, tomato, cheese and mayo', price: 88, category: cm['Sandwiches'], imageUrl: '/images/food_33.png', isVeg: false, prepTime: 10, rating: 4.8, tags: ['classic'], calories: 580 },
    { name: 'Paneer Tikka Sandwich', description: 'Toasted bread with spiced marinated grilled paneer, mint chutney, onions and capsicum', price: 64, category: cm['Sandwiches'], imageUrl: '/images/food_34.png', isVeg: true, prepTime: 8, rating: 4.5, tags: ['popular', 'street food'], calories: 380 },
    { name: 'Spicy Crispy Chicken Sandwich', description: 'Crispy fried chicken strips with hot buffalo sauce, pickled jalapenos and coleslaw on toasted flat bread', price: 80, category: cm['Sandwiches'], imageUrl: '/images/food_35.png', isVeg: false, prepTime: 10, rating: 4.9, tags: ['bestseller', 'spicy'], calories: 520 },
  ]);
  console.log('🍔 Created 35 food items');

  console.log('\n✅ Database seeded!\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔐 Demo Login Credentials');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('👨‍🍳 Owner:   owner@quickbite.com   / password123');
  console.log('🎓 Student: student@quickbite.com  / password123');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  if (require.main === module) {
    process.exit(0);
  }
};

if (require.main === module) {
  seed().catch(err => { console.error('Seed failed:', err); process.exit(1); });
}

module.exports = seed;
