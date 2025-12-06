-- =========================================
-- Foreign Key Constraints
-- =========================================

ALTER TABLE users
    ADD FOREIGN KEY (role_id) REFERENCES roles(id),
    ADD FOREIGN KEY (prefix_id) REFERENCES prefixes(id),
    ADD FOREIGN KEY (created_by) REFERENCES users(id),
    ADD FOREIGN KEY (updated_by) REFERENCES users(id);

ALTER TABLE roles
    ADD FOREIGN KEY (created_by) REFERENCES users(id),
    ADD FOREIGN KEY (updated_by) REFERENCES users(id);

ALTER TABLE password_reset_tokens
    ADD FOREIGN KEY (user_id) REFERENCES users(id),
    ADD FOREIGN KEY (created_by) REFERENCES users(id),
    ADD FOREIGN KEY (updated_by) REFERENCES users(id);

ALTER TABLE addresses
    ADD FOREIGN KEY (user_id) REFERENCES users(id),
    ADD FOREIGN KEY (created_by) REFERENCES users(id),
    ADD FOREIGN KEY (updated_by) REFERENCES users(id);

ALTER TABLE categories
    ADD FOREIGN KEY (created_by) REFERENCES users(id),
    ADD FOREIGN KEY (updated_by) REFERENCES users(id);

ALTER TABLE products
    ADD FOREIGN KEY (category_id) REFERENCES categories(id),
    ADD FOREIGN KEY (created_by) REFERENCES users(id),
    ADD FOREIGN KEY (updated_by) REFERENCES users(id);

ALTER TABLE product_variants
    ADD FOREIGN KEY (product_id) REFERENCES products(id),
    ADD FOREIGN KEY (created_by) REFERENCES users(id),
    ADD FOREIGN KEY (updated_by) REFERENCES users(id);

ALTER TABLE order_statuses
    ADD FOREIGN KEY (created_by) REFERENCES users(id),
    ADD FOREIGN KEY (updated_by) REFERENCES users(id);

ALTER TABLE payment_statuses
    ADD FOREIGN KEY (created_by) REFERENCES users(id),
    ADD FOREIGN KEY (updated_by) REFERENCES users(id);

ALTER TABLE orders
    ADD FOREIGN KEY (user_id) REFERENCES users(id),
    ADD FOREIGN KEY (order_status_id) REFERENCES order_statuses(id),
    ADD FOREIGN KEY (payment_status_id) REFERENCES payment_statuses(id),
    ADD FOREIGN KEY (created_by) REFERENCES users(id),
    ADD FOREIGN KEY (updated_by) REFERENCES users(id);

ALTER TABLE order_items
    ADD FOREIGN KEY (order_id) REFERENCES orders(id),
    ADD FOREIGN KEY (variant_id) REFERENCES product_variants(id),
    ADD FOREIGN KEY (created_by) REFERENCES users(id),
    ADD FOREIGN KEY (updated_by) REFERENCES users(id);

ALTER TABLE carts
    ADD FOREIGN KEY (user_id) REFERENCES users(id),
    ADD FOREIGN KEY (created_by) REFERENCES users(id),
    ADD FOREIGN KEY (updated_by) REFERENCES users(id);

ALTER TABLE cart_items
    ADD FOREIGN KEY (cart_id) REFERENCES carts(id),
    ADD FOREIGN KEY (variant_id) REFERENCES product_variants(id),
    ADD FOREIGN KEY (created_by) REFERENCES users(id),
    ADD FOREIGN KEY (updated_by) REFERENCES users(id);

ALTER TABLE discount_types
    ADD FOREIGN KEY (created_by) REFERENCES users(id),
    ADD FOREIGN KEY (updated_by) REFERENCES users(id);

ALTER TABLE discounts
    ADD FOREIGN KEY (discount_type_id) REFERENCES discount_types(id),
    ADD FOREIGN KEY (created_by) REFERENCES users(id),
    ADD FOREIGN KEY (updated_by) REFERENCES users(id);

ALTER TABLE reviews
    ADD FOREIGN KEY (product_id) REFERENCES products(id),
    ADD FOREIGN KEY (user_id) REFERENCES users(id),
    ADD FOREIGN KEY (created_by) REFERENCES users(id),
    ADD FOREIGN KEY (updated_by) REFERENCES users(id);

ALTER TABLE activity_logs
    ADD FOREIGN KEY (user_id) REFERENCES users(id),
    ADD FOREIGN KEY (created_by) REFERENCES users(id),
    ADD FOREIGN KEY (updated_by) REFERENCES users(id);

ALTER TABLE prefixes
    ADD FOREIGN KEY (created_by) REFERENCES users(id),
    ADD FOREIGN KEY (updated_by) REFERENCES users(id);
