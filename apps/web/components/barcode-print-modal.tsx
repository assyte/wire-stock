'use client';

import { Barcode as BarcodeIcon, Download, Loader2, Printer, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import JsBarcode from 'jsbarcode';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import api from '@/lib/api';

interface Product {
  id: string;
  sku: string;
  barcode?: string | null;
  name: string;
  purchasePrice: number | string;
  salePrice: number | string;
  unit?: { shortName: string };
}

interface BarcodePrintModalProps {
  product: Product;
  onClose: () => void;
}

export function BarcodePrintModal({ product, onClose }: BarcodePrintModalProps) {
  const [barcode, setBarcode] = useState<string | null>(product.barcode ?? null);
  const [generating, setGenerating] = useState(false);
  const [printing, setPrinting] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);

  // Barkod SVG render
  useEffect(() => {
    if (!barcode || !svgRef.current) return;
    try {
      JsBarcode(svgRef.current, barcode, {
        format: 'EAN13',
        width: 2.2,
        height: 70,
        displayValue: true,
        fontSize: 14,
        margin: 6,
        background: '#ffffff',
        lineColor: '#0a0a0a',
      });
    } catch (err) {
      console.error('Barcode render error:', err);
      toast.error('Barkod oluşturulamadı');
    }
  }, [barcode]);

  const generate = async () => {
    try {
      setGenerating(true);
      const { data } = await api.post(`/products/${product.id}/generate-barcode`);
      setBarcode(data.data.barcode);
      toast.success(`✅ Barkod üretildi: ${data.data.barcode}`);
    } catch (err: any) {
      toast.error(err?.response?.data?.error?.message ?? 'Barkod üretilemedi');
    } finally {
      setGenerating(false);
    }
  };

  const downloadPng = async () => {
    if (!svgRef.current || !barcode) return;
    try {
      // SVG → Canvas → PNG
      const svg = svgRef.current;
      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);

      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('img load'));
        img.src = url;
      });

      canvas.width = img.width * 2;
      canvas.height = img.height * 2;
      ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);

      const png = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = png;
      link.download = `${product.sku}-${barcode}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('PNG indirildi');
    } catch (err) {
      toast.error('PNG oluşturulamadı');
    }
  };

  const handlePrint = async () => {
    if (!barcode || !svgRef.current) return;
    setPrinting(true);

    // Yazdırma için HTML oluştur
    const svgData = new XMLSerializer().serializeToString(svgRef.current);
    const printWindow = window.open('', '_blank', 'width=400,height=300');
    if (!printWindow) {
      toast.error('Pop-up engellendi. Lütfen izin verin.');
      setPrinting(false);
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Barkod Etiket — ${product.sku}</title>
          <style>
            @page {
              size: 50mm 25mm;
              margin: 0;
            }
            body {
              margin: 0;
              padding: 2mm;
              font-family: -apple-system, BlinkMacSystemFont, sans-serif;
              width: 50mm;
            }
            .label {
              border: 1px dashed #ccc;
              padding: 2mm;
              text-align: center;
            }
            .name {
              font-size: 7pt;
              font-weight: bold;
              margin-bottom: 1mm;
              line-height: 1.1;
              max-height: 8mm;
              overflow: hidden;
            }
            .sku {
              font-size: 6pt;
              color: #666;
              margin-bottom: 1mm;
              font-family: monospace;
            }
            svg {
              max-width: 100%;
              height: auto;
            }
          </style>
        </head>
        <body>
          <div class="label">
            <div class="name">${product.name}</div>
            <div class="sku">SKU: ${product.sku}</div>
            ${svgData}
          </div>
          <script>
            window.onload = () => {
              setTimeout(() => {
                window.print();
                window.close();
              }, 300);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();

    setTimeout(() => setPrinting(false), 500);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-200 bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-4 text-white">
          <div className="flex items-center gap-2">
            <BarcodeIcon className="h-5 w-5" />
            <h2 className="font-display text-lg font-bold">Barkod Etiketi</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {/* Ürün bilgisi */}
          <div className="mb-4 rounded-xl bg-stone-50 p-3">
            <p className="line-clamp-2 font-display text-base font-bold text-stone-900">
              {product.name}
            </p>
            <p className="mt-1 font-mono text-xs text-stone-500">
              SKU: {product.sku}
            </p>
            {barcode && (
              <p className="mt-1 font-mono text-xs text-emerald-700">
                Barkod: {barcode}
              </p>
            )}
          </div>

          {/* Etiket önizleme (50mm × 25mm etiket) */}
          <div className="mb-4 flex items-center justify-center">
            <div
              className="rounded border-2 border-dashed border-stone-300 bg-white p-3"
              style={{ width: '240px', height: '140px' }}
            >
              <p className="mb-1 line-clamp-2 text-center text-xs font-bold leading-tight text-stone-900">
                {product.name}
              </p>
              <p className="mb-2 text-center font-mono text-[10px] text-stone-500">
                {product.sku}
              </p>
              {barcode ? (
                <svg ref={svgRef} className="mx-auto block" />
              ) : (
                <div className="flex h-12 items-center justify-center rounded border border-stone-200 bg-stone-50 text-xs text-stone-400">
                  Barkod oluşturulmadı
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2">
            {!barcode ? (
              <Button
                onClick={generate}
                disabled={generating}
                size="lg"
                className="h-12 w-full bg-gradient-to-r from-emerald-500 to-emerald-600"
              >
                {generating ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <BarcodeIcon className="mr-2 h-4 w-4" />
                )}
                Barkod Üret (EAN-13)
              </Button>
            ) : (
              <>
                <Button
                  onClick={handlePrint}
                  disabled={printing}
                  size="lg"
                  className="h-12 w-full bg-gradient-to-r from-emerald-500 to-emerald-600"
                >
                  {printing ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Printer className="mr-2 h-4 w-4" />
                  )}
                  Etiket Yazdır (50×25mm)
                </Button>
                <Button
                  onClick={downloadPng}
                  variant="outline"
                  size="lg"
                  className="h-11 w-full"
                >
                  <Download className="mr-2 h-4 w-4" />
                  PNG İndir
                </Button>
                <Button
                  onClick={generate}
                  disabled={generating}
                  variant="ghost"
                  size="sm"
                  className="w-full text-xs text-stone-500"
                >
                  {generating ? (
                    <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                  ) : (
                    <>Yeni barkod üret</>
                  )}
                </Button>
              </>
            )}
          </div>

          {/* Info */}
          <div className="mt-4 rounded-lg bg-amber-50 p-3 text-xs text-amber-900">
            <p className="font-bold">💡 Etiket yazıcı için:</p>
            <p className="mt-1">
              50×25mm termal etiket kullanın (Brother, Zebra, CASIO uyumlu).
              "Yazdır" butonu pop-up açar, yazıcı seçin.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}