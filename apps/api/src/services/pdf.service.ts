import puppeteer from 'puppeteer';
import { Devis, Receipt } from '@ecom/types';
import { generateQRCode } from './qr.service';
import { supabase } from '../lib/supabase';
import fs from 'fs';
import path from 'path';

export const generateDevisPDF = async (devis: Devis, clientName: string): Promise<string> => {
  const qrCode = await generateQRCode(`https://ecomplus.ga/valider/${devis.id}`);
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Helvetica', sans-serif; color: #333; margin: 0; padding: 40px; }
        .header { display: flex; justify-content: space-between; border-bottom: 2px solid #000; padding-bottom: 20px; }
        .logo { font-size: 24px; font-weight: 900; color: #10b981; }
        .title { font-size: 28px; font-weight: bold; margin: 20px 0; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 40px; }
        .info-box h4 { margin: 0 0 10px 0; color: #666; text-transform: uppercase; font-size: 12px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
        th { background: #f8fafc; text-align: left; padding: 12px; border-bottom: 1px solid #e2e8f0; font-size: 12px; }
        td { padding: 12px; border-bottom: 1px solid #f1f5f9; font-size: 13px; }
        .totals { float: right; width: 300px; }
        .total-row { display: flex; justify-content: space-between; padding: 8px 0; }
        .total-ttc { border-top: 2px solid #000; margin-top: 10px; padding-top: 10px; font-weight: bold; font-size: 18px; }
        .qr-section { margin-top: 100px; text-align: center; }
        .qr-section img { width: 120px; }
        .footer { position: fixed; bottom: 40px; left: 40px; right: 40px; font-size: 10px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 10px; }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <div class="logo">ECOM PLUS GABON</div>
          <div style="font-size: 12px; margin-top: 5px;">Sourcing Chine-Gabon • Libreville, Gabon</div>
        </div>
        <div style="text-align: right; font-size: 12px;">
          Reference: <strong>${devis.reference}</strong><br>
          Date: ${new Date(devis.created_at).toLocaleDateString('fr-FR')}
        </div>
      </div>

      <div class="title">DEVIS PROFESSIONNEL</div>

      <div class="info-grid">
        <div class="info-box">
          <h4>DESTINATAIRE</h4>
          <strong>${clientName}</strong><br>
          Gabon
        </div>
        <div class="info-box">
          <h4>EXPÉDITEUR</h4>
          <strong>Ecom Plus Gabon Service Sourcing</strong><br>
          Achat & Logistique Chine-Afrique
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>PRODUIT</th>
            <th style="text-align: center;">QTÉ</th>
            <th style="text-align: right;">PRIX UNITAIRE</th>
            <th style="text-align: right;">TOTAL</th>
          </tr>
        </thead>
        <tbody>
          ${devis.items.map(item => `
            <tr>
              <td>${item.product.nom}</td>
              <td style="text-align: center;">${item.quantity}</td>
              <td style="text-align: right;">${(Math.round((item.product.prix_cny / 100) * 95)).toLocaleString()} F</td>
              <td style="text-align: right;">${(Math.round((item.product.prix_cny / 100) * 95 * item.quantity)).toLocaleString()} F</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="totals">
        <div class="total-row">
          <span>Sous-total produits</span>
          <span>${devis.subtotal_products.toLocaleString()} F CFA</span>
        </div>
        <div class="total-row">
          <span>Commission (${devis.commission.taux}%)</span>
          <span>${devis.commission.montant.toLocaleString()} F CFA</span>
        </div>
        <div class="total-row">
          <span>Livraison (${devis.shipping.method})</span>
          <span>${devis.shipping.montant.toLocaleString()} F CFA</span>
        </div>
        <div class="total-row total-ttc">
          <span>TOTAL TTC</span>
          <span>${devis.total_ttc.toLocaleString()} F CFA</span>
        </div>
      </div>

      <div class="qr-section">
        <img src="${qrCode}" alt="QR Validation"><br>
        <span style="font-size: 10px; color: #666;">Scannez pour valider ce devis</span>
      </div>

      <div class="footer">
        Ecom Plus Gabon — RCCM 2026-B-1234 — IF 000123456 — Contact: +241 00 00 00 00<br>
        Validité du devis: 7 jours à compter de la date d'émission. Les prix peuvent varier selon le taux de change.
      </div>
    </body>
    </html>
  `;

  return await generatePDF(html, `devis_${devis.reference}.pdf`, 'quotes');
};

export const generateReceiptPDF = async (receipt: Receipt, clientName: string): Promise<string> => {
  const qrCode = await generateQRCode(`https://ecomplus.ga/suivi/${receipt.tracking_number}`);
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Helvetica', sans-serif; color: #333; margin: 0; padding: 40px; }
        .header { display: flex; justify-content: space-between; border-bottom: 2px solid #000; padding-bottom: 20px; }
        .logo { font-size: 24px; font-weight: 900; color: #10b981; }
        .title { font-size: 28px; font-weight: bold; margin: 20px 0; }
        .tracking-box { background: #f0fdf4; border: 1px solid #10b981; padding: 20px; border-radius: 12px; text-align: center; margin-bottom: 40px; }
        .tracking-number { font-size: 24px; font-weight: 900; color: #059669; letter-spacing: 2px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
        th { background: #f8fafc; text-align: left; padding: 12px; border-bottom: 1px solid #e2e8f0; font-size: 12px; }
        td { padding: 12px; border-bottom: 1px solid #f1f5f9; font-size: 13px; }
        .qr-section { margin-top: 50px; text-align: center; }
        .qr-section img { width: 120px; }
        .footer { position: fixed; bottom: 40px; left: 40px; right: 40px; font-size: 10px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 10px; }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <div class="logo">ECOM PLUS GABON</div>
          <div style="font-size: 12px; margin-top: 5px;">Sourcing Chine-Gabon • Reçu Officiel</div>
        </div>
        <div style="text-align: right; font-size: 12px;">
          Reference: <strong>${receipt.reference}</strong><br>
          Date: ${new Date(receipt.created_at).toLocaleDateString('fr-FR')}
        </div>
      </div>

      <div class="title">REÇU DE COMMANDE</div>

      <div class="tracking-box">
        <div style="font-size: 12px; color: #059669; font-weight: bold; margin-bottom: 5px;">NUMÉRO DE SUIVI (TRACKING)</div>
        <div class="tracking-number">${receipt.tracking_number}</div>
        <div style="font-size: 10px; margin-top: 5px; color: #666;">Utilisez ce numéro sur ecomplus.ga pour suivre votre colis</div>
      </div>

      <div style="margin-bottom: 40px;">
        <strong>Client:</strong> ${clientName}<br>
        <strong>Statut:</strong> Payé / Validé
      </div>

      <div class="qr-section">
        <img src="${qrCode}" alt="QR Tracking"><br>
        <span style="font-size: 10px; color: #666;">Scannez pour suivre l'expédition en temps réel</span>
      </div>

      <div class="footer">
        Ecom Plus Gabon — RCCM 2026-B-1234 — IF 000123456<br>
        Ce document sert de preuve d'achat et de prise en charge pour le transport international.
      </div>
    </body>
    </html>
  `;

  return await generatePDF(html, `recu_${receipt.reference}.pdf`, 'receipts');
};

const generatePDF = async (html: string, fileName: string, bucket: string): Promise<string> => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'load' });
  const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
  await browser.close();

  const tempPath = path.join('/tmp', fileName);
  if (!fs.existsSync('/tmp')) fs.mkdirSync('/tmp');
  fs.writeFileSync(tempPath, pdfBuffer);

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(fileName, fs.readFileSync(tempPath), {
      contentType: 'application/pdf',
      upsert: true
    });

  if (error) throw error;

  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(fileName);

  return publicUrl;
};
