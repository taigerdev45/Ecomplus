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

function calculateCommission(subtotal: number) {
  if (subtotal < 350000) {
    return { taux: 10, montant: Math.round(subtotal * 0.10) };
  }
  if (subtotal >= 350000 && subtotal < 1000000) {
    return { taux: 15, montant: Math.round(subtotal * 0.15) };
  }
  return { taux: 20, montant: Math.round(subtotal * 0.20) };
}

function calculateShipping(method: string, totalWeight: number, totalVolumeCbm: number, cbmRate: number = 450000) {
  let rate = 10000;
  let delai = '7-15 jours';
  let montant = 0;

  if (method === 'AIR_EXPRESS') {
    rate = 15000;
    delai = '4-5 jours';
    montant = Math.round(totalWeight * rate);
  } else if (method === 'AIR_NORMAL') {
    rate = 10000;
    delai = '7-15 jours';
    montant = Math.round(totalWeight * rate);
  } else if (method === 'SEA') {
    delai = '30-45 jours';
    montant = Math.round(totalVolumeCbm * cbmRate);
  }

  return { method, montant, delai };
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
export async function downloadReceiptPDF(order: any, clientName: string, config?: any) {
  const trackingNumber = order.numero_tracking || 'TEMP-ECOM';
  const trackingUrl = `${window.location.origin}/suivi/${trackingNumber}`;
  const qrCodeDataUrl = await generateQRCode(trackingUrl);

  const reference = `REC-${trackingNumber.replace('ECOM-', '')}`;

  // Calculate dynamic totals for items if available
  const subtotalProducts = (order.items || []).reduce((acc: number, item: any) => {
    const priceXaf = Math.round(((item.product?.prix_cny || 0) / 100) * (config?.exchange_rate || 95));
    return acc + (priceXaf * item.quantity);
  }, 0);

  const commission = calculateCommission(subtotalProducts);
  const totalWeight = (order.items || []).reduce((acc: number, item: any) => acc + ((item.product?.poids_kg || 0) * item.quantity), 0);
  const totalVolumeCbm = (order.items || []).reduce((acc: number, item: any) => {
    const l = item.product?.longueur_m || 0.1;
    const w = item.product?.largeur_m || 0.1;
    const h = item.product?.hauteur_m || 0.1;
    return acc + (l * w * h * item.quantity);
  }, 0);

  const shippingMethod = order.shipping_method || 'AIR_NORMAL';
  const shipping = calculateShipping(shippingMethod, totalWeight, totalVolumeCbm, config?.cbm_rate || 450000);

  // Fallback to order's total_ttc or calculate it
  const calculatedTotal = subtotalProducts + commission.montant + shipping.montant;
  const totalTtc = order.total_ttc || calculatedTotal;

  const docDefinition: any = {
    pageSize: 'A4',
    pageMargins: [40, 50, 40, 95], // Extra margin bottom for custom footer info
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
      stack: [
        {
          columns: [
            {
              text: [
                { text: 'Service Client Ecom Plus : ', bold: true, color: PRIMARY },
                { text: `${config?.whatsapp_service_1 || '+241 77 00 00 00'} / ${config?.whatsapp_service_2 || '+241 66 00 00 00'}` }
              ],
              fontSize: 8,
              color: GREY
            },
            {
              text: `Page ${currentPage}/${pageCount}`,
              alignment: 'right',
              fontSize: 8,
              color: GREY
            }
          ]
        },
        {
          text: 'Ecom Plus Gabon — RCCM 2026-B-1234 — IF 000123456 — Libreville, Gabon',
          fontSize: 7.5,
          color: GREY,
          margin: [0, 4, 0, 0]
        }
      ]
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
              { text: 'REÇU DE PAIEMENT', fontSize: 18, bold: true, color: GREEN },
              { text: `Réf. : ${reference}`, fontSize: 10, bold: true, color: GREEN, margin: [0, 4, 0, 0] },
              { text: `Date : ${new Date(order.created_at).toLocaleDateString('fr-FR')}`, fontSize: 9, color: GREY },
            ],
          },
        ],
      },
      { canvas: [{ type: 'line', x1: 0, y1: 5, x2: 515, y2: 5, lineWidth: 2, lineColor: GREEN }], margin: [0, 10, 0, 20] },

      // Tracking box (highlighted)
      {
        table: {
          widths: ['*'],
          body: [[
            {
              stack: [
                { text: 'NUMÉRO DE SUIVI (TRACKING)', fontSize: 9, bold: true, color: GREEN, alignment: 'center' },
                { text: trackingNumber, fontSize: 20, bold: true, color: GREEN, alignment: 'center', margin: [0, 4, 0, 4], characterSpacing: 2 },
                { text: 'Suivez votre colis sur ecomplus.ga en saisissant ce numéro.', fontSize: 8, color: GREY, alignment: 'center' },
              ],
              margin: [15, 10, 15, 10],
              border: [false, false, false, false],
            },
          ]],
        },
        fillColor: GREEN_BG,
        margin: [0, 0, 0, 20],
      },

      // Info Client / Paiement
      {
        columns: [
          {
            width: '50%',
            stack: [
              { text: 'FACTURE À', fontSize: 8, bold: true, color: GREY, letterSpacing: 1 },
              { text: clientName, fontSize: 11, bold: true, color: DARK, margin: [0, 4, 0, 2] },
              { text: 'Client Ecom Plus Gabon', fontSize: 8.5, color: GREY },
            ],
          },
          {
            width: '50%',
            alignment: 'right',
            stack: [
              { text: 'INFORMATIONS DE PAIEMENT', fontSize: 8, bold: true, color: GREY, letterSpacing: 1 },
              { text: 'Moyen : Mobile Money Gabon', fontSize: 9, bold: true, color: DARK, margin: [0, 4, 0, 2] },
              {
                text: [
                  { text: 'Statut : ', color: GREY },
                  { text: '✓ Payé & Validé', bold: true, color: GREEN }
                ],
                fontSize: 9
              }
            ],
          },
        ],
        margin: [0, 0, 0, 20],
      },

      // Items Table if present
      ...((order.items && order.items.length > 0) ? [
        {
          text: 'DÉTAILS DES PRODUITS COMMANDÉS',
          fontSize: 8,
          bold: true,
          color: GREY,
          letterSpacing: 1,
          margin: [0, 0, 0, 6]
        },
        {
          table: {
            widths: ['*', 50, 80, 80],
            headerRows: 1,
            body: [
              [
                { text: 'PRODUIT', style: 'tableHeader' },
                { text: 'QTÉ', style: 'tableHeader', alignment: 'center' },
                { text: 'PRIX UNITAIRE', style: 'tableHeader', alignment: 'right' },
                { text: 'TOTAL', style: 'tableHeader', alignment: 'right' },
              ],
              ...order.items.map((item: any, i: number) => {
                const unitPriceXaf = Math.round(((item.product?.prix_cny || 0) / 100) * (config?.exchange_rate || 95));
                const totalXaf = unitPriceXaf * item.quantity;
                const bg = i % 2 === 0 ? '#FFFFFF' : LIGHT_GREY;
                return [
                  { text: item.product?.nom || 'Produit', fillColor: bg, margin: [4, 6, 4, 6] },
                  { text: String(item.quantity), alignment: 'center', fillColor: bg, margin: [4, 6, 4, 6] },
                  { text: formatFCFA(unitPriceXaf), alignment: 'right', fillColor: bg, margin: [4, 6, 4, 6] },
                  { text: formatFCFA(totalXaf), alignment: 'right', fillColor: bg, bold: true, margin: [4, 6, 4, 6] },
                ];
              })
            ]
          },
          layout: {
            hLineWidth: (i: number, node: any) => (i === 0 || i === 1 || i === node.table.body.length ? 1 : 0.5),
            vLineWidth: () => 0,
            hLineColor: (i: number) => (i === 0 || i === 1 ? GREEN : BORDER),
            fillColor: (rowIndex: number) => rowIndex === 0 ? GREEN_BG : null,
          },
          margin: [0, 0, 0, 15]
        }
      ] : []),

      // Totals Table
      {
        alignment: 'right',
        table: {
          widths: [200, 100],
          body: [
            [
              { text: 'Sous-total produits', color: GREY, border: [false, false, false, false], margin: [0, 2, 4, 2] },
              { text: formatFCFACFA(subtotalProducts), alignment: 'right', border: [false, false, false, false], margin: [0, 2, 0, 2] },
            ],
            [
              { text: `Commission (${commission.taux}%)`, color: GREY, border: [false, false, false, false], margin: [0, 2, 4, 2] },
              { text: formatFCFACFA(commission.montant), alignment: 'right', border: [false, false, false, false], margin: [0, 2, 0, 2] },
            ],
            [
              { text: `Livraison (${shippingLabel(shippingMethod)})`, color: GREY, border: [false, false, false, false], margin: [0, 2, 4, 2] },
              { text: formatFCFACFA(shipping.montant), alignment: 'right', border: [false, false, false, false], margin: [0, 2, 0, 2] },
            ],
            [
              { text: 'MONTANT TOTAL PAYÉ', bold: true, fontSize: 11, color: GREEN, border: [false, true, false, false], margin: [0, 6, 4, 6] },
              { text: formatFCFACFA(totalTtc), bold: true, fontSize: 11, color: GREEN, alignment: 'right', border: [false, true, false, false], margin: [0, 6, 0, 6] },
            ],
          ],
        },
        layout: { hLineColor: () => BORDER },
        margin: [0, 0, 0, 20],
      },

      // QR Code
      ...(qrCodeDataUrl ? [
        {
          alignment: 'center',
          stack: [
            { image: qrCodeDataUrl, width: 80, alignment: 'center' },
            { text: 'Scannez pour suivre l\'expédition en temps réel', fontSize: 8, color: GREY, alignment: 'center', margin: [0, 4, 0, 0] },
          ],
          margin: [0, 0, 0, 15],
        }
      ] : []),

      {
        text: 'Ce reçu officiel atteste du règlement intégral de la commande et fait foi de prise en charge pour son expédition.',
        fontSize: 8, color: GREY, alignment: 'center', italics: true,
      },
    ],

    styles: {
      tableHeader: {
        bold: true,
        fontSize: 9,
        color: GREEN,
        fillColor: GREEN_BG,
        margin: [4, 6, 4, 6],
      },
    },
  };

  pdfMake.createPdf(docDefinition).download(`recu_${trackingNumber}.pdf`);
}
