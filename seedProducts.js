import mongoose from "mongoose";
import dotenv from "dotenv";
import connectDB from "./src/config/db.js";
import Product from "./src/models/product.model.js";

dotenv.config();

// Modern high-quality product images
const categoryImages = {
  electronics: [
    "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1000",
    "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=1000",
    "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=1000",
    "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=1000",
    "https://images.unsplash.com/photo-1517336714739-489689fd1ca8?w=1000",
  ],

  clothing: [
    "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=1000",
    "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=1000",
    "https://images.unsplash.com/photo-1434389674359-7502f85c6e6c?w=1000",
    "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1000",
    "https://images.unsplash.com/photo-1445205170230-053b83016050?w=1000",
  ],

  shoes: [
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1000",
    "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=1000",
    "https://images.unsplash.com/photo-1539185441755-769473a23570?w=1000",
    "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=1000",
    "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=1000",
  ],

  accessories: [
    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1000",
    "https://images.unsplash.com/photo-1547949003-9792a18a2601?w=1000",
    "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=1000",
    "https://images.unsplash.com/photo-1533139502658-0198f920d8e8?w=1000",
    "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1000",
  ],

  books: [
    "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=1000",
    "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=1000",
    "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=1000",
    "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=1000",
    "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=1000",
  ],
};

const categories = {
  electronics: [
    "iPhone 15 Pro",
    "Gaming Laptop",
    "Wireless Earbuds",
    "Smart Watch",
    "Bluetooth Speaker",
  ],

  clothing: [
    "Oversized Hoodie",
    "Premium T-Shirt",
    "Slim Fit Jeans",
    "Streetwear Jacket",
    "Cargo Pants",
  ],

  shoes: [
    "Nike Sneakers",
    "Running Shoes",
    "Jordan High Tops",
    "Casual Trainers",
    "Sports Shoes",
  ],

  accessories: [
    "Luxury Watch",
    "Leather Backpack",
    "Sunglasses",
    "Wallet",
    "Travel Bag",
  ],

  books: [
    "Atomic Habits",
    "Rich Dad Poor Dad",
    "Deep Work",
    "Clean Code",
    "The Psychology of Money",
  ],
};

const brands = [
  "Apple",
  "Nike",
  "Adidas",
  "Samsung",
  "Sony",
  "Puma",
  "Amazon Basics",
  "UrbanStyle",
  "Zara",
  "H&M",
];

const adjectives = [
  "Premium",
  "Modern",
  "Luxury",
  "Smart",
  "Ultra",
  "Advanced",
  "Professional",
  "Classic",
];

const generateProducts = (count = 200) => {
  const products = [];
  const categoryKeys = Object.keys(categories);

  for (let i = 0; i < count; i++) {
    const category =
      categoryKeys[Math.floor(Math.random() * categoryKeys.length)];

    const item =
      categories[category][
        Math.floor(Math.random() * categories[category].length)
      ];

    const adjective =
      adjectives[Math.floor(Math.random() * adjectives.length)];

    const brand =
      brands[Math.floor(Math.random() * brands.length)];

    const name = `${adjective} ${item}`;

    const categoryImageList = categoryImages[category];

    const randomImage =
      categoryImageList[
        Math.floor(Math.random() * categoryImageList.length)
      ];

    products.push({
      name,

      slug:
        name.toLowerCase().replace(/\s+/g, "-") +
        "-" +
        i,

      description: `${name} built with premium quality materials, stylish modern design, and excellent durability. Perfect for daily lifestyle and professional use.`,

      price: Math.floor(Math.random() * 15000) + 999,

      stock: Math.floor(Math.random() * 100) + 1,

      category,

      brand,

      images: [randomImage],

      rating: Number((Math.random() * 5).toFixed(1)),

      numReviews: Math.floor(Math.random() * 500),

      isFeatured: Math.random() > 0.7,

      isActive: true,
    });
  }

  return products;
};

const seedProducts = async () => {
  try {
    await connectDB();

    console.log("🗑️ Deleting old products...");
    await Product.deleteMany();

    console.log("🌱 Adding modern ecommerce products...");

    const products = generateProducts(200);

    await Product.insertMany(products);

    console.log(
      `✅ Success! ${products.length} modern products inserted into Atlas`
    );

    process.exit();
  } catch (error) {
    console.error("❌ Error seeding products:", error);
    process.exit(1);
  }
};

seedProducts();