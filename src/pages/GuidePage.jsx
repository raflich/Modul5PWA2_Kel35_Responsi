import {
  Compass,
  Droplets,
  Wind,
  ShieldAlert,
  MapPin,
  Clock,
  Phone,
  Mail,
  HelpCircle,
  Sparkles,
  Tent,
} from 'lucide-react'

export default function GuidePage() {
  return (
    <div className="guide-page">
      {/* Masthead */}
      <section className="guide-masthead">
        <div className="badge badge--emerald">
          <Compass size={14} /> Panduan Outdoor &amp; Edukasi Tenda
        </div>
        <h1 className="hero-title" style={{ marginTop: '8px' }}>
          Panduan Memilih Alat Tenda &amp; Layanan Outlet
        </h1>
        <p className="hero-subtitle">
          Ketahui standar spesifikasi tenda pendakian gunung, tingkat ketahanan air (PU rating), sistem ventilasi anti-kondensasi, dan informasi kontak toko resmi TentCraft.
        </p>
      </section>

      {/* 1. Guide Pillars */}
      <section className="guide-section">
        <h2 className="section-title">Faktor Kunci Memilih Tenda Gunung</h2>
        <div className="guide-cards-grid">
          <div className="guide-card">
            <div className="guide-card-icon">
              <Droplets size={24} color="var(--emerald)" />
            </div>
            <h3>Peringkat Waterproof (PU mm)</h3>
            <p>
              Tingkat tekanan air hidrostatis menentukan kemampuan menahan hujan badai:
            </p>
            <ul className="guide-bullets">
              <li><strong>PU 1500mm</strong>: Hujan ringan hingga sedang di dataran rendah.</li>
              <li><strong>PU 3000mm</strong>: Standar aman gunung Indonesia menghadapi hujan tropis berjam-jam.</li>
              <li><strong>PU 4000mm - 5000mm</strong>: Ekspedisi badai ekstrem dan musim hujan lebat.</li>
            </ul>
          </div>

          <div className="guide-card">
            <div className="guide-card-icon">
              <Wind size={24} color="#38bdf8" />
            </div>
            <h3>Struktur Rangka &amp; Ketahanan Angin</h3>
            <p>
              Rangka frame menahan terpaan angin puncak gunung:
            </p>
            <ul className="guide-bullets">
              <li><strong>Alloy 7001 Aluminium</strong>: Fleksibel, tahan patah, dan sangat ringan (ultralight).</li>
              <li><strong>Fiberglass Reinforced</strong>: Kokoh dan terjangkau, cocok untuk camping santai keluarga.</li>
              <li><strong>Geodesic / Dome Crossing</strong>: Titik silang ganda memecah angin kencang dari segala arah.</li>
            </ul>
          </div>

          <div className="guide-card">
            <div className="guide-card-icon">
              <ShieldAlert size={24} color="var(--amber)" />
            </div>
            <h3>Double Layer vs Anti Kondensasi</h3>
            <p>
              Udara dingin di luar dan uap nafas di dalam tenda sering menimbulkan embun/tetesan air (kondensasi):
            </p>
            <ul className="guide-bullets">
              <li>Tenda <strong>Double Layer</strong> memisahkan inner breathable mesh dengan outer rainfly.</li>
              <li>Tetesan air mengalir di dinding outer tanpa menetes ke matras atau sleeping bag.</li>
              <li>Buka ventilasi atas agar sirkulasi udara tetap lancar sepanjang malam.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Outlet Location & Contact */}
      <section className="guide-section">
        <h2 className="section-title">Kunjungi Outlet &amp; Basecamp TentCraft</h2>
        <div className="contact-info-grid">
          <div className="contact-tile">
            <div className="contact-tile-icon">
              <MapPin size={22} color="var(--emerald)" />
            </div>
            <div>
              <h4>Alamat Basecamp &amp; Toko</h4>
              <p className="contact-lead">Jl. Prof. Soedarto No. 126, Tembalang</p>
              <p className="contact-sub">Kawasan Kampus Universitas Diponegoro, Semarang, Jawa Tengah</p>
            </div>
          </div>

          <div className="contact-tile">
            <div className="contact-tile-icon">
              <Clock size={22} color="var(--emerald)" />
            </div>
            <div>
              <h4>Jam Layanan Outlet</h4>
              <p className="contact-lead">Senin – Minggu (Setiap Hari)</p>
              <p className="contact-sub">Buka pukul 08.00 – 21.00 WIB (Penerimaan sewa &amp; drop-off 24 jam via posko)</p>
            </div>
          </div>

          <div className="contact-tile">
            <div className="contact-tile-icon">
              <Phone size={22} color="var(--emerald)" />
            </div>
            <div>
              <h4>WhatsApp Hotline &amp; Telepon</h4>
              <p className="contact-lead">+62 821-2012-4130</p>
              <p className="contact-sub">Konsultasi pemilihan alat tenda &amp; reservasi rombongan pendakian</p>
            </div>
          </div>

          <div className="contact-tile">
            <div className="contact-tile-icon">
              <Mail size={22} color="var(--emerald)" />
            </div>
            <div>
              <h4>Email Pelayanan Resmi</h4>
              <p className="contact-lead">dispatch@tentcraft.outdoor.id</p>
              <p className="contact-sub">Pertanyaan kemitraan, grosir komunitas pencinta alam &amp; SAR</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

