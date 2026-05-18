-- Categories
INSERT INTO categories (name, description, image_url, is_active, created_at, updated_at) 
VALUES ('Sarees', 'Exquisite traditional sarees including Silk, Cotton, and Designer collections for every occasion.', '/images/categories/sarees.png', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO categories (name, description, image_url, is_active, created_at, updated_at) 
VALUES ('Fabrics', 'Premium unstitched textile materials, from pure cotton to luxury brocades for bespoke tailoring.', '/images/categories/fabrics.png', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO categories (name, description, image_url, is_active, created_at, updated_at) 
VALUES ('Silk Collection', 'Pure Mulberry and Kanchipuram silk pattu collections featuring intricate zari work.', '/images/categories/silk.png', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO categories (name, description, image_url, is_active, created_at, updated_at) 
VALUES ('Blouse Pieces', 'Beautiful unstitched blouse materials with vibrant prints and ethnic embroidery patterns.', '/images/categories/blouse.png', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Products
INSERT INTO products (name, description, category_id, is_active, color) 
VALUES ('Kanchipuram Silk Saree', 'Handwoven traditional Kanchipuram silk saree with gold zari', 1, true, 'Emerald Green');

INSERT INTO products (name, description, category_id, is_active, color) 
VALUES ('Banarasi Brocade', 'Pure Banarasi silk brocade fabric for designer wear', 2, true, 'Royal Blue');

INSERT INTO products (name, description, category_id, is_active, color) 
VALUES ('Chanderi Cotton', 'Lightweight and breathable Chanderi cotton fabric', 2, true, 'Cream');

INSERT INTO products (name, description, category_id, is_active, color) 
VALUES ('Mysore Silk Saree', 'Elegant Mysore silk saree with rich border', 3, true, 'Maroon');

-- Users (Admin)
INSERT INTO users (name, email, phone_number, password, role, created_at, is_verified) 
VALUES ('Admin', 'admin@praisomart.com', '9999999999', '$2a$10$Bmx9CZadK05j0/WWxZXxlusD24hKmqxlaHB.v6YcN.zDkQFOkHvAq', 'ADMIN', CURRENT_TIMESTAMP, true);

-- Single Blouse Piece Product with Long Description (TEXT)
INSERT INTO products (name, description, category_id, is_active, color) 
VALUES ('2 Meter Blouse Piece', 'VIBRANT FLORAL PRINT: Features a stunning multicolour floral pattern base, adding a bold and ethnic charm to your wardrobe.
PREMIUM QUALITY FABRIC: Crafted from high-quality material that offers a smooth texture, ensuring comfort and elegance for all-day wear.
UNSTITCHED MATERIAL: Comes as unstitched fabric, giving you the freedom to customise the blouse as per your preferred style, fit, and design.
Weight - 100 gms
2 meter material', 4, true, 'Multi');

-- Variants and Images would follow here...
