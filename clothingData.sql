-- 1.1 สร้าง Roles ก่อน (ยังไม่ต้องใส่ created_by เพราะยังไม่มี User)
INSERT INTO roles (id, role_name) VALUES 
(1, 'admin'), 
(2, 'staff'), 
(3, 'user');

-- 1.2 สร้าง User คนแรก (Super Admin)
-- หมายเหตุ: password_hash ในที่นี้เป็นแค่ตัวอย่าง ในใช้งานจริงต้องเป็น Bcrypt Hash
INSERT INTO users (role_id, username, password, email, first_name, last_name) 
VALUES 
(1, 'admin', '123456', 'admin@gmail.com', 'Admin', 'Admin'),
(2, 'staff', '123456', 'staff@gmail.com', 'Staff', 'Staff'),
(3, 'user', '123456', 'user@gmail.com', 'User', 'User');

-- 2.1 Order Statuses (สถานะคำสั่งซื้อ)
INSERT INTO order_statuses (id, status_name, created_by) VALUES 
(1, 'pending_payment', 1),  -- รอชำระเงิน
(2, 'processing', 1),       -- กำลังเตรียมสินค้า
(3, 'shipped', 1),          -- ส่งของแล้ว
(4, 'delivered', 1),        -- ถึงมือลูกค้าแล้ว
(5, 'cancelled', 1),        -- ยกเลิก
(6, 'refunded', 1);         -- คืนเงิน

-- 2.2 Payment Statuses (สถานะการเงินจาก Stripe)
INSERT INTO payment_statuses (id, status_name, description, created_by) VALUES 
(1, 'pending', 'Waiting for payment provider', 1),
(2, 'successed', 'Payment received successfully', 1),
(3, 'failed', 'Payment failed or declined', 1);

-- 2.3 Discount Types (ประเภทส่วนลด)
INSERT INTO discount_types (discount_name, created_by) VALUES 
('percentage', 1),       -- ลดเป็น %
('fixed_amount', 1),     -- ลดเป็นบาท
('free_shipping', 1);    -- ส่งฟรี

-- prefixes
INSERT INTO prefixes (id, prefix_name, created_by) VALUES
(1, 'นาย', 1),
(2, 'นาง', 1),
(3, 'นางสาว', 1);

-- genders
INSERT INTO genders (id, gender_name, slug) VALUES 
(1, 'ผู้ชาย', 'men'), 
(2, 'ผู้หญิง', 'women'), 
(3, 'เด็ก', 'kids');

-- categories
INSERT INTO categories (id, category_name, category_code) VALUES
(1, 'เสื้อยืด', 'T-SHIRT'),
(2, 'เสื้อเชิ้ต', 'SHIRT'),
(3, 'กางเกง', 'PANTS'),
(4, 'กระโปรง', 'SKIRT'),
(5, 'แจ็คเก็ต', 'JACKET'),
(6, 'รองเท้า', 'SHOES'),
(7, 'กระเป๋า', 'BAG');

-- สมมติ category_id = 1, gender_id = 1, created_by = 1
INSERT INTO products (
    product_code, category_id, gender_id, product_name, description, base_price, image_path,
    best_seller, is_active, created_by, updated_by, created_at, updated_at
) VALUES
('TSHIRT001', 1, 1, 'เสื้อยืดคอกลม', 'เสื้อยืดผ้าฝ้าย', 299.00, NULL, false, true, 1, 1, now(), now()),
('SHIRT001', 2, 1, 'เสื้อเชิ้ตแขนยาว', 'เชิ้ตผ้าคอตตอน', 499.00, NULL, false, true, 1, 1, now(), now());

-- สมมติ product_id = 1, 2 (ตามลำดับที่ insert ข้างบน)
INSERT INTO product_variants (
    product_id, sku_code, size, stock_quantity, created_by, updated_by, created_at, updated_at
) VALUES
(1, 'TSHIRT001-S', 'S', 50, 1, 1, now(), now()),
(1, 'TSHIRT001-M', 'M', 50, 1, 1, now(), now()),
(1, 'TSHIRT001-L', 'L', 50, 1, 1, now(), now()),
(2, 'SHIRT001-M', 'M', 30, 1, 1, now(), now()),
(2, 'SHIRT001-L', 'L', 30, 1, 1, now(), now());