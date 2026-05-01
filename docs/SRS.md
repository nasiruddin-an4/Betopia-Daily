# BETOPIA DAILY
## E-Commerce Platform
### Software Requirements Specification (SRS)
**Version:** 1.0
**Date:** May 2026

## Table of Contents
1. Project Overview
2. System Architecture & Tech Stack
3. Module-wise Requirements
4. User Roles & Permissions
5. Database Schema
6. API Specifications
7. Integration with ERP
8. Timeline & Dependencies

---

## 1. Project Overview

### 1.1 Purpose
Betopia Daily is an internal zero-margin e-commerce platform enabling Betopia Group employees to purchase groceries and food items with special benefits (commissions, discounts). The system manages product inventory, order fulfillment, demand scheduling (for perishables), and vendor coordination with office-only delivery.

### 1.2 Key Business Rules
| Rule | Details |
|---|---|
| **User Authentication** | ID-based login verified against ERP system. Only Betopia employees can access. |
| **Payment Methods** | Salary Credit (deducted from salary) or bKash |
| **MOQ & Max Order** | Products can have Minimum Order Quantity (MOQ) and Maximum Order Quantity constraints |
| **Demand-Based Orders** | Items (e.g., beef) use 6-day demand windows. Orders placed before 5:30 PM deliver next business day; after 5:30 PM deliver 2+ days later |
| **Delivery** | Office address only. Vendors deliver to Betopia office headquarters. |

---

## 2. System Architecture & Tech Stack

### 2.1 Recommended Tech Stack
| Layer | Technology |
|---|---|
| **Frontend** | React.js / Next.js, Tailwind CSS, Redux/Zustand for state |
| **Backend** | Node.js + Express / NestJS, JWT auth, REST/GraphQL |
| **Database** | PostgreSQL (primary), Redis (caching/session) |
| **ERP Integration** | Direct DB read (if available) or REST API endpoints |

### 2.2 High-Level Architecture
- **Frontend:** Product browsing, cart, checkout, order history, demand scheduling UI
- **API Gateway:** Authentication, rate limiting, request validation
- **Backend Services:** Auth, Products, Orders, Payments, Demand, Reporting
- **Database:** Orders, products, demand, vendor assignments, payment records
- **ERP Sync Service:** Periodic sync of employee data and salary credits

---

## 3. Module-wise Requirements

### 3.1 Authentication & User Management Module
#### 3.1.1 Login/Registration
- Employee ID-based login (ID and password)
- Validate credentials against ERP database (read-only)
- No self-registration; only active ERP employees can access
- JWT token generation; token expiry 8 hours
- Refresh token mechanism for session persistence

#### 3.1.2 User Profile
- Fetch from ERP: Employee ID, Name, Department, Email, Phone, Salary Info
- Store locally: Delivery address (office), preferred payment method
- Salary balance available for purchase shown on dashboard

#### 3.1.3 Password Management
- Forgot password: Send reset link via email
- Change password in-app with old password verification
- **Developer Owner:** Nasir

### 3.2 Product Catalog Module
#### 3.2.1 Product Management
- Product fields: ID, Name, Category, Description, Unit Price, Unit (kg, piece, L, etc.)
- Stock status: In stock, Out of stock, Limited (< 10 units)
- Image upload: Product photos (500x500px min, JPEG/PNG)
- Vendor assignment: Each product linked to 1+ vendors

#### 3.2.2 MOQ & Max Order Constraints
- Optional MOQ: Minimum quantity customer must order (e.g., 5 kg)
- Optional Max Order: Maximum per customer per day (e.g., 50 kg)
- Cart validation: Alert user if quantity violates MOQ/Max
- Admin override: Managers can bypass for special cases

#### 3.2.3 Product Display
- Browse by category (e.g., Beef, Vegetables, Dairy, Spices)
- Search and filter (price, category, stock status)
- Product detail page: Full description, price, MOQ/Max, reviews
- Demand window indicator (if applicable): Shows order deadline and delivery date
- **Developer Owner:** Safayat (Design/Frontend) + Nasir (Backend)

