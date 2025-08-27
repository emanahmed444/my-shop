// ===== Constants (LocalStorage Keys) =====
const LS_USERS_KEY = "myshop_users";
const LS_SESSION_KEY = "myshop_session";
const LS_PRODUCTS_KEY = "myshop_products";
const LS_CART_KEY = "myshop_cart";

// ===== Admin Creds =====
const ADMIN_EMAIL = "test@demo.com";
const ADMIN_PASS = "123456";

// ===== Init tooltips =====
function initTooltips() {
  const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
  tooltipTriggerList.map(function (el) { return new bootstrap.Tooltip(el); });
}

// ===== Users/Session helpers =====
function getUsers() { return JSON.parse(localStorage.getItem(LS_USERS_KEY) || "[]"); }
function saveUsers(u) { localStorage.setItem(LS_USERS_KEY, JSON.stringify(u)); }
function getSession() { return JSON.parse(localStorage.getItem(LS_SESSION_KEY) || "null"); }
function setSession(user) { user ? localStorage.setItem(LS_SESSION_KEY, JSON.stringify(user)) : localStorage.removeItem(LS_SESSION_KEY); }
function isLoggedIn() { return !!getSession(); }
function isAdmin() { const s = getSession(); return !!(s && s.email === ADMIN_EMAIL && s.password === ADMIN_PASS); }

// Ensure admin in users list (for clarity)
(function ensureAdmin() {
  const users = getUsers();
  if (!users.find(u => u.email === ADMIN_EMAIL)) {
    users.push({ email: ADMIN_EMAIL, password: ADMIN_PASS, role: "admin" });
    saveUsers(users);
  }
})();

// ===== SweetAlert helpers with buttons =====
function loginPrompt() {
  return Swal.fire({
    title: 'Please login to continue.',
    showDenyButton: true,
    showCancelButton: true,
    confirmButtonText: 'Login',
    denyButtonText: 'Create Account'
  }).then((res) => {
    if (res.isConfirmed) window.location.href = 'login.html';
    else if (res.isDenied) window.location.href = 'signup.html';
  });
}

// ===== Navbar guards, avatar tooltip, logout =====
function setupNavbarGuards() {
  const session = getSession();
  const avatar = document.getElementById('userAvatar');
  if (avatar) {
    avatar.setAttribute('title', session ? session.email : 'Not logged in');
    initTooltips();
  }

  // Require login on certain links
  document.querySelectorAll('.require-login').forEach(a => {
    a.addEventListener('click', function(e) {
      if (!isLoggedIn()) { e.preventDefault(); loginPrompt(); }
    });
  });

  // Admin-only link
  document.querySelectorAll('.require-admin').forEach(a => {
    a.addEventListener('click', function(e) {
      if (!isAdmin()) { e.preventDefault(); Swal.fire({icon:'warning', title:'Admins only', text:'Only admin can access Add Product.'}); }
    });
  });

  // Logout
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      if (!isLoggedIn()) { Swal.fire({icon:'info', title:'Not logged in'}); return; }
      setSession(null);
      Swal.fire({icon:'success', title:'Logged out'}).then(()=>window.location.href='index.html');
    });
  }
}

// ===== Auth Forms =====
function setupLoginForm() {
  const form = document.getElementById('loginForm');
  if (!form) return;
  form.addEventListener('submit', (e)=>{
    e.preventDefault();
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value.trim();
    if (!email || !password) { Swal.fire({icon:'error', title:'Invalid', text:'Email and password are required.'}); return; }

    if (email === ADMIN_EMAIL) {
      if (password !== ADMIN_PASS) { Swal.fire({icon:'error', title:'Admin login denied', text:'Admin credentials must match exactly.'}); return; }
      setSession({email, password, role:'admin'});
      Swal.fire({icon:'success', title:'Welcome admin!'}).then(()=>window.location.href='index.html');
      return;
    }

    const users = getUsers();
    const user = users.find(u=>u.email===email && u.password===password);
    if (!user) { Swal.fire({icon:'error', title:'Login failed', text:'Create an account first, then login with the same credentials.'}); return; }
    setSession(user);
    Swal.fire({icon:'success', title:'Login successful'}).then(()=>window.location.href='index.html');
  });
}

