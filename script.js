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

const supabaseHeaders = {
    'apikey': CONFIG.supabase.key,
    'Authorization': `Bearer ${CONFIG.supabase.key}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
};

/* =====================================================
   1. COVER & BUKA UNDANGAN
   ===================================================== */
const btnOpen = document.getElementById('btnOpen');
const body = document.body;

if (btnOpen) {
    // Cek apakah user sudah pernah membuka di sesi ini
    const hasOpened = sessionStorage.getItem('undangan_opened');
    if (hasOpened === 'true') {
        body.classList.remove('locked');
        body.classList.add('unlocked');
        window.scrollTo(0, 0);
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
        }, 200);
    });
}

/* =====================================================
   2. HITUNG MUNDUR (COUNTDOWN)
   ===================================================== */
function updateCountdown() {
    const targetDate = new Date(CONFIG.weddingDate).getTime();
    const now = new Date().getTime();
    const distance = targetDate - now;
    
    const ccDays = document.getElementById('ccDays');
    const ccHours = document.getElementById('ccHours');
    const ccMinutes = document.getElementById('ccMinutes');
    const ccSeconds = document.getElementById('ccSeconds');
    
    if (!ccDays) return;

    if (distance < 0) {
        [ccDays, ccHours, ccMinutes, ccSeconds].forEach(el => el.textContent = '00');
        return;
    }

    const d = Math.floor(distance / (1000 * 60 * 60 * 24));
    const h = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((distance % (1000 * 60)) / 1000);

    ccDays.textContent = String(d).padStart(2, '0');
    ccHours.textContent = String(h).padStart(2, '0');
    ccMinutes.textContent = String(m).padStart(2, '0');
    ccSeconds.textContent = String(s).padStart(2, '0');
}

// Jalankan countdown seketika dan ulangi tiap detik
updateCountdown();
setInterval(updateCountdown, 1000);

/* =====================================================
   3. ANIMASI KELOPAK BUNGA (PETALS)
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

const petalsLayer = document.getElementById('petalsLayer');
if (petalsLayer) {
    const count = window.innerWidth < 640 ? 12 : 20;
    for (let i = 0; i < count; i++) {
        petalsLayer.appendChild(createPetal());
    }
}

/* =====================================================
   4. NAMA TAMU DARI URL (?to=Nama)
   ===================================================== */
const params = new URLSearchParams(window.location.search);
const to = params.get('to');
if (to) {
    const el = document.getElementById('guestName');
    if (el) el.textContent = decodeURIComponent(to.replace(/\+/g, ' '));
}

/* =====================================================
   5. PEMUTAR MUSIK
   ===================================================== */
const music = document.getElementById('bgMusic');
const musicBtn = document.getElementById('musicBtn');
let isPlaying = false;

if (music && musicBtn) {
    music.volume = CONFIG.musicVolume;
    musicBtn.addEventListener('click', () => {
        if (isPlaying) {
            music.pause();
            musicBtn.classList.remove('playing');
            musicBtn.classList.add('paused');
            isPlaying = false;
        } else {
            music.play().then(() => {
                musicBtn.classList.add('playing');
                musicBtn.classList.remove('paused');
                isPlaying = true;
            }).catch(err => console.warn('Musik gagal:', err));
        }
    });
}

/* =====================================================
   6. ANIMASI REVEAL SAAT SCROLL
   ===================================================== */
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('active');
    });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

/* =====================================================
   7. FITUR SALIN REKENING BCA
   ===================================================== */
window.copyRekening = function() {
    const rek = document.getElementById('rekBCA').innerText;
    navigator.clipboard.writeText(rek).then(() => {
        const btn = document.querySelector('.btn-copy');
        const originalText = btn.innerHTML;
        btn.innerHTML = 'Berhasil Disalin!';
        btn.style.background = '#a8b8a0';
        btn.style.color = '#fff';
        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.style.background = 'var(--rose-light)';
            btn.style.color = 'var(--rose-dark)';
        }, 2500);
    }).catch(() => alert('Gagal menyalin nomor rekening.'));
};

/* =====================================================
   8. FITUR RSVP & BUKU TAMU (SUPABASE)
   ===================================================== */
function renderWish(wish, prepend = false) {
    const list = document.getElementById('wishesList');
    const empty = document.getElementById('wishesEmpty');
    if (!list) return;
    if (empty) empty.remove();

    const card = document.createElement('div');
    card.className = 'wish-card';
    card.innerHTML = `
        <div class="wish-header">
            <span class="wish-name">${wish.name}</span>
            <span class="wish-badge ${wish.status === 'Hadir' ? 'hadir' : 'tidak-hadir'}">${wish.status}</span>
        </div>
        <p class="wish-text">${wish.text}</p>
        <p class="wish-time">${wish.time}</p>
    `;

    if (prepend) list.insertBefore(card, list.firstChild);
    else list.appendChild(card);
}

async function loadWishes() {
    try {
        const res = await fetch(`${CONFIG.supabase.url}/rest/v1/${CONFIG.supabase.table}?select=*&order=created_at.desc&limit=100`, { headers: supabaseHeaders });
        const wishes = await res.json();
        const list = document.getElementById('wishesList');
        if (!list) return;
        list.innerHTML = '';
        
        if (wishes.length === 0) {
            list.innerHTML = '<p class="wishes-empty" id="wishesEmpty">Belum ada ucapan. Jadilah yang pertama! 💌</p>';
            return;
        }
        wishes.forEach(w => {
            renderWish({
                name: w.name,
                status: w.attendance,
                text: w.message,
                time: new Date(w.created_at).toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' })
            });
        });
    } catch (error) {
        console.error('Error:', error);
    }
}

const form = document.getElementById('rsvpForm');
if (form) {
    form.addEventListener('submit', async function (e) {
        e.preventDefault();
        const name = document.getElementById('name').value;
        const attendance = document.getElementById('attendance').value;
        const message = document.getElementById('message').value;

        const now = new Date();
        const timeString = now.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) + ' at ' + now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

        // Render langsung di layar
        renderWish({ name, status: attendance, text: message, time: timeString }, true);
        this.reset();

        // Kirim ke Supabase
        try {
            await fetch(`${CONFIG.supabase.url}/rest/v1/${CONFIG.supabase.table}`, {
                method: 'POST',
                headers: supabaseHeaders,
                body: JSON.stringify({ name: name, attendance: attendance, message: message })
            });
        } catch (err) {
            console.log('Gagal kirim ke db', err);
        }
    });
}

// Muat ucapan saat pertama kali dibuka atau setelah klik tombol
if (body.classList.contains('unlocked')) {
    loadWishes();
} else if (btnOpen) {
    btnOpen.addEventListener('click', () => setTimeout(loadWishes, 1000), { once: true });
}