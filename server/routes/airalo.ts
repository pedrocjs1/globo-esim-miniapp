// server/routes/airalo.ts
import { Router } from "express";
import FormData from "form-data";
import { airaloRequest } from "../airaloClient";

const router = Router();

/**
 * GET /api/airalo/packages?country=AR
 * Devuelve los planes simplificados para un país
 */
router.get("/packages", async (req, res) => {
  const country = (req.query.country as string) || "AR";

  try {
    const apiRes = await airaloRequest<any>({
      method: "GET",
      url: "/v2/packages",
      params: {
        "filter[country]": country,
        "filter[type]": "local",
        limit: 2000,
        language: "es",
      },
    });

    const rawCountry = apiRes.data?.[0];

    const countryInfo = {
      code: rawCountry?.country_code ?? country,
      name: rawCountry?.title ?? country,
      flagImage: rawCountry?.image?.url ?? null,
    };

    const operator = rawCountry?.operators?.[0];

    const plans =
      operator?.packages?.map((p: any) => {
        const daysLabel = p.day === 1 ? "día" : "días";

        const titleEs = p.is_unlimited
          ? `Datos ilimitados - ${p.day} ${daysLabel}`
          : `${p.data} - ${p.day} ${daysLabel}`;

        return {
          id: p.id,
          title: titleEs,
          days: p.day,
          isUnlimited: p.is_unlimited,
          data: p.is_unlimited ? "Datos ilimitados" : p.data,
          priceUsd: p.price,
          netPriceUsd: p.net_price,
        };
      }) ?? [];

    res.json({
      country: countryInfo,
      operator: {
        id: operator?.id,
        name: operator?.title,
        image: operator?.image?.url ?? null,
      },
      plans,
    });
  } catch (err) {
    console.error("Error fetching packages:", err);
    res.status(500).json({ error: "Error fetching packages" });
  }
});

/**
 * POST /api/airalo/orders
 * Crea una orden en Airalo para un package_id
 * body: { packageId, email }
 */
router.post("/orders", async (req, res) => {
  try {
    const { packageId, email } = req.body;

    if (!packageId) {
      return res.status(400).json({ error: "packageId es obligatorio" });
    }

    const form = new FormData();
    form.append("quantity", "1");
    form.append("package_id", String(packageId));
    form.append("type", "esim"); // si falla, probá "sim" según la doc

    form.append("description", `Globo eSIM - package ${packageId}`);

    

    if (email) {
      form.append("to_email", email);
      form.append("sharing_option[]", "link");

      if (process.env.AIRALO_DEFAULT_COPY_EMAIL) {
        form.append("copy_address[]", process.env.AIRALO_DEFAULT_COPY_EMAIL);
      }
    }

    const apiRes = await airaloRequest<any>({
      method: "POST",
      url: "/v2/orders",
      data: form,
      headers: form.getHeaders(),
    });

    const data = apiRes.data;
    const sim = data?.sims?.[0];

    const orderPayload = {
      id: data?.id,
      code: data?.code,
      packageId: data?.package_id,
      packageName: data?.package,
      data: data?.data,
      validityDays: data?.validity,
      price: data?.price,
      currency: data?.currency,
      manualInstallationHtml: data?.manual_installation || null,
      qrInstallationHtml: data?.qrcode_installation || null,
      installationGuideUrl:
        data?.installation_guides?.es || data?.installation_guides?.en || null,
      qrCodeUrl: sim?.qrcode_url || null,
      lpa: sim?.qrcode || null,
      directAppleInstallationUrl: sim?.direct_apple_installation_url || null,
    };

    return res.json({ order: orderPayload });
  } catch (err: any) {
    console.error(
      "Error creando orden en Airalo:",
      err?.response?.status,
      err?.response?.data || err
    );

    const apiMessage =
      err?.response?.data?.meta?.message ||
      err?.response?.data?.error ||
      "Error creating Airalo order";

    return res.status(500).json({ error: apiMessage });
  }
});

export default router;
