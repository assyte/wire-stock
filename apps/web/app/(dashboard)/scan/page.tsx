'use client';

import {
  ScanLine,
  Loader2,
  CheckCircle2,
  XCircle,
  Package,
  ArrowDownToLine,
  MapPin,
  Clock,
  Camera,
  Keyboard,
  Volume2,
  VolumeX,
  Sparkles,
  AlertCircle,
  X,
  History,
  TrendingDown,
  Plus,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import api from '@/lib/api';
import { cn } from '@/lib/utils';

// =================================================================
// Types
// =================================================================
interface ProductLookup {
  id: string;
  sku: string;
  barcode: string;
  name: string;
  description?: string;
  brand?: { id: string; name: string };
  category: { id: string; name: string; color: string | null };
  unit: { shortName: string };
  purchasePrice: number;
  salePrice: number;
  minStock: number;
  stock: {
    totalQuantity: number;
    available: number;
    shelfDistribution: Array<{
      shelfCode: string;
      shelfName: string;
      warehouseName: string;
      quantity: number;
    }>;
  };
  lastMovement: { type: string; quantity: number; createdAt: string } | null;
}

interface MovementLog {
  id: string;
  productName: string;
  quantity: number;
  unit: string;
  timestamp: string;
}

// =================================================================
// Component
// =================================================================
export default function ScanPage() {
  const [mode, setMode] = useState<'camera' | 'keyboard'>('camera');
  const [manualBarcode, setManualBarcode] = useState('');
  const [scanning, setScanning] = useState(false);
  const [looking, setLooking] = useState(false);
  const [product, setProduct] = useState<ProductLookup | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [consumeQty, setConsumeQty] = useState('');
  const [consumeNote, setConsumeNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [recentScans, setRecentScans] = useState<MovementLog[]>([]);

  const cameraRef = useRef<HTMLDivElement>(null);
  const scannerRef = useRef<any>(null);

  // Ses efekti (Web Audio API ile basit bip)
  const playBeep = (success: boolean) => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = success ? 1200 : 400;
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch {
      // ses yok
    }
  };

  // Kamera başlat
  useEffect(() => {
    if (mode !== 'camera') return;

    let cancelled = false;
    const startScanner = async () => {
      try {
        setScanning(true);
        setError(null);
        // Dynamic import (browser-only)
        const { Html5Qrcode } = await import('html5-qrcode');
        if (cancelled) return;

        const scanner = new Html5Qrcode('qr-reader');
        scannerRef.current = scanner;

        await scanner.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: { width: 280, height: 160 },
          },
          (decodedText: string) => {
            handleBarcodeScanned(decodedText);
          },
          () => {
            // her frame'de hata — yok say
          },
        );
      } catch (err: any) {
        if (!cancelled) {
          setError(
            'Kamera başlatılamadı. Klavye modunu kullanın veya kamera izni verin.',
          );
          setScanning(false);
        }
      }
    };

    startScanner();

    return () => {
      cancelled = true;
      if (scannerRef.current) {
        try {
          scannerRef.current.stop().catch(() => {});
        } catch {
          // ignore
        }
      }
    };
  }, [mode]);

  const handleBarcodeScanned = async (barcode: string) => {
    if (looking || product) return; // Çift arama engeli
    await lookupBarcode(barcode);
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualBarcode.trim()) return;
    await lookupBarcode(manualBarcode.trim());
  };

  const lookupBarcode = async (barcode: string) => {
    try {
      setLooking(true);
      setError(null);
      const { data } = await api.get(`/products/lookup/${barcode}`);
      setProduct(data.data);
      setManualBarcode('');
      playBeep(true);
      toast.success(`✅ ${data.data.name}`);
    } catch (err: any) {
      playBeep(false);
      const msg =
        err?.response?.data?.error?.message ?? 'Bu barkod tanınmıyor';
      setError(msg);
      setProduct(null);
      toast.error(msg);
    } finally {
      setLooking(false);
    }
  };

  const handleConsume = async () => {
    if (!product || !consumeQty) return;
    const qty = Number(consumeQty);
    if (isNaN(qty) || qty <= 0) {
      toast.error('Geçerli bir miktar girin');
      return;
    }

    try {
      setSubmitting(true);
      const shelfId = product.stock.shelfDistribution[0]?.shelfCode;
      const warehouseId = product.stock.shelfDistribution[0]?.warehouseName;

      // Mevcut /stock/movements endpoint'ini kullan
      const payload: any = {
        productId: product.id,
        warehouseId: warehouseId, // TODO: gerçek ID gerekli
        shelfId: shelfId, // TODO: gerçek ID gerekli
        type: 'OUT',
        quantity: qty,
        note: consumeNote || 'Hızlı tüketim (/scan)',
      };

      const { data } = await api.post('/stock/movements', payload);

      // Recent'e ekle
      setRecentScans((prev) => [
        {
          id: data.data?.id ?? Date.now().toString(),
          productName: product.name,
          quantity: qty,
          unit: product.unit.shortName,
          timestamp: new Date().toISOString(),
        },
        ...prev.slice(0, 9),
      ]);

      playBeep(true);
      toast.success(`📦 ${qty} ${product.unit.shortName} stoktan düşüldü`);

      // Reset
      setConsumeQty('');
      setConsumeNote('');
      setProduct(null);
    } catch (err: any) {
      playBeep(false);
      const msg = err?.response?.data?.error?.message ?? 'Stok hareketi başarısız';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    setProduct(null);
    setError(null);
    setConsumeQty('');
    setConsumeNote('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-white to-emerald-50/30">
      <div className="mx-auto max-w-5xl space-y-6 p-4 md:p-8">
        {/* ============= HEADER ============= */}
        <div className="flex items-center justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-800">
              <ScanLine className="h-3 w-3" />
              BARKOD TARAYICI
            </div>
            <h1 className="font-display text-3xl font-black tracking-tight text-stone-900 md:text-4xl">
              Ürün Tara
            </h1>
            <p className="mt-1 text-sm text-stone-600">
              Barkod okut → ürün bilgisi → hızlı stok düş.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setSoundEnabled((v) => !v)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-stone-300 bg-white text-stone-600 transition-colors hover:bg-stone-50"
            title={soundEnabled ? 'Ses açık' : 'Ses kapalı'}
          >
            {soundEnabled ? (
              <Volume2 className="h-4 w-4" />
            ) : (
              <VolumeX className="h-4 w-4" />
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
          {/* ============= SOL — Tarayıcı ============= */}
          <div className="space-y-4">
            {/* Mode toggle */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setMode('camera')}
                className={cn(
                  'flex flex-1 items-center justify-center gap-2 rounded-xl border-2 px-4 py-2.5 text-sm font-bold transition-all',
                  mode === 'camera'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                    : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300',
                )}
              >
                <Camera className="h-4 w-4" />
                Kamera
              </button>
              <button
                type="button"
                onClick={() => setMode('keyboard')}
                className={cn(
                  'flex flex-1 items-center justify-center gap-2 rounded-xl border-2 px-4 py-2.5 text-sm font-bold transition-all',
                  mode === 'keyboard'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                    : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300',
                )}
              >
                <Keyboard className="h-4 w-4" />
                Klavye
              </button>
            </div>

            {/* Camera / Keyboard Area */}
            {mode === 'camera' ? (
              <Card className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="relative aspect-[4/3] w-full bg-stone-900">
                    <div
                      id="qr-reader"
                      ref={cameraRef}
                      className="h-full w-full"
                    />
                    {!scanning && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-stone-400">
                        <Camera className="h-12 w-12" />
                        <p className="text-sm">Kamera başlatılıyor...</p>
                      </div>
                    )}
                    {error && mode === 'camera' && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-stone-900/90 p-4 text-center text-white">
                        <AlertCircle className="h-10 w-10 text-red-400" />
                        <p className="text-sm">{error}</p>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setMode('keyboard')}
                          className="mt-2 bg-white"
                        >
                          Klavye moduna geç
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-6">
                  <form onSubmit={handleManualSubmit} className="space-y-3">
                    <div>
                      <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-stone-500">
                        Barkod Numarası
                      </label>
                      <Input
                        autoFocus
                        value={manualBarcode}
                        onChange={(e) => setManualBarcode(e.target.value)}
                        placeholder="örn: 8693053771991"
                        className="h-14 text-lg font-mono"
                      />
                    </div>
                    <Button
                      type="submit"
                      size="lg"
                      className="h-12 w-full"
                      disabled={!manualBarcode.trim() || looking}
                    >
                      {looking ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Aranıyor...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-4 w-4" />
                          Tara
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Ürün kartı (bulunduğunda) */}
            {product && (
              <Card className="animate-fade-in border-2 border-emerald-300 bg-gradient-to-br from-emerald-50 via-white to-emerald-50 shadow-lg">
                <CardContent className="p-6">
                  <div className="mb-4 flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 text-white shadow-md">
                        <CheckCircle2 className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                          Ürün Bulundu
                        </p>
                        <p className="text-[10px] font-mono text-stone-500">
                          {product.barcode}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={reset}
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-stone-500 hover:bg-stone-100"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <h2 className="font-display text-2xl font-black text-stone-900">
                    {product.name}
                  </h2>
                  {product.brand && (
                    <p className="mt-1 text-sm text-stone-600">
                      {product.brand.name}
                      {product.description && ` · ${product.description}`}
                    </p>
                  )}

                  <div className="mt-4 flex items-center gap-2 text-xs">
                    <span
                      className="rounded-full px-3 py-1 font-bold"
                      style={{
                        backgroundColor: product.category.color
                          ? `${product.category.color}20`
                          : '#f3f4f6',
                        color: product.category.color ?? '#374151',
                      }}
                    >
                      {product.category.name}
                    </span>
                    <span className="font-mono text-stone-500">
                      SKU: {product.sku}
                    </span>
                  </div>

                  {/* Stok durumu */}
                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <div className="rounded-xl border-2 border-stone-200 bg-white p-4 text-center">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                        Mevcut Stok
                      </p>
                      <p
                        className={cn(
                          'mt-1 font-display text-4xl font-black leading-none',
                          product.stock.totalQuantity === 0
                            ? 'text-red-600'
                            : product.stock.totalQuantity <= product.minStock
                            ? 'text-amber-600'
                            : 'text-emerald-600',
                        )}
                      >
                        {product.stock.totalQuantity}
                      </p>
                      <p className="mt-1 text-xs text-stone-500">
                        {product.unit.shortName}
                      </p>
                    </div>
                    <div className="rounded-xl border-2 border-stone-200 bg-white p-4 text-center">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                        Raf Konumu
                      </p>
                      <p className="mt-1 font-display text-4xl font-black leading-none text-stone-900">
                        {product.stock.shelfDistribution[0]?.shelfCode ?? '—'}
                      </p>
                      <p className="mt-1 line-clamp-1 text-xs text-stone-500">
                        {product.stock.shelfDistribution[0]?.warehouseName ?? 'Depoda yok'}
                      </p>
                    </div>
                  </div>

                  {/* Raf detayı */}
                  {product.stock.shelfDistribution.length > 1 && (
                    <div className="mt-3 rounded-xl bg-stone-50 p-3">
                      <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-stone-500">
                        Tüm Raflar
                      </p>
                      {product.stock.shelfDistribution.map((s, i) => (
                        <div key={i} className="flex items-center justify-between text-xs">
                          <span>
                            <MapPin className="mr-1 inline h-3 w-3" />
                            {s.shelfCode} · {s.shelfName}
                          </span>
                          <span className="font-bold">
                            {s.quantity} {product.unit.shortName}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Tüketim formu */}
                  <div className="mt-5 border-t-2 border-emerald-200 pt-5">
                    <p className="mb-3 text-xs font-bold uppercase tracking-wider text-stone-700">
                      <TrendingDown className="mr-1 inline h-3.5 w-3.5" />
                      Tüketim Bildir
                    </p>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={consumeQty}
                        onChange={(e) => setConsumeQty(e.target.value)}
                        placeholder={`Miktar (${product.unit.shortName})`}
                        className="h-12 text-lg font-bold"
                      />
                      <Button
                        size="lg"
                        onClick={handleConsume}
                        disabled={!consumeQty || submitting}
                        className="h-12 bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 shadow-md hover:from-emerald-600 hover:to-emerald-700"
                      >
                        {submitting ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <ArrowDownToLine className="mr-2 h-4 w-4" />
                            Düş
                          </>
                        )}
                      </Button>
                    </div>
                    <Input
                      value={consumeNote}
                      onChange={(e) => setConsumeNote(e.target.value)}
                      placeholder="Not (opsiyonel)"
                      className="mt-2"
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Hata (ürün bulunamadı) */}
            {error && !product && (
              <Card className="animate-fade-in border-2 border-red-300 bg-red-50/50">
                <CardContent className="p-6 text-center">
                  <XCircle className="mx-auto mb-3 h-12 w-12 text-red-500" />
                  <p className="font-bold text-red-900">{error}</p>
                  <p className="mt-2 text-xs text-stone-600">
                    Bu barkod henüz sisteme eklenmemiş.
                  </p>
                  <Link href="/products" className="mt-4 inline-block">
                    <Button variant="outline" size="sm">
                      <Plus className="mr-2 h-3.5 w-3.5" />
                      Yeni ürün olarak ekle
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>

          {/* ============= SAĞ — Recent Scans ============= */}
          <div>
            <Card>
              <h2 className="flex items-center gap-2 border-b border-stone-200 px-4 py-3 text-sm font-bold uppercase tracking-wider text-stone-700">
                <History className="h-4 w-4" />
                Son Tarama
              </h2>
              <CardContent className="p-0">
                {recentScans.length === 0 ? (
                  <div className="p-6 text-center text-xs text-stone-500">
                    Henüz tüketim kaydı yok.
                    <br />
                    Barkod tara → miktar gir.
                  </div>
                ) : (
                  <div className="divide-y divide-stone-100">
                    {recentScans.map((m) => (
                      <div key={m.id} className="px-4 py-3 text-xs">
                        <p className="line-clamp-1 font-semibold text-stone-900">
                          {m.productName}
                        </p>
                        <p className="text-stone-500">
                          <span className="font-bold text-emerald-600">
                            −{m.quantity}
                          </span>{' '}
                          {m.unit} ·{' '}
                          {new Date(m.timestamp).toLocaleTimeString('tr-TR', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="mt-4 bg-gradient-to-br from-amber-50 to-amber-100">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Sparkles className="h-5 w-5 flex-shrink-0 text-amber-600" />
                  <div className="text-xs text-amber-900">
                    <p className="font-bold">💡 İpucu</p>
                    <p className="mt-1">
                      Ürünlere kendi barkod etiketini basmak için{' '}
                      <Link href="/products" className="underline">
                        Ürünler
                      </Link>{' '}
                      sayfasında "Barkod Bas" butonunu kullan.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}