function setupRegisterForm() {
  const form = document.getElementById('registerForm');
  if (!form) return;
  form.addEventListener('submit', (e)=>{
    e.preventDefault();
    const email = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value.trim();
    if (!email || !password) { Swal.fire({icon:'error', title:'Invalid', text:'Email and password are required.'}); return; }
    if (email === ADMIN_EMAIL) { Swal.fire({icon:'warning', title:'Reserved', text:'This email is reserved for the admin.'}); return; }
    const users = getUsers();
    if (users.find(u=>u.email===email)) { Swal.fire({icon:'error', title:'Already exists', text:'Account already exists. Try logging in.'}); return; }
    users.push({email, password, role:'user'});
    saveUsers(users);
    Swal.fire({icon:'success', title:'Account created', text:'Use the same credentials to login.'}).then(()=>window.location.href='login.html');
  });
}

// ===== Page guards =====
function guardProtectedPages() {
  const protectedPages = ['about.html','products.html','cart.html','add-product.html'];
  const path = window.location.pathname.split('/').pop();
  if (protectedPages.includes(path) && !isLoggedIn()) {
    loginPrompt();
    setTimeout(()=>window.location.href='login.html', 0); // ensure leaving restricted page if accessed directly
  }
  if (path === 'add-product.html' && isLoggedIn() && !isAdmin()) {
    Swal.fire({icon:'warning', title:'Admins only', text:'Only admin can add products.'}).then(()=>window.location.href='index.html');
  }
}

// ===== Products =====
const defaultProducts = [
  { id:1, name:'Wireless Headphones', price:59.99, image:'https://images.unsplash.com/photo-1518440955850-06e0b4d6cc3f?q=80&w=800&auto=format&fit=crop' },
  { id:2, name:'Smart Watch', price:89.99, image:'https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?q=80&w=800&auto=format&fit=crop' },
  { id:3, name:'Portable Speaker', price:39.99, image:'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800&auto=format&fit=crop' },
  { id:4, name:'Gaming Mouse', price:24.99, image:'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?q=80&w=800&auto=format&fit=crop' },
  { id:5, name:'4K Monitor', price:299.00, image:'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=800&auto=format&fit=crop' },
  { id:6, name:'Mechanical Keyboard', price:79.00, image:'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=800&auto=format&fit=crop' }
];
function getProducts(){ const ls = JSON.parse(localStorage.getItem(LS_PRODUCTS_KEY) || 'null'); if(!ls){ localStorage.setItem(LS_PRODUCTS_KEY, JSON.stringify(defaultProducts)); return defaultProducts;} return ls; }
function saveProducts(a){ localStorage.setItem(LS_PRODUCTS_KEY, JSON.stringify(a)); }

function renderProducts() {
  const grid = document.getElementById('productsGrid'); const count = document.getElementById('productsCount');
  if (!grid) return;
  const products = getProducts();
  grid.innerHTML = '';
  products.forEach(p=>{
    const col = document.createElement('div');
    col.className = 'col-sm-6 col-md-4 col-lg-3';
    col.innerHTML = `
      <div class="product-card h-100 d-flex flex-column" data-aos="zoom-in">
        <div class="top-strip"></div>
        <img src="${p.image}" class="w-100" alt="${p.name}" onerror="this.src='https://picsum.photos/400/300?random=${p.id}'" />
        <div class="p-3 d-flex flex-column gap-2 flex-grow-1">
          <h6 class="mb-1">${p.name}</h6>
          <p class="mb-2 text-muted">$${p.price.toFixed(2)}</p>
          <div class="mt-auto d-flex gap-2">
            <button class="btn btn-sm btn-dark flex-grow-1" onclick="handleAddToCart(${p.id})">Add to Cart</button>
            <button class="btn btn-sm btn-outline-danger" onclick="removeProduct(${p.id})">Remove</button>
          </div>
        </div>
      </div>`;
    grid.appendChild(col);
  });
  if (count) count.textContent = products.length;
}

// Remove product (admin only) with confirmation
window.removeProduct = function(id){
  if (!isAdmin()) { Swal.fire({icon:'warning', title:'Admins only', text:'Only admin can remove products.'}); return; }
  Swal.fire({icon:'question', title:'Remove product?', showCancelButton:true, confirmButtonText:'Yes, remove'})
    .then(res=>{ if(res.isConfirmed){ const arr = getProducts().filter(p=>p.id!==id); saveProducts(arr); renderProducts(); Swal.fire({icon:'success', title:'Removed'});} });
}

