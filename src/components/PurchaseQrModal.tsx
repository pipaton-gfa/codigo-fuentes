import QRCode from "qrcode";
import { useEffect, useState } from "react";

export function PurchaseQrModal({ qrCode, purchaseId }: { qrCode: string; purchaseId: string }) {
  const [open, setOpen] = useState(false);
  const [qrImage, setQrImage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;

    setError("");
    QRCode.toDataURL(`${window.location.origin}/validar?codigo=${encodeURIComponent(qrCode)}`, {
      width: 420,
      margin: 2,
    })
      .then(setQrImage)
      .catch(() => setError("No se pudo generar la imagen del código QR."));
  }, [open, qrCode]);

  const close = () => {
    setOpen(false);
    setQrImage("");
  };

  const downloadPdf = () => {
    if (!qrImage) return;
    const printWindow = window.open("", "_blank", "width=560,height=720");
    if (!printWindow) {
      setError("Permite las ventanas emergentes para descargar el PDF.");
      return;
    }

    printWindow.document.write(`
      <!doctype html>
      <html lang="es">
        <head>
          <meta charset="utf-8" />
          <title>QR ${purchaseId}</title>
          <style>
            body { margin: 0; padding: 48px; color: #0e283c; font-family: Arial, sans-serif; text-align: center; }
            img { display: block; width: 420px; max-width: 100%; margin: 24px auto; }
            h1 { font-size: 22px; margin: 0; }
            p { color: #567083; font-size: 14px; }
            @media print { body { padding: 24px; } }
          </style>
        </head>
        <body>
          <h1>Código QR de compra ${purchaseId}</h1>
          <img src="${qrImage}" alt="Código QR de compra" />
          <p>Código numérico: ${qrCode}</p>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  return (
    <>
      <button type="button" className="admin-qr-button" onClick={() => setOpen(true)}>
        Ver QR
      </button>
      {open && (
        <div className="admin-qr-backdrop" role="presentation" onMouseDown={close}>
          <section
            className="admin-qr-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby={`qr-title-${purchaseId}`}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="admin-qr-dialog-heading">
              <div>
                <span className="source-kicker">COMPRA {purchaseId}</span>
                <h2 id={`qr-title-${purchaseId}`}>Código QR</h2>
              </div>
              <button type="button" className="admin-qr-close" onClick={close}>
                Cerrar
              </button>
            </div>
            {error ? (
              <p className="source-login-error" role="alert">
                {error}
              </p>
            ) : qrImage ? (
              <img className="admin-qr-image" src={qrImage} alt={`Código QR de compra ${purchaseId}`} />
            ) : (
              <p className="admin-intro">Generando código QR...</p>
            )}
            <p className="admin-qr-number">{qrCode}</p>
            <button type="button" className="admin-qr-download" onClick={downloadPdf} disabled={!qrImage}>
              Descargar QR en PDF
            </button>
          </section>
        </div>
      )}
    </>
  );
}
