import pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import QRCode from 'qrcode';
import { LOGO_BASE64 } from './logo';

// Initialize fonts in browser safely
if (typeof window !== 'undefined') {
  try {
    const vfs = (pdfFonts as any)?.pdfMake?.vfs || (pdfFonts as any)?.default?.pdfMake?.vfs || (pdfFonts as any)?.vfs;
    if (vfs) {
      (pdfMake as any).vfs = vfs;
      // Configure standard fonts mapping to avoid character overlapping/sticking issues
      const robotoFonts = {
        Roboto: {
          normal: 'Roboto-Regular.ttf',
          bold: 'Roboto-Medium.ttf',
          italics: 'Roboto-Italic.ttf',
          bolditalics: 'Roboto-MediumItalic.ttf'
        },
        Helvetica: {
          normal: 'Roboto-Regular.ttf',
          bold: 'Roboto-Medium.ttf',
          italics: 'Roboto-Italic.ttf',
          bolditalics: 'Roboto-MediumItalic.ttf'
        }
      };
      (pdfMake as any).fonts = robotoFonts;
    }
  } catch (err) {
    console.warn('pdfMake vfs fonts not found, falling back to standard fonts:', err);
  }
}

// Color palette
const PRIMARY = '#4F46E5';       // indigo-600
const PRIMARY_LIGHT = '#EEF2FF'; // indigo-50
const DARK = '#1E293B';          // slate-800
const GREY = '#64748B';          // slate-500
const LIGHT_GREY = '#F8FAFC';    // slate-50
const BORDER = '#E2E8F0';        // slate-200
const GREEN = '#059669';         // emerald-600
const GREEN_BG = '#ECFDF5';      // emerald-50

// Shipping method label helper
function shippingLabel(method: string): string {
  const labels: Record<string, string> = {
    AIR_NORMAL: 'Aérien standard (7-15 jours)',
    AIR_EXPRESS: 'Aérien express (4-5 jours)',
    SEA: 'Maritime (30-45 jours)',
  };
  return labels[method] || method;
}

// Helper: clean non-breaking spaces for PDF
const formatFCFA = (val: number): string => {
  return val.toLocaleString('fr-FR').replace(/[\u00a0\xa0\s]/g, ' ') + ' F';
};
const formatFCFACFA = (val: number): string => {
  return val.toLocaleString('fr-FR').replace(/[\u00a0\xa0\s]/g, ' ') + ' F CFA';
};

// Generate client-side QR Code
async function generateQRCode(text: string): Promise<string> {
  try {
    return await QRCode.toDataURL(text, {
      margin: 1,
      width: 200,
      color: {
        dark: '#1E293B',
        light: '#FFFFFF',
      },
    });
  } catch (err) {
    console.error('Error generating QR Code', err);
    return '';
  }
}

export interface ClientQuote {
  id: string;
  reference: string;
  created_at: string;
  subtotal_products: number;
  commission: {
    taux: number;
    montant: number;
  };
  shipping: {
    method: string;
    montant: number;
  };
  total_ttc: number;
  status: string;
  items: Array<{
    quantity: number;
    product: {
      nom: string;
      prix_cny: number;
    };
  }>;
}

export interface ClientOrder {
  id: string;
  numero_tracking: string;
  created_at: string;
  total_ttc: number;
  statut: string;
  client_id?: string;
}

/**
 * Generates and downloads the Devis PDF from the frontend
 */
