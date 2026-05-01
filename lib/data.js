export const MOCK_USER = {
  user_id: 'USR-001',
  erp_employee_id: 'EMP-9921',
  name: 'Nasir',
  department: 'Engineering',
  email: 'nasir@betopia.com',
  phone: '+8801700000000',
  role: 'Employee',
  salary_credit_balance: 15000,
  delivery_address: 'Betopia Headquarters, Floor 5, Desk 12',
};

export const CATEGORIES = [
  { id: 'cat_staples', name: 'Rice & Grains', icon: 'Box' },
  { id: 'cat_meat', name: 'Fish & Meat', icon: 'Beef' },
  { id: 'cat_veg', name: 'Vegetables', icon: 'Carrot' },
  { id: 'cat_dairy', name: 'Dairy & Eggs', icon: 'Milk' },
  { id: 'cat_spices', name: 'Spices & Oil', icon: 'Flame' },
  { id: 'cat_snacks', name: 'Snacks & Bakery', icon: 'Cookie' },
  { id: 'cat_beverages', name: 'Beverages', icon: 'Coffee' },
  { id: 'cat_hygiene', name: 'Hygiene & Care', icon: 'User' },
];

const getProductImage = (id) => {
  const num = parseInt(id.replace('P', '')) % 81 + 10001;
  const ext = (num >= 10001 && num <= 10003) || num === 10010 || num === 10028 || (num >= 10031 && num <= 10032) || num === 10035 || num === 10039 || num === 10044 ? 'webp' : (num === 10081 ? 'png' : 'jpg');
  return `/productImg/${num}.${ext}`;
};

