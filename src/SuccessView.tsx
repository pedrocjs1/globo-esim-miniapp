import React from 'react';

type SuccessViewProps = {
  txHash: string;
  planName: string;
};

const SuccessView: React.FC<SuccessViewProps> = ({ txHash, planName }) => {
  return (
    <div style={styles.container}>
      {/* Reemplazo del ícono 🎈 por tu logo */}
      <div style={styles.iconCircle}>
        <img
            src="/globo-esim.svg"
            alt="Globo eSIM Logo"
            style={{
            width: 80,
            height: 80,
            display: "block",
            objectFit: "contain",
            }}
        />
      </div>


      <h1 style={styles.title}>¡Tu eSIM está lista! 🌍✨</h1>

      <p style={styles.text}>
        Activá tu eSIM del plan <b>{planName}</b> siguiendo las instrucciones que
        vas a ver en la próxima pantalla de Lemon o en el correo del proveedor.
      </p>

      <div style={styles.qrPlaceholder}>
        <p style={styles.qrText}>
          Aquí vamos a mostrar el código QR o link de activación real cuando
          conectemos la API de Airalo.
        </p>
      </div>

      <p style={styles.helperText}>
        Una vez activada, vas a poder usar datos móviles en tu destino sin pagar
        roaming. Recordá encender la eSIM cuando llegues al país.
      </p>

      <div style={styles.txBox}>
        <p style={styles.txLabel}>ID de transacción en Lemon</p>
        <code style={styles.txHash}>{txHash}</code>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    textAlign: 'center',
    color: '#e5e7eb',
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 999,
    background:
      'radial-gradient(circle at top, rgba(248,250,252,0.15), rgba(15,23,42,1))',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 12px auto',
    boxShadow: '0 0 30px rgba(56,189,248,0.4)',
    overflow: 'hidden', // para que quede bien centrado
  },
  title: {
    fontSize: 20,
    margin: '4px 0 8px 0',
  },
  text: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 16,
  },
  qrPlaceholder: {
    borderRadius: 18,
    border: '1px dashed rgba(148,163,184,0.7)',
    padding: 24,
    marginBottom: 16,
    background:
      'radial-gradient(circle at top left, rgba(15,23,42,0.9), rgba(2,6,23,1))',
  },
  qrText: {
    fontSize: 13,
    color: '#9ca3af',
    margin: 0,
  },
  helperText: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 16,
  },
  txBox: {
    padding: 10,
    borderRadius: 12,
    background: 'rgba(15,23,42,0.9)',
    border: '1px solid rgba(55,65,81,0.9)',
    textAlign: 'left',
  },
  txLabel: {
    fontSize: 11,
    color: '#9ca3af',
    marginBottom: 4,
  },
  txHash: {
    fontSize: 12,
    color: '#e5e7eb',
    wordBreak: 'break-all',
  },
};

export default SuccessView;