### 3.3 Shopping Cart & Checkout Module
#### 3.3.1 Cart Management
- Add to cart: Product ID + Quantity + Demand date (if applicable)
- Update quantity: Real-time MOQ/Max validation
- Remove items: Single or bulk removal
- Persist cart: Store in localStorage + sync to backend
- Calculate subtotal, tax (if applicable), estimated delivery

#### 3.3.2 Checkout Process
- Review order summary
- Select payment method: Salary Credit or bKash
- Apply promo code (future feature)
- Confirm delivery address: Auto-filled (office address)
- Final confirmation: Review and submit order
- **Developer Owner:** Rabbi (Frontend)

### 3.4 Payment Processing Module
#### 3.4.1 Salary Credit Payment
- Deduct amount from employee salary credit
- Sync with ERP: Update salary balance post-payment
- Instant confirmation; no authorization delay
- Log transaction in payment history

#### 3.4.2 bKash Payment
- Integration with bKash API (Sandbox first, then Production)
- Payment gateway redirect; user completes transaction externally
- Webhook handler: Process payment confirmation from bKash
- Automatic order creation upon successful payment
- Failed payment handling & retry logic

#### 3.4.3 Payment Status Tracking
- Payment status: Pending, Completed, Failed, Refunded
- Transaction ID storage for reconciliation
- Payment history visible on user dashboard
- **Developer Owner:** Ayon (Payment Integration Lead)

### 3.5 Order Management Module
#### 3.5.1 Order Creation
- Create order after successful payment
- Order fields: Order ID, Customer ID, Items (product+qty+price), Total, Payment method, Status, Order date, Expected delivery date
- Store order items separately: Order_Items table with product details snapshot
- Generate Order Number: Auto-increment with date prefix (e.g., BD-20260501-001)

#### 3.5.2 Order Status Workflow
- Pending: Order created, awaiting vendor confirmation
- Confirmed: Vendor confirmed order
- Packed: Items packed and ready for delivery
- Out for Delivery: With vendor/courier
- Delivered: Reached office
- Cancelled: Customer or system cancelled
- Returned: Customer initiated return (future feature)

#### 3.5.3 Order History
- Customer view: All past orders with status, date, total
- Filter by: Date range, Status, Product
- View details: Order items, breakdown, delivery details
- Reorder: Quick-reorder button for previous purchases

#### 3.5.4 Order Cancellation
- Allow cancellation only if order status is Pending
- Refund logic: Return full amount to payment method
- Notify vendor of cancellation
- **Developer Owner:** Nasir + Mamun/Jawwad (Vendor Coordination)

### 3.6 Demand-Based Ordering Module
#### 3.6.1 Demand Window Configuration
- Define for perishables (e.g., Beef): 6-day demand window
- Set order cutoff time per product: 5:30 PM (example)
- Set delivery days: 1-day or 2-day lead times
- Order cutoff before 5:30 PM → Next business day delivery

#### 3.6.2 Demand Collection
- Collect orders for demand products for 6-day window
- Display demand window on product page: “Order by [date] for delivery [date]”
- Aggregate daily demand counts
- Track order intent vs. confirmed purchases

#### 3.6.3 Auto-Delivery Date Assignment
- Order placed before 5:30 PM → Set delivery to next business day
- Order placed after 5:30 PM → Set delivery to 2+ days later
- Skip weekends (if applicable)

### 3.7 Vendor Management Module
#### 3.7.1 Vendor Profiles
- Vendor info: Name, Contact (phone, email), Address, Payment terms, Delivery schedule
- Products supplied: List of assigned products
- Rating & performance metrics: On-time delivery %, Quality score

#### 3.7.2 Order Distribution to Vendors
- Group orders by product → Assign to vendor
- Generate order sheet (CSV/PDF): Vendor name, Products, Quantities, Expected delivery
- Send via email or upload to vendor portal
- Track vendor confirmation & delivery status

