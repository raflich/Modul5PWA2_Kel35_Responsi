import { Tent, ShieldCheck, Wifi, Sparkles, Heart } from 'lucide-react'

export default function Footer({ onNavigateTab }) {
  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="footer-brand-col">
          <div className="footer-brand">
            <div className="footer-logo-badge">
              <img src="/icon.svg" alt="TentCraft" />
            </div>
            <span className="footer-brand-title">TentCraft Outdoor PWA</span>
          </div>
          <p className="footer-lede">
            Aplikasi Progressive Web App (PWA) modern untuk penjualan dan persewaan alat tenda outdoor, dome, flysheet, dan perlengkapan camping. Dibangun dengan offline-first architecture, service worker precaching, dan penyimpanan lokal yang andal.
          </p>
          <div className="footer-badges">
            <span className="badge badge--neutral">
              <Wifi size={12} /> Offline First PWA
            </span>
            <span className="badge badge--neutral">
              <ShieldCheck size={12} /> Responsive CRUD
            </span>
            <span className="badge badge--neutral">
              <Sparkles size={12} /> React 19 + Vite 8
            </span>
          </div>
        </div>

        {/* Quick Links Navigation */}
        <div className="footer-links-col">
          <h4 className="footer-col-title">Navigasi Halaman</h4>
          <ul className="footer-links">
            <li>
              <button type="button" onClick={() => onNavigateTab && onNavigateTab('Catalog')}>
                Katalog Alat Tenda
              </button>
            </li>
            <li>
              <button type="button" onClick={() => onNavigateTab && onNavigateTab('Manage')}>
                Kelola Produk (CRUD)
              </button>
            </li>
            <li>
              <button type="button" onClick={() => onNavigateTab && onNavigateTab('Favorites')}>
                Daftar Favorit &amp; Keranjang
              </button>
            </li>
            <li>
              <button type="button" onClick={() => onNavigateTab && onNavigateTab('Profile')}>
                Profil Mahasiswa
              </button>
            </li>
            <li>
              <button type="button" onClick={() => onNavigateTab && onNavigateTab('Guide')}>
                Panduan Tenda &amp; Info Toko
              </button>
            </li>
          </ul>
        </div>

        {/* Student Identity Card */}
        <div className="footer-student-col">
          <h4 className="footer-col-title">Identitas Praktikan</h4>
          <div className="footer-student-card">
            <div className="student-name">Muhammad Rafli Buchori</div>
            <div className="student-nim">NIM: <strong>21120124130095</strong></div>
            <div className="student-group">Kelompok: <strong>35</strong></div>
            <div className="student-dept">Departemen Teknik Komputer</div>
            <div className="student-univ">Universitas Diponegoro</div>
            <div className="student-course">
              Praktikum Pemrograman Perangkat Bergerak (MODUL 5)
            </div>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p className="copyright">
          &copy; {new Date().getFullYear()} TentCraft PWA — Tugas Responsi Modul 5 Praktikum PPB.
        </p>
        <p className="footer-note">
          Dibuat dengan <Heart size={13} fill="#ef4444" stroke="#ef4444" style={{ display: 'inline', verticalAlign: 'middle' }} /> untuk pendaki dan penjelajah alam Indonesia.
        </p>
      </div>
    </footer>
  )
}
