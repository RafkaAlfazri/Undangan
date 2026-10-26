/* =====================================================
   KONFIGURASI SUPABASE & UNDANGAN
   ===================================================== */
const SUPABASE_URL = 'https://nbxcubodnzqeivtbdjtx.supabase.co';
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
   1. ANIMASI REVEAL INTERAKTIF DUA ARAH (SCROLL)
   ===================================================== */
function setupReveal() {
    const els = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active'); // Muncul saat masuk layar
            } else {
                entry.target.classList.remove('active'); // Hilang saat keluar layar
            }
        });
    }, { 
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    });
    els.forEach(el => observer.observe(el));
}
setupReveal();

/* =====================================================
   2. COVER & BUKA UNDANGAN
   ===================================================== */
const btnOpen = document.getElementById('btnOpen');
const body = document.body;
const cover = document.getElementById('cover');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (btnOpen) {
    const hasOpened = sessionStorage.getItem('undangan_opened');
    if (hasOpened === 'true') {
        body.classList.remove('locked');
        body.classList.add('unlocked');
        window.scrollTo(0, 0);
    }

    const finishOpening = () => {
        body.classList.remove('locked');
        body.classList.add('unlocked');
        sessionStorage.setItem('undangan_opened', 'true');
        window.scrollTo(0, 0);

        setTimeout(() => {
            document.querySelectorAll('.reveal').forEach(el => {
                if (el.getBoundingClientRect().top < window.innerHeight) {
                    el.classList.add('active');
                }
            });
        }, 500);

        const music = document.getElementById('bgMusic');
        if (music) music.play().catch(() => {});
    };

    btnOpen.addEventListener('click', () => {
        btnOpen.disabled = true;
        if (prefersReducedMotion) {
            finishOpening();
            return;
        }

        cover.classList.add('is-folding');
        setTimeout(() => {
            cover.classList.add('is-flying');
            body.classList.add('page-revealing');
        }, 720);
        setTimeout(finishOpening, 1900);
    });
}

/* =====================================================
   3. ANIMASI KELOPAK BUNGA JATUH
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
    const count = window.innerWidth < 640 ? 15 : 25;
    for (let i = 0; i < count; i++) {
        petalsLayer.appendChild(createPetal());
    }
}

/* =====================================================
   4. HITUNG MUNDUR (COUNTDOWN)
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
updateCountdown();
setInterval(updateCountdown, 1000);

/* =====================================================
   5. NAMA TAMU DARI URL (?to=Nama)
   ===================================================== */
const params = new URLSearchParams(window.location.search);
const to = params.get('to');
if (to) {
    const el = document.getElementById('guestName');
    if (el) el.textContent = decodeURIComponent(to.replace(/\+/g, ' '));
}