const generateProducts = () => {
  const products = [
    // RICE & GRAINS
    { product_id: 'P1', name: 'Miniket Rice (Premium)', category: 'Rice & Grains', unit_price: 68, unit: 'kg', available_units: ['5 kg', '10 kg', '25 kg'], stock_status: 'In stock', stock_qty: 500, discount_pct: 5 },
    { product_id: 'P2', name: 'Nazirshail Rice', category: 'Rice & Grains', unit_price: 82, unit: 'kg', available_units: ['5 kg', '10 kg', '25 kg'], stock_status: 'In stock', stock_qty: 300, discount_pct: null },
    { product_id: 'P3', name: 'Chinigura Polau Rice', category: 'Rice & Grains', unit_price: 145, unit: 'kg', available_units: ['1 kg', '2 kg', '5 kg'], stock_status: 'In stock', stock_qty: 150, discount_pct: 10 },
    { product_id: 'P4', name: 'Masoor Dal (Medium)', category: 'Rice & Grains', unit_price: 130, unit: 'kg', available_units: ['1 kg', '2 kg'], stock_status: 'In stock', stock_qty: 200, discount_pct: 5 },
    { product_id: 'P5', name: 'Moong Dal (Premium)', category: 'Rice & Grains', unit_price: 160, unit: 'kg', available_units: ['500g', '1 kg'], stock_status: 'In stock', stock_qty: 100, discount_pct: null },
    { product_id: 'P6', name: 'Booter Dal', category: 'Rice & Grains', unit_price: 95, unit: 'kg', available_units: ['1 kg'], stock_status: 'In stock', stock_qty: 120, discount_pct: null },
    { product_id: 'P7', name: 'Ata (Whole Wheat Flour)', category: 'Rice & Grains', unit_price: 55, unit: 'kg', available_units: ['2 kg', '5 kg'], stock_status: 'In stock', stock_qty: 400, discount_pct: 8 },
    { product_id: 'P8', name: 'Maida (Refined Flour)', category: 'Rice & Grains', unit_price: 65, unit: 'kg', available_units: ['1 kg', '2 kg'], stock_status: 'In stock', stock_qty: 250, discount_pct: null },
    { product_id: 'P9', name: 'Brown Rice', category: 'Rice & Grains', unit_price: 90, unit: 'kg', available_units: ['5 kg'], stock_status: 'In stock', stock_qty: 80, discount_pct: 12 },
    { product_id: 'P10', name: 'Suij (Semolina)', category: 'Rice & Grains', unit_price: 75, unit: '500g', available_units: ['500g', '1 kg'], stock_status: 'In stock', stock_qty: 150, discount_pct: null },

    // FISH & MEAT
    { product_id: 'P11', name: 'Beef (Briskets)', category: 'Fish & Meat', unit_price: 750, unit: 'kg', available_units: ['1 kg', '2 kg', '5 kg'], stock_status: 'In stock', stock_qty: 50, discount_pct: null, is_demand_based: true, demand_days: 6 },
    { product_id: 'P12', name: 'Mutton (Khashi)', category: 'Fish & Meat', unit_price: 1100, unit: 'kg', available_units: ['1 kg', '2 kg'], stock_status: 'In stock', stock_qty: 30, discount_pct: 5, is_demand_based: true, demand_days: 6 },
    { product_id: 'P13', name: 'Broiler Chicken', category: 'Fish & Meat', unit_price: 210, unit: 'kg', available_units: ['1 kg', '2 kg'], stock_status: 'In stock', stock_qty: 100, discount_pct: null },
    { product_id: 'P14', name: 'Deshi Chicken (Full)', category: 'Fish & Meat', unit_price: 550, unit: 'kg', available_units: ['800g-1kg'], stock_status: 'In stock', stock_qty: 40, discount_pct: null },
    { product_id: 'P15', name: 'Ilish Fish (Large)', category: 'Fish & Meat', unit_price: 1600, unit: 'kg', available_units: ['1 kg', '1.5 kg'], stock_status: 'In stock', stock_qty: 25, discount_pct: 10 },
    { product_id: 'P16', name: 'Rui Fish (Cut)', category: 'Fish & Meat', unit_price: 450, unit: 'kg', available_units: ['1 kg', '2 kg'], stock_status: 'In stock', stock_qty: 60, discount_pct: null },
    { product_id: 'P17', name: 'Pangas Fish', category: 'Fish & Meat', unit_price: 220, unit: 'kg', available_units: ['1 kg', '2 kg'], stock_status: 'In stock', stock_qty: 80, discount_pct: 5 },
    { product_id: 'P18', name: 'Shrimp (Golda)', category: 'Fish & Meat', unit_price: 850, unit: 'kg', available_units: ['500g', '1 kg'], stock_status: 'In stock', stock_qty: 40, discount_pct: null },
    { product_id: 'P19', name: 'Tilapia Fish', category: 'Fish & Meat', unit_price: 240, unit: 'kg', available_units: ['1 kg'], stock_status: 'In stock', stock_qty: 100, discount_pct: null },
    { product_id: 'P20', name: 'Katla Fish', category: 'Fish & Meat', unit_price: 480, unit: 'kg', available_units: ['1 kg', '2 kg'], stock_status: 'In stock', stock_qty: 50, discount_pct: null },

    // VEGETABLES
    { product_id: 'P21', name: 'Potato (Diamond)', category: 'Vegetables', unit_price: 45, unit: 'kg', available_units: ['1 kg', '5 kg'], stock_status: 'In stock', stock_qty: 1000, discount_pct: null },
    { product_id: 'P22', name: 'Onion (Local)', category: 'Vegetables', unit_price: 95, unit: 'kg', available_units: ['1 kg', '5 kg'], stock_status: 'In stock', stock_qty: 800, discount_pct: null },
    { product_id: 'P23', name: 'Garlic (Deshi)', category: 'Vegetables', unit_price: 220, unit: 'kg', available_units: ['250g', '500g', '1 kg'], stock_status: 'In stock', stock_qty: 200, discount_pct: 10 },
    { product_id: 'P24', name: 'Ginger (Local)', category: 'Vegetables', unit_price: 240, unit: 'kg', available_units: ['250g', '500g'], stock_status: 'In stock', stock_qty: 150, discount_pct: null },
    { product_id: 'P25', name: 'Tomato', category: 'Vegetables', unit_price: 60, unit: 'kg', available_units: ['1 kg', '2 kg'], stock_status: 'In stock', stock_qty: 300, discount_pct: 15 },
    { product_id: 'P26', name: 'Green Chili', category: 'Vegetables', unit_price: 120, unit: 'kg', available_units: ['250g', '500g'], stock_status: 'In stock', stock_qty: 100, discount_pct: null },
    { product_id: 'P27', name: 'Brinjal (Gol)', category: 'Vegetables', unit_price: 80, unit: 'kg', available_units: ['1 kg'], stock_status: 'In stock', stock_qty: 150, discount_pct: null },
    { product_id: 'P28', name: 'Cucumber (Deshi)', category: 'Vegetables', unit_price: 50, unit: 'kg', available_units: ['1 kg'], stock_status: 'In stock', stock_qty: 200, discount_pct: null },
    { product_id: 'P29', name: 'Carrot', category: 'Vegetables', unit_price: 70, unit: 'kg', available_units: ['1 kg'], stock_status: 'In stock', stock_qty: 180, discount_pct: null },
    { product_id: 'P30', name: 'Lemon (4 pcs)', category: 'Vegetables', unit_price: 25, unit: 'hali', available_units: ['1 hali', '2 hali'], stock_status: 'In stock', stock_qty: 500, discount_pct: null },

    // DAIRY & EGGS
    { product_id: 'P31', name: 'Aarong Liquid Milk', category: 'Dairy & Eggs', unit_price: 95, unit: 'L', available_units: ['1 L', '2 L'], stock_status: 'In stock', stock_qty: 200, discount_pct: 5 },
    { product_id: 'P32', name: 'Farm Eggs (Red)', category: 'Dairy & Eggs', unit_price: 155, unit: 'dozen', available_units: ['1 dozen', '2 dozen'], stock_status: 'In stock', stock_qty: 300, discount_pct: null },
    { product_id: 'P33', name: 'Sweet Yogurt (Mishti Doi)', category: 'Dairy & Eggs', unit_price: 280, unit: 'kg', available_units: ['500g', '1 kg'], stock_status: 'In stock', stock_qty: 50, discount_pct: null },
    { product_id: 'P34', name: 'Paneer (Local)', category: 'Dairy & Eggs', unit_price: 650, unit: 'kg', available_units: ['250g', '500g'], stock_status: 'In stock', stock_qty: 20, discount_pct: 10 },
    { product_id: 'P35', name: 'Ghee (Premium)', category: 'Dairy & Eggs', unit_price: 1250, unit: 'kg', available_units: ['500g', '1 kg'], stock_status: 'In stock', stock_qty: 40, discount_pct: 5 },

    // SPICES & OIL
    { product_id: 'P36', name: 'Mustard Oil (Kacchi Ghani)', category: 'Spices & Oil', unit_price: 320, unit: 'L', available_units: ['1 L', '2 L', '5 L'], stock_status: 'In stock', stock_qty: 150, discount_pct: 10 },
    { product_id: 'P37', name: 'Soybean Oil (Fresh)', category: 'Spices & Oil', unit_price: 165, unit: 'L', available_units: ['1 L', '2 L', '5 L'], stock_status: 'In stock', stock_qty: 400, discount_pct: null },
    { product_id: 'P38', name: 'Turmeric Powder (Radhuni)', category: 'Spices & Oil', unit_price: 110, unit: '200g', available_units: ['200g', '400g'], stock_status: 'In stock', stock_qty: 300, discount_pct: null },
    { product_id: 'P39', name: 'Chili Powder (Premium)', category: 'Spices & Oil', unit_price: 140, unit: '200g', available_units: ['200g', '400g'], stock_status: 'In stock', stock_qty: 250, discount_pct: null },
    { product_id: 'P40', name: 'Salt (Iodized)', category: 'Spices & Oil', unit_price: 38, unit: 'kg', available_units: ['1 kg'], stock_status: 'In stock', stock_qty: 600, discount_pct: null },
  ];

  // Add more to reach 100...
  const fullList = products.map(p => ({ ...p, image_url: getProductImage(p.product_id) }));
  
  for (let i = products.length + 1; i <= 100; i++) {
    const base = products[i % products.length];
    const pid = `P${i}`;
    fullList.push({
      ...base,
      product_id: pid,
      name: `${base.name} (Variant ${Math.ceil(i/products.length)})`,
      unit_price: base.unit_price + (i % 20),
      stock_qty: Math.floor(Math.random() * 200) + 10,
      discount_pct: i % 7 === 0 ? 5 : (i % 11 === 0 ? 10 : null),
      image_url: getProductImage(pid)
    });
  }
  
  return fullList;
};

export const MOCK_PRODUCTS = generateProducts();

