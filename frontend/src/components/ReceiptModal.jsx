import React, { useRef } from 'react';
import { X, Printer, Download, ShieldCheck, CheckCircle, XCircle, CreditCard, Cpu, QrCode } from 'lucide-react';

export default function ReceiptModal({ isOpen, onClose, transaction }) {
  const printRef = useRef(null);

  if (!isOpen || !transaction) return null;

  const receiptRef = `REC-${new Date(transaction.createdAt).getFullYear()}-${transaction.id.slice(0, 8).toUpperCase()}`;
  
  // URL de vérification encodée dans le QR Code
  const qrData = `https://peage.bj/verify?id=${transaction.id}&uid=${transaction.cardUid}&amount=${transaction.amount}&status=${transaction.status}`;
  // Image SVG QR Code via Google Charts API pour haute résolution
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrData)}`;

  const handlePrint = () => {
    const printContent = printRef.current;
    const windowPrint = window.open('', '', 'left=0,top=0,width=800,height=900,toolbar=0,scrollbars=0,status=0');
    windowPrint.document.write(`
      <html>
        <head>
          <title>Reçu de Péage - ${receiptRef}</title>
          <style>
            body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #1e293b; padding: 40px; margin: 0; }
            .header { text-align: center; border-bottom: 2px solid #0284c7; padding-bottom: 20px; margin-bottom: 30px; }
            .logo { font-size: 24px; font-weight: bold; color: #0f172a; }
            .subtitle { font-size: 12px; color: #64748b; margin-top: 5px; text-uppercase: tracking-wider; }
            .badge { display: inline-block; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; }
            .authorized { background: #d1fae5; color: #047857; }
            .refused { background: #fee2e2; color: #b91c1c; }
            .grid { width: 100%; border-collapse: collapse; margin: 20px 0; }
            .grid td { padding: 10px; border-bottom: 1px solid #e2e8f0; font-size: 14px; }
            .grid td.label { font-weight: bold; color: #64748b; width: 40%; }
            .amount-box { background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 12px; padding: 15px; text-align: center; margin: 20px 0; }
            .amount { font-size: 28px; font-weight: 900; color: #0369a1; }
            .footer { text-align: center; font-size: 11px; color: #94a3b8; margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 20px; }
            .qr { text-align: center; margin-top: 20px; }
            .qr img { width: 120px; height: 120px; }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);
    windowPrint.document.close();
    windowPrint.focus();
    setTimeout(() => {
      windowPrint.print();
      windowPrint.close();
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-3xl p-6 shadow-2xl relative text-slate-100 max-h-[90vh] overflow-y-auto">
        
        {/* Bouton Fermer */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Contenu imprimable */}
        <div ref={printRef} className="space-y-6">
          
          {/* En-tête officiel */}
          <div className="text-center border-b border-slate-800 pb-5">
            <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <Cpu className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-black text-white tracking-wide">
              REÇU DE PASSAGE PÉAGE
            </h2>
            <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest block mt-0.5">
              SYSTÈME ÉLECTRONIQUE INTELLIGENT ESP32
            </span>
            <span className="text-xs font-mono text-slate-400 block mt-2">
              Réf : <strong className="text-white">{receiptRef}</strong>
            </span>
          </div>

          {/* Badge Statut */}
          <div className="text-center">
            <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold border ${
              transaction.status === 'AUTHORIZED'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-red-500/10 border-red-500/30 text-red-400'
            }`}>
              {transaction.status === 'AUTHORIZED' ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  PASSAGE AUTORISÉ (BARRIÈRE OUVERTE)
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4" />
                  PASSAGE REFUSÉ ({transaction.reason || 'ERREUR'})
                </>
              )}
            </span>
          </div>

          {/* Grille détails transaction */}
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-4 space-y-3 text-xs">
            <div className="flex justify-between items-center py-1 border-b border-slate-700/40">
              <span className="text-slate-400">Date & Heure :</span>
              <span className="font-mono font-bold text-white">
                {new Date(transaction.createdAt).toLocaleString('fr-FR')}
              </span>
            </div>

            <div className="flex justify-between items-center py-1 border-b border-slate-700/40">
              <span className="text-slate-400">UID Carte RFID :</span>
              <span className="font-mono font-bold text-cyan-400">{transaction.cardUid}</span>
            </div>

            <div className="flex justify-between items-center py-1 border-b border-slate-700/40">
              <span className="text-slate-400">Conducteur :</span>
              <span className="font-bold text-white">{transaction.userName || "Usager"}</span>
            </div>

            <div className="flex justify-between items-center py-1">
              <span className="text-slate-400">Emplacement Péage :</span>
              <span className="font-medium text-slate-200">
                {transaction.tollGate?.name || "Poste Principal - Cotonou"}
              </span>
            </div>
          </div>

          {/* Encadré Montant Déduit */}
          <div className="bg-gradient-to-br from-slate-900 to-cyan-950/40 border border-cyan-500/30 p-4 rounded-2xl text-center space-y-1">
            <span className="text-[11px] text-slate-400 uppercase font-bold tracking-wider block">
              Tarif Déduit du Solde
            </span>
            <div className="text-3xl font-black text-white">
              {transaction.amount.toLocaleString()} <span className="text-lg text-cyan-400">FCFA</span>
            </div>
          </div>

          {/* QR Code de vérification */}
          <div className="flex flex-col items-center justify-center pt-2 space-y-2">
            <div className="p-2 bg-white rounded-xl shadow-md inline-block">
              <img src={qrCodeUrl} alt="QR Code de Vérification" className="w-24 h-24" />
            </div>
            <span className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              Scannez le QR Code pour vérifier l'authenticité
            </span>
          </div>

          {/* Pied de page */}
          <div className="text-center text-[10px] text-slate-500 pt-3 border-t border-slate-800">
            Société Nationale d'Exploitation des Péages - République du Bénin
          </div>
        </div>

        {/* Boutons d'action */}
        <div className="mt-6 flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="flex-1 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition-all"
          >
            <Printer className="w-4 h-4" />
            Imprimer / Télécharger le Reçu PDF
          </button>
        </div>

      </div>
    </div>
  );
}