// ===== Add Product page =====
function setupAddProductForm(){
  const form = document.getElementById('addProductForm'); if(!form) return;
  form.addEventListener('submit',(e)=>{
    e.preventDefault();
    if (!isAdmin()) { Swal.fire({icon:'warning', title:'Admins only', text:'Only admin can add products.'}); return; }
    const name = document.getElementById('pname').value.trim();
    const price = parseFloat(document.getElementById('pprice').value);
    const image = document.getElementById('pimage').value.trim();
    if (!name || !price || !image) { Swal.fire({icon:'error', title:'Invalid', text:'All fields are required.'}); return; }
    const products = getProducts();
    const id = (products.at(-1)?.id || 0) + 1;
    products.push({ id, name, price, image });
    saveProducts(products);
    Swal.fire({icon:'success', title:'Product added'}).then(()=>window.location.href='products.html');
  });
}

// ===== Cart =====
function getCart(){ return JSON.parse(localStorage.getItem(LS_CART_KEY) || '[]'); }
function saveCart(c){ localStorage.setItem(LS_CART_KEY, JSON.stringify(c)); }

window.handleAddToCart = function(productId){
  if (!isLoggedIn()) { loginPrompt(); return; }
  const p = getProducts().find(x=>x.id===productId); if(!p) return;
  const cart = getCart();
  const ex = cart.find(c=>c.id===productId);
  if(ex) ex.qty += 1; else cart.push({ id:p.id, name:p.name, price:p.price, image:p.image, qty:1 });
  saveCart(cart);
  Swal.fire({icon:'success', title:'Added to cart'});
}

function renderCart(){
  const tbody = document.querySelector('#cartTable tbody'); const totalEl = document.getElementById('cartTotal'); if(!tbody) return;
  const cart = getCart(); tbody.innerHTML=''; let total = 0;
  cart.forEach(item=>{
    const subtotal = item.price * item.qty; total += subtotal;
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><div class="d-flex align-items-center gap-2"><img src="${item.image}" style="width:64px;height:48px;object-fit:cover" class="rounded" /> <span>${item.name}</span></div></td>
      <td>$${item.price.toFixed(2)}</td>
      <td>
        <div class="d-flex align-items-center gap-2">
          <button class="btn btn-sm btn-outline-secondary" onclick="decQty(${item.id})">-</button>
          <span>${item.qty}</span>
          <button class="btn btn-sm btn-outline-secondary" onclick="incQty(${item.id})">+</button>
        </div>
      </td>
      <td>$${subtotal.toFixed(2)}</td>
      <td><button class="btn btn-sm btn-outline-danger" onclick="removeFromCart(${item.id})">Remove</button></td>`;
    tbody.appendChild(tr);
  });
  if (totalEl) totalEl.textContent = `$${total.toFixed(2)}`;
}

window.incQty = function(id){ const c=getCart(); const it=c.find(i=>i.id===id); if(!it) return; it.qty+=1; saveCart(c); renderCart(); }
window.decQty = function(id){ const c=getCart(); const it=c.find(i=>i.id===id); if(!it) return; it.qty=Math.max(1,it.qty-1); saveCart(c); renderCart(); }
window.removeFromCart = function(id){ const c=getCart().filter(i=>i.id!==id); saveCart(c); renderCart(); }

// ===== Swiper & AOS =====
function initUIPlugins(){
  if (document.querySelector('.hero-swiper')) {
    new Swiper('.hero-swiper', { loop:true, autoplay:{delay:2500}, pagination:{el:'.swiper-pagination'}, navigation:{nextEl:'.swiper-button-next', prevEl:'.swiper-button-prev'} });
  }
  if (window.AOS) AOS.init({ once:true, duration:700 });
}

// ===== Entry =====
document.addEventListener('DOMContentLoaded', ()=>{
  setupNavbarGuards();
  setupLoginForm();
  setupRegisterForm();
  setupAddProductForm();
  guardProtectedPages();
  renderProducts();
  renderCart();
  initUIPlugins();
});