export async function downloadDevisPDF(devis: ClientQuote, clientName: string) {
  const validationUrl = `${window.location.origin}/valider/${devis.id}`;
  const qrCodeDataUrl = await generateQRCode(validationUrl);

  const docDefinition: any = {
    pageSize: 'A4',
    pageMargins: [40, 50, 40, 80],
    defaultStyle: { font: 'Roboto', fontSize: 10, color: DARK },

    background: (currentPage: number, pageSize: any) => [
      {
        canvas: [
          {
            type: 'rect',
            x: 0,
            y: 0,
            w: pageSize.width,
            h: pageSize.height,
            color: '#FAFAFE',
          },
        ],
      },
      {
        image: 'data:image/png;base64,' + LOGO_BASE64,
        width: 300,
        opacity: 0.04,
        absolutePosition: { x: (pageSize.width - 300) / 2, y: (pageSize.height - 300) / 2 }
      }
    ],

    footer: (currentPage: number, pageCount: number) => ({
      margin: [40, 0, 40, 0],
      columns: [
        {
          text: 'Ecom Plus Gabon — RCCM 2026-B-1234 — IF 000123456 — Contact : +241 00 00 00 00',
          fontSize: 8,
          color: GREY,
        },
        {
          text: `Page ${currentPage}/${pageCount}`,
          alignment: 'right',
          fontSize: 8,
          color: GREY,
        },
      ],
    }),

    content: [
      // HEADER
      {
        columns: [
          {
            image: 'data:image/png;base64,' + LOGO_BASE64,
            width: 40,
            height: 40,
            margin: [0, 0, 10, 0]
          },
          {
            width: '*',
            stack: [
              { text: 'ECOM PLUS GABON', fontSize: 18, bold: true, color: PRIMARY },
              { text: 'Sourcing Chine-Gabon · Libreville, Gabon', fontSize: 9, color: GREY, margin: [0, 2, 0, 0] },
            ],
          },
          {
            width: 'auto',
            alignment: 'right',
            stack: [
              { text: 'DEVIS PROFESSIONNEL', fontSize: 18, bold: true, color: DARK },
              { text: `Réf. : ${devis.reference}`, fontSize: 10, bold: true, color: PRIMARY, margin: [0, 4, 0, 0] },
              { text: `Date : ${new Date(devis.created_at).toLocaleDateString('fr-FR')}`, fontSize: 9, color: GREY },
            ],
          },
        ],
        margin: [0, 0, 0, 0],
      },
      // Separator
      { canvas: [{ type: 'line', x1: 0, y1: 5, x2: 515, y2: 5, lineWidth: 2, lineColor: PRIMARY }], margin: [0, 10, 0, 20] },

      // PARTIES
      {
        columns: [
          {
            width: '50%',
            stack: [
              { text: 'DESTINATAIRE', fontSize: 8, bold: true, color: GREY, letterSpacing: 1 },
              { text: clientName, fontSize: 12, bold: true, color: DARK, margin: [0, 4, 0, 2] },
              { text: 'Gabon, Libreville', fontSize: 9, color: GREY },
            ],
          },
          {
            width: '50%',
            alignment: 'right',
            stack: [
              { text: 'EXPÉDITEUR', fontSize: 8, bold: true, color: GREY, letterSpacing: 1 },
              { text: 'Ecom Plus Gabon Service Sourcing', fontSize: 12, bold: true, color: DARK, margin: [0, 4, 0, 2] },
              { text: 'Achat & Logistique Chine-Afrique', fontSize: 9, color: GREY },
            ],
          },
        ],
        margin: [0, 0, 0, 24],
      },

      // PRODUCT TABLE
      {
        table: {
          widths: ['*', 60, 90, 90],
          headerRows: 1,
          body: [
            // Header row
            [
              { text: 'PRODUIT', style: 'tableHeader' },
              { text: 'QTÉ', style: 'tableHeader', alignment: 'center' },
              { text: 'PRIX UNITAIRE', style: 'tableHeader', alignment: 'right' },
              { text: 'TOTAL', style: 'tableHeader', alignment: 'right' },
            ],
            // Data rows
            ...(devis.items || []).map((item, i) => {
              const unitPriceXaf = Math.round(((item.product?.prix_cny || 0) / 100) * 95);
              const totalXaf = unitPriceXaf * item.quantity;
              const bg = i % 2 === 0 ? '#FFFFFF' : LIGHT_GREY;
              return [
                { text: item.product?.nom || 'Produit', fillColor: bg, margin: [4, 8, 4, 8] },
                { text: String(item.quantity), alignment: 'center', fillColor: bg, margin: [4, 8, 4, 8] },
                { text: formatFCFA(unitPriceXaf), alignment: 'right', fillColor: bg, margin: [4, 8, 4, 8] },
                { text: formatFCFA(totalXaf), alignment: 'right', fillColor: bg, bold: true, margin: [4, 8, 4, 8] },
              ];
            }),
          ],
        },
        layout: {
          hLineWidth: (i: number, node: any) => (i === 0 || i === 1 || i === node.table.body.length ? 1 : 0.5),
          vLineWidth: () => 0,
          hLineColor: (i: number) => (i === 0 || i === 1 ? PRIMARY : BORDER),
          fillColor: (rowIndex: number) => rowIndex === 0 ? PRIMARY_LIGHT : null,
        },
        margin: [0, 0, 0, 20],
      },

      // TOTALS
      {
        alignment: 'right',
        table: {
          widths: [200, 100],
          body: [
            [
              { text: 'Sous-total produits', color: GREY, border: [false, false, false, false], margin: [0, 4, 4, 4] },
              { text: formatFCFACFA(devis.subtotal_products || 0), alignment: 'right', border: [false, false, false, false], margin: [0, 4, 0, 4] },
            ],
            [
              { text: `Commission (${devis.commission?.taux || 0}%)`, color: GREY, border: [false, false, false, false], margin: [0, 4, 4, 4] },
              { text: formatFCFACFA(devis.commission?.montant || 0), alignment: 'right', border: [false, false, false, false], margin: [0, 4, 0, 4] },
            ],
            [
              { text: `Livraison — ${shippingLabel(devis.shipping?.method || '')}`, color: GREY, border: [false, false, false, false], margin: [0, 4, 4, 4] },
              { text: formatFCFACFA(devis.shipping?.montant || 0), alignment: 'right', border: [false, false, false, false], margin: [0, 4, 0, 4] },
            ],
            [
              { text: 'TOTAL TTC', bold: true, fontSize: 13, color: PRIMARY, border: [false, true, false, false], margin: [0, 8, 4, 8] },
              { text: formatFCFACFA(devis.total_ttc || 0), bold: true, fontSize: 13, color: PRIMARY, alignment: 'right', border: [false, true, false, false], margin: [0, 8, 0, 8] },
            ],
          ],
        },
        layout: { hLineColor: () => BORDER },
        margin: [0, 0, 0, 30],
      },

      // DISCLAIMER
      {
        fillColor: '#FEF9C3',
        table: {
          widths: ['*'],
          body: [[
            {
              text: '⚠  Les montants de transport indiqués sont des estimations. Le tarif définitif vous sera communiqué par un agent via le chat avant toute expédition.',
              fontSize: 8.5,
              color: '#92400E',
              margin: [10, 8, 10, 8],
              border: [false, false, false, false],
            },
          ]],
        },
        layout: 'noBorders',
        margin: [0, 0, 0, 24],
      },

      // QR CODE
      ...(qrCodeDataUrl ? [
        {
          alignment: 'center',
          stack: [
            { image: qrCodeDataUrl, width: 100, alignment: 'center' },
            { text: 'Scannez pour valider ce devis', fontSize: 9, color: GREY, alignment: 'center', margin: [0, 6, 0, 0] },
          ],
          margin: [0, 0, 0, 20],
        }
      ] : []),

      // VALIDITY
      {
        text: 'Validité du devis : 7 jours à compter de la date d\'émission. Les prix peuvent varier selon le taux de change CNY/XAF.',
        fontSize: 8,
        color: GREY,
        alignment: 'center',
        italics: true,
      },
    ],

    styles: {
      tableHeader: {
        bold: true,
        fontSize: 9,
        color: PRIMARY,
        fillColor: PRIMARY_LIGHT,
        margin: [4, 8, 4, 8],
      },
    },
  };

  pdfMake.createPdf(docDefinition).download(`devis_${devis.reference}.pdf`);
}

