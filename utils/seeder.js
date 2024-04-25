const mongoose = require('mongoose');
const Product = require('../models/product');

const products = [
    {
        name: "Iphone 12",
        images: [
            {
                public_id: "iphone12_img1",
                url: "https://images.unsplash.com/photo-1605637064671-c03a5fae76cd?ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTZ8fGlwaG9uZSUyMDEyfGVufDB8fDB8fA%3D%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
            }
        ],
        price: 10000,
        description: "The iPhone is a line of smartphones designed and marketed by Apple Inc. that use Apple's iOS mobile operating system. The first-generation iPhone was announced by former Apple CEO Steve Jobs on January 9, 2007. Since then Apple has annually released new iPhone models and iOS updates. As of November 1, 2018, more than 2.2 billion iPhones had been sold.",
        category: "Electronics",
        seller: "Apple",
        stock: 50,
        ratings: 4.5,
        numofReviews: 0
    },
    {
        name: "Macbook Pro",
        images: [
            {
                public_id: "macbookpro_img1",
                url: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8bWFjYm9va3xlbnwwfHwwfHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
            }
        ],
        price: 900000,
        description: "The MacBook Pro is a line of Macintosh portable computers introduced in January 2006 by Apple Inc. It is the higher-end model of the MacBook family, sitting above the consumer-focused MacBook Air, and is sold with 13- and 16-inch screens. 17-inch and 15-inch version were sold from April 2006 to June 2012 and January 2006 to January 2020, respectively.",
        category: "Electronics",
        seller: "Apple",
        stock: 100,
        ratings: 4.7,
        numofReviews: 0
    },
];

const seedDB = async () => {
    try {
        await Product.deleteMany({}); 
        await Product.insertMany(products);
        console.log("Database seeded with products.");
    } catch (err) {
        console.error("Error seeding database:", err);
    }
}

module.exports = seedDB;