#### 3.7.3 Vendor Communication
- Email notifications for new orders
- Vendor portal (future): View orders, update status, upload invoices
- Delivery confirmation: Mark order as delivered
- **Developer Owner:** Maruf (Project Lead) + Ayon (Coordination)

### 3.8 Reporting & Analytics Module
#### 3.8.1 Admin Dashboard
- Real-time KPIs: Total orders today, Revenue, Active customers, Pending deliveries
- Sales trend: Daily/weekly/monthly revenue chart
- Top products: Most ordered items
- Vendor performance: Delivery rate, on-time %, rating

#### 3.8.2 Order Reports
- Export orders: CSV/Excel with all fields
- Filter by: Date range, Status, Vendor, Product, Customer
- Vendor-wise order summary: Total order value, item count, delivery dates

#### 3.8.3 Demand Management Report
- Demand forecast by product for 6-day window
- Actual vs. projected demand
- Suggest reorder quantities

#### 3.8.4 Payment Reconciliation
- Salary credit vs. bKash breakdown
- Failed payment tracking
- Refund audit trail
- **Developer Owner:** Ayon (Analytics + Vendor Reports)

### 3.9 Document Generation & Export Module
#### 3.9.1 Order Sheets
- Generate vendor-wise order sheets: Product, Qty, Unit, Total qty, Delivery date
- Format: PDF or CSV
- Include Betopia letterhead and vendor contact

#### 3.9.2 Product-Wise Order Summary
- List all orders for a product across all vendors
- Include: Customer, Qty, Delivery date, Status
- Download as CSV

#### 3.9.3 Demand & Forecast Reports
- 6-day demand forecast by product
- Share with procurement team
- **Developer Owner:** Nasir + Ayon

---

## 4. User Roles & Permissions
| Role | User Type | Permissions |
|---|---|---|
| **Employee** | Customer | Browse products, Add to cart, Checkout, View orders, Pay via Salary/bKash |
| **Admin** | System Manager | Add/Edit/Delete products, Manage vendors, View all orders, Generate reports, Override orders, System settings |
| **Vendor** | Supplier | View assigned orders, Update order status, Download order sheets |
| **Accountant** | Finance Staff | View payment reports, Reconciliation, Export financial data |

---

## 5. Database Schema

### 5.1 Core Tables
- **Users**: `user_id` (PK), `erp_employee_id`, `email`, `password_hash`, `name`, `department`, `phone`, `role` (Employee/Admin/Vendor), `active`, `created_at`, `updated_at`
- **Products**: `product_id` (PK), `name`, `category`, `description`, `unit_price`, `unit` (kg/piece/L), `stock_qty`, `moq` (nullable), `max_order_qty` (nullable), `is_demand_based`, `demand_days`, `order_cutoff_time`, `image_url`, `vendor_id` (FK), `active`, `created_at`, `updated_at`
- **Vendors**: `vendor_id` (PK), `name`, `contact_person`, `phone`, `email`, `address`, `delivery_address`, `payment_terms`, `active`, `rating`, `on_time_delivery_pct`, `created_at`, `updated_at`
- **Orders**: `order_id` (PK), `order_number` (unique), `customer_id` (FK), `total_amount`, `payment_method` (Salary/bKash), `payment_status`, `order_status`, `delivery_date`, `delivery_address`, `created_at`, `delivered_at`, `cancelled_at`
- **Order_Items**: `order_item_id` (PK), `order_id` (FK), `product_id` (FK), `quantity`, `unit_price` (snapshot), `subtotal`, `created_at`
- **Payments**: `payment_id` (PK), `order_id` (FK), `amount`, `payment_method`, `status` (Pending/Completed/Failed), `transaction_id` (bKash ref), `bkash_response` (JSON), `created_at`, `completed_at`