/**
 * Generates and downloads the Receipt PDF from the frontend
 */
export async function downloadReceiptPDF(order: ClientOrder, clientName: string) {
  const trackingNumber = order.numero_tracking;
  const trackingUrl = `${window.location.origin}/suivi/${trackingNumber}`;
  const qrCodeDataUrl = await generateQRCode(trackingUrl);

  const reference = `REC-${trackingNumber.replace('ECOM-', '')}`;

  const docDefinition: any = {
    pageSize: 'A4',
    pageMargins: [40, 50, 40, 80],
    defaultStyle: { font: 'Roboto', fontSize: 10, color: DARK },

    // ── Background watermark ─────────────────────────────────────────────────
    background: (currentPage: number, pageSize: any) => [
      {
        canvas: [
          {
            type: 'rect',
            x: 0,
            y: 0,
            w: pageSize.width,
            h: pageSize.height,
            color: '#FAFAFE',
          },
        ],
      },
      {
        image: 'data:image/png;base64,' + LOGO_BASE64,
        width: 300,
        opacity: 0.04,
        absolutePosition: { x: (pageSize.width - 300) / 2, y: (pageSize.height - 300) / 2 }
      }
    ],

    footer: (currentPage: number, pageCount: number) => ({
      margin: [40, 0, 40, 0],
      columns: [
        { text: 'Ecom Plus Gabon — Ce document est une preuve de prise en charge officielle.', fontSize: 8, color: GREY },
        { text: `Page ${currentPage}/${pageCount}`, alignment: 'right', fontSize: 8, color: GREY },
      ],
    }),

    content: [
      // Header
      {
        columns: [
          {
            image: 'data:image/png;base64,' + LOGO_BASE64,
            width: 40,
            height: 40,
            margin: [0, 0, 10, 0]
          },
          {
            width: '*',
            stack: [
              { text: 'ECOM PLUS GABON', fontSize: 18, bold: true, color: PRIMARY },
              { text: 'Sourcing Chine-Gabon · Reçu Officiel', fontSize: 9, color: GREY, margin: [0, 2, 0, 0] },
            ],
          },
          {
            width: 'auto',
            alignment: 'right',
            stack: [
              { text: 'REÇU DE COMMANDE', fontSize: 18, bold: true, color: GREEN },
              { text: `Réf. : ${reference}`, fontSize: 10, bold: true, color: GREEN, margin: [0, 4, 0, 0] },
              { text: `Date : ${new Date(order.created_at).toLocaleDateString('fr-FR')}`, fontSize: 9, color: GREY },
            ],
          },
        ],
      },
      { canvas: [{ type: 'line', x1: 0, y1: 5, x2: 515, y2: 5, lineWidth: 2, lineColor: GREEN }], margin: [0, 10, 0, 24] },

      // Tracking box (highlighted)
      {
        table: {
          widths: ['*'],
          body: [[
            {
              stack: [
                { text: 'NUMÉRO DE SUIVI (TRACKING)', fontSize: 9, bold: true, color: GREEN, alignment: 'center' },
                { text: trackingNumber, fontSize: 22, bold: true, color: GREEN, alignment: 'center', margin: [0, 6, 0, 6], characterSpacing: 2 },
                { text: 'Utilisez ce numéro sur ecomplus.ga pour suivre votre colis en temps réel', fontSize: 8, color: GREY, alignment: 'center' },
              ],
              margin: [20, 16, 20, 16],
              border: [false, false, false, false],
            },
          ]],
        },
        fillColor: GREEN_BG,
        margin: [0, 0, 0, 24],
      },

      // Client info
      {
        columns: [
          {
            stack: [
              { text: 'CLIENT', fontSize: 8, bold: true, color: GREY, letterSpacing: 1 },
              { text: clientName, fontSize: 12, bold: true, color: DARK, margin: [0, 4, 0, 2] },
            ],
          },
          {
            alignment: 'right',
            stack: [
              { text: 'STATUT', fontSize: 8, bold: true, color: GREY, letterSpacing: 1 },
              { text: '✓ Payé / Validé', fontSize: 12, bold: true, color: GREEN, margin: [0, 4, 0, 2] },
            ],
          },
        ],
        margin: [0, 0, 0, 32],
      },

      // QR Code
      ...(qrCodeDataUrl ? [
        {
          alignment: 'center',
          stack: [
            { image: qrCodeDataUrl, width: 120, alignment: 'center' },
            { text: 'Scannez pour suivre l\'expédition en temps réel', fontSize: 9, color: GREY, alignment: 'center', margin: [0, 8, 0, 0] },
          ],
          margin: [0, 0, 0, 20],
        }
      ] : []),

      {
        text: 'Ce document sert de preuve d\'achat et de prise en charge pour le transport international.',
        fontSize: 8, color: GREY, alignment: 'center', italics: true,
      },
    ],
  };

  pdfMake.createPdf(docDefinition).download(`recu_${trackingNumber}.pdf`);
}
