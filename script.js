// ================================
// LOADING
// ================================
setTimeout(()=>{
    const loadingEl = document.getElementById("loading");
    if(loadingEl) loadingEl.style.display="none";
},1500);

// ================================
// DATA PRODUK
// ================================
let products = [];

fetch('products.json')
.then(res => res.json())
.then(data => {
    products = data.map(p => ({
        ...p,
        status: p.harga === "COMING SOON" ? "soon" : "ready"
    }));
    loadProducts();
    loadOrderGrid(); // load order grid juga
});

// ================================
// FILTER & SEARCH
// ================================
let platformFilter = 'ALL';
let hargaFilter = 'ALL';

function loadProducts() {
    const grid = document.getElementById('product-grid');
    const search = document.getElementById('search-input')?.value.toLowerCase()||'';
    if(!grid) return;
    grid.innerHTML = '';

    products.forEach(p => {
        if((platformFilter==='ALL'||p.platform.includes(platformFilter)) &&
           (hargaFilter==='ALL'||p.harga===hargaFilter) &&
           (p.nama.toLowerCase().includes(search) || p.fitur.toLowerCase().includes(search))) {
            const card = document.createElement('div');
            card.className = 'product-card';
            card.innerHTML=`
                <img src="${p.gambar}" alt="${p.nama}">
                <h3>${p.nama}</h3>
                <p>${p.fitur.replace(/\n/g,'<br>')}</p>
                <p><b>${p.harga}</b> - ${p.platform}</p>
                <a href="${p.link}" target="_blank"><button>${p.tombol}</button></a>
                <p>Admin: ${p.admin}</p>
            `;
            grid.appendChild(card);
        }
    });
}

function setPlatform(val, btn){
    platformFilter = val;
    document.querySelectorAll('#filter-platform button').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    loadProducts();
}

function setHarga(val, btn){
    hargaFilter = val;
    document.querySelectorAll('#filter-harga button').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    loadProducts();
}

// ================================
// ORDER / PAYMENT
// ================================
let currentOrder="";

function loadOrderGrid(){
    const grid = document.getElementById("grid");
    if(!grid) return;
    let html="";
    products.forEach(p=>{
        let tombol = p.status==="soon"
            ? `<button class="btn" style="background:orange;">COMING SOON</button>`
            : `<button class="btn" onclick="order('${p.nama}','${p.harga}')">ORDER</button>`;

        html+=`
        <div class="card">
            <img src="${p.gambar}" alt="${p.nama}">
            <h3>${p.nama}</h3>
            <p>${p.harga}</p>
            ${tombol}
        </div>
        `;
    });
    grid.innerHTML=html;
}

function order(nama,harga){
    let namaUser=document.getElementById("nama")?.value;
    let hp=document.getElementById("nohp")?.value;

    if(!namaUser || !hp){
        alert("Isi data dulu!");
        return;
    }

    currentOrder=`Produk: ${nama}\nHarga: ${harga}\nNo HP: ${hp}`;
    const payEl=document.getElementById("pay");
    if(payEl) payEl.style.display="block";
}

function pay(method){
    let namaUser=document.getElementById("nama")?.value;
    let hp=document.getElementById("nohp")?.value;
    let id="NX-"+Date.now();

    let status=document.getElementById("statusText");
    if(status) status.innerHTML="⏳ Menunggu...";
    setTimeout(()=>{ if(status) status.innerHTML="⚙️ Diproses..."; },2000);
    setTimeout(()=>{ if(status) status.innerHTML="✅ Berhasil (Fake)"; },4000);

    let data={
        nama:namaUser,
        produk:currentOrder,
        metode:method,
        id:id
    };

    let history=JSON.parse(localStorage.getItem("orderHistory"))||[];
    history.push(data);
    localStorage.setItem("orderHistory",JSON.stringify(history));
    showHistory();

    let msg=`ORDER NEXUS
Nama:${namaUser}
HP:${hp}
${currentOrder}
Metode:${method}
ID:${id}`;

    let link="https://wa.me/6285355752323?text="+encodeURIComponent(msg);
    window.open(link);

    closePay();
}

// ================================
// HISTORY
// ================================
function showHistory(){
    let history=JSON.parse(localStorage.getItem("orderHistory"))||[];
    let html="";
    history.reverse().forEach(h=>{
        html+=`
        <div class="history-item">
            <b>${h.nama}</b><br>
            ${h.produk}<br>
            Metode: ${h.metode}<br>
            ID: ${h.id}
        </div>`;
    });
    const histEl=document.getElementById("history");
    if(histEl) histEl.innerHTML=html;
}
showHistory();

function exportHistory(){
    let data=JSON.parse(localStorage.getItem("orderHistory"))||[];
    if(data.length===0){ alert("Tidak ada data!"); return; }

    let text="=== NEXUS STORE DATA ===\n\n";
    data.forEach(d=>{
        text+=`
ID: ${d.id}
Nama: ${d.nama}
Produk: ${d.produk}
Metode: ${d.metode}
-------------------------
`;
    });

    let blob=new Blob([text],{type:"text/plain"});
    let a=document.createElement("a");
    a.href=URL.createObjectURL(blob);
    a.download="nexus_order.txt";
    a.click();
}

// ================================
// DASHBOARD & CLOSE
// ================================
function openDashboard(){ window.location.href="dashboard.html"; }
function closePay(){ const pay=document.getElementById("pay"); if(pay) pay.style.display="none"; }

// ================================
// ANTI INSPECT
// ================================
document.addEventListener("contextmenu",e=>e.preventDefault());
document.onkeydown=function(e){ if(e.keyCode==123) return false; }