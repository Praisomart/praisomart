-- Rectify column definitions for descriptions to support unlimited/large text lengths
ALTER TABLE paisomart_auth.products ALTER COLUMN description SET DATA TYPE CLOB;
ALTER TABLE paisomart_auth.categories ALTER COLUMN description SET DATA TYPE CLOB;

-- Seed Categories (using MERGE to prevent duplicate primary keys on restarts)
MERGE INTO paisomart_auth.categories (id, name, description, image_url, is_active, created_at, updated_at) KEY(name)
VALUES (1, 'Sarees', 'Exquisite traditional sarees including Silk, Cotton, and Designer collections for every occasion.', 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

MERGE INTO paisomart_auth.categories (id, name, description, image_url, is_active, created_at, updated_at) KEY(name)
VALUES (2, 'Fabrics', 'Premium unstitched textile materials, from pure cotton to luxury brocades for bespoke tailoring.', 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

MERGE INTO paisomart_auth.categories (id, name, description, image_url, is_active, created_at, updated_at) KEY(name)
VALUES (3, 'Silk Collection', 'Pure Mulberry and Kanchipuram silk pattu collections featuring intricate gold zari work.', 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&q=80', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

MERGE INTO paisomart_auth.categories (id, name, description, image_url, is_active, created_at, updated_at) KEY(name)
VALUES (4, 'Blouse Pieces', 'Beautiful unstitched blouse materials with vibrant prints and ethnic embroidery patterns.', 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&q=80', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);


-- Seed Products
MERGE INTO paisomart_auth.products (id, name, description, category_id, is_active, color) KEY(name)
VALUES (1, 'Kanchipuram Silk Saree', 'Handwoven traditional Kanchipuram silk saree with elegant gold zari border, perfect for weddings and heritage festivals.', 1, true, 'Emerald Green');

MERGE INTO paisomart_auth.products (id, name, description, category_id, is_active, color) KEY(name)
VALUES (2, 'Banarasi Brocade', 'Pure Banarasi silk brocade fabric for high-end designer wear and royal ethnic outfits.', 2, true, 'Royal Blue');

MERGE INTO paisomart_auth.products (id, name, description, category_id, is_active, color) KEY(name)
VALUES (3, 'Chanderi Cotton', 'Lightweight and extremely breathable traditional Chanderi cotton fabric, ideal for warm weather designer suits.', 2, true, 'Cream');

MERGE INTO paisomart_auth.products (id, name, description, category_id, is_active, color) KEY(name)
VALUES (4, 'Mysore Silk Saree', 'Elegant, lightweight pure Mysore silk saree featuring a rich gold border and glossy silk sheen finish.', 3, true, 'Maroon');

MERGE INTO paisomart_auth.products (id, name, description, category_id, is_active, color) KEY(name)
VALUES (5, '2 Meter Blouse Piece', 'VIBRANT FLORAL PRINT: Features a stunning multicolour floral pattern base, adding a bold and ethnic charm to your wardrobe. PREMIUM QUALITY FABRIC: Crafted from high-quality material that offers a smooth texture, ensuring comfort and elegance for all-day wear. UNSTITCHED MATERIAL: Comes as unstitched fabric, giving you the freedom to customise the blouse as per your preferred style, fit, and design. Weight - 100 gms.', 4, true, 'Multi');


-- Seed Product Variants (with original prices!)
MERGE INTO paisomart_auth.product_variants (id, product_id, attribute, color, price, stock, is_active, sku) KEY(sku)
VALUES (1, 1, '6 Meters', 'Emerald Green', 15000.00, 10, true, 'KANCHI-GRN-01');

MERGE INTO paisomart_auth.product_variants (id, product_id, attribute, color, price, stock, is_active, sku)
VALUES (2, 2, 'Per Meter', 'Royal Blue', 1200.00, 50, true, 'BANARASI-BLU-FT');

MERGE INTO paisomart_auth.product_variants (id, product_id, attribute, color, price, stock, is_active, sku) KEY(sku)
VALUES (3, 3, 'Per Meter', 'Cream', 450.00, 100, true, 'CHAN-CRM-FT');

MERGE INTO paisomart_auth.product_variants (id, product_id, attribute, color, price, stock, is_active, sku) KEY(sku)
VALUES (4, 4, '6.5 Meters', 'Maroon', 8500.00, 15, true, 'MYSORE-MRN-01');

-- Blouse Piece Color-Specific Variants (Original price ₹250.00)
MERGE INTO paisomart_auth.product_variants (id, product_id, attribute, color, price, stock, is_active, sku) KEY(sku)
VALUES (5, 5, '2 Meters', 'orange', 250.00, 100, true, 'BLOUSE-ORG-2M');

MERGE INTO paisomart_auth.product_variants (id, product_id, attribute, color, price, stock, is_active, sku) KEY(sku)
VALUES (6, 5, '2 Meters', 'maroon', 250.00, 100, true, 'BLOUSE-MRN-2M');

MERGE INTO paisomart_auth.product_variants (id, product_id, attribute, color, price, stock, is_active, sku) KEY(sku)
VALUES (7, 5, '2 Meters', 'green', 250.00, 100, true, 'BLOUSE-GRN-2M');

MERGE INTO paisomart_auth.product_variants (id, product_id, attribute, color, price, stock, is_active, sku) KEY(sku)
VALUES (8, 5, '2 Meters', 'grey', 250.00, 100, true, 'BLOUSE-GRY-2M');

MERGE INTO paisomart_auth.product_variants (id, product_id, attribute, color, price, stock, is_active, sku) KEY(sku)
VALUES (9, 5, '2 Meters', 'yellow', 250.00, 100, true, 'BLOUSE-YLW-2M');

MERGE INTO paisomart_auth.product_variants (id, product_id, attribute, color, price, stock, is_active, sku) KEY(sku)
VALUES (10, 5, '2 Meters', 'brown', 250.00, 100, true, 'BLOUSE-BRW-2M');

MERGE INTO paisomart_auth.product_variants (id, product_id, attribute, color, price, stock, is_active, sku) KEY(sku)
VALUES (11, 5, '2 Meters', 'blue', 250.00, 100, true, 'BLOUSE-BLU-2M');


-- Seed Product Images (using exact local paths in public/images/products)
MERGE INTO paisomart_auth.product_images (id, product_id, image_url, is_primary, display_order, color, created_at) KEY(id)
VALUES (1, 1, '/images/products/kanchi.png', true, 1, 'Emerald Green', CURRENT_TIMESTAMP);

MERGE INTO paisomart_auth.product_images (id, product_id, image_url, is_primary, display_order, color, created_at) KEY(id)
VALUES (2, 2, '/images/products/banarasi.png', true, 1, 'Royal Blue', CURRENT_TIMESTAMP);

MERGE INTO paisomart_auth.product_images (id, product_id, image_url, is_primary, display_order, color, created_at) KEY(id)
VALUES (3, 3, '/images/products/banarasi.png', true, 1, 'Cream', CURRENT_TIMESTAMP);

MERGE INTO paisomart_auth.product_images (id, product_id, image_url, is_primary, display_order, color, created_at) KEY(id)
VALUES (4, 4, '/images/products/kanchi.png', true, 1, 'Maroon', CURRENT_TIMESTAMP);

-- Blouse Piece Color-Specific Images
MERGE INTO paisomart_auth.product_images (id, product_id, image_url, is_primary, display_order, color, created_at) KEY(id)
VALUES (5, 5, '/images/products/blouse-pieces/orange.png', true, 1, 'orange', CURRENT_TIMESTAMP);

MERGE INTO paisomart_auth.product_images (id, product_id, image_url, is_primary, display_order, color, created_at) KEY(id)
VALUES (6, 5, '/images/products/blouse-pieces/maroon.png', true, 1, 'maroon', CURRENT_TIMESTAMP);

MERGE INTO paisomart_auth.product_images (id, product_id, image_url, is_primary, display_order, color, created_at) KEY(id)
VALUES (7, 5, '/images/products/blouse-pieces/green.png', true, 1, 'green', CURRENT_TIMESTAMP);

MERGE INTO paisomart_auth.product_images (id, product_id, image_url, is_primary, display_order, color, created_at) KEY(id)
VALUES (8, 5, '/images/products/blouse-pieces/grey.png', true, 1, 'grey', CURRENT_TIMESTAMP);

MERGE INTO paisomart_auth.product_images (id, product_id, image_url, is_primary, display_order, color, created_at) KEY(id)
VALUES (9, 5, '/images/products/blouse-pieces/yellow.png', true, 1, 'yellow', CURRENT_TIMESTAMP);

MERGE INTO paisomart_auth.product_images (id, product_id, image_url, is_primary, display_order, color, created_at) KEY(id)
VALUES (10, 5, '/images/products/blouse-pieces/brown.png', true, 1, 'brown', CURRENT_TIMESTAMP);

MERGE INTO paisomart_auth.product_images (id, product_id, image_url, is_primary, display_order, color, created_at) KEY(id)
VALUES (11, 5, '/images/products/blouse-pieces/blue.png', true, 1, 'blue', CURRENT_TIMESTAMP);


-- Seed Standard System Admin Account (Password corresponds to 'Admin@123')
MERGE INTO paisomart_auth.users (id, name, email, phone_number, password, role, created_at, is_verified) KEY(email)
VALUES (1, 'Admin', 'admin@praisomart.com', '9999999999', '$2a$10$Bmx9CZadK05j0/WWxZXxlusD24hKmqxlaHB.v6YcN.zDkQFOkHvAq', 'ADMIN', CURRENT_TIMESTAMP, true);

-- Adjust Auto-Increment sequences to prevent collisions with manually seeded IDs
ALTER TABLE paisomart_auth.users ALTER COLUMN id RESTART WITH 100;
ALTER TABLE paisomart_auth.categories ALTER COLUMN id RESTART WITH 100;
ALTER TABLE paisomart_auth.products ALTER COLUMN id RESTART WITH 100;
ALTER TABLE paisomart_auth.product_variants ALTER COLUMN id RESTART WITH 100;
ALTER TABLE paisomart_auth.product_images ALTER COLUMN id RESTART WITH 100;
