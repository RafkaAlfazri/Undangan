/* =====================================================
   KONFIGURASI SUPABASE & UNDANGAN
   ===================================================== */
const SUPABASE_URL = 'https://nbxcubodnzqevitbdjtx.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_hwTKNzavCmvkPLGG6XLE0w_KUOnj-MD';

const CONFIG = {
    weddingDate: 'March 21, 2027 08:00:00 GMT+0700',
    musicVolume: 0.5,
    supabase: {
        url: SUPABASE_URL,
        key: SUPABASE_ANON_KEY,
        table: 'wishes'
    }
};

/* =====================================================
   HEADER UNTUK REQUEST KE SUPABASE
   ===================================================== */
const supabaseHeaders = {
    'apikey': CONFIG.supabase.key,
    'Authorization': `Bearer ${CONFIG.supabase.key}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
};

/* =====================================================
   COVER & BUKA UNDANGAN
   ===================================================== */
(function setupCover() {
    const btnOpen = document.getElementById('btnOpen');
    const body = document.body;
    if (!btnOpen) return;

    // Cek apakah user sudah pernah membuka di sesi ini
    const hasOpened = sessionStorage.getItem('undangan_opened');
    if (hasOpened === 'true') {
        body.classList.remove('locked');
        body.classList.add('unlocked');
        window.scrollTo(0, 0);
        setTimeout(() => {
            document.querySelectorAll('.reveal').forEach(el => {
                if (el.getBoundingClientRect().top < window.innerHeight) {
                    el.classList.add('active');
                }
            });
        }, 100);
    }

    // Event klik tombol buka
    btnOpen.addEventListener('click', () => {
        btnOpen.style.transform = 'scale(0.95)';
        setTimeout(() => {
            body.classList.remove('locked');
            body.classList.add('unlocked');
            sessionStorage.setItem('undangan_opened', 'true');
            window.scrollTo(0, 0);

            // Mainkan musik
            const music = document.getElementById('bgMusic');
            if (music) {
                music.play().catch(() => {});
            }

            // Trigger animasi elemen yang terlihat
            setTimeout(() => {
                document.querySelectorAll('.reveal').forEach(el => {
                    if (el.getBoundingClientRect().top < window.innerHeight) {
                        el.classList.add('active');
                    }
                });
            }, 800);
        }, 200);
    });
})();

/* =====================================================
   ANIMASI KELOPAK BUNGA (PETALS)
   ===================================================== */
function createPetal() {
    const petal = document.createElement('div');
    petal.className = 'petal' + (Math.random() > 0.7 ? ' sage' : '');
    const size = 8 + Math.random() * 10;
    petal.style.width = size + 'px';
    petal.style.height = size + 'px';
    petal.style.left = Math.random() * 100 + '%';
    petal.style.setProperty('--duration', (8 + Math.random() * 8) + 's');
    petal.style.setProperty('--delay', (Math.random() * 8) + 's');
    petal.style.setProperty('--drift', (Math.random() * 150 - 75) + 'px');
    return petal;
}

(function generatePetals() {
    const layer = document.getElementById('petalsLayer');
    if (!layer) return;
    const count = window.innerWidth < 640 ? 12 : 20;
    for (let i = 0; i < count; i++) {
        layer.appendChild(createPetal());
    }
})();

/* =====================================================
   NAMA TAMU DARI URL (?to=Nama)
   ===================================================== */
(function setGuestName() {
    const params = new URLSearchParams(window.location.search);
    const to = params.get('to');
    if (to) {
        const el = document.getElementById('guestName');
        if (el) el.textContent = decodeURIComponent(to.replace(/\+/g, ' '));
    }
})();

/* =====================================================
   PEMUTAR MUSIK
   ===================================================== */
(function setupMusic() {
    const music = document.getElementById('bgMusic');
    const btn = document.getElementById('musicBtn');
    if (!music || !btn) return;

    let isPlaying = false;
    music.volume = CONFIG.musicVolume;

    btn.addEventListener('click', () => {
        if (isPlaying) {
            music.pause();
            btn.classList.remove('playing');
            btn.classList.add('paused');
            isPlaying = false;
        } else {
            music.play().then(() => {
                btn.classList.add('playing');
                btn.classList.remove('paused');
                isPlaying = true;
            }).catch(err => console.warn('Musik gagal:', err));
        }
    });

    music.addEventListener('play', () => {
        btn.classList.add('playing');
        btn.classList.remove('paused');
        isPlaying = true;
    });
    music.addEventListener('pause', () => {
        btn.classList.remove('playing');
        btn.classList.add('paused');
        isPlaying = false;
    });
})();

/* =====================================================
   ANIMASI REVEAL SAAT SCROLL
   ===================================================== */
(function setupReveal() {
    const els = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add('active');
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    els.forEach(el => observer.observe(el));
})();

/* =====================================================
   HITUNG MUNDUR (COUNTDOWN)
   ===================================================== */
(function setupCountdown() {
    const targetDate = new Date(CONFIG.weddingDate).getTime();
    const ccDays = document.getElementById('ccDays');
    const ccHours = document.getElementById('ccHours');
    const ccMinutes = document.getElementById('ccMinutes');
    const ccSeconds = document.getElementById('ccSeconds');
    
    if (!ccDays) return;

    function update() {
        const now = new Date().getTime();
        const distance = targetDate - now;
        
        if (distance < 0) {
            [ccDays, ccHours, ccMinutes, ccSeconds].forEach(el => el.textContent = '00');
            return;
        }

        const d = Math.floor(distance / (1000 * 60 * 60 * 24));
        const h = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((distance % (1000 * 60)) / 1000);

        if (ccDays) ccDays.textContent = String(d).padStart(2, '0');
        if (ccHours) ccHours.textContent = String(h).padStart(2, '0');
        if (ccMinutes) ccMinutes.textContent = String(m).padStart(2, '0');
        if (ccSeconds) ccSeconds.textContent = String(s).padStart(2, '0');
    }
    
    update();
    setInterval(update, 1000);
})();

/* =====================================================
   FITUR SALIN REKENING BCA
   ===================================================== */
window.copyRekening = function() {
    const rek = document.getElementById('rekBCA').innerText;
    navigator.clipboard.writeText(rek).then(() => {
        const btn = document.querySelector('.btn-copy');
        const originalText = btn.innerHTML;
        
        btn.innerHTML = `<svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg> Berhasil Disalin!`;
        btn.style.background = '#a8b8a0';
        btn.style.color = '#fff';
        btn.style.borderColor = '#a8b8a0';
        
        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.style.background = 'var(--rose-light)';
            btn.style.color = 'var(--rose-dark)';
            btn.style.borderColor = 'var(--rose)';
        }, 2500);
    }).catch(() => alert('Gagal menyalin nomor rekening.'));
};

/* =====================================================
   FITUR RSVP & BUKU TAMU (SUPABASE)
   ===================================================== */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function getStatusClass(status) {
    if (status === 'Hadir') return 'hadir';
    if (status === 'Tidak Hadir') return 'tidak-hadir';
    return 'masih-ragu';
}

function renderWish(wish, prepend = false) {
    const list = document.getElementById('wishesList');
    const empty = document.getElementById('wishesEmpty');
    if (!list) return;
    if (empty) empty.remove();

    const card = document.createElement('div');
    card.className = 'wish-card';
    card.innerHTML = `
        <div class="wish-header">
            <span class="wish-name">${escapeHtml(wish.name)}</span>
            <span class="wish-badge ${getStatusClass(wish.status)}">${escapeHtml(wish.status)}</span>
        </div>
        <p class="wish-text">${escapeHtml(wish.text)}</p>
        <p class="wish-time">${escapeHtml(wish.time)}</p>
    `;

    if (prepend) list.insertBefore(card, list.firstChild);
    else list.appendChild(card);
}

// Fungsi Ambil Data dari Supabase
async function loadWishesFromSupabase() {
    try {
        const response = await fetch(`${CONFIG.supabase.url}/rest/v1/${CONFIG.supabase.table}?select=*&order=created_at.desc&limit=100`, {
            headers: supabaseHeaders
        });
        if (!response.ok) throw new Error('Gagal mengambil data');
        
        const wishes = await response.json();
        const list = document.getElementById('wishesList');
        const empty = document.getElementById('wishesEmpty');
        if (empty) empty.remove();
        list.innerHTML = '';

        if (wishes.length === 0) {
            list.innerHTML = '<p class="wishes-empty" id="wishesEmpty">Belum ada ucapan. Jadilah yang pertama! 💌</p>';
            return;
        }

        wishes.forEach(wish => {
            renderWish({
                name: wish.name,
                status: wish.attendance,
                text: wish.message,
                time: new Date(wish.created_at).toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' })
            });
        });
    } catch (error) {
        console.error('Error load wishes:', error);
        loadLocalWishes(); // Cadangan
    }
}

// Fungsi Kirim Data ke Supabase
async function submitWishToSupabase(wishData) {
    // Tampilkan langsung di UI agar terasa cepat
    renderWish(wishData, true);
    
    try {
        const response = await fetch(`${CONFIG.supabase.url}/rest/v1/${CONFIG.supabase.table}`, {
            method: 'POST',
            headers: supabaseHeaders,
            body: JSON.stringify({
                name: wishData.name,
                attendance: wishData.status,
                message: wishData.text
            })
        });
        
        if (!response.ok) throw new Error('Gagal menyimpan ke database');
        
        const savedData = await response.json();
        console.log('Tersimpan di Supabase:', savedData);
        showToast('Ucapan berhasil dikirim! Terima kasih 🤍');
        
    } catch (error) {
        console.error('Error submit:', error);
        saveLocalWish(wishData); // Simpan ke local browser jika internet/db bermasalah
        showToast('Ucapan tersimpan lokal (koneksi database gagal)');
    }
}

/* Penyimpanan Lokal (Cadangan) */
function saveLocalWish(wish) {
    let localData = JSON.parse(localStorage.getItem('wishes_local')) || [];
    localData.unshift(wish);
    localStorage.setItem('wishes_local', JSON.stringify(localData));
}

function loadLocalWishes() {
    const localData = JSON.parse(localStorage.getItem('wishes_local')) || [];
    const list = document.getElementById('wishesList');
    const empty = document.getElementById('wishesEmpty');
    if (empty) empty.remove();
    list.innerHTML = '';
    
    if (localData.length === 0) {
        list.innerHTML = '<p class="wishes-empty" id="wishesEmpty">Belum ada ucapan. Jadilah yang pertama! 💌</p>';
        return;
    }
    localData.forEach(w => renderWish(w));
}

(function setupRSVP() {
    const form = document.getElementById('rsvpForm');
    if (!form) return;

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        const name = document.getElementById('name').value.trim();
        const attendance = document.getElementById('attendance').value;
        const message = document.getElementById('message').value.trim();
        if (!name || !attendance || !message) return;

        const now = new Date();
        const timeString = now.toLocaleDateString('id-ID', {
            day: 'numeric', month: 'long', year: 'numeric'
        }) + ' at ' + now.toLocaleTimeString('id-ID', {
            hour: '2-digit', minute: '2-digit'
        });

        // Panggil fungsi Supabase
        submitWishToSupabase({ name, status: attendance, text: message, time: timeString });
        this.reset();

        setTimeout(() => {
            document.getElementById('wishesList').scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 200);
    });
})();

/* =====================================================
   NOTIFIKASI TOAST
   ===================================================== */
function showToast(message) {
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed; bottom: 100px; left: 50%;
        transform: translateX(-50%) translateY(20px);
        background: linear-gradient(135deg, #d4868b, #b56b70);
        color: #fff; padding: 14px 26px; border-radius: 30px;
        font-size: 0.85rem; font-weight: 600; z-index: 9999;
        opacity: 0; transition: all 0.4s ease; box-shadow: 0 10px 30px rgba(212, 134, 139, 0.5);
        max-width: calc(100% - 40px); text-align: center; pointer-events: none;
    `;
    document.body.appendChild(toast);
    requestAnimationFrame(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateX(-50%) translateY(0)';
    });
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(-50%) translateY(20px)';
        setTimeout(() => toast.remove(), 400);
    }, 3000);
}

