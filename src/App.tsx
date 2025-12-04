// src/App.tsx
import React, { useEffect, useState } from 'react';
import {
  authenticate,
  deposit,
  isWebView,
  TransactionResult,
  TokenName,
} from '@lemoncash/mini-app-sdk';
import SuccessView from './SuccessView';

const DEV_FORCE_WEBVIEW = true;

// ---------- Tipos ----------
type EsimPlan = {
  id: string;
  name: string;
  description: string;
  priceUSDC: string; // lo usamos como string para deposit()
};

type TxStatus = 'idle' | 'pending' | 'success' | 'error';

type AiraloPlanFromApi = {
  id: string;
  title: string;
  days: number;
  isUnlimited: boolean;
  data: string;
  priceUsd: number;
  netPriceUsd: number;
};

type AiraloResponse = {
  country: { code: string; name: string; flagImage: string | null };
  operator: { id: number; name: string; image: string | null };
  plans: AiraloPlanFromApi[];
};

export type AiraloOrder = {
  id: number | string | null;
  code: string | null;
  packageId: string | null;
  packageName: string | null;
  data: string | null;
  validityDays: number | null;
  price: number | null;
  currency: string | null;
  manualInstallationHtml: string | null;
  qrInstallationHtml: string | null;
  installationGuideUrl: string | null;
  qrCodeUrl: string | null;
  lpa: string | null;
  directAppleInstallationUrl: string | null;
};

// Países que vamos a soportar al principio (podés sumar más)
const COUNTRY_OPTIONS = [
  { code: 'AR', label: 'Argentina' },
  { code: 'US', label: 'Estados Unidos' },
  { code: 'ES', label: 'España' },
  { code: 'BR', label: 'Brasil' },
  { code: 'CL', label: 'Chile' },
  { code: 'MX', label: 'México' },
];

const App: React.FC = () => {
  const [wallet, setWallet] = useState<string | undefined>(undefined);
  const [authLoading, setAuthLoading] = useState<boolean>(true);

  const [selectedPlan, setSelectedPlan] = useState<EsimPlan | null>(null);
  const [txStatus, setTxStatus] = useState<TxStatus>('idle');
  const [txHash, setTxHash] = useState<string | null>(null);
  const [txError, setTxError] = useState<string | null>(null);

  // 🔹 Estado para destino y planes de Airalo
  const [destinationCode, setDestinationCode] = useState<string>('AR');
  const [destinationName, setDestinationName] = useState<string>('Argentina');
  const [plans, setPlans] = useState<EsimPlan[]>([]);
  const [plansLoading, setPlansLoading] = useState<boolean>(true);
  const [plansError, setPlansError] = useState<string | null>(null);

  // 🔹 Email y orden de Airalo
  const [userEmail, setUserEmail] = useState<string>('');
  const [order, setOrder] = useState<AiraloOrder | null>(null);
  const [orderStatus, setOrderStatus] =
    useState<'idle' | 'creating' | 'error'>('idle');
  const [orderError, setOrderError] = useState<string | null>(null);

  const isRealWebView = isWebView();
  const insideLemon = DEV_FORCE_WEBVIEW || isRealWebView;

  // ---------- Autenticación con Lemon ----------
  useEffect(() => {
    const handleAuthentication = async () => {
      try {
        setAuthLoading(true);

        // Simulación en desktop para desarrollar UI
        if (!isRealWebView && DEV_FORCE_WEBVIEW) {
          setWallet('0xDEV_FAKE_WALLET_1234567890');
          return;
        }

        const result = await authenticate();

        if (result.result === TransactionResult.SUCCESS) {
          setWallet(result.data.wallet);
        }
      } catch (err) {
        console.error('Error during authentication:', err);
      } finally {
        setAuthLoading(false);
      }
    };

    if (insideLemon) {
      void handleAuthentication();
    } else {
      setAuthLoading(false);
    }
  }, [insideLemon, isRealWebView]);

  // ---------- Cargar planes desde tu backend (Airalo) ----------
  useEffect(() => {
    const loadPlans = async () => {
      try {
        setPlansLoading(true);
        setPlansError(null);
        setSelectedPlan(null);

        const res = await fetch(
          `http://localhost:4000/api/airalo/packages?country=${destinationCode}`,
        );

        if (!res.ok) {
          throw new Error('Error al cargar los planes');
        }

        const data: AiraloResponse = await res.json();

        setDestinationName(data.country?.name ?? destinationCode);

        const mappedPlans: EsimPlan[] =
          data.plans?.map((p) => ({
            id: p.id,
            name: p.title,
            description: `${p.isUnlimited ? 'Datos ilimitados' : p.data} · ${
              p.days
            } días`,
            priceUSDC: String(p.priceUsd),
          })) ?? [];

        setPlans(mappedPlans);
        if (mappedPlans.length > 0) {
          setSelectedPlan(mappedPlans[0]);
        }
      } catch (err) {
        console.error(err);
        setPlansError(
          'No pudimos cargar los planes para este destino. Probá de nuevo o elegí otro país.',
        );
        setPlans([]);
      } finally {
        setPlansLoading(false);
      }
    };

    void loadPlans();
  }, [destinationCode]);

  // ---------- Crear orden en Airalo (backend) ----------
  const createAiraloOrder = async (packageId: string, email: string) => {
    try {
      setOrderStatus('creating');
      setOrderError(null);

      const res = await fetch('http://localhost:4000/api/airalo/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ packageId, email }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => null);
        throw new Error(
          errJson?.error || 'No se pudo crear la orden en Airalo.',
        );
      }

      const json = await res.json();
      setOrder(json.order as AiraloOrder);
      setOrderStatus('idle');
    } catch (e: any) {
      console.error('Error al crear la orden:', e);
      setOrderStatus('error');
      setOrderError(e?.message ?? 'Error al crear la orden.');
    }
  };

  // ---------- Pago ----------
  const handlePay = async () => {
    if (!selectedPlan || !wallet || !userEmail) return;

    setTxStatus('pending');
    setTxHash(null);
    setTxError(null);
    setOrder(null);
    setOrderStatus('idle');
    setOrderError(null);

    // Simulación cuando estamos desarrollando fuera del WebView real
    if (!isRealWebView && DEV_FORCE_WEBVIEW) {
      setTimeout(async () => {
        const fakeHash = '0xFAKE_TX_HASH_DEV_123456';
        setTxStatus('success');
        setTxHash(fakeHash);

        // Después del "pago", creamos la orden en Airalo
        await createAiraloOrder(selectedPlan.id, userEmail);
      }, 1200);
      return;
    }

    try {
      const result = await deposit({
        amount: selectedPlan.priceUSDC,
        tokenName: TokenName.USDC,
      });

      if (result.result === TransactionResult.SUCCESS) {
        setTxStatus('success');
        setTxHash(result.data.txHash);

        await createAiraloOrder(selectedPlan.id, userEmail);
      } else if (result.result === TransactionResult.FAILED) {
        setTxStatus('error');
        setTxError(
          result.error.message ?? 'Ocurrió un error al procesar el pago.',
        );
      } else {
        // CANCELLED
        setTxStatus('idle');
      }
    } catch (error: any) {
      console.error('Deposit failed:', error);
      setTxStatus('error');
      setTxError(error?.message ?? 'Ocurrió un error al procesar el pago.');
    }
  };

  // ---------- Si no está dentro de Lemon ----------
  if (!insideLemon) {
    return (
      <div style={styles.pageDark}>
        <div style={styles.card}>
          <div style={styles.brandRow}>
            <div style={styles.logoCircle}>
              <img
                src="/globo-logo.png"
                alt="Globo eSIM"
                style={{ width: 28, height: 28 }}
              />
            </div>
            <div>
              <h1 style={styles.title}>Globo eSIM</h1>
              <p style={styles.subtitleSmall}>Viajar es más fácil conectado.</p>
            </div>
          </div>
          <p style={styles.text}>
            Esta mini app está diseñada para ejecutarse dentro de <b>Lemon Cash</b>.
            Abrila desde la sección de Mini Apps para usarla con tu saldo.
          </p>
        </div>
      </div>
    );
  }

  // ---------- Pantalla de éxito ----------
  if (txStatus === 'success' && txHash && selectedPlan && order) {
    return (
      <div style={styles.pageDark}>
        <div style={styles.card}>
          <SuccessView txHash={txHash} planName={selectedPlan.name} order={order} />
        </div>
      </div>
    );
  }

  // ---------- UI principal ----------
  return (
    <div style={styles.pageDark}>
      <div style={styles.card}>
        {/* Branding */}
        <header style={styles.header}>
          <div style={styles.brandRow}>
            <div style={styles.logoCircle}>
              <img
                src="/globo-logo.png"
                alt="Globo eSIM"
                style={{ width: 50, height: 50 }}
              />
            </div>
            <div>
              <h1 style={styles.title}>Globo eSIM</h1>
              <p style={styles.subtitle}>Viajar es más fácil conectado.</p>
            </div>
          </div>

          {/* Stepper simple */}
          <div style={styles.stepper}>
            <div style={styles.stepActive}>
              <span style={styles.stepNumber}>1</span>
              <span style={styles.stepLabel}>Elegí tu destino y plan</span>
            </div>
            <div style={styles.stepDivider} />
            <div style={styles.step}>
              <span style={styles.stepNumber}>2</span>
              <span style={styles.stepLabel}>Pagá con Lemon</span>
            </div>
            <div style={styles.stepDivider} />
            <div style={styles.step}>
              <span style={styles.stepNumber}>3</span>
              <span style={styles.stepLabel}>Activá tu eSIM</span>
            </div>
          </div>
        </header>

        <p style={styles.text}>
          Comprá tu eSIM en pocos pasos y viajá conectado a más de 200 destinos
          sin dramas con el roaming.
        </p>

        {/* Estado de autenticación / wallet */}
        <section style={styles.walletBox}>
          {authLoading && <span>Conectando con tu cuenta de Lemon...</span>}
          {!authLoading && !wallet && (
            <span style={{ color: '#fecaca' }}>
              No pudimos obtener tu wallet. Cerrá y volvé a abrir la mini app.
            </span>
          )}
          {wallet && (
            <>
              <span style={{ fontSize: 12, color: '#9ca3af' }}>Wallet conectada</span>
              <br />
              <code style={{ fontSize: 13 }}>
                {wallet.slice(0, 6)}...{wallet.slice(-6)}
              </code>
              {DEV_FORCE_WEBVIEW && !isRealWebView && (
                <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>
                  (Modo simulación para desarrollo)
                </p>
              )}
            </>
          )}
        </section>

        {/* Email del viajero */}
        <section style={styles.walletBox}>
          <label style={{ fontSize: 13, color: '#e5e7eb', display: 'block' }}>
            📧 ¿A qué email te mandamos tu eSIM?
          </label>
          <input
            type="email"
            placeholder="tuemail@ejemplo.com"
            value={userEmail}
            onChange={(e) => setUserEmail(e.target.value)}
            style={{
              marginTop: 6,
              width: '100%',
              padding: '8px 10px',
              boxSizing: "border-box",
              borderRadius: 10,
              border: '1px solid rgba(148,163,184,0.5)',
              background: '#020617',
              color: '#e5e7eb',
              fontSize: 14,
            }}
          />
          <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>
            Usaremos este correo para enviarte el QR y las instrucciones de
            instalación.
          </p>
        </section>

        {/* Selector de destino */}
        <section style={styles.destinationBox}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div>
              <p style={styles.sectionTitle}>¿A dónde viajás?</p>
              <p style={{ ...styles.text, marginBottom: 0, fontSize: 12 }}>
                Elegí el país de destino para ver los planes disponibles.
              </p>
            </div>
          </div>

          <select
            value={destinationCode}
            onChange={(e) => {
              const value = e.target.value;
              setDestinationCode(value);
              const selected = COUNTRY_OPTIONS.find((c) => c.code === value);
              setDestinationName(selected?.label ?? value);
            }}
            style={styles.destinationSelect}
          >
            {COUNTRY_OPTIONS.map((c) => (
              <option key={c.code} value={c.code}>
                {c.label}
              </option>
            ))}
          </select>
        </section>

        {/* Planes */}
        <h2 style={styles.sectionTitle}>Planes para {destinationName}</h2>

        {plansLoading && (
          <p style={{ ...styles.text, fontStyle: 'italic' }}>Cargando planes...</p>
        )}

        {!plansLoading && plansError && (
          <p style={{ ...styles.text, color: '#fecaca' }}>{plansError}</p>
        )}

        {!plansLoading && !plansError && plans.length === 0 && (
          <p style={{ ...styles.text, fontStyle: 'italic' }}>
            No encontramos planes para este destino.
          </p>
        )}

        <div style={styles.planList}>
          {!plansLoading &&
            !plansError &&
            plans.map((plan) => {
              const isSelected = selectedPlan?.id === plan.id;
              return (
                <button
                  key={plan.id}
                  style={{
                    ...styles.planButton,
                    borderColor: isSelected ? '#4f46e5' : '#1f2937',
                    boxShadow: isSelected
                      ? '0 0 0 1px rgba(79,70,229,0.6)'
                      : '0 0 0 1px rgba(15,23,42,0.6)',
                    background:
                      'radial-gradient(circle at top left, #0f172a, #020617)',
                  }}
                  onClick={() => setSelectedPlan(plan)}
                >
                  <div style={styles.planHeader}>
                    <span style={styles.planName}>{plan.name}</span>
                    <span style={styles.planPrice}>{plan.priceUSDC} USDC</span>
                  </div>
                  <p style={styles.planDescription}>{plan.description}</p>
                </button>
              );
            })}
        </div>

        {/* Botón de pago */}
        <button
          style={{
            ...styles.payButton,
            opacity:
              !selectedPlan ||
              !wallet ||
              !userEmail ||
              txStatus === 'pending' ||
              orderStatus === 'creating'
                ? 0.6
                : 1,
            cursor:
              !selectedPlan ||
              !wallet ||
              !userEmail ||
              txStatus === 'pending' ||
              orderStatus === 'creating'
                ? 'not-allowed'
                : 'pointer',
          }}
          disabled={
            !selectedPlan ||
            !wallet ||
            !userEmail ||
            txStatus === 'pending' ||
            orderStatus === 'creating'
          }
          onClick={handlePay}
        >
          {txStatus === 'pending' || orderStatus === 'creating'
            ? 'Procesando pago y creando tu eSIM...'
            : selectedPlan
            ? `Pagar ${selectedPlan.priceUSDC} USDC`
            : 'Elegí un plan para continuar'}
        </button>

        {/* Errores */}
        <div style={styles.txBox}>
          {txStatus === 'error' && (
            <p style={{ color: '#fecaca', fontSize: 13 }}>
              ❌ Hubo un problema con el pago.
              <br />
              <span style={{ fontSize: 11 }}>{txError}</span>
            </p>
          )}
          {orderStatus === 'error' && (
            <p style={{ color: '#fecaca', fontSize: 13 }}>
              ❌ El pago se acreditó, pero hubo un problema creando tu eSIM.
              <br />
              <span style={{ fontSize: 11 }}>{orderError}</span>
            </p>
          )}
        </div>

        {/* Mini FAQ */}
        <section style={styles.faqBox}>
          <p style={styles.faqTitle}>Preguntas rápidas</p>
          <ul style={styles.faqList}>
            <li>✔️ Necesitás un celular compatible con eSIM.</li>
            <li>✔️ Vas a recibir el código para activarla al instante.</li>
            <li>✔️ Podés seguir usando tu número de siempre en WhatsApp.</li>
          </ul>
        </section>
      </div>
    </div>
  );
};

// ---------- Estilos ----------
const styles: { [key: string]: React.CSSProperties } = {
  pageDark: {
    minHeight: '100vh',
    margin: 0,
    padding: '16px',
    background: '#020617',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontFamily:
      'system-ui, -apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", sans-serif',
  },
  card: {
    width: '100%',
    maxWidth: 480,
    background: '#020617',
    borderRadius: 24,
    padding: 20,
    boxShadow: '0 18px 40px rgba(0,0,0,0.6)',
    border: '1px solid rgba(148,163,184,0.3)',
  },
  header: {
    marginBottom: 12,
  },
  brandRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  logoCircle: {
    width: 40,
    height: 40,
    borderRadius: 999,
    background: '#020617',
    border: '1px solid rgba(148,163,184,0.4)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 0 15px rgba(56,189,248,0.25)',
  },
  title: {
    fontSize: 20,
    margin: 0,
    color: '#e5e7eb',
    fontWeight: 600,
  },
  subtitle: {
    fontSize: 13,
    margin: 0,
    color: '#9ca3af',
  },
  subtitleSmall: {
    fontSize: 13,
    margin: 0,
    color: '#9ca3af',
  },
  text: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 14,
  },
  stepper: {
    marginTop: 4,
    padding: 6,
    borderRadius: 999,
    background: 'rgba(15,23,42,0.8)',
    display: 'flex',
    alignItems: 'center',
    gap: 4,
  },
  step: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    opacity: 0.5,
  },
  stepActive: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    background: 'rgba(30,64,175,0.8)',
    borderRadius: 999,
    padding: '4px 8px',
  },
  stepNumber: {
    width: 16,
    height: 16,
    borderRadius: 999,
    border: '1px solid rgba(148,163,184,0.6)',
    fontSize: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#e5e7eb',
  },
  stepLabel: {
    fontSize: 11,
    color: '#e5e7eb',
  },
  stepDivider: {
    width: 1,
    height: 16,
    background: 'rgba(31,41,55,0.9)',
  },
  walletBox: {
    marginTop: 8,
    marginBottom: 18,
    padding: 10,
    borderRadius: 16,
    background:
      'linear-gradient(135deg, rgba(15,23,42,0.9), rgba(30,64,175,0.7))',
    border: '1px solid rgba(148,163,184,0.4)',
    color: '#e5e7eb',
    fontSize: 13,
  },
  sectionTitle: {
    fontSize: 15,
    margin: 0,
    marginBottom: 8,
    color: '#e5e7eb',
    fontWeight: 500,
  },
  destinationBox: {
    marginBottom: 14,
    padding: 10,
    borderRadius: 16,
    background: 'rgba(15,23,42,0.9)',
    border: '1px solid rgba(31,41,55,0.9)',
  },
  destinationSelect: {
    marginTop: 6,
    width: '100%',
    padding: '8px 10px',
    borderRadius: 999,
    border: '1px solid rgba(55,65,81,1)',
    backgroundColor: '#020617',
    color: '#e5e7eb',
    fontSize: 13,
    outline: 'none',
  },
  planList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    marginBottom: 18,
  },
  planButton: {
    width: '100%',
    textAlign: 'left',
    padding: 12,
    borderRadius: 16,
    border: '1px solid #1f2937',
    background: '#020617',
    cursor: 'pointer',
  },
  planHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  planName: {
    fontWeight: 500,
    fontSize: 14,
    color: '#e5e7eb',
  },
  planPrice: {
    fontWeight: 600,
    fontSize: 14,
    color: '#e5e7eb',
  },
  planDescription: {
    fontSize: 12,
    color: '#9ca3af',
    margin: 0,
  },
  payButton: {
    width: '100%',
    padding: '12px 16px',
    borderRadius: 999,
    border: 'none',
    background:
      'linear-gradient(90deg, #f97316, #facc15, #22c55e, #0ea5e9, #6366f1)',
    color: '#020617',
    fontWeight: 600,
    fontSize: 15,
    marginTop: 4,
  },
  txBox: {
    minHeight: 40,
    marginTop: 12,
  },
  faqBox: {
    marginTop: 8,
    paddingTop: 8,
    borderTop: '1px solid rgba(31,41,55,0.9)',
  },
  faqTitle: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 4,
  },
  faqList: {
    paddingLeft: 18,
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    fontSize: 11,
    color: '#9ca3af',
  },
};

export default App;
