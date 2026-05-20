/*import mongoose from "mongoose";
import dotenv from "dotenv";
import connectDB from "./src/config/db.js";
import Product from "./src/models/product.model.js";

dotenv.config();

const categories = {
  electronics: ["Headphones", "Speaker", "Laptop", "Smart Watch"],
  clothing: ["T-Shirt", "Shirt", "Jeans", "Hoodie"],
  shoes: ["Sneakers", "Running Shoes", "Boots"],
  accessories: ["Watch", "Backpack", "Wallet"],
  books: ["Novel", "Programming Book", "Self Help"],
};

const adjectives = ["Premium", "Stylish", "Modern", "Advanced"];

const generateProducts = (count = 100) => {
  const products = [];
  const keys = Object.keys(categories);

  for (let i = 0; i < count; i++) {
    const category = keys[Math.floor(Math.random() * keys.length)];
    const item =
      categories[category][
        Math.floor(Math.random() * categories[category].length)
      ];

    const name = `${adjectives[Math.floor(Math.random() * adjectives.length)]} ${item}`;

    products.push({
      name,
      slug: name.toLowerCase().replace(/\s+/g, "-") + "-" + i,
      description: `Best ${name} for daily use`,
      price: Math.floor(Math.random() * 5000) + 500,
      stock: Math.floor(Math.random() * 50),
      category,
      images: [`https://picsum.photos/300/300?random=${i}`],
      rating: (Math.random() * 5).toFixed(1),
      numReviews: Math.floor(Math.random() * 200),
      isActive: true,
    });
  }

  return products;
};

const seedProducts = async () => {
  try {
    await connectDB();

    console.log("Deleting old products...");
    await Product.deleteMany();

    console.log("Adding new products...");
    const products = generateProducts(200);

    await Product.insertMany(products);

    console.log("✅ Done! Products inserted");
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seedProducts();  */


import mongoose from "mongoose";
import dotenv from "dotenv";
import connectDB from "./src/config/db.js";
import Product from "./src/models/product.model.js";

dotenv.config();

// Category-specific image URLs (real product images)
const categoryImages = {
  electronics: [
    "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=300",
    "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=300",
    "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=300",
    "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=300",
  ],
  clothing: [
    "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=300",
    "https://images.unsplash.com/photo-1583744946564-b52ac1c389c8?w=300",
    "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=300",
    "https://images.unsplash.com/photo-1434389674359-7502f85c6e6c?w=300",
  ],
  shoes: [
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300",
    "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=300",
    "https://images.unsplash.com/photo-1539185441755-769473a23570?w=300",
    "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=300",
  ],
  accessories: [
    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300", // Watch
    "https://images.unsplash.com/photo-1547949003-9792a18a2601?w=300", // Backpack
    "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=300", // Wallet
    "https://images.unsplash.com/photo-1533139502658-0198f920d8e8?w=300", // Sunglasses
  ],
  books: [
    "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=300",
    "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=300",
    "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300",
    "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=300",
  ],
};

const categories = {
  electronics: ["Headphones", "Speaker", "Laptop", "Smart Watch"],
  clothing: ["T-Shirt", "Shirt", "Jeans", "Hoodie"],
  shoes: ["Sneakers", "Running Shoes", "Boots"],
  accessories: ["Watch", "Backpack", "Wallet"],
  books: ["Novel", "Programming Book", "Self Help"],
};

const adjectives = ["Premium", "Stylish", "Modern", "Advanced", "Classic"];

const generateProducts = (count = 100) => {
  const products = [];
  const keys = Object.keys(categories);

  for (let i = 0; i < count; i++) {
    const category = keys[Math.floor(Math.random() * keys.length)];
    const item =
      categories[category][
        Math.floor(Math.random() * categories[category].length)
      ];

    const name = `${adjectives[Math.floor(Math.random() * adjectives.length)]} ${item}`;
    
    // Get random image from category-specific images
    const categoryImageList = categoryImages[category];
    const randomImage = categoryImageList[Math.floor(Math.random() * categoryImageList.length)];

    products.push({
      name,
      slug: name.toLowerCase().replace(/\s+/g, "-") + "-" + i,
      description: `Best ${name} with premium quality and durability. Perfect for everyday use.`,
      price: Math.floor(Math.random() * 5000) + 500,
      stock: Math.floor(Math.random() * 50),
      category,
      images: [randomImage],
      rating: (Math.random() * 5).toFixed(1),
      numReviews: Math.floor(Math.random() * 200),
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

    console.log("🌱 Adding new products with proper images...");
    const products = generateProducts(200);

    await Product.insertMany(products);

    console.log(`✅ Done! ${products.length} products inserted with category-specific images`);
    process.exit();
  } catch (error) {
    console.error("❌ Error seeding products:", error);
    process.exit(1);
  }
};

seedProducts();