/* =====================================================
   LIGHTBOX GALERI FOTO
   ===================================================== */
(function setupLightbox() {
    const items = document.querySelectorAll('.gallery-item img');
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    const closeBtn = document.getElementById('lightboxClose');
    if(!lightbox) return;

    items.forEach(img => {
        img.parentElement.addEventListener('click', () => {
            lightboxImg.src = img.src;
            lightbox.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    });

    function closeLightbox() {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
    }

    closeBtn.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) closeLightbox();
    });
})();

/* =====================================================
   MENU MENGAMBANG & BACK TO TOP
   ===================================================== */
(function setupScrollUI() {
    const menu = document.getElementById('floatingMenu');
    const backToTop = document.getElementById('backToTop');
    const sections = document.querySelectorAll('section[id]');
    const menuItems = document.querySelectorAll('.menu-item');
    if (!menu || !backToTop) return;

    function onScroll() {
        if (document.body.classList.contains('locked')) return;
        const y = window.scrollY;

        if (y > window.innerHeight * 0.5) menu.classList.add('visible');
        else menu.classList.remove('visible');

        if (y > window.innerHeight) backToTop.classList.add('visible');
        else backToTop.classList.remove('visible');

        let current = '';
        sections.forEach(s => {
            if (y >= s.offsetTop - 150) current = s.getAttribute('id');
        });
        menuItems.forEach(it => {
            it.classList.remove('active');
            if (it.getAttribute('href').substring(1) === current) it.classList.add('active');
        });
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
})();

/* =====================================================
   INISIALISASI SAAT HALAMAN DIMUAT
   ===================================================== */
document.addEventListener('DOMContentLoaded', () => {
    // Muat ucapan jika undangan sudah dalam keadaan terbuka
    if (document.body.classList.contains('unlocked')) {
        loadWishesFromSupabase(); // Memanggil fungsi Supabase
    } else {
        // Atau muat setelah tombol "Buka Undangan" diklik
        const btnOpen = document.getElementById('btnOpen');
        if (btnOpen) {
            btnOpen.addEventListener('click', () => {
                setTimeout(loadWishesFromSupabase, 1000);
            }, { once: true });
        }
    }
});~