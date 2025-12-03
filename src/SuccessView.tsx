import React, { useState } from "react";
import type { AiraloOrder } from "./App";

type SuccessViewProps = {
  txHash: string;
  planName: string;
  order: AiraloOrder;
};

const SuccessView: React.FC<SuccessViewProps> = ({
  txHash,
  planName,
  order,
}) => {
  const [showGuide, setShowGuide] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<"iphone" | "android">(
    "iphone",
  );

  const hasAppleLink = Boolean(order.directAppleInstallationUrl);
  const hasQr = Boolean(order.qrCodeUrl);
  const hasLpa = Boolean(order.lpa);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.iconCircle}>
          <img
            src="/globo-logo.png"
            alt="Globo eSIM Logo"
            style={{ width: 40, height: 40, objectFit: "contain" }}
          />
        </div>
        <div>
          <h1 style={styles.title}>¡Tu eSIM está lista! 🌍✨</h1>
          <p style={styles.subtitle}>
            Ya generamos tu eSIM del plan <b>{planName}</b>. Seguí estos pasos
            para activarla en tu dispositivo.
          </p>
        </div>
      </div>

      {/* Tarjeta principal con QR */}
      <div style={styles.mainCard}>
        {hasQr && (
          <div style={styles.qrBox}>
            <img
              src={order.qrCodeUrl!}
              alt="Código QR de eSIM"
              style={{ width: "100%", maxWidth: 220, height: "auto" }}
            />
            <p style={styles.qrCaption}>
              Escaneá este código con la cámara de tu celular para instalar la
              eSIM.
            </p>
          </div>
        )}

        {/* Botón iPhone automático */}
        {hasAppleLink && (
          <a
            href={order.directAppleInstallationUrl!}
            style={styles.iosButton}
          >
            Instalar automáticamente en iPhone
          </a>
        )}

        {/* LPA */}
        {hasLpa && (
          <div style={styles.lpaBox}>
            <p style={styles.lpaLabel}>Código de activación (LPA)</p>
            <code style={styles.lpaCode}>{order.lpa}</code>
          </div>
        )}

        {/* Guía paso a paso interna */}
        <button
          type="button"
          onClick={() => setShowGuide(true)}
          style={styles.guideLinkButton}
        >
          ▢ Ver guía paso a paso
        </button>

        <p style={styles.helperText}>
          Recordá activar la eSIM recién cuando llegues a tu destino para
          aprovechar al máximo los días de validez del plan.
        </p>

        {/* Resumen del plan */}
        <div style={styles.summaryBox}>
          <p style={styles.summaryTitle}>Resumen del plan</p>
          <ul style={styles.summaryList}>
            <li>Datos: {order.data ?? "No informado"}</li>
            <li>Vigencia: {order.validityDays ?? "–"} días</li>
            <li>
              Precio: {order.price ?? "–"} {order.currency ?? "USD"}
            </li>
          </ul>
        </div>

        {/* TX hash Lemon */}
        <div style={styles.txBox}>
          <p style={styles.txLabel}>ID de transacción en Lemon</p>
          <code style={styles.txHash}>{txHash}</code>
        </div>
      </div>

      {/* Overlay de guía */}
      {showGuide && (
        <div style={styles.guideOverlay}>
          <div style={styles.guideModal}>
            <div style={styles.guideHeader}>
              <h2 style={styles.guideTitle}>Guía de instalación</h2>
              <button
                type="button"
                onClick={() => setShowGuide(false)}
                style={styles.closeButton}
              >
                ✕
              </button>
            </div>

            <p style={styles.guideIntro}>
              Elegí tu tipo de dispositivo para ver los pasos. Vas a usar el{" "}
              <b>QR</b> o el <b>código LPA</b> que ves en la pantalla anterior.
            </p>

            {/* Tabs */}
            <div style={styles.tabRow}>
              <button
                type="button"
                onClick={() => setSelectedDevice("iphone")}
                style={{
                  ...styles.tabButton,
                  ...(selectedDevice === "iphone"
                    ? styles.tabButtonActive
                    : {}),
                }}
              >
                iPhone
              </button>
              <button
                type="button"
                onClick={() => setSelectedDevice("android")}
                style={{
                  ...styles.tabButton,
                  ...(selectedDevice === "android"
                    ? styles.tabButtonActive
                    : {}),
                }}
              >
                Android
              </button>
            </div>

            {/* Contenido por dispositivo */}
            <div style={styles.guideContent}>
              {selectedDevice === "iphone" ? (
                <ol style={styles.stepList}>
                  <li>
                    Abrí <b>Configuración</b> en tu iPhone.
                  </li>
                  <li>
                    Entrá en <b>Datos móviles</b> o <b>Celular</b> &gt;{" "}
                    <b>Agregar eSIM</b>.
                  </li>
                  <li>
                    Elegí <b>Usar código QR</b> y escaneá el QR de Globo eSIM.
                  </li>
                  <li>
                    Si te da la opción <b>Ingresar detalles manualmente</b>,
                    usá el código:
                    <br />
                    <code style={styles.inlineCode}>
                      {order.lpa ?? "LPA:…"}
                    </code>
                  </li>
                  <li>
                    Tocá <b>Continuar / Agregar plan celular</b> y esperá a que
                    se active.
                  </li>
                  <li>
                    Cuando termine, en <b>Datos móviles</b> elegí la eSIM de{" "}
                    <b>Globo</b> como línea para <b>Datos móviles</b>.
                  </li>
                  <li>
                    Al llegar a tu destino, activá la eSIM y desactivá los
                    datos de tu línea física para usar solo los datos del plan.
                  </li>
                </ol>
              ) : (
                <ol style={styles.stepList}>
                  <li>
                    Abrí <b>Configuración</b> en tu Android.
                  </li>
                  <li>
                    Entrá en <b>Conexiones</b> o <b>Redes e Internet</b> &gt;{" "}
                    <b>SIMs</b> o <b>Administrador de SIM</b>.
                  </li>
                  <li>
                    Buscá la opción <b>Agregar eSIM</b> o{" "}
                    <b>Agregar plan móvil</b>.
                  </li>
                  <li>
                    Elegí <b>Escanear código QR</b> y apuntá la cámara al QR de
                    Globo eSIM.
                  </li>
                  <li>
                    Si aparece la opción <b>Ingresar código manualmente</b>, usá
                    este código:
                    <br />
                    <code style={styles.inlineCode}>
                      {order.lpa ?? "LPA:…"}
                    </code>
                  </li>
                  <li>
                    Confirmá la instalación y esperá a que la eSIM se agregue a
                    tu dispositivo.
                  </li>
                  <li>
                    En la sección de <b>SIMs</b>, marcá la eSIM de{" "}
                    <b>Globo</b> como SIM predeterminada para <b>Datos</b>.
                  </li>
                  <li>
                    Al llegar a tu destino, activá los datos móviles en esa SIM
                    y desactivá el roaming de tu línea física para evitar
                    cargos extras.
                  </li>
                </ol>
              )}
            </div>

            <p style={styles.guideFooter}>
              Si tenés dudas con la activación, sacá una captura de esta
              pantalla y enviala a nuestro soporte de Globo eSIM.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    color: "#e5e7eb",
  },
  header: {
    display: "flex",
    gap: 12,
    alignItems: "center",
    marginBottom: 14,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 999,
    background:
      "radial-gradient(circle at top, rgba(248,250,252,0.15), rgba(15,23,42,1))",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 0 25px rgba(56,189,248,0.4)",
  },
  title: {
    fontSize: 20,
    margin: 0,
  },
  subtitle: {
    fontSize: 13,
    margin: 0,
    color: "#9ca3af",
  },
  mainCard: {
    borderRadius: 20,
    background: "rgba(15,23,42,0.95)",
    border: "1px solid rgba(31,41,55,0.9)",
    padding: 16,
  },
  qrBox: {
    borderRadius: 16,
    background:
      "radial-gradient(circle at top, rgba(15,23,42,1), rgba(2,6,23,1))",
    border: "1px solid rgba(55,65,81,0.9)",
    padding: 16,
    textAlign: "center",
    marginBottom: 12,
  },
  qrCaption: {
    marginTop: 8,
    fontSize: 12,
    color: "#9ca3af",
  },
  iosButton: {
    display: "block",
    width: "100%",
    textAlign: "center",
    boxSizing: "border-box",
    marginTop: 8,
    marginBottom: 12,
    padding: "10px 14px",
    borderRadius: 999,
    textDecoration: "none",
    fontWeight: 600,
    fontSize: 14,
    background:
      "linear-gradient(90deg, #22c55e, #0ea5e9, #6366f1)", // verde → celeste → violeta
    color: "#020617",
  },
  lpaBox: {
    marginTop: 4,
    marginBottom: 10,
    padding: 10,
    borderRadius: 14,
    background: "rgba(15,23,42,0.95)",
    border: "1px solid rgba(55,65,81,0.9)",
  },
  lpaLabel: {
    fontSize: 11,
    color: "#9ca3af",
    marginBottom: 4,
  },
  lpaCode: {
    fontSize: 12,
    color: "#e5e7eb",
    wordBreak: "break-all",
  },
  guideLinkButton: {
    marginTop: 2,
    marginBottom: 10,
    border: "none",
    background: "transparent",
    color: "#38bdf8",
    fontSize: 13,
    textAlign: "left",
    padding: 0,
    cursor: "pointer",
  },
  helperText: {
    fontSize: 12,
    color: "#9ca3af",
    marginBottom: 10,
  },
  summaryBox: {
    marginTop: 4,
    padding: 10,
    borderRadius: 14,
    background: "rgba(15,23,42,0.95)",
    border: "1px solid rgba(55,65,81,0.9)",
  },
  summaryTitle: {
    fontSize: 13,
    margin: 0,
    marginBottom: 4,
    fontWeight: 500,
  },
  summaryList: {
    margin: 0,
    paddingLeft: 18,
    fontSize: 12,
    color: "#9ca3af",
  },
  txBox: {
    marginTop: 10,
    padding: 10,
    borderRadius: 12,
    background: "rgba(15,23,42,0.9)",
    border: "1px solid rgba(55,65,81,0.9)",
  },
  txLabel: {
    fontSize: 11,
    color: "#9ca3af",
    marginBottom: 3,
  },
  txHash: {
    fontSize: 12,
    color: "#e5e7eb",
    wordBreak: "break-all",
  },

  // Overlay guía
  guideOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(15,23,42,0.85)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    zIndex: 9999,
  },
  guideModal: {
    width: "100%",
    maxWidth: 480,
    maxHeight: "90vh",
    overflowY: "auto",
    background: "#020617",
    borderRadius: 20,
    border: "1px solid rgba(55,65,81,0.9)",
    boxShadow: "0 24px 60px rgba(0,0,0,0.7)",
    padding: 16,
  },
  guideHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  guideTitle: {
    fontSize: 17,
    margin: 0,
  },
  closeButton: {
    border: "none",
    background: "transparent",
    color: "#9ca3af",
    cursor: "pointer",
    fontSize: 18,
    lineHeight: 1,
  },
  guideIntro: {
    fontSize: 13,
    color: "#9ca3af",
    marginBottom: 10,
  },
  tabRow: {
    display: "flex",
    gap: 6,
    marginBottom: 10,
    background: "rgba(15,23,42,0.9)",
    padding: 4,
    borderRadius: 999,
  },
  tabButton: {
    flex: 1,
    borderRadius: 999,
    border: "none",
    padding: "6px 8px",
    fontSize: 13,
    cursor: "pointer",
    background: "transparent",
    color: "#9ca3af",
  },
  tabButtonActive: {
    background: "rgba(37,99,235,0.9)",
    color: "#e5e7eb",
  },
  guideContent: {
    padding: 8,
    borderRadius: 12,
    background: "rgba(15,23,42,0.95)",
    border: "1px solid rgba(31,41,55,0.9)",
  },
  stepList: {
    margin: 0,
    paddingLeft: 18,
    fontSize: 13,
    color: "#e5e7eb",
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  inlineCode: {
    display: "inline-block",
    marginTop: 4,
    padding: "2px 6px",
    borderRadius: 6,
    background: "rgba(15,23,42,1)",
    border: "1px solid rgba(55,65,81,0.9)",
    fontSize: 12,
  },
  guideFooter: {
    marginTop: 10,
    fontSize: 11,
    color: "#9ca3af",
  },
};

export default SuccessView;
