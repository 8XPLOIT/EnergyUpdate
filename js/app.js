/* =====================================================
   Energi Kosmis — app.js
   Vanilla JS: kalkulasi astro, sistem energi kolektif,
   manipulasi DOM, dan interaksi UI.
   ===================================================== */
(() => {
  "use strict";

  /* ----------------------------------------------------
     Utilitas
     ---------------------------------------------------- */
  const $ = (sel) => document.querySelector(sel);
  const norm = (deg) => ((deg % 360) + 360) % 360;
  const mod = (n, m) => ((n % m) + m) % m;

  /* ----------------------------------------------------
     Bintang latar (dekoratif)
     ---------------------------------------------------- */
  function buildStars() {
    const wrap = $("#stars");
    if (!wrap) return;
    const count = window.innerWidth < 600 ? 60 : 120;
    const frag = document.createDocumentFragment();
    for (let i = 0; i < count; i++) {
      const s = document.createElement("span");
      s.className = "star";
      const size = Math.random() * 2 + 1;
      s.style.left = Math.random() * 100 + "%";
      s.style.top = Math.random() * 100 + "%";
      s.style.width = size + "px";
      s.style.height = size + "px";
      s.style.setProperty("--dur", (Math.random() * 4 + 2) + "s");
      s.style.animationDelay = Math.random() * 5 + "s";
      frag.appendChild(s);
    }
    wrap.appendChild(frag);
  }

  /* ----------------------------------------------------
     Tanggal hari ini (hero)
     ---------------------------------------------------- */
  function renderDate() {
    const el = $("#heroDate");
    if (!el) return;
    const hari = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
    const bulan = [
      "Januari", "Februari", "Maret", "April", "Mei", "Juni",
      "Juli", "Agustus", "September", "Oktober", "November", "Desember",
    ];
    const d = new Date();
    el.textContent = `${hari[d.getDay()]}, ${d.getDate()} ${bulan[d.getMonth()]} ${d.getFullYear()}`;
  }

  /* ----------------------------------------------------
     Header & FAB (scroll)
     ---------------------------------------------------- */
  function initScrollUI() {
    const header = $("#appHeader");
    const fab = $("#fab");
    const onScroll = () => {
      const y = window.scrollY;
      if (header) header.classList.toggle("solid", y > 40);
      if (fab) fab.classList.toggle("show", y > 320);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    if (fab) {
      fab.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    }
    onScroll();
  }

  function initTheme() {
    const button = $("#themeToggle");
    if (!button) return;
    const applyTheme = (theme) => {
      document.documentElement.dataset.theme = theme;
      localStorage.setItem("energi-kosmis-theme", theme);
      const light = theme === "light";
      button.setAttribute("aria-label", light ? "Aktifkan mode gelap" : "Aktifkan mode terang");
      button.setAttribute("title", light ? "Aktifkan mode gelap" : "Aktifkan mode terang");
    };
    applyTheme(document.documentElement.dataset.theme === "light" ? "light" : "dark");
    button.addEventListener("click", () => {
      applyTheme(document.documentElement.dataset.theme === "light" ? "dark" : "light");
    });
  }

  const PLANETARY_EVENTS = [
    // Oktober 2026
    { date: "2026-10-24", title: "Merkurius retrograde di Scorpio", detail: "Fase peninjauan ulang komunikasi, informasi, keputusan, dan percakapan yang belum selesai." },
    { date: "2026-10-24", title: "Matahari berada di Scorpio", detail: "Langit musim Scorpio menonjolkan tema kedalaman, transformasi, dan kejujuran batin." },
    { date: "2026-10-24", title: "Venus retrograde di Scorpio", detail: "Relasi, nilai pribadi, keuangan, dan batas emosional memasuki fase evaluasi." },
    { date: "2026-10-25", title: "Venus retrograde kembali memasuki Libra", detail: "Perhatian bergeser menuju keseimbangan, keadilan, hubungan, dan peninjauan ulang nilai." },
    { date: "2026-10-26", title: "Bulan Purnama di Taurus", detail: "Puncak siklus lunar yang menyoroti keamanan, sumber daya, kenyamanan, dan kestabilan." },
    // November 2026
    { date: "2026-11-09", title: "Bulan Baru di Scorpio", detail: "Awal siklus baru yang mendorong transformasi batin, keberanian menghadapi kedalaman, dan langkah nyata." },
    { date: "2026-11-13", title: "Merkurius kembali direct di Scorpio", detail: "Fase peninjauan komunikasi berakhir dan kejelasan mulai terbentuk kembali." },
    { date: "2026-11-13", title: "Venus kembali direct di Libra", detail: "Evaluasi relasi dan nilai memasuki fase yang lebih maju dan terbuka." },
    { date: "2026-11-22", title: "Matahari memasuki Sagittarius", detail: "Musim Sagittarius dimulai — tema ekspansi, kebebasan, petualangan, dan visi jangka panjang menguat." },
    { date: "2026-11-24", title: "Bulan Purnama di Gemini", detail: "Puncak lunar di Gemini menyoroti komunikasi, pertukaran ide, dan keputusan yang tertunda." },
    { date: "2026-11-28", title: "Venus memasuki Scorpio", detail: "Energi cinta dan relasi bergerak ke dalam, intensif, dan penuh kedalaman emosional." },
    // Desember 2026
    { date: "2026-12-08", title: "Bulan Baru di Sagittarius", detail: "Saat ideal untuk menetapkan niat besar, merencanakan perjalanan, atau memulai studi baru." },
    { date: "2026-12-20", title: "Merkurius memasuki Capricorn", detail: "Pola pikir bergeser ke arah yang lebih strategis, terstruktur, dan berorientasi pada hasil." },
    { date: "2026-12-21", title: "Matahari memasuki Capricorn (Solstis)", detail: "Titik balik musim dan awal musim Capricorn — fokus pada struktur, tujuan, dan fondasi jangka panjang." },
    { date: "2026-12-23", title: "Bulan Purnama di Cancer", detail: "Puncak lunar di Cancer menonjolkan kebutuhan akan keamanan emosional, keluarga, dan rumah." },
    { date: "2026-12-30", title: "Venus memasuki Sagittarius", detail: "Energi cinta bergerak bebas — cocok untuk petualangan bersama dan hubungan yang penuh semangat." },
    // Januari 2027
    { date: "2027-01-07", title: "Bulan Baru di Capricorn", detail: "Niat baru di awal tahun — waktu terbaik untuk menetapkan tujuan nyata dan langkah pertama." },
    { date: "2027-01-13", title: "Merkurius retrograde di Aquarius", detail: "Fase peninjauan ulang rencana ke depan, gagasan besar, dan komunikasi digital — tunda keputusan besar." },
    { date: "2027-01-19", title: "Matahari memasuki Aquarius", detail: "Musim Aquarius dimulai — tema inovasi, kebebasan berpikir, dan kontribusi kolektif menonjol." },
    { date: "2027-01-22", title: "Bulan Purnama di Leo", detail: "Puncak lunar di Leo mendorong ekspresi diri, kreativitas, dan kepercayaan diri yang otentik." },
    // Februari 2027
    { date: "2027-02-03", title: "Merkurius kembali direct di Capricorn", detail: "Kejelasan kembali hadir — rencana dan komunikasi yang tertunda kini bisa dilanjutkan." },
    { date: "2027-02-05", title: "Bulan Baru di Aquarius", detail: "Saat ideal untuk memulai proyek inovatif, memperluas jaringan, dan berpikir di luar kebiasaan." },
    { date: "2027-02-18", title: "Matahari memasuki Pisces", detail: "Musim Pisces dimulai — tema intuisi, empati, kreativitas, dan pelepasan hal lama menguat." },
    { date: "2027-02-20", title: "Bulan Purnama di Virgo", detail: "Puncak lunar di Virgo mendorong evaluasi kesehatan, rutinitas, dan detail yang perlu diperbaiki." },
    // Maret 2027
    { date: "2027-03-07", title: "Bulan Baru di Pisces", detail: "Awal siklus yang mendalam — cocok untuk refleksi, penyembuhan, dan niat yang bersifat spiritual." },
    { date: "2027-03-20", title: "Matahari memasuki Aries (Ekuinoks)", detail: "Awal musim semi astrologi — siklus zodiak baru dimulai, tema keberanian dan awal segar menggelora." },
    { date: "2027-03-22", title: "Bulan Purnama di Libra", detail: "Puncak lunar di Libra menyoroti keseimbangan, keadilan dalam hubungan, dan keputusan yang adil." },
  ];

  function dateKey(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  }

  function displayDate(date) {
    return new Intl.DateTimeFormat("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(date);
  }

  const ASTRO_EVENTS_API = "https://api.cosmyday.com/events/upcoming?days=400&limit=200&min_importance=0";
  let activePlanetaryEvents = PLANETARY_EVENTS;
  let astroDataSource = "Data cadangan lokal";

  function localizeAstroText(text) {
    return text
      .replace(/Mercury/g, "Merkurius")
      .replace(/Venus/g, "Venus")
      .replace(/Sun/g, "Matahari")
      .replace(/Full Moon/g, "Bulan Purnama")
      .replace(/New Moon/g, "Bulan Baru")
      .replace(/Moon/g, "Bulan")
      .replace(/goes retrograde/g, "memasuki retrograde")
      .replace(/stations retrograde/g, "memasuki retrograde")
      .replace(/turns direct/g, "kembali direct")
      .replace(/stations direct/g, "kembali direct")
      .replace(/enters/g, "memasuki")
      .replace(/season begins/g, "memulai musim")
      .replace(/retrograde/g, "retrograde")
      .replace(/Scorpio/g, "Scorpio")
      .replace(/Libra/g, "Libra")
      .replace(/Taurus/g, "Taurus")
      .replace(/Sagittarius/g, "Sagittarius")
      .replace(/Aquarius/g, "Aquarius")
      .replace(/Capricorn/g, "Capricorn")
      .replace(/Pisces/g, "Pisces")
      .replace(/Leo/g, "Leo")
      .replace(/Virgo/g, "Virgo")
      .replace(/Cancer/g, "Cancer")
      .replace(/Gemini/g, "Gemini")
      .replace(/Aries/g, "Aries");
  }

  async function loadPlanetaryEvents() {
    try {
      const response = await fetch(ASTRO_EVENTS_API, { headers: { Accept: "application/json" } });
      if (!response.ok) throw new Error(`Astrology feed returned ${response.status}`);
      const payload = await response.json();
      if (!Array.isArray(payload.events)) throw new Error("Astrology feed has no events array");
      const events = payload.events
        .filter((event) => typeof event.date === "string" && typeof event.headline === "string")
        .map((event) => ({
          date: event.date,
          title: localizeAstroText(event.headline),
          detail: localizeAstroText(event.short || event.long || "Peristiwa astrologi dari feed Swiss Ephemeris."),
        }));
      if (!events.length) throw new Error("Astrology feed returned no usable events");
      activePlanetaryEvents = events;
      astroDataSource = "CosmyDay · Swiss Ephemeris";
      renderAstrologyEvents();
    } catch {
      astroDataSource = "Data cadangan lokal · feed CosmyDay tidak tersedia";
      renderAstrologyEvents();
    }
  }

  function renderAstrologyEvents() {
    const panel = $("#collectiveLoading");
    if (!panel) return;
    const today = new Date();
    const todayKey = dateKey(today);
    const todayEvents = activePlanetaryEvents.filter((event) => event.date === todayKey);
    const upcoming = activePlanetaryEvents
      .filter((event) => event.date > todayKey && event.date.slice(0, 4) === String(today.getFullYear()))
      .slice(0, 4);
    const eventItems = todayEvents.length
      ? todayEvents.map((event) => `<li class="astro-event"><span><strong>${event.title}</strong><small>${event.detail}</small></span></li>`).join("")
      : `<li class="astro-event"><span><strong>Matahari berada di ${SIGNS[sunSignIndex(today.getMonth() + 1, today.getDate())]}</strong><small>Tidak ada pergantian besar yang tercatat untuk tanggal ini. Siklus planet tetap bergerak dan akan diperbarui mengikuti kalender tahun berjalan.</small></span></li>`;
    const upcomingMarkup = upcoming.length
      ? `<div class="astro-upcoming"><strong>Peristiwa berikutnya tahun ini</strong><br>${upcoming.map((event) => `${displayDate(new Date(`${event.date}T12:00:00`))} — ${event.title}`).join("<br>")}</div>`
      : `<div class="astro-upcoming"><strong>Perbarui besok</strong><br>Kalender akan memeriksa kembali peristiwa planet pada pergantian tanggal berikutnya.</div>`;
    const monthKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
    const monthEvents = activePlanetaryEvents.filter((event) => event.date.slice(0, 7) === monthKey);
    const monthlyMarkup = monthEvents.length
      ? `<div class="astro-upcoming"><strong>Peristiwa kosmik bulan ini</strong><br>${monthEvents.map((event) => `${displayDate(new Date(`${event.date}T12:00:00`))} — ${event.title}`).join("<br>")}</div>`
      : `<div class="astro-upcoming"><strong>Peristiwa kosmik bulan ini</strong><br>Belum ada peristiwa yang tercatat untuk bulan ini.</div>`;
    panel.innerHTML = `<div class="astro-events"><div class="astro-events-head"><div><div class="astro-events-kicker">Event astrologi hari ini</div><div class="astro-events-date">${displayDate(today)}</div></div><div class="astro-events-updated">Diperbarui ${new Intl.DateTimeFormat("id-ID", { hour: "2-digit", minute: "2-digit" }).format(today)}<br><small>${astroDataSource}</small></div></div><ul class="astro-events-list">${eventItems}</ul>${upcomingMarkup}${monthlyMarkup}</div>`;
    panel.hidden = false;
  }

  /* ====================================================
     BAGIAN 1 — KALKULASI ASTROLOGI
     ==================================================== */

  // Tanda-tanda zodiak (INTERNAL — tidak ditampilkan ke pengguna)
  const SIGNS = [
    "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
    "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
  ];

  // Batas tanggal untuk Sun sign (tropical)
  // [bulan, hari] awal setiap tanda (dimulai Aries 21 Maret)
  const SUN_RANGES = [
    { s: 0, e: { m: 3, d: 21 } }, // Aries
    { s: 1, e: { m: 4, d: 20 } }, // Taurus
    { s: 2, e: { m: 5, d: 21 } }, // Gemini
    { s: 3, e: { m: 6, d: 22 } }, // Cancer
    { s: 4, e: { m: 7, d: 23 } }, // Leo
    { s: 5, e: { m: 8, d: 23 } }, // Virgo
    { s: 6, e: { m: 9, d: 23 } }, // Libra
    { s: 7, e: { m: 10, d: 22 } }, // Scorpio
    { s: 8, e: { m: 11, d: 22 } }, // Sagittarius
    { s: 9, e: { m: 12, d: 20 } }, // Capricorn
    { s: 10, e: { m: 1, d: 19 } }, // Aquarius
    { s: 11, e: { m: 2, d: 18 } }, // Pisces
  ];

  function sunSignIndex(month, day) {
    // month: 1-12, day: 1-31
    const startRanges = [
      [3, 21], [4, 20], [5, 21], [6, 22], [7, 23], [8, 23],
      [9, 23], [10, 22], [11, 22], [12, 20], [1, 19], [2, 18],
    ];
    // Cek dari belakang: tanda dimulai sebelum/tanggal input
    let idx = 11; // Pisces default
    for (let i = 0; i < 12; i++) {
      const [m, d] = startRanges[i];
      if (month < m || (month === m && day < d)) {
        idx = (i + 11) % 12;
        return idx;
      }
    }
    return 0; // Aries (setelah 21 Maret)
  }

  // Konversi DD/MM/YYYY + HH:MM ke Julian Day
  function toJulianDay(year, month, day, hour, minute) {
    // Metode Meeus
    let y = year, m = month;
    if (m <= 2) { y -= 1; m += 12; }
    const a = Math.floor(y / 100);
    const b = 2 - a + Math.floor(a / 4);
    const jd =
      Math.floor(365.25 * (y + 4716)) +
      Math.floor(30.6001 * (m + 1)) +
      day + b - 1524.5;
    return jd + (hour + minute / 60) / 24;
  }

  // Moon sign (aproksimasi lintang ekliptika bulan)
  function moonSignIndex(jd) {
    const d = jd - 2451545.0;
    const L = norm(218.316 + 13.176396 * d); // mean longitude
    const M = norm(134.963 + 13.064993 * d); // mean anomaly
    const moonLong = norm(L + 6.289 * Math.sin(deg2rad(M)));
    return Math.floor(moonLong / 30);
  }

  // Sun ecliptic longitude (untuk sidereal time)
  function sunLongitude(jd) {
    const d = jd - 2451545.0;
    const L = norm(280.46 + 0.9856474 * d);
    const g = norm(357.528 + 0.9856003 * d);
    return norm(L + 1.915 * Math.sin(deg2rad(g)) + 0.02 * Math.sin(deg2rad(2 * g)));
  }

  function deg2rad(d) { return (d * Math.PI) / 180; }
  function rad2deg(r) { return (r * 180) / Math.PI; }

  // Local Sidereal Time (jam)
  function localSiderealTime(jd, longitudeDeg) {
    const gmst = 18.697374558 + 24.06570982441908 * (jd - 2451545.0);
    const lst = mod(gmst + longitudeDeg / 15, 24);
    return lst;
  }

  // Rising sign (Ascendant)
  function risingSignIndex(jd, latitudeDeg, longitudeDeg) {
    const lstHours = localSiderealTime(jd, longitudeDeg);
    const ramc = norm(lstHours * 15); // derajat
    const eps = 23.4397; // obliquity
    // ASC = atan2(cos(RAMC), -(sin(RAMC)*cos(eps) + tan(phi)*sin(eps)))
    const y = Math.cos(deg2rad(ramc));
    const x = -(Math.sin(deg2rad(ramc)) * Math.cos(deg2rad(eps)) + Math.tan(deg2rad(latitudeDeg)) * Math.sin(deg2rad(eps)));
    let asc = norm(rad2deg(Math.atan2(y, x)));
    return Math.floor(asc / 30);
  }

  // Database koordinat kota ( Indonesia + beberapa kota besar dunia)
  const CITIES = {
    jakarta: { lat: -6.21, lon: 106.85 }, bandung: { lat: -6.92, lon: 107.61 },
    surabaya: { lat: -7.25, lon: 112.75 }, medan: { lat: 3.59, lon: 98.67 },
    semarang: { lat: -6.97, lon: 110.42 }, makassar: { lat: -5.14, lon: 119.43 },
    palembang: { lat: -2.99, lon: 104.76 }, denpasar: { lat: -8.67, lon: 115.22 },
    yogyakarta: { lat: -7.8, lon: 110.37 }, balikpapan: { lat: -1.27, lon: 116.82 },
    banjarmasin: { lat: -3.32, lon: 114.59 }, padang: { lat: -0.95, lon: 100.35 },
    pekanbaru: { lat: 0.51, lon: 101.45 }, manado: { lat: 1.49, lon: 124.84 },
    pontianak: { lat: -0.03, lon: 109.32 }, surakarta: { lat: -7.58, lon: 110.83 },
    malang: { lat: -7.98, lon: 112.63 }, samarinda: { lat: -0.6, lon: 117.15 },
    jayapura: { lat: -2.59, lon: 140.69 }, kupang: { lat: -10.18, lon: 123.61 },
    bogor: { lat: -6.6, lon: 106.8 }, tangerang: { lat: -6.18, lon: 106.63 },
    bekasi: { lat: -6.24, lon: 107.0 }, depok: { lat: -6.4, lon: 106.83 },
    batam: { lat: 1.05, lon: 104.0 }, bali: { lat: -8.34, lon: 115.09 },
    "kuala lumpur": { lat: 3.14, lon: 101.69 }, singapore: { lat: 1.35, lon: 103.82 },
    tokyo: { lat: 35.68, lon: 139.69 }, "new york": { lat: 40.71, lon: -74.01 },
    london: { lat: 51.51, lon: -0.13 }, sydney: { lat: -33.87, lon: 151.21 },
    paris: { lat: 48.85, lon: 2.35 }, dubai: { lat: 25.2, lon: 55.27 },
    "hong kong": { lat: 22.32, lon: 114.17 }, seoul: { lat: 37.57, lon: 126.98 },
    bangkok: { lat: 13.76, lon: 100.5 }, manila: { lat: 14.6, lon: 120.98 },
    "los angeles": { lat: 34.05, lon: -118.24 }, berlin: { lat: 52.52, lon: 13.4 },
  };

  function resolveCoords(place) {
    if (!place) return null;
    const key = place.toLowerCase().trim();
    if (CITIES[key]) return CITIES[key];
    // Cari kota yang mengandung kata kunci
    for (const k of Object.keys(CITIES)) {
      if (key.includes(k) || k.includes(key)) return CITIES[k];
    }
    return null;
  }

  // Hash deterministik untuk kota tak dikenal (agar hasil stabil)
  function hashStr(s) {
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h;
  }

  // Parsing input tanggal dari elemen <input type="date"> (format YYYY-MM-DD)
  function parseDate(str) {
    if (!str) return null;
    const m = str.trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!m) return null;
    const y = parseInt(m[1], 10), mo = parseInt(m[2], 10), d = parseInt(m[3], 10);
    if (mo < 1 || mo > 12 || d < 1 || d > 31) return null;
    const dt = new Date(y, mo - 1, d);
    if (dt.getDate() !== d || dt.getMonth() !== mo - 1 || dt.getFullYear() !== y) return null;
    return { d, mo, y };
  }

  // Parsing input waktu dari elemen <input type="time"> (format HH:MM)
  // Jika kosong, default ke 12:00
  function parseTime(str) {
    if (!str || !str.trim()) return { h: 12, mi: 0 };
    const m = str.trim().match(/^(\d{1,2}):(\d{2})$/);
    if (!m) return null;
    const h = parseInt(m[1], 10), mi = parseInt(m[2], 10);
    if (h < 0 || h > 23 || mi < 0 || mi > 59) return null;
    return { h, mi };
  }

  // Hitung tiga tanda inti
  function computeTriad(place, dateStr, timeStr) {
    const date = parseDate(dateStr);
    const time = parseTime(timeStr);
    if (!date || !time) return null;

    let coords = resolveCoords(place);
    let lat, lon;
    if (coords) {
      lat = coords.lat; lon = coords.lon;
    } else {
      // Fallback deterministik berbasis hash kota
      const h = hashStr(place.toLowerCase());
      lat = ((h % 13000) / 100 - 60); // -60..70
      lon = (((h >> 12) % 36000) / 100 - 180); // -180..180
    }

    const jd = toJulianDay(date.y, date.mo, date.d, time.h, time.mi);
    const sun = sunSignIndex(date.mo, date.d);
    const moon = moonSignIndex(jd);
    const rising = risingSignIndex(jd, lat, lon);

    return { sun, moon, rising, jd, lat, lon, place };
  }

  /* ====================================================
     BAGIAN 2 — PROFIL ENERGI (per tanda, tanpa istilah)
     ==================================================== */

  // Setiap tanda punya: essence, dampak[], do[], dont[]
  const PROFILES = [
    { // Aries
      essence: "Energimu berkobar dengan dorongan untuk memulai. Hari ini ideal untuk mengambil langkah pertama atas hal yang lama kamu tunda.",
      impact: ["Semangat untuk memulai hal baru sedang berapi-api", "Keberanian dalam mengambil keputusan cepat meningkat", "Potensi gesekan jika ego terlampau tinggi"],
      do: ["Ambil langkah pertama pada proyek yang tertunda", "Kanalkan energi melalui aktivitas fisik", "Memimpin dengan ketegasan yang adil"],
      dont: ["Terburu-buru bertindak tanpa pertimbangan", "Memaksakan pendapat hingga menyinggung orang lain", "Memulai konflik yang tidak perlu"],
    },
    { // Taurus
      essence: "Energimu menuntut ketenangan dan kestabilan. Nilai kesabangan akan terasa sangat berdaya hari ini.",
      impact: ["Kebutuhan akan kenyamanan dan keamanan meningkat", "Ketekunan dalam menyelesaikan tugas membuahkan hasil", "Kecenderungan menolak perubahan mendadak"],
      do: ["Nikmati momen sederhana dengan penuh kesadaran", "Tetap konsisten pada rutinitas yang menenangkan", "Perhatikan kebutuhan tubuh dengan lebih baik"],
      dont: ["Bertahan pada keadaan yang sudah tidak sehat", "Terlalu kaku menolak setiap perubahan", "Berlebihan menikmati hal-hal materiil"],
    },
    { // Gemini
      essence: "Pikiran bergerak cepat dan rasa ingin tahu memuncak. Hari ini cocok untuk belajar, berdialog, dan bertukar gagasan.",
      impact: ["Komunikasi terasa lebih lincah dan mengalir", "Banyak ide bermunculan dalam waktu singkat", "Sulit fokus pada satu hal terlalu lama"],
      do: ["Tuliskan ide-ide yang muncul sebelum terlupakan", "Berdialog dengan orang berbeda sudut pandang", "Belajar hal baru dalam waktu singkat"],
      dont: ["Membicarakan hal yang belum pasti kebenarannya", "Menyebar perhatian ke terlalu banyak hal", "Mengabaikan menyelesaikan apa yang sudah dimulai"],
    },
    { // Cancer
      essence: "Energi mengarah ke dalam, mendekat pada perasaan dan orang terkasih. Kehangatan emosional menjadi kekuatan utama.",
      impact: ["Sensitivitas emosional meningkat tajam", "Kebutuhan akan rasa aman dan kebersamaan menguat", "Intuisi tentang orang terdebat sangat akurat"],
      do: ["Luangkan waktu berkualitas bersama keluarga", "Dengarkan intuisi tentang orang terdekat", "Ciptakan suasana hangat di rumah"],
      dont: ["Menyimpan perasaan hingga berakumulasi", "Mengambil tindakan saat emosi sedang labil", "Menarik diri berlebihan dari lingkungan"],
    },
    { // Leo
      essence: "Percaya diri memuncak dan ingin berkontribusi tampil. Energi hangat untuk berbagi terasa sangat kuat hari ini.",
      impact: ["Rasa percaya diri dan karisma meningkat", "Kreativitas dalam berekspresi memuncak", "Risiko terlalu mendominasi panggung"],
      do: ["Bagikan karya dan ide dengan percaya diri", "Berikan apresiasi tulus pada orang lain", "Berikan perhatian pada hobi kreatif"],
      dont: ["Mencari perhatian dengan cara berlebihan", "Mengabaikan kontribusi orang sekitar", "Bersikap sombong atas pencapaian"],
    },
    { // Virgo
      essence: "Energi menuntut ketelitian dan keteraturan. Detail kecil yang biasanya terlewat akan terasa penting hari ini.",
      impact: ["Kemampuan analisis dan ketelitian meningkat", "Kebutuhan untuk merapikan dan menyusun kembali menguat", "Tendensi terlalu kritis pada diri sendiri"],
      do: ["Susun ulang prioritas dan rapikan keteraturan", "Bantu orang lain dengan cara praktis", "Perhatikan kesehatan dan pola harian"],
      dont: ["Mengejar kesempurnaan hingga kelelahan", "Mengkritik diri sendiri secara berlebihan", "Mengabaikan istirahat demi detail kecil"],
    },
    { // Libra
      essence: "Energi mengarah pada harmoni, keindahan, dan keseimbangan. Hubungan dan kebersamaan menjadi prioritas utama.",
      impact: ["Kebutuhan akan keseimbangan dan keadilan meningkat", "Daya tarik sosial dan kemampuan diplomatis memuncak", "Sulit mengambil keputusan tegas sendirian"],
      do: ["Cari titik tengah dalam setiap perbedaan", "Hiasi hari dengan sentuhan keindahan", "Bangun komunikasi yang seimbang dalam hubungan"],
      dont: ["Mengabaikan kebutuhan diri demi menyenangkan orang", "Menunda keputusan penting terlalu lama", "Menghindari konflik hingga menekan perasaan"],
    },
    { // Scorpio
      essence: "Energimu dalam dan intens. Transformasi batin dan kejujuran emosional akan membawa kekuatan besar hari ini.",
      impact: ["Intensitas emosional dan ketajaman batin meningkat", "Kemampuan membaca situasi tersembunyi sangat kuat", "Risiko larut dalam dendam atau curiga berlebih"],
      do: ["Hadapi perasaan yang lama dihindari", "Lakukan refleksi mendalam tentang arah hidup", "Ubah hal yang tidak lagi relevan menjadi kesempatan"],
      dont: ["Menahan dendam atau kecurigaan tanpa alasan", "Mendominasi atau mengontrol orang terdekat", "Menggali rahasia orang lain tanpa keperluan"],
    },
    { // Sagittarius
      essence: "Energi membara untuk merengkuh lebih banyak. Semangat petualangan dan optimisme mengisi hari dengan gerak.",
      impact: ["Rasa bebas dan keinginan menjelajah menguat", "Optimisme serta visi jangka panjang memuncak", "Tendensi bertindak terlalu cepat tanpa baseline"],
      do: ["Rencanakan perjalanan atau pengalaman baru", "Perluas wawasan lewat buku atau diskusi", "Bagikan optimisme untuk mengangkat semangat orang"],
      dont: ["Mengabaikan konsekuensi jangka panjang", "Berjanji lebih dari yang bisa ditepati", "Terlampau longgar pada tanggung jawab"],
    },
    { // Capricorn
      essence: "Energimu tertuju pada struktur dan pencapaian. Disiplin dan tanggung jawab akan membuahkan hasil nyata.",
      impact: ["Fokus pada tujuan jangka panjang menguat", "Rasa tanggung jawab dan disiplin meningkat", "Risiko terlalu kaku dan melupakan keseimbangan"],
      do: ["Susun tujuan konkret dan langkah-langkahnya", "Hargai pencapaian kecil di sepanjang jalan", "Bangun fondasi yang akan bertahan lama"],
      dont: ["Bekerja hingga melupakan kesehatan dan istirahat", "Menolak bantuan karena merasa harus mandiri", "Terlalu keras pada diri sendiri maupun orang lain"],
    },
    { // Aquarius
      essence: "Pikiran melompat jauh ke depan. Energi inovasi dan jiwa kemanusiaan mendorong untuk berpikir di luar kebiasaan.",
      impact: ["Kreativitas tak terduga dan gagasan unik bermunculan", "Kepedulian pada hal-hal luas memuncak", "Tendensi melihat diri terlalu berbeda hingga terasing"],
      do: ["Bagikan ide-ide unik yang muncul", "Terlibat dalam kegiatan yang bermanfaat bagi banyak orang", "Berpikir di luar pola yang sudah baku"],
      dont: ["Terlampau menolak aturan tanpa alasan jelas", "Mengabaikan perasaan orang terdekat", "Menjaga jangan terlalu jauh hingga terasing"],
    },
    { // Pisces
      essence: "Energimu lembut, peka, dan menyatu dengan sekitar. Hari ini imajinasi dan empati menjadi pemandu utama.",
      impact: ["Sensitivitas dan daya imajinasi meningkat tajam", "Empati terhadap perasaan orang lain sangat kuat", "Risiko mudah larut dan kehilangan batas diri"],
      do: ["Luangkan waktu untuk kreativitas dan seni", "Bantu orang dengan kepedulian tulus", "Beristirahat di lingkungan yang tenang"],
      dont: ["Menyerap emosi negatif orang hingga lelah", "Mengabaikan batas antara diri dan orang lain", "Menghindari kenyataan dengan cara tidak sehat"],
    },
  ];

  // Modulasi tambahan berbasis tanda Moon & Rising untuk variasi personal
  const MOON_FLAVOR = [
    "Emosi hari ini cenderung terasa lebih kuat dari biasanya.",
    "Ada kelembutan batin yang membuatmu lebih peka pada suasana sekitar.",
    "Suasana hati bergerak dinamis—kadang tenang, kadang bergairah.",
    "Perasaan lebih mudah tersentuh dan butuh kehangatan.",
    "Kebutuhan untuk diakui dan diperhatikan sedang meningkat.",
    "Ketenangan batin datang dari rutinitas yang rapi dan teratur.",
    "Keseimbangan emosi tercapai lewat kebersamaan yang harmonis.",
    "Ada intensitas dalam perasaan yang perlu dikanal dengan sehat.",
    "Semangat bebas ingin lepas dari beban emosional.",
    "Tanggung jawab emosional terasa berat namun mendewasakan.",
    "Ide-ide tentang masa depan mengangkat suasana hati.",
    "Imajinasi dan lembut hati menjadi sumber kekuatan hari ini.",
  ];

  const RISING_FLAVOR = [
    "Cara kamu memandang dunia hari ini terasa lebih berani.",
    "Kesan pertama yang kamu berikan terasa hangat dan menenangkan.",
    "Percakapan singkat akan membuka banyak pintu keberuntungan.",
    "Kehadiranmu membawa kenyamanan bagi orang di sekitar.",
    "Sinar percaya diri kamu menarik perhatian positif.",
    "Ketelitian kecil yang kamu lakukan akan dihargai banyak orang.",
    "Keanggunan dalam sikap membuat suasana menjadi selaras.",
    "Aura misteriusmu membuat orang penasaran dan tertarik.",
    "Energi petualanganmu menginspirasi orang untuk ikut bergerak.",
    "Ketenangan dan ketegasanmu membawa rasa aman pada lingkungan.",
    "Gagasan unikmu menarik simpati orang yang berpikiran terbuka.",
    "Kelembutan dan kedalamanmu menyentuh hati banyak orang.",
  ];

  function buildPersonalReading(triad) {
    const sun = PROFILES[triad.sun];
    const moonIdx = triad.moon;
    const risingIdx = triad.rising;

    // Essence: gabungan sun essence + flavor moon + rising
    const essence = `${sun.essence} ${MOON_FLAVOR[moonIdx]} ${RISING_FLAVOR[risingIdx]}`;

    // Dampak: dari Sun + satu titik tambahan dari Moon-flavor impact
    const impact = [...sun.impact];

    // Do's: gabungan Sun do + satu dari Rising-flavor terjemahan
    const doList = [...sun.do];
    // Tambah do spesifik dari Rising
    const risingDo = [
      "Tampilkan sisi pemberani dalam tindakan kecil",
      "Sapa orang baru dengan senyum tulus",
      "Mulailah percakapan ringan yang menyenangkan",
      "Ciptakan kenyamanan di sekitarmu",
      "Berkarya dengan percaya diri penuh",
      "Rapikan satu hal kecil yang mengganggu",
      "Jaga keseimbangan dalam setiap keputusan",
      "Hadapi situasi dengan ketenangan dalam",
      "Jelajah lingkungan baru sejenak",
      "Bangun struktur harian yang kokoh",
      "Bagikan ide unikmu tanpa ragu",
      "Dengarkan suara hati dengan tenang",
    ];
    doList.push(risingDo[risingIdx]);

    // Don'ts: dari Sun dont + satu dari Moon
    const dontList = [...sun.dont];
    const moonDont = [
      "Menyalahkan suasana hati pada hal luar",
      "Mengabaikan kebutuhan istirahat emosional",
      "Berpura-pura tidak peduli pada perasaan",
      "Menekan perasaan hingga meluap tiba-tiba",
      "Mencari validasi berlebih dari luar",
      "Terlalu kritis pada kerentanan diri",
      "Mengorbankan kebutuhan diri demi harmoni",
      "Larut dalam kecurigaan tanpa dasar",
      "Lari dari tanggung jawab emosional",
      "Memikul beban orang lain berlebihan",
      "Terlalu asing dari lingkungan terdekat",
      "Mengabaikan batas sehat antar diri dan orang",
    ];
    dontList.push(moonDont[moonIdx]);

    return { essence, impact, do: doList, dont: dontList };
  }

  /* ====================================================
     BAGIAN 3 — ENERGI KOLEKTIF
     ==================================================== */

  // Pool dampak / do / dont kolektif (bebas istilah astronomi)
  const COLLECTIVE_POOL = {
    impact: [
      "Arus energi hari ini mendorong keberanian untuk mengambil keputusan yang lama tertunda.",
      "Ada dorongan kuat untuk merapikan kembali prioritas hidup yang sempat berantakan.",
      "Energi komunikasi memuncak—banyak ide bermunculan, namun sulit untuk diam diam.",
      "Suasana emosional terasa lebih peka dari biasanya; kelembutan akan sangat berharga.",
      "Semangat untuk memulai sesuatu yang baru terasa sangat kuat dan menggugah.",
      "Kebutuhan akan keseimbangan antara waktu untuk diri dan orang lain menjadi menonjol.",
      "Ada tekanan halus untuk melepaskan hal yang sudah tidak lagi melayani pertumbuhan.",
      "Kreativitas dan daya imajinasi meningkat—waktu ideal untuk berekspresi.",
      "Rasa ingin tahu dan semangat belajar sedang memuncak secara kolektif.",
      "Ketelitian dan perhatian pada detail kecil akan terasa sangat berguna.",
      "Ada dorongan untuk menyelesaikan konflik lama dan membuka lembaran baru.",
      "Energi ketenangan menguat—banyak orang akan merasa butuh waktu hening.",
      "Keinginan untuk memperluas wawasan dan pengalaman sedang menggelora.",
      "Fokus pada tujuan jangka panjang terasa lebih kuat dan jelas arahnya.",
      "Gagasan-gagasan tak lazim akan terasa menarik dan layak dipertimbangkan.",
      "Empati kolektif meningkat—banyak hati terasa lebih terbuka satu sama lain.",
    ],
    do: [
      "Luangkan waktu hening untuk mendengarkan suara hati sendiri.",
      "Tulis ide-ide yang muncul sebelum terlewat oleh kesibukan.",
      "Berdialog terbuka dengan orang yang berbeda sudut pandang.",
      "Kanal emosi lewat aktivitas kreatif atau seni yang kamu sukai.",
      "Rapikan satu hal kecil yang sudah lama mengganggu.",
      "Sampaikan apresiasi tulus pada orang yang berarti.",
      "Susun ulang prioritas agar lebih jelas dan terarah.",
      "Bergerak ringan—jalan singkat atau peregangan menyegarkan.",
      "Cari titik tengah dalam perbedaan pendapat yang muncul.",
      "Hadir sepenuhnya saat bersama orang terkasih.",
      "Lakukan satu hal kecil untuk merawat tubuh dengan lebih baik.",
      "Berbagi optimisme untuk mengangkat semangat orang sekitar.",
      "Sapa seseorang yang sudah lama tidak terhubung.",
      "Catat tujuan kecil yang ingin diraih minggu ini.",
      "Ciptakan suasana hangat di rumah atau ruang kerja.",
      "Percaya pada intuisi saat menghadapi pilihan kecil.",
    ],
    dont: [
      "Mengambil keputusan besar saat emosi sedang bergejolak.",
      "Membicarakan hal yang belum pasti kebenarannya.",
      "Menunda ngomong terus-menerus tanpa tindakan nyata.",
      "Menyerap emosi negatif orang lain hingga melampaui batas.",
      "Terlalu kaku menolak setiap perubahan yang muncul.",
      "Mencari perdebatan yang tidak benar-benar perlu.",
      "Bertindak terburu-buru tanpa pertimbangan matang.",
      "Mengabaikan istirahat demi mengejar target.",
      "Menekan perasaan hingga meluap di waktu yang tidak tepat.",
      "Memaksakan pendapat hingga menyinggung orang lain.",
      "Menjaga jarak berlebihan dari orang yang sebenarnya butuh kehadiranmu.",
      "Mengabaikan tanda-tanda kelelahan dari tubuh sendiri.",
      "Menggali rahasia orang lain tanpa keperluan yang jelas.",
      "Berjanji lebih dari yang benar-benar bisa ditepati.",
      "Mengorbankan kebutuhan diri demi menyenangkan semua orang.",
      "Mengulur waktu pada hal yang sudah jelas harus dilepaskan.",
    ],
  };

  // Seed deterministik harian
  function dailySeed() {
    const d = new Date();
    return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
  }

  // PRNG sederhana (mulberry32)
  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function pickN(arr, n, rng) {
    const copy = arr.slice();
    const out = [];
    for (let i = 0; i < n && copy.length; i++) {
      const idx = Math.floor(rng() * copy.length);
      out.push(copy.splice(idx, 1)[0]);
    }
    return out;
  }

  function explainCollectiveImpact(impact) {
    return `${impact} Artinya, pola ini menggambarkan tema yang mungkin terasa dalam suasana bersama, tetapi bukan pengalaman yang pasti sama bagi setiap orang. Tujuannya adalah membantu membaca kebutuhan yang sedang muncul, memahami pilihan dengan lebih jernih, lalu menerjemahkannya menjadi langkah yang sadar dan realistis.`;
  }

  function buildCollectiveReading() {
    const rng = mulberry32(dailySeed());
    return {
      impact: pickN(COLLECTIVE_POOL.impact, 4, rng).map(explainCollectiveImpact),
      do: pickN(COLLECTIVE_POOL.do, 5, rng),
      dont: pickN(COLLECTIVE_POOL.dont, 4, rng),
    };
  }

  /* ----------------------------------------------------
     Render energi kolektif (dengan percobaan fetch + fallback)
     ---------------------------------------------------- */
  async function loadCollective() {
    const statusEl = $("#collectiveStatus");
    const loadingEl = $("#collectiveLoading");
    const contentEl = $("#collectiveContent");
    const refreshBtn = $("#refreshCollective");
    const copyBtn = $("#copyCollective");

    statusEl.textContent = "Menyaring arus energi kosmis terkini…";
    loadingEl.hidden = false;
    contentEl.hidden = true;
    if (refreshBtn) refreshBtn.hidden = true;
    if (copyBtn) copyBtn.hidden = true;

    // Energi kolektif dihitung dari kalkulasi internal harian yang stabil.
    // Setiap hari menghasilkan kombinasi unik berdasarkan tanggal.
    await new Promise((r) => setTimeout(r, 600));

    const data = buildCollectiveReading();

    renderList("#impactList", data.impact);
    renderList("#doList", data.do);
    renderList("#dontList", data.dont);

    loadingEl.hidden = false;
    renderAstrologyEvents();
    contentEl.hidden = false;
    if (refreshBtn) refreshBtn.hidden = false;
    if (copyBtn) copyBtn.hidden = false;
    statusEl.textContent = "Update energi hari ini telah difilter dan diterjemahkan secara kolektif.";
  }

  async function copyCollectiveUpdate() {
    const statusEl = $("#copyStatus");
    const copyBtn = $("#copyCollective");
    const copiedAt = new Date();
    const copiedAtText = `${displayDate(copiedAt)} pukul ${new Intl.DateTimeFormat("id-ID", { hour: "2-digit", minute: "2-digit" }).format(copiedAt)}`;
    const sections = [
      "# UPDATE ENERGI KOSMIS",
      `_${$("#heroDate")?.textContent || displayDate(copiedAt)}_`,
      "",
      "## DAMPAK KOLEKTIF",
      ...Array.from(document.querySelectorAll("#impactList li"), (item) => `- ${item.textContent}`),
      "",
      "## YANG DIANJURKAN",
      ...Array.from(document.querySelectorAll("#doList li"), (item) => `- ${item.textContent}`),
      "",
      "## YANG DILARANG",
      ...Array.from(document.querySelectorAll("#dontList li"), (item) => `- ${item.textContent}`),
      "",
      "## PERISTIWA ASTROLOGI",
      $("#collectiveLoading")?.textContent?.trim() || "",
      "",
      `Disalin pada ${copiedAtText} melalui https://8xploit.github.io/EnergyUpdate by Kapten Nemo.`,
    ];
    const text = sections.join("\n");
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const helper = document.createElement("textarea");
      helper.value = text;
      helper.setAttribute("readonly", "");
      helper.style.position = "fixed";
      helper.style.opacity = "0";
      document.body.appendChild(helper);
      helper.select();
      document.execCommand("copy");
      helper.remove();
    }
    if (statusEl) statusEl.textContent = "Update tersalin";
    if (copyBtn) {
      copyBtn.textContent = "Tersalin";
      window.setTimeout(() => {
        copyBtn.textContent = "Salin Update";
        if (statusEl) statusEl.textContent = "";
      }, 1800);
    }
  }

  function renderList(sel, items) {
    const ul = $(sel);
    if (!ul) return;
    ul.innerHTML = "";
    items.forEach((txt) => {
      const li = document.createElement("li");
      li.textContent = txt;
      ul.appendChild(li);
    });
  }

  /* ====================================================
     BAGIAN 4 — FORM PERSONAL
     ==================================================== */
  function initForm() {
    const form = $("#personalForm");
    const errEl = $("#formError");
    const resultCard = $("#resultCard");
    if (!form) return;

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      errEl.hidden = true;

      const nameVal = $("#name").value.trim();
      const place = $("#birthPlace").value.trim();
      const dateStr = $("#birthDate").value.trim();
      const timeStr = $("#birthTime").value.trim();

      if (!place) {
        showError("Mohon isi tempat lahir terlebih dahulu.");
        return;
      }
      if (!dateStr) {
        showError("Mohon pilih tanggal lahir Anda.");
        return;
      }
      if (!parseDate(dateStr)) {
        showError("Tanggal lahir tidak valid. Silakan pilih lewat kalender.");
        return;
      }

      const triad = computeTriad(place, dateStr, timeStr);
      if (!triad) {
        showError("Data tidak dapat diproses. Periksa kembali data Anda.");
        return;
      }

      const displayName = nameVal || "Sahabat";
      const reading = buildPersonalReading(triad);
      renderPersonalResult(displayName, place, reading, !nameVal);
      resultCard.hidden = false;
      resultCard.scrollIntoView({ behavior: "smooth", block: "start" });
    });

    function showError(msg) {
      errEl.textContent = msg;
      errEl.hidden = false;
    }
  }

  function renderPersonalResult(name, place, reading, isDefault) {
    $("#resultName").textContent = name;
    $("#resultMeta").textContent = `Lahir di ${place}${isDefault ? "" : ""}`;
    $("#resultEssence").textContent = reading.essence;
    renderList("#personalImpact", reading.impact);
    renderList("#personalDo", reading.do);
    renderList("#personalDont", reading.dont);
  }

  /* ====================================================
     INISIALISASI
     ==================================================== */
  function init() {
    buildStars();
    renderDate();
    initTheme();
    renderAstrologyEvents();
    initScrollUI();
    initForm();
    renderAstrologyEvents();
    loadPlanetaryEvents();
    loadCollective();
    let lastDateKey = dateKey(new Date());
    window.setInterval(() => {
      renderDate();
      renderAstrologyEvents();
      const currentKey = dateKey(new Date());
      if (currentKey !== lastDateKey) {
        lastDateKey = currentKey;
        loadCollective();
      }
    }, 60000);

    const refreshBtn = $("#refreshCollective");
    const copyBtn = $("#copyCollective");
    if (refreshBtn) refreshBtn.addEventListener("click", loadCollective);
    if (copyBtn) copyBtn.addEventListener("click", copyCollectiveUpdate);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
