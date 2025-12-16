-- 1.1 สร้าง Roles ก่อน (ยังไม่ต้องใส่ created_by เพราะยังไม่มี User)
INSERT INTO roles (id, role_name) VALUES 
(1, 'admin'), 
(2, 'staff'), 
(3, 'user');

-- 1.2 สร้าง User คนแรก (Super Admin)
-- หมายเหตุ: password_hash ในที่นี้เป็นแค่ตัวอย่าง ในใช้งานจริงต้องเป็น Bcrypt Hash
INSERT INTO users (role_id, username, password, email, first_name, last_name) 
VALUES 
(1, 'admin', '123456', 'admin@gmail.com', 'Admin', 'Admin');

-- 2.1 Order Statuses (สถานะคำสั่งซื้อ)
INSERT INTO order_statuses (status_name, created_by) VALUES 
('pending_payment', 1),  -- รอชำระเงิน
('processing', 1),       -- กำลังเตรียมสินค้า
('shipped', 1),          -- ส่งของแล้ว
('delivered', 1),        -- ถึงมือลูกค้าแล้ว
('cancelled', 1),        -- ยกเลิก
('refunded', 1);         -- คืนเงิน

-- 2.2 Payment Statuses (สถานะการเงินจาก Stripe)
INSERT INTO payment_statuses (status_name, description, created_by) VALUES 
('pending', 'Waiting for payment provider', 1),
('successed', 'Payment received successfully', 1),
('failed', 'Payment failed or declined', 1);

-- 2.3 Discount Types (ประเภทส่วนลด)
INSERT INTO discount_types (discount_name, created_by) VALUES 
('percentage', 1),       -- ลดเป็น %
('fixed_amount', 1),     -- ลดเป็นบาท
('free_shipping', 1);    -- ส่งฟรี

INSERT INTO prefixes (prefix_name, created_by) VALUES
('นาย', 1),
('นาง', 1),
('นางสาว', 1);

-- ใส่ข้อมูลตั้งต้น
INSERT INTO genders (gender_name, slug) VALUES 
('Men', 'men'), 
('Women', 'women'), 
('Unisex', 'unisex'), 
('Kids', 'kids');