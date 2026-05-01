document.addEventListener('DOMContentLoaded', function () {
    const tg = window.Telegram.WebApp;
    tg.ready();
    tg.expand();
    
    // Theme iOS pur
    tg.setHeaderColor('#ffffff');
    tg.setBackgroundColor('#F2F2F7');

    const progressBar = document.getElementById("myBar");
    const loader = document.getElementById("page-loader");

    setTimeout(() => { if (progressBar) progressBar.style.width = "100%"; }, 100);
    setTimeout(() => {
        if (loader) {
            loader.style.opacity = "0";
            setTimeout(() => {
                loader.style.display = "none";
                loader.classList.remove('active');
            }, 200);
        }
    }, 1800);

    // --- DATA (Tes produits intacts) ---
    const appData = [
        {
            id: 'HASH', name: 'Hash 🍫', type: 'Hash', image: 'CategHash.png',
            farms: [
                { id: 'FILTRE_90U', name: 'FILTRER 90u', products: [
                    { id: '72u', flag: '🇲🇦', name: '𝐓𝐎𝐏 𝟕𝟑/𝟏𝟎𝟓𝐮🔥', farm: '𝐭𝐢𝐤𝐭𝐚𝐤 𝐟𝐚𝐫𝐦𝐬', type: 'Filtre90u', image: 'Product72.png', video: 'Video72.mov', description: '', tarifs: [{ weight: '10G', price: 70 }, { weight: '20G', price: 120 }, { weight: '50G', price: 250 }] }
                ]},
                { id: 'FROZEN_SIFT', name: 'FROZEN SIFT', products: [
                    { id: 'PAPAYA', flag: '🇲🇦', name: 'PAPAYA 🥭', farm: 'escobar pikinho', type: 'FrozenSift', image: 'ProductPapaya.png', video: 'VideoPapaya.mov', tarifs: [{ weight: '5G', price: 70 }, { weight: '10G', price: 120 }, { weight: '20G', price: 230 }] },
                    { id: 'GRAPE', flag: '🇲🇦', name: 'GRAPE GAZ 🍇', farm: 'LA SOURCE', type: 'FrozenSift', image: 'ProductSift.png', video: 'VideoSift.mov', jars: [{ name: 'GRAPE GAZ', emoji: '🍇'}, { name: 'LAVA CAKE', emoji: '🍰'}], tarifs: [{ weight: '5G', price: 70 }, { weight: '10G', price: 120 }, { weight: '20G', price: 230 }] }
                ]},
                { id: 'STATIC_SIFT', name: 'STATIC SIFT', products: [
                    { id: 'OLIVE', flag: '🇲🇦', name: '𝐎𝐋𝐈𝐕𝐄 𝐒𝐓𝐀𝐓𝐈𝐂 🔞', farm: 'CLF-SELECTION', type: 'StaticSift', image: 'ProductOlive.png', video: 'VideoOlive.mov', jars: [{ name: '𝐅𝐫𝐨𝐛𝐢𝐝𝐝𝐞𝐧 𝐟𝐫𝐮𝐢𝐭𝐬', emoji: '🍇'}], tarifs: [{ weight: '5G', price: 80 }, { weight: '10G', price: 150 }] },
                    { id: 'MELOW', flag: '🇲🇦', name: '𝐌𝐞𝐥𝐨𝐰 🍈', farm: 'CLF-SELECTION', type: 'StaticSift', image: 'ProductMelow.png', video: 'VideoMelow.mov', tarifs: [{ weight: '5G', price: 80 }, { weight: '10G', price: 150 }] }
                ]}
            ]
        },
        {
            id: 'FLEURS', name: 'Weed 🥦', type: 'Weed', image: 'CategWeed.png',
            farms: [
                { id: 'WEED_HOLLANDA', name: 'WEED HOLLANDA', products: [
                    { id: 'AMNESIA', flag: '🇳🇱', name: 'AMNESIA HAZE💥', farm: '𝐓𝐎𝐏 𝐇𝐀𝐙𝐄', type: 'WEEDHOLLANDA', image: 'ProductHaze.png', video: 'VideoHaze.mov', tarifs: [{ weight: '10G', price: 60 }, { weight: '20G', price: 110 }] }
                ]},
                { id: 'WEED_USA', name: 'WEED USA', products: [
                    { id: 'MARKER', flag: '🇺🇸', name: 'PERMANENT MARKER💣', farm: '𝐂𝐀𝐋𝐈 𝐔.𝐒', type: 'CaliUs', image: 'ProductMarker.png', video: 'VideoMarker.mov', tarifs: [{ weight: '3,5G', price: 50 }, { weight: '10G', price: 100 }] }
                ]}
            ]
        }
    ];

    // Extraction de tous les produits pour "Récents" et "Tendances"
    let allProducts = [];
    appData.forEach(c => c.farms.forEach(f => {
        f.products.forEach(p => { p.category = c; p.farmName = f.name; allProducts.push(p); });
    }));

    // --- VARIABLES GLOBALES ---
    let cart = [];
    let currentProd = null;
    let currTarif = null;
    let currVar = null;
    let currQty = 1;
    let checkoutMode = 'Livraison';

    // --- TELEGRAM USER DATA ---
    const user = tg.initDataUnsafe?.user;
    if(user) {
        document.getElementById('prof-pseudo').innerText = user.username ? `@${user.username}` : user.first_name;
        document.getElementById('prof-id').innerText = user.id;
        // Optionnel: photo url si dispo
        if(user.photo_url) document.getElementById('prof-img').src = user.photo_url;
    }
// --- ROUTER ---
    window.navigate = function(pageId) {
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        document.getElementById('page-' + pageId).classList.add('active');
        window.scrollTo(0,0);
        
        // Update Bottom Nav UI
        document.querySelectorAll('.nav-item-float').forEach(i => i.classList.remove('active'));
        if(pageId === 'cart') document.querySelectorAll('.nav-item-float')[0].classList.add('active');
        if(pageId === 'home' || pageId === 'cat-list' || pageId === 'product') document.querySelectorAll('.nav-item-float')[1].classList.add('active');
        if(pageId === 'profile' || pageId === 'contact' || pageId === 'info') document.querySelectorAll('.nav-item-float')[2].classList.add('active');
        
        // 🔥 LIGNES AJOUTÉES : On force le calcul et l'affichage du panier quand on l'ouvre
        if(pageId === 'cart') renderCart();
        if(pageId === 'checkout') renderCheckout();
    };

    // --- RENDER HOME ---
    function renderHome() {
        // Catégories
        const catContainer = document.getElementById('cat-scroll');
        catContainer.innerHTML = appData.map(c => `
            <div class="cat-card" onclick="openCategory('${c.id}')">
                <img src="${c.image}" alt="">
                <div class="title">${c.name}</div>
                <div class="flags">🇲🇦 🇪🇸 🇺🇸</div>
            </div>
        `).join('');

        // Récents (Prend 3 produits)
        const recContainer = document.getElementById('recent-scroll');
        recContainer.innerHTML = allProducts.slice(0, 3).map(p => createCardHTML(p, true)).join('');

        // Tendances (Prend le reste)
        const trendContainer = document.getElementById('trend-grid');
        trendContainer.innerHTML = allProducts.slice(3, 7).map(p => createCardHTML(p, false)).join('');
    }

    function createCardHTML(p, isLarge) {
        const badge = p.farmName; // Ex: STATIC SIFT
        return `
            <div class="${isLarge ? 'prod-card-lg' : 'prod-card-lg'}" style="${!isLarge ? 'flex:none; width:100%;' : ''}" onclick="openProduct('${p.id}')">
                <img src="${p.image}" alt="">
                <div class="info">
                    <div class="badge">${badge} 🇺🇸</div>
                    <div class="title">${p.name}</div>
                    <div class="btn-outline">Voir les détails</div>
                </div>
            </div>
        `;
    }

    window.openCategory = function(catId) {
        const cat = appData.find(c => c.id === catId);
        document.getElementById('cat-list-title').innerText = cat.name;
        let html = '';
        cat.farms.forEach(f => {
            f.products.forEach(p => { html += createCardHTML(p, false); });
        });
        document.getElementById('cat-list-grid').innerHTML = html;
        navigate('cat-list');
    };

    // --- RENDER PRODUCT ---
    window.openProduct = function(id) {
        currentProd = allProducts.find(p => p.id === id);
        currQty = 1;
        currTarif = currentProd.tarifs[0];
        currVar = currentProd.jars ? currentProd.jars[0].name : null;

        // Media
        const mediaZone = document.getElementById('prod-media');
        if(currentProd.video) {
            mediaZone.innerHTML = `<video autoplay loop muted playsinline><source src="${currentProd.video}" type="video/mp4"></video>`;
        } else {
            mediaZone.innerHTML = `<img src="${currentProd.image}">`;
        }

        document.getElementById('p-name').innerText = currentProd.name;
        document.getElementById('p-desc').innerHTML = currentProd.description ? currentProd.description.replace(/\n/g, '<br>') : '';

        // Variantes
        const vZone = document.getElementById('variants-zone');
        const vScroll = document.getElementById('p-variants');
        if(currentProd.jars) {
            vZone.style.display = 'block';
            vScroll.innerHTML = currentProd.jars.map((j, i) => `
                <div class="tarif-pill var-btn ${i===0?'active':''}" data-val="${j.name}">
                    <span class="w">${j.emoji}</span>
                    <span class="p">${j.name}</span>
                </div>
            `).join('');
            
            document.querySelectorAll('.var-btn').forEach(b => {
                b.onclick = (e) => {
                    document.querySelectorAll('.var-btn').forEach(btn => btn.classList.remove('active'));
                    e.currentTarget.classList.add('active');
                    currVar = e.currentTarget.dataset.val;
                    tg.HapticFeedback.selectionChanged();
                };
            });
        } else {
            vZone.style.display = 'none';
        }

        // Tarifs
        const tScroll = document.getElementById('p-tarifs');
        tScroll.innerHTML = currentProd.tarifs.map((t, i) => `
            <div class="tarif-pill tar-btn ${i===0?'active':''}" data-idx="${i}">
                <span class="w">${t.weight}</span>
                <span class="p">${t.price}€</span>
            </div>
        `).join('');

        document.querySelectorAll('.tar-btn').forEach(b => {
            b.onclick = (e) => {
                document.querySelectorAll('.tar-btn').forEach(btn => btn.classList.remove('active'));
                e.currentTarget.classList.add('active');
                currTarif = currentProd.tarifs[e.currentTarget.dataset.idx];
                updateProdTotal();
                tg.HapticFeedback.selectionChanged();
            };
        });

        updateProdTotal();
        navigate('product');
    };

    function updateProdTotal() {
        document.getElementById('p-qty').innerText = currQty;
        document.getElementById('p-total').innerText = (currTarif.price * currQty).toFixed(2) + '€';
    }

    document.getElementById('p-minus').onclick = () => { if(currQty > 1) { currQty--; updateProdTotal(); }};
    document.getElementById('p-plus').onclick = () => { currQty++; updateProdTotal(); };

    document.getElementById('p-add').onclick = () => {
        const cartId = `${currentProd.id}-${currTarif.weight}-${currVar||'def'}`;
        const ext = cart.find(i => i.id === cartId);
        let fn = currentProd.name; if(currVar) fn += ` (${currVar})`;

        if(ext) {
            ext.qty += currQty; ext.tot = ext.qty * ext.price;
        } else {
            cart.push({ id: cartId, name: fn, img: currentProd.image, weight: currTarif.weight, price: currTarif.price, qty: currQty, tot: currTarif.price * currQty });
        }
        
        tg.HapticFeedback.notificationOccurred('success');
        document.getElementById('success-modal').style.display = 'flex';
        updateBadge();
    };

    // --- PANIER ---
    function updateBadge() {
        const count = cart.reduce((s, i) => s + i.qty, 0);
        const b = document.getElementById('nav-badge');
        b.innerText = count;
        b.style.display = count > 0 ? 'flex' : 'none';
    }

    function renderCart() {
        const list = document.getElementById('cart-list');
        if(cart.length === 0) {
            list.innerHTML = `<p style="text-align:center;color:var(--text-muted);margin-top:40px;">Panier vide</p>`;
            document.getElementById('cart-recap-text').innerText = 'Total (0)';
            document.getElementById('cart-total-display').innerText = '0€';
            return;
        }

        list.innerHTML = cart.map(i => `
            <div class="cart-item">
                <img src="${i.img}">
                <div style="flex-grow:1">
                    <div style="font-weight:800; font-size:0.95rem;">${i.name}</div>
                    <div style="color:var(--text-muted); font-size:0.8rem; margin: 4px 0;">Grammage: ${i.weight}</div>
                    <div style="font-weight:800;">${i.tot.toFixed(2)}€</div>
                </div>
                <div style="display:flex; align-items:center; background:var(--bg-color); border-radius:10px; padding:4px;">
                    <button style="border:none;background:none;font-size:1.2rem;font-weight:bold;width:30px;" onclick="modCart('${i.id}',-1)">-</button>
                    <span style="font-weight:800; width:20px; text-align:center;">${i.qty}</span>
                    <button style="border:none;background:none;font-size:1.2rem;font-weight:bold;width:30px;" onclick="modCart('${i.id}',1)">+</button>
                </div>
            </div>
        `).join('');

        const sum = cart.reduce((s, i) => s + i.tot, 0);
        const count = cart.reduce((s, i) => s + i.qty, 0);
        document.getElementById('cart-recap-text').innerText = `Total (${count} articles)`;
        document.getElementById('cart-total-display').innerText = sum.toFixed(2) + '€';
    }

    window.modCart = function(id, d) {
        const item = cart.find(i => i.id === id);
        item.qty += d;
        if(item.qty <= 0) cart = cart.filter(i => i.id !== id);
        else item.tot = item.qty * item.price;
        renderCart(); updateBadge();
    };

    // --- CHECKOUT & SWIPE ---
    function renderCheckout() {
        const cItems = document.getElementById('checkout-items');
        cItems.innerHTML = cart.map(i => `• ${i.name} (${i.weight}) x${i.qty} — ${i.tot.toFixed(2)}€`).join('<br>');
        const sum = cart.reduce((s, i) => s + i.tot, 0);
        document.getElementById('checkout-total').innerText = `Total: ${sum.toFixed(2)}€`;
    }

    document.querySelectorAll('.mode-btn').forEach(b => {
        b.onclick = (e) => {
            document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
            e.currentTarget.classList.add('active');
            checkoutMode = e.currentTarget.dataset.m;
            
            const info = document.getElementById('info-text');
            const addr = document.getElementById('address-field');
            if(checkoutMode === 'Livraison') { info.innerText = "L'adresse vous sera communiquée en MP."; addr.style.display='block'; }
            if(checkoutMode === 'Meet-up') { info.innerText = "Lieu exact communiqué après validation."; addr.style.display='none'; }
            if(checkoutMode === 'Envoi colis') { info.innerText = "Suivi d'envoi confirmé après validation."; addr.style.display='block'; addr.placeholder='Adresse postale complète...';}
        };
    });

    // Slider Logique Native
    const swipeBtn = document.getElementById('swipe-btn');
    const swipeBox = document.getElementById('swipe-box');
    let isDragging = false, startX = 0;

    swipeBtn.addEventListener('touchstart', (e) => {
        if(cart.length === 0) return;
        isDragging = true; startX = e.touches[0].clientX - swipeBtn.offsetLeft;
        swipeBtn.style.transition = 'none';
    });
    swipeBtn.addEventListener('touchmove', (e) => {
        if(!isDragging) return;
        const max = swipeBox.offsetWidth - swipeBtn.offsetWidth - 8;
        let x = e.touches[0].clientX - startX;
        if(x < 4) x = 4; if(x > max) x = max;
        swipeBtn.style.left = `${x}px`;
    });
    swipeBtn.addEventListener('touchend', () => {
        isDragging = false;
        const max = swipeBox.offsetWidth - swipeBtn.offsetWidth - 8;
        const cur = parseInt(swipeBtn.style.left || 4);
        if(cur > max * 0.85) {
            swipeBtn.style.left = `${max}px`; swipeBtn.style.background = 'var(--green)'; swipeBtn.innerHTML = '✓';
            tg.HapticFeedback.notificationOccurred('success');
            
            // Envoi Message
            let msg = `*🛒 COMMANDE VIP CLF44*\n\n`;
            cart.forEach(i => { msg += `▪️ *${i.name}* (${i.weight}) x${i.qty} = ${i.tot.toFixed(2)}€\n`; });
            const sum = cart.reduce((s, i) => s + i.tot, 0);
            msg += `\n*💰 TOTAL: ${sum.toFixed(2)}€*\n*📦 Mode:* ${checkoutMode}\n`;
            if(document.getElementById('address-field').style.display !== 'none') {
                msg += `*📍 Adresse:* ${document.getElementById('address-field').value || 'Non précisée'}`;
            }
            tg.openTelegramLink(`https://t.me/CLF_44?text=${encodeURIComponent(msg)}`);

            setTimeout(() => {
                swipeBtn.style.transition = 'left 0.3s ease, background 0.3s ease';
                swipeBtn.style.left = '4px'; swipeBtn.style.background = 'var(--blue)';
                swipeBtn.innerHTML = '<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>';
            }, 2000);
        } else {
            swipeBtn.style.transition = 'left 0.3s ease'; swipeBtn.style.left = '4px';
        }
    });

   // --- GESTION DES CLICS SUR LA NOUVELLE NAVBAR ---
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const target = e.currentTarget.dataset.target;
            if(!target) return;
            
            // Les fameuses lignes pour l'animation de la pilule !
            document.querySelectorAll('.nav-item-float').forEach(i => i.classList.remove('active'));
            if(e.currentTarget.classList.contains('nav-item-float')) {
                e.currentTarget.classList.add('active');
            }

            // Redirection vers la bonne page
            const pageName = target.replace('page-', '');
            navigate(pageName);
        });
    });

    // NE TOUCHE PAS AUX DEUX LIGNES EN DESSOUS (Elles y sont déjà)
    renderHome();
});