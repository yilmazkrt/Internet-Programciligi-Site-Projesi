const dateInput = document.getElementById("dateInput");
const calendarPopup = document.getElementById("calendarPopup");
const monthYearLabel = document.getElementById("monthYearLabel");
const calendarDays = document.getElementById("calendarDays");
const prevMonthBtn = document.getElementById("prevMonth");
const nextMonthBtn = document.getElementById("nextMonth");
const timeSlotsContainer = document.getElementById("timeSlots");
const barberButtons = document.querySelectorAll(".barber-btn");
const appointmentForm = document.getElementById("appointmentForm");
const appointmentResult = document.getElementById("appointmentResult");

// Örnek dolu günler ("YYYY-MM-DD" formatında)
const doluGunler = [
    "2026-11-21",
    "2026-11-25",
    "2026-11-28"
];

// Günlere göre örnek dolu saatler ("GG.AA.YYYY": ["SS:DD", ...])
const gunlukDoluSaatler = {
    "19.11.2026": ["11:30", "15:30"],
    "20.11.2026": ["10:30", "16:30"],
    "24.11.2026": ["12:30", "17:30"]
};

// Gün tipine göre çalışma saatleri
const haftaIciSaatler = [
    "09:30", "10:30", "11:30", "12:30", "13:30",
    "14:30", "15:30", "16:30", "17:30", "18:30", "19:30"
];

const cumartesiSaatler = [
    "09:30", "10:30", "11:30", "12:30", "13:30",
    "14:30", "15:30", "16:30", "17:30", "18:30", "19:30", "20:30"
];

const aylar = [
    "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
    "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"
];

let aktifTarih = new Date();
let seciliUsta = "";
let seciliTarihMetni = "";
let seciliSaat = "";

// Usta butonlarına tıklama
barberButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        barberButtons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        seciliUsta = btn.dataset.barber;
    });
});

function gununSaatListesiniGetir(tarihMetni) {
    const [gun, ay, yil] = tarihMetni.split(".").map(Number);
    const tarihObj = new Date(yil, ay - 1, gun);
    const haftaninGunu = tarihObj.getDay(); // 6: Cumartesi

    if (haftaninGunu === 6) return cumartesiSaatler;
    return haftaIciSaatler;
}

function saatleriGuncelle(tarihMetni) {
    const saatListesi = gununSaatListesiniGetir(tarihMetni);
    const doluSaatler = gunlukDoluSaatler[tarihMetni] || [];
    seciliSaat = "";
    timeSlotsContainer.innerHTML = "";

    saatListesi.forEach(saat => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.classList.add("time-btn");
        btn.textContent = saat;

        if (doluSaatler.includes(saat)) {
            btn.disabled = true;
            btn.classList.add("disabled");
        } else {
            btn.addEventListener("click", () => {
                document.querySelectorAll(".time-btn").forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
                seciliSaat = saat;
            });
        }

        timeSlotsContainer.appendChild(btn);
    });
}

function takvimiCiz() {
    const yil = aktifTarih.getFullYear();
    const ay = aktifTarih.getMonth();

    monthYearLabel.textContent = `${aylar[ay]} ${yil}`;
    calendarDays.innerHTML = "";

    let ilkGun = new Date(yil, ay, 1).getDay();
    ilkGun = ilkGun === 0 ? 6 : ilkGun - 1;

    const toplamGun = new Date(yil, ay + 1, 0).getDate();

    for (let i = 0; i < ilkGun; i++) {
        const bosKutu = document.createElement("span");
        calendarDays.appendChild(bosKutu);
    }

    for (let gun = 1; gun <= toplamGun; gun++) {
        const gunButon = document.createElement("button");
        gunButon.type = "button";
        gunButon.classList.add("cal-day");
        gunButon.textContent = gun;

        const ayStr = String(ay + 1).padStart(2, "0");
        const gunStr = String(gun).padStart(2, "0");
        const tamTarih = `${yil}-${ayStr}-${gunStr}`;
        const gosterimTarihi = `${gunStr}.${ayStr}.${yil}`;

        // O günün Pazarmı değilmi
        const haftaninGunu = new Date(yil, ay, gun).getDay();
        const pazarMi = haftaninGunu === 0;

        if (pazarMi || doluGunler.includes(tamTarih)) {
            gunButon.disabled = true;
            gunButon.classList.add("disabled");
            gunButon.title = pazarMi ? "Pazar günleri kapalıyız" : "Bu gün dolu";
        } else {
            gunButon.addEventListener("click", () => {
                document.querySelectorAll(".cal-day.selected").forEach(el => {
                    el.classList.remove("selected");
                });
                gunButon.classList.add("selected");

                seciliTarihMetni = gosterimTarihi;
                dateInput.value = seciliTarihMetni;
                calendarPopup.classList.remove("open");

                saatleriGuncelle(seciliTarihMetni);
            });
        }

        if (seciliTarihMetni === gosterimTarihi) {
            gunButon.classList.add("selected");
        }

        calendarDays.appendChild(gunButon);
    }
}

dateInput.addEventListener("click", (e) => {
    e.stopPropagation();
    calendarPopup.classList.toggle("open");
    takvimiCiz();
});

prevMonthBtn.addEventListener("click", () => {
    aktifTarih.setMonth(aktifTarih.getMonth() - 1);
    takvimiCiz();
});

nextMonthBtn.addEventListener("click", () => {
    aktifTarih.setMonth(aktifTarih.getMonth() + 1);
    takvimiCiz();
});

document.addEventListener("click", (e) => {
    if (!e.target.closest(".date-picker-wrapper")) {
        calendarPopup.classList.remove("open");
    }
});

appointmentForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const adSoyad = document.getElementById("name").value.trim();
    const telefon = document.getElementById("phone").value.trim();
    const hizmet = document.getElementById("service").value;
    const tarih = dateInput.value.trim();

    if (!seciliUsta) {
        alert("Lütfen bir usta seçiniz.");
        return;
    }

    if (!tarih) {
        alert("Lütfen bir tarih seçiniz.");
        return;
    }

    if (!seciliSaat) {
        alert("Lütfen uygun bir saat seçiniz.");
        return;
    }

    appointmentResult.innerHTML = `
        <div class="result-card">
            <h3>Randevunuz Oluşturuldu!</h3>
            <p><strong>Müşteri:</strong> ${adSoyad}</p>
            <p><strong>Telefon:</strong> ${telefon}</p>
            <p><strong>Hizmet:</strong> ${hizmet}</p>
            <p><strong>Usta:</strong> ${seciliUsta}</p>
            <p><strong>Tarih & Saat:</strong> ${tarih} - ${seciliSaat}</p>
        </div>
    `;

    if (!gunlukDoluSaatler[tarih]) {
        gunlukDoluSaatler[tarih] = [];
    }
    if (!gunlukDoluSaatler[tarih].includes(seciliSaat)) {
        gunlukDoluSaatler[tarih].push(seciliSaat);
    }

    appointmentForm.reset();
    seciliUsta = "";
    seciliTarihMetni = "";
    seciliSaat = "";
    barberButtons.forEach(b => b.classList.remove("active"));
    document.querySelectorAll(".cal-day.selected").forEach(el => el.classList.remove("selected"));
    timeSlotsContainer.innerHTML = `<p class="time-hint">Önce bir tarih seçiniz.</p>`;
});