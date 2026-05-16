-- Categories
INSERT INTO categories (name, description, image_url, is_active, created_at, updated_at) VALUES ('Sarees', 'Exquisite traditional sarees including Silk, Cotton, and Designer collections for every occasion.', '/images/categories/sarees.png', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO categories (name, description, image_url, is_active, created_at, updated_at) VALUES ('Fabrics', 'Premium unstitched textile materials, from pure cotton to luxury brocades for bespoke tailoring.', '/images/categories/fabrics.png', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO categories (name, description, image_url, is_active, created_at, updated_at) VALUES ('Silk Collection', 'Pure Mulberry and Kanchipuram silk pattu collections featuring intricate zari work.', '/images/categories/silk.png', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO categories (name, description, image_url, is_active, created_at, updated_at) VALUES ('Blouse Pieces', 'Beautiful unstitched blouse materials with vibrant prints and ethnic embroidery patterns.', '/images/categories/blouse.png', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Products
INSERT INTO products (name, description, category_id, is_active, color) VALUES ('Kanchipuram Silk Saree', 'Handwoven traditional Kanchipuram silk saree with gold zari', 1, true, 'Emerald Green');
INSERT INTO products (name, description, category_id, is_active, color) VALUES ('Banarasi Brocade', 'Pure Banarasi silk brocade fabric for designer wear', 2, true, 'Royal Blue');
INSERT INTO products (name, description, category_id, is_active, color) VALUES ('Chanderi Cotton', 'Lightweight and breathable Chanderi cotton fabric', 2, true, 'Cream');
INSERT INTO products (name, description, category_id, is_active, color) VALUES ('Mysore Silk Saree', 'Elegant Mysore silk saree with rich border', 3, true, 'Maroon');

-- Product Variants
INSERT INTO product_variants (product_id, attribute, price, stock, is_active, sku) VALUES (1, '6 Meters', 15000.00, 10, true, 'KANCHI-GRN-01');
INSERT INTO product_variants (product_id, attribute, price, stock, is_active, sku) VALUES (2, 'Per Meter', 1200.00, 50, true, 'BANARASI-BLU-FT');
INSERT INTO product_variants (product_id, attribute, price, stock, is_active, sku) VALUES (3, 'Per Meter', 450.00, 100, true, 'CHAN-CRM-FT');
INSERT INTO product_variants (product_id, attribute, price, stock, is_active, sku) VALUES (4, '6.5 Meters', 8500.00, 15, true, 'MYSORE-MRN-01');

-- Users (Admin)
INSERT INTO paisomart_auth.users (name, email, phone_number, password, role, created_at) VALUES ('Admin', 'admin@praisomart.com', '9999999999', '$2a$10$Bmx9CZadK05j0/WWxZXxlusD24hKmqxlaHB.v6YcN.zDkQFOkHvAq', 'ADMIN', CURRENT_TIMESTAMP);
-- Password is 'Admin@123'

-- Single Blouse Piece Product
INSERT INTO products (name, description, category_id, is_active, color) VALUES ('2 Meter Blouse Piece', 'VIBRANT FLORAL PRINT: Features a stunning multicolour floral pattern base, adding a bold and ethnic charm to your wardrobe.
PREMIUM QUALITY FABRIC: Crafted from high-quality material that offers a smooth texture, ensuring comfort and elegance for all-day wear.
UNSTITCHED MATERIAL: Comes as unstitched fabric, giving you the freedom to customise the blouse as per your preferred style, fit, and design.
Weight - 100 gms
2 meter material', 4, true, 'Multi');

-- Blouse Piece Variants (All colors under Product 5)
INSERT INTO product_variants (product_id, attribute, price, stock, is_active, sku, color) VALUES (5, '2 Meters', 250.00, 100, true, 'BLOUSE-ORG-2M', 'orange');
INSERT INTO product_variants (product_id, attribute, price, stock, is_active, sku, color) VALUES (5, '2 Meters', 250.00, 100, true, 'BLOUSE-MRN-2M', 'maroon');
INSERT INTO product_variants (product_id, attribute, price, stock, is_active, sku, color) VALUES (5, '2 Meters', 250.00, 100, true, 'BLOUSE-GRN-2M', 'green');
INSERT INTO product_variants (product_id, attribute, price, stock, is_active, sku, color) VALUES (5, '2 Meters', 250.00, 100, true, 'BLOUSE-GRY-2M', 'grey');
INSERT INTO product_variants (product_id, attribute, price, stock, is_active, sku, color) VALUES (5, '2 Meters', 250.00, 100, true, 'BLOUSE-YLW-2M', 'yellow');
INSERT INTO product_variants (product_id, attribute, price, stock, is_active, sku, color) VALUES (5, '2 Meters', 250.00, 100, true, 'BLOUSE-BRW-2M', 'brown');
INSERT INTO product_variants (product_id, attribute, price, stock, is_active, sku, color) VALUES (5, '2 Meters', 250.00, 100, true, 'BLOUSE-BLU-2M', 'blue');

-- Blouse Piece Images (Linked by color)
INSERT INTO product_images (product_id, image_url, is_primary, display_order, color) VALUES (5, '/images/products/blouse-pieces/orange.png', true, 1, 'orange');
INSERT INTO product_images (product_id, image_url, is_primary, display_order, color) VALUES (5, '/images/products/blouse-pieces/maroon.png', true, 1, 'maroon');
INSERT INTO product_images (product_id, image_url, is_primary, display_order, color) VALUES (5, '/images/products/blouse-pieces/green.png', true, 1, 'green');
INSERT INTO product_images (product_id, image_url, is_primary, display_order, color) VALUES (5, '/images/products/blouse-pieces/grey.png', true, 1, 'grey');
INSERT INTO product_images (product_id, image_url, is_primary, display_order, color) VALUES (5, '/images/products/blouse-pieces/yellow.png', true, 1, 'yellow');
INSERT INTO product_images (product_id, image_url, is_primary, display_order, color) VALUES (5, '/images/products/blouse-pieces/brown.png', true, 1, 'brown');
INSERT INTO product_images (product_id, image_url, is_primary, display_order, color) VALUES (5, '/images/products/blouse-pieces/blue.png', true, 1, 'blue');