### 5.2 Additional Tables
- **Demand_Forecasts**: `demand_id`, `product_id`, `date_range_start`, `date_range_end`, `forecasted_qty`, `actual_qty`
- **Promotions**: `promo_id`, `code`, `discount_pct`, `valid_from`, `valid_to`
- **Audit_Logs**: `log_id`, `user_id`, `action`, `entity_type`, `entity_id`, `timestamp`

---

## 6. API Specifications

### 6.1 Authentication Endpoints
- `POST /api/auth/login`: Body: `{ employee_id, password }` → Response: `{ access_token, refresh_token, user }` (Verify against ERP; return 401 if invalid)
- `POST /api/auth/refresh`: Body: `{ refresh_token }` → Response: `{ access_token }`

### 6.2 Product Endpoints
- `GET /api/products`: Query params: `category, search, limit, offset` → Response: `[{ product_id, name, price, moq, max_order, is_demand_based, demand_window, image_url, stock_status }]`
- `GET /api/products/:id`: Response: Full product details including vendor info, demand schedule

### 6.3 Order Endpoints
- `POST /api/orders`: Body: `{ items: [{product_id, qty, delivery_date}], payment_method, address }` → Response: `{ order_id, order_number, status: "Pending" }`
- `GET /api/orders`: Query: `status, date_from, date_to` → Response: `[{ order details }]`
- `GET /api/orders/:id`: Response: Complete order with items, delivery info, payment status
- `POST /api/orders/:id/cancel`: Allowed only if status = "Pending" → Process refund

### 6.4 Payment Endpoints
- `POST /api/payments`: Body: `{ order_id, payment_method }` → If Salary: Deduct & return `{ status: "Completed" }`. If bKash: Redirect to bKash gateway.
- `POST /api/payments/bkash/webhook`: Handle bKash payment confirmation; update order status to Confirmed

### 6.5 Vendor/Admin Endpoints
- `GET /api/admin/vendors/{vendor_id}/orders`: Vendor-specific orders
- `POST /api/admin/orders/export`: Generate CSV/PDF order sheets
- `GET /api/admin/reports/demand`: 6-day demand forecast by product
- `GET /api/admin/reports/payment`: Payment reconciliation

---

## 7. Integration with ERP

### 7.1 Employee Data Sync
- Fetch employee list from ERP at login time (on-demand)
- Validate ID + Password against ERP credentials
- Retrieve: ID, Name, Department, Email, Phone, Salary info
- Store locally in Users table for fast subsequent access

### 7.2 Salary Credit Management
- API endpoint: `GET /api/user/salary-balance` (fetch from ERP)
- On payment via Salary: Update ERP salary credit (write operation)
- Sync: Reconcile local vs. ERP monthly

### 7.3 Integration Method
- Recommended: REST API from ERP (if available)
- Alternative: Direct database read (with proper authorization)
- Error handling: Graceful fallback if ERP is down
- Logging: Audit all ERP read/write operations

### 7.4 Contact for ERP Integration Details
- Ratan (Billing), Mamun & Jawwad (Sales/Support), Nasir (Technical)

---

## 8. Timeline & Dependencies

### 8.1 Phase 1: Core Platform (4-5 weeks)
- **Week 1-2:** Backend setup (DB, Auth, Product API)
- **Week 2-3:** Frontend (Product catalog, Cart, Checkout UI)
- **Week 3-4:** Payment integration (Salary & bKash)
- **Week 4-5:** Order management, Reporting, Testing

### 8.2 Phase 2: Advanced Features (2-3 weeks)
- Demand-based ordering module
- Vendor portal (view orders, update status)
- Advanced analytics & forecasting

### 8.3 Key Dependencies
- ERP API documentation & credentials (Nasir/Munna)
- bKash sandbox/production credentials (Ayon)
- Product & vendor master data (Ayon/Maruf)
- Design assets & branding (Safayat/Rabbi)
- Testing & UAT with employees & vendors (Ratan/Mamun)
