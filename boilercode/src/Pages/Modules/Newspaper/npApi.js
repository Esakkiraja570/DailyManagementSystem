// c:\Users\dell\Desktop\React\Dms-project-frontend\boilercode\src\Pages\Modules\Newspaper\npApi.js

// Frontend based logic and function: Using LocalStorage to simulate the backend.
const delay = (ms = 400) => new Promise(r => setTimeout(r, ms));

const getDb = () => {
  const db = localStorage.getItem('np_database');
  if (db) return JSON.parse(db);
  return {
    distributors: [],
    customers: [],
    newspapers: [],
    customer_subscriptions: [],
    delivery_entries: [],
    payments: [],
    workers: [],
    otp_table: []
  };
};

const saveDb = (db) => localStorage.setItem('np_database', JSON.stringify(db));
const genId = (arr) => arr.length > 0 ? Math.max(...arr.map(x => x.id)) + 1 : 1;

// MOCK BACKEND LOGIC
const mockBackend = async (method, path, body = {}) => {
  await delay();
  const db = getDb();
  
  // ==========================================
  // 1. AUTH MODULE
  // ==========================================
  if (path === '/login' || path === '/api/auth/login') {
    const mobile = body.mobile || body.username;
    const u = db.distributors.find(x => x.mobile === mobile);
    if (!u || u.password !== body.password) throw new Error("Invalid credentials");
    return { id: u.id, name: u.name, mobile: u.mobile, role: 'ADMIN', token: 'mock-token-123' };
  }
  if (path === '/register' || path === '/api/auth/register') {
    if (db.distributors.find(x => x.mobile === body.mobile)) throw new Error("Mobile already registered");
    const newD = { id: genId(db.distributors), ...body };
    db.distributors.push(newD);
    saveDb(db);
    return { id: newD.id, name: newD.name, mobile: newD.mobile, email: newD.email, token: 'mock-token-123' };
  }
  if (path === '/api/auth/send-otp') return { message: "OTP Sent" };
  if (path === '/api/auth/verify-otp') return "OTP Verified";

  // ==========================================
  // 2. NEWSPAPER MODULE
  // ==========================================
  if (path.startsWith('/newspapers/find/')) {
    const id = Number(path.split('/').pop());
    const n = db.newspapers.find(x => x.id === id);
    if (!n) throw new Error("Newspaper not found");
    return n;
  }
  if (path.startsWith('/newspapers/') || path.startsWith('/api/distributor/newspapers/')) {
    const mobile = path.split('/').pop();
    return db.newspapers.filter(n => n.distributorMobile === mobile);
  }
  if (path === '/newspapers' || path === '/api/distributor/newspaper/add') {
    const newN = { id: genId(db.newspapers), ...body };
    db.newspapers.push(newN);
    saveDb(db);
    return { id: newN.id, name: newN.name, price: newN.price };
  }
  if (method === 'DELETE' && path.startsWith('/newspapers/')) {
    const id = Number(path.split('/').pop());
    db.newspapers = db.newspapers.filter(n => n.id !== id);
    saveDb(db);
    return { message: "Deleted" };
  }

  // ==========================================
  // 3. CUSTOMER MODULE
  // ==========================================
  if (path.startsWith('/customer/lookup/')) {
    const mob = path.split('/').pop();
    const cust = db.customers.find(c => c.mobile === mob);
    if (!cust) throw new Error("Customer account not found");
    return cust;
  }
  if (path.startsWith('/customers/') && method === 'GET') {
    const idOrMobile = path.split('/').pop();
    if (idOrMobile.length >= 10) { // Assume mobile
      return db.customers.filter(c => c.distributorMobile === idOrMobile);
    }
    return db.customers.find(c => String(c.id) === idOrMobile);
  }
  if (path === '/customers' || path === '/api/customer/create') {
    const newC = { id: genId(db.customers), active: true, ...body };
    db.customers.push(newC);
    saveDb(db);
    return { id: newC.id, name: newC.name };
  }
  if (method === 'DELETE' && path.startsWith('/customers/')) {
    const id = Number(path.split('/').pop());
    db.customers = db.customers.filter(c => c.id !== id);
    saveDb(db);
    return { message: "Deleted" };
  }
  // PAUSE CUSTOMER
  if (method === 'PUT' && (path.includes('/pause') || path.startsWith('/api/customer/pause/'))) {
    const id = Number(path.split('/').find(x => !isNaN(x) && x !== ''));
    const cust = db.customers.find(c => c.id === id);
    if (cust) {
      cust.pauseStartDate = body.start || body.pauseStartDate;
      cust.pauseEndDate = body.end || body.pauseEndDate;
      cust.active = false;
      saveDb(db);
    }
    return "Customer Paused";
  }
  // RESUME CUSTOMER
  if (method === 'PUT' && (path.includes('/resume') || path.startsWith('/api/customer/resume/'))) {
    const id = Number(path.split('/').find(x => !isNaN(x) && x !== ''));
    const cust = db.customers.find(c => c.id === id);
    if (cust) {
      cust.pauseStartDate = null;
      cust.pauseEndDate = null;
      cust.active = true;
      saveDb(db);
    }
    return "Customer Resumed";
  }

  // ==========================================
  // 4. SUBSCRIPTION MODULE
  // ==========================================
  if (path === '/api/customer/subscription/add') {
    const sub = { id: genId(db.customer_subscriptions), ...body };
    db.customer_subscriptions.push(sub);
    saveDb(db);
    return { id: sub.id, customerId: sub.customerId };
  }

  // ==========================================
  // 5. WORKER MODULE
  // ==========================================
  if (path.startsWith('/workers/') || path.startsWith('/api/distributor/workers/')) {
    const mobile = path.split('/').pop();
    return db.workers.filter(w => w.distributorMobile === mobile);
  }
  if (path === '/workers' || path === '/api/distributor/worker/add') {
    const newW = { id: genId(db.workers), ...body };
    db.workers.push(newW);
    saveDb(db);
    return { id: newW.id, name: newW.name };
  }

  // ==========================================
  // 6. DAILY DELIVERY MODULE
  // ==========================================
  if (path.startsWith('/api/entry/customer/today/')) {
    const custId = Number(path.split('/').pop());
    const todayStr = new Date().toISOString().split('T')[0];
    const entry = db.delivery_entries.find(e => e.customerId === custId && e.date === todayStr);
    return entry || null;
  }
  if (path.startsWith('/api/entry/today/')) {
    const mobile = path.split('/').pop();
    const todayStr = new Date().toISOString().split('T')[0];
    return db.delivery_entries.filter(e => e.distributorMobile === mobile && e.date === todayStr);
  }
  if (path === '/api/customer/generate-entry') {
    const mobile = body.distributorMobile;
    const todayStr = new Date().toISOString().split('T')[0];
    const exists = db.delivery_entries.some(e => e.distributorMobile === mobile && e.date === todayStr);
    if (!exists) {
      const activeCustomers = db.customers.filter(c => c.distributorMobile === mobile && c.active !== false);
      activeCustomers.forEach(c => {
         db.delivery_entries.push({
           id: genId(db.delivery_entries),
           customerId: c.id,
           customerName: c.name,
           distributorMobile: mobile,
           date: todayStr,
           delivered: false,
           price: c.price || 0
         });
      });
      saveDb(db);
    }
    return "Today entries generated";
  }
  if (method === 'PUT' && path.startsWith('/api/customer/delivered/')) {
    const id = Number(path.split('/').pop());
    const entry = db.delivery_entries.find(e => e.id === id);
    if (entry) entry.delivered = true;
    saveDb(db);
    return { id, delivered: true };
  }

  // ==========================================
  // 7. BILLING MODULE
  // ==========================================
  if (path.startsWith('/billing/')) {
    const custId = Number(path.split('/').pop());
    const cust = db.customers.find(c => c.id === custId);
    if (!cust) throw new Error("Customer not found");
    
    const today = new Date();
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    let breakDays = 0;
    if (cust.pauseStartDate && cust.pauseEndDate) {
      const s = new Date(cust.pauseStartDate);
      const e = new Date(cust.pauseEndDate);
      breakDays = Math.max(0, Math.floor((e - s) / (1000 * 60 * 60 * 24)) + 1);
    }
    let activeDays = daysInMonth - breakDays;
    if (activeDays < 0) activeDays = 0;
    
    let rate = 0;
    if (cust.newspaperId) {
        const p = db.newspapers.find(n => String(n.id) === String(cust.newspaperId));
        if (p) rate = p.price || 0;
    }
    
    return {
      customerId: cust.id,
      customerName: cust.name,
      monthDays: daysInMonth,
      breakDays: breakDays,
      activeDays: activeDays,
      monthlyAmount: activeDays * rate * (cust.quantity || 1)
    };
  }

  if (path.startsWith('/api/customer/bill/')) {
    return 240.0; // static mock as per requirement
  }
  if (path.startsWith('/api/customer/monthly-bill/')) {
    return { customerName: "Ravi", totalEntries: 30, totalAmount: 240 };
  }

  // ==========================================
  // 8. PAYMENT MODULE
  // ==========================================
  if (path === '/payments' || path === '/api/payment/pay') {
    const p = { id: genId(db.payments), status: 'PAID', paymentDate: new Date().toISOString().split('T')[0], ...body };
    db.payments.push(p);
    saveDb(db);
    return { id: p.id, status: 'PAID' };
  }
  if (path.startsWith('/payments/') || path.startsWith('/api/payment/history/')) {
    const id = Number(path.split('/').pop());
    return db.payments.filter(p => p.customerId === id);
  }

  // ==========================================
  // 9. DASHBOARD MODULE
  // ==========================================
  if (path.startsWith('/api/dashboard/')) {
    const mobile = path.split('/').pop();
    return {
      totalCustomers: db.customers.filter(c => c.distributorMobile === mobile).length,
      totalWorkers: db.workers.filter(w => w.distributorMobile === mobile).length,
      totalNewspapers: db.newspapers.filter(n => n.distributorMobile === mobile).length,
      todayEntries: db.delivery_entries.filter(e => e.distributorMobile === mobile && e.date === new Date().toISOString().split('T')[0]).length,
      payments: db.payments.filter(p => p.distributorMobile === mobile).length
    };
  }

  console.warn(`Mock API Not Found: ${method} ${path}`);
  throw new Error(`Endpoint not found in mock: ${method} ${path}`);
};

export const npGet    = (p)    => mockBackend('GET', p);
export const npPost   = (p, b) => mockBackend('POST', p, b);
export const npPut    = (p, b) => mockBackend('PUT', p, b);
export const npDelete = (p)    => mockBackend('DELETE', p);

export const getMobile = () => localStorage.getItem('npMobile') || '';
export const BASE_URL = 'http://localhost:8080';