/* =====================================================
   6. PEMUTAR MUSIK
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
    if (prepend) card.classList.add('is-new');
    const header = document.createElement('div');
    header.className = 'wish-header';

    const name = document.createElement('span');
    name.className = 'wish-name';
    name.textContent = wish.name;

    const status = document.createElement('span');
    status.className = `wish-badge ${wish.status.toLowerCase().replace(/\s+/g, '-')}`;
    status.textContent = wish.status === 'Masih Ragu' ? 'Konfirmasi menyusul' : wish.status;

    const text = document.createElement('p');
    text.className = 'wish-text';
    text.textContent = wish.text;

    const time = document.createElement('p');
    time.className = 'wish-time';
    time.textContent = wish.time;

    header.append(name, status);
    card.append(header, text, time);

    if (prepend) list.insertBefore(card, list.firstChild);
    else list.appendChild(card);
}

function showWishesMessage(message) {
    const list = document.getElementById('wishesList');
    if (!list) return;

    const empty = document.createElement('p');
    empty.className = 'wishes-empty';
    empty.textContent = message;
    list.replaceChildren(empty);
}

async function loadWishes() {
    try {
        const res = await fetch(
            `${CONFIG.supabase.url}/rest/v1/${CONFIG.supabase.table}?select=id,name,attendance,message,created_at&is_visible=eq.true&order=created_at.desc&limit=100`,
            { headers: supabaseHeaders }
        );
        const wishes = await res.json();
        const list = document.getElementById('wishesList');
        if (!list) return;

        if (!res.ok) {
            throw new Error(wishes.message || wishes.details || 'Permintaan ke Supabase ditolak.');
        }
        if (!Array.isArray(wishes)) {
            throw new Error('Respons Supabase tidak sesuai format.');
        }

        list.replaceChildren();
        if (wishes.length === 0) {
            showWishesMessage('Belum ada ucapan. Jadilah yang pertama!');
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
        console.error('Gagal memuat ucapan:', error);
        showWishesMessage('Ucapan gagal dimuat. Periksa koneksi atau konfigurasi Supabase.');
    }
}

// Form Submit
const form = document.getElementById('rsvpForm');
if (form) {
    form.addEventListener('submit', async function (e) {
        e.preventDefault();
        const name = document.getElementById('name').value.trim();
        const attendance = document.getElementById('attendance').value;
        const message = document.getElementById('message').value.trim();
        const feedback = document.getElementById('rsvpFeedback');
        const submitButton = form.querySelector('button[type="submit"]');
        feedback.textContent = 'Mengirim ucapan...';
        feedback.classList.remove('error', 'success');
        submitButton.disabled = true;

        try {
            const res = await fetch(`${CONFIG.supabase.url}/rest/v1/${CONFIG.supabase.table}`, {
                method: 'POST',
                headers: supabaseHeaders,
                body: JSON.stringify({ name, attendance, message })
            });
            const result = await res.json();
            if (!res.ok) {
                throw new Error(result.message || result.details || 'Permintaan ke Supabase ditolak.');
            }

            const savedWish = Array.isArray(result) ? result[0] : null;
            const time = savedWish?.created_at
                ? new Date(savedWish.created_at).toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' })
                : new Date().toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' });
            renderWish({
                name: savedWish?.name || name,
                status: savedWish?.attendance || attendance,
                text: savedWish?.message || message,
                time
            }, true);
            form.reset();
            feedback.textContent = 'Ucapan berhasil dikirim. Terima kasih!';
            feedback.classList.add('success');
        } catch (error) {
            console.error('Gagal mengirim ucapan:', error);
            feedback.textContent = 'Ucapan gagal dikirim. Periksa konfigurasi Supabase dan coba lagi.';
            feedback.classList.add('error');
        } finally {
            submitButton.disabled = false;
        }
    });
}

/* =====================================================
   9. MENU MENGAMBANG & BACK TO TOP
   ===================================================== */
const menu = document.getElementById('floatingMenu');
const backToTop = document.getElementById('backToTop');
const sections = document.querySelectorAll('section[id]');
const menuItems = document.querySelectorAll('.menu-item');

if (menu && backToTop) {
    document.body.append(menu, backToTop);

    window.addEventListener('scroll', () => {
        if (body.classList.contains('locked')) return;
        const y = window.scrollY;

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
    }, { passive: true });

    backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

/* =====================================================
   10. INISIALISASI SAAT HALAMAN DIMUAT
   ===================================================== */
document.addEventListener('DOMContentLoaded', () => {
    // Muat ucapan dari Supabase seketika, tanpa peduli status buka/tutup
    loadWishes();
});

const openingSection = document.querySelector('.opening');
const openingBackground = document.querySelector('.opening-bg');
if (openingSection && openingBackground && !prefersReducedMotion) {
    let parallaxFrame = null;

    const updateParallax = () => {
        if (parallaxFrame !== null) return;
        parallaxFrame = window.requestAnimationFrame(() => {
            const distance = Math.max(-40, Math.min(40, -openingSection.getBoundingClientRect().top * 0.08));
            openingBackground.style.setProperty('--parallax-y', `${distance}px`);
            parallaxFrame = null;
        });
    };

    window.addEventListener('scroll', updateParallax, { passive: true });
    window.addEventListener('resize', updateParallax);
    updateParallax();
}