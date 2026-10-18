import Link from 'next/link';
import {
  Zap,
  Package,
  TrendingUp,
  Shield,
  Users,
  BarChart3,
  Smartphone,
  ArrowRight,
  Check,
  Sparkles,
  Cable,
  Wrench,
  Building2,
  Boxes,
  ScanLine,
  FileText,
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-grid opacity-50" />
      <div className="absolute inset-0 bg-gradient-radial" />
      <div className="absolute left-1/2 top-0 -z-10 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-brand/20 blur-3xl" />
      <div className="absolute right-0 top-1/2 -z-10 h-[400px] w-[400px] rounded-full bg-accent/10 blur-3xl" />

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-6 lg:px-12">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-brand shadow-glow-brand">
            <Zap className="h-5 w-5 text-background" strokeWidth={2.5} />
          </div>
          <span className="font-display text-xl font-bold text-gradient">WireStock</span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          <Link href="#features" className="text-sm text-text-secondary transition-colors hover:text-text-primary">
            Özellikler
          </Link>
          <Link href="#solutions" className="text-sm text-text-secondary transition-colors hover:text-text-primary">
            Çözümler
          </Link>
          <Link href="#pricing" className="text-sm text-text-secondary transition-colors hover:text-text-primary">
            Fiyatlandırma
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="rounded-lg px-4 py-2 text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
          >
            Giriş Yap
          </Link>
          <Link
            href="/register"
            className="group inline-flex items-center gap-2 rounded-lg bg-gradient-brand px-4 py-2 text-sm font-semibold text-background transition-all hover:shadow-glow-brand"
          >
            Ücretsiz Başla
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 mx-auto max-w-6xl px-6 pt-20 pb-32 text-center lg:px-12">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card/50 px-4 py-1.5 text-xs text-text-secondary backdrop-blur">
          <Sparkles className="h-3.5 w-3.5 text-accent" />
          <span>Elektrik sektörü için tasarlandı</span>
        </div>

        <h1 className="font-display text-5xl font-bold tracking-tight text-text-primary md:text-6xl lg:text-7xl">
          Deponu <span className="text-gradient">akıllıca</span> yönet,
          <br />
          zamandan <span className="text-gradient-accent">tasarruf et</span>.
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg text-text-secondary">
          Elektrik-elektronik esnafı, taahhüt firmaları ve toptancılar için geliştirilmiş
          modern depo ve stok yönetim sistemi. Kağıt-defter dönemini bitir, hata yapma,
          hızlı ol.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/register"
            className="group inline-flex items-center gap-2 rounded-lg bg-gradient-brand px-6 py-3 text-base font-semibold text-background transition-all hover:shadow-glow-brand"
          >
            Hemen Ücretsiz Dene
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link
            href="#demo"
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-card/50 px-6 py-3 text-base font-semibold text-text-primary backdrop-blur transition-colors hover:border-brand/50 hover:bg-card"
          >
            Demo İzle
          </Link>
        </div>

        <p className="mt-4 text-xs text-text-muted">
          Kredi kartı gerekmez • 14 gün ücretsiz • Kurulum 5 dakika
        </p>
      </section>

      {/* Features */}
      <section id="features" className="relative z-10 mx-auto max-w-7xl px-6 py-20 lg:px-12">
        <div className="text-center">
          <h2 className="font-display text-3xl font-bold text-text-primary md:text-4xl">
            Tek platform. <span className="text-gradient">Tüm ihtiyaçlar.</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-text-secondary">
            Stok takibinden proje yönetimine, satıştan satın almaya kadar her şey tek yerde.
          </p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              icon: Package,
              title: 'Akıllı Stok Yönetimi',
              description: 'Barkod, raf bazlı takip, minimum stok uyarıları, otomatik sayım.',
            },
            {
              icon: Boxes,
              title: 'Çoklu Depo & Raf',
              description: 'Sınırsız depo, raf bazlı organizasyon, depolar arası transfer.',
            },
            {
              icon: ScanLine,
              title: 'Barkod & QR Desteği',
              description: 'Telefonla okut, hızlı giriş-çıkış yap. Etiket yazıcı desteği.',
            },
            {
              icon: BarChart3,
              title: 'Gerçek Zamanlı Raporlar',
              description: 'Kâr-zarar, stok devir hızı, müşteri analizi. Tek tıkla.',
            },
            {
              icon: Building2,
              title: 'Proje Yönetimi (Taahhüt)',
              description: 'İş emri, malzeme listesi, usta atama, ilerleme takibi.',
            },
            {
              icon: FileText,
              title: 'Teklif & Fatura',
              description: 'Hızlı teklif, e-Fatura entegrasyonu, otomatik irsaliye.',
            },
            {
              icon: Users,
              title: 'Çok Kullanıcılı',
              description: 'Patron, yönetici, çırak — herkesin kendi rolü ve yetkisi.',
            },
            {
              icon: Smartphone,
              title: 'Mobil Uyumlu',
              description: 'Telefondan her şeyi yap. Çırak saha uygulaması yakında.',
            },
            {
              icon: Shield,
              title: 'KVKK Uyumlu',
              description: 'Veriler Türkiye\'de, günlük yedekleme, 2FA güvenlik.',
            },
          ].map((feature, i) => (
            <div
              key={i}
              className="group relative overflow-hidden rounded-xl border border-border bg-card/50 p-6 backdrop-blur transition-all hover:border-brand/30 hover:bg-card hover:shadow-card"
            >
              <div className="absolute inset-0 bg-gradient-brand opacity-0 transition-opacity group-hover:opacity-5" />
              <div className="relative">
                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-lg bg-brand/10 text-brand">
                  <feature.icon className="h-5 w-5" strokeWidth={2} />
                </div>
                <h3 className="font-display text-lg font-semibold text-text-primary">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm text-text-secondary">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Solutions */}
      <section id="solutions" className="relative z-10 mx-auto max-w-7xl px-6 py-20 lg:px-12">
        <div className="text-center">
          <h2 className="font-display text-3xl font-bold text-text-primary md:text-4xl">
            Sektörün <span className="text-gradient-accent">her paydaşı</span> için
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-text-secondary">
            İster küçük esnaf ol, ister büyük taahhüt firması. WireStock seninle büyür.
          </p>
        </div>

        <div className="mt-16 grid gap-6 lg:grid-cols-3">
          {[
            {
              icon: Cable,
              title: 'Malzeme Satıcıları',
              desc: 'Perakende ve toptan satış yapan işletmeler için hızlı barkod, cari hesap, kâr analizi.',
              features: ['Hızlı satış ekranı', 'Müşteri cari', 'Kâr/zarar raporu'],
            },
            {
              icon: Wrench,
              title: 'Taahhüt & Tesisat Firmaları',
              desc: 'Proje bazlı malzeme çıkışı, usta yönetimi, maliyet kontrolü, teklif-fatura akışı.',
              features: ['Proje yönetimi', 'Malzeme listesi (BOM)', 'Usta atama'],
            },
            {
              icon: Package,
              title: 'Kablo & Toptancılar',
              desc: 'Metre bazlı stok, kesim takibi, sevkiyat, toptan fiyatlandırma.',
              features: ['Metre/kg bazlı stok', 'Toptan fiyat listesi', 'Sevkiyat yönetimi'],
            },
          ].map((solution, i) => (
            <div
              key={i}
              className="group relative overflow-hidden rounded-2xl border border-border bg-gradient-to-b from-card/50 to-card p-8 backdrop-blur transition-all hover:border-accent/30 hover:shadow-glow-accent"
            >
              <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent">
                <solution.icon className="h-6 w-6" strokeWidth={2} />
              </div>
              <h3 className="font-display text-xl font-semibold text-text-primary">
                {solution.title}
              </h3>
              <p className="mt-2 text-sm text-text-secondary">{solution.desc}</p>
              <ul className="mt-6 space-y-2">
                {solution.features.map((f, j) => (
                  <li key={j} className="flex items-center gap-2 text-sm text-text-secondary">
                    <Check className="h-4 w-4 text-brand" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing teaser */}
      <section id="pricing" className="relative z-10 mx-auto max-w-5xl px-6 py-20 lg:px-12">
        <div className="overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-card via-card to-background p-12 text-center">
          <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-brand shadow-glow-brand">
            <TrendingUp className="h-7 w-7 text-background" strokeWidth={2.5} />
          </div>
          <h2 className="font-display text-3xl font-bold text-text-primary md:text-4xl">
            Erken başlayanlar <span className="text-gradient">kazanır</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-text-secondary">
            İlk 100 müşteriye ömür boyu %50 indirim. Şimdi kayıt ol, ileride teşekkür et.
          </p>
          <Link
            href="/register"
            className="mt-8 inline-flex items-center gap-2 rounded-lg bg-gradient-brand px-6 py-3 text-base font-semibold text-background transition-all hover:shadow-glow-brand"
          >
            Hemen Başla
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border bg-card/30 px-6 py-12 lg:px-12">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-brand">
              <Zap className="h-4 w-4 text-background" strokeWidth={2.5} />
            </div>
            <span className="font-display text-sm font-semibold text-text-primary">WireStock</span>
          </div>
          <p className="text-xs text-text-muted">
            © {new Date().getFullYear()} WireStock. Modern elektrik, akıllı stok.
          </p>
        </div>
      </footer>
    </div>
  );
}
