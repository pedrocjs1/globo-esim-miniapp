import { Router } from "express";
import { airaloRequest } from "../airaloClient";

const router = Router();

// GET /api/airalo/packages?country=AR
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

    // ⭐ TRADUCCIÓN AUTOMÁTICA DE TÍTULOS
    const plans =
      operator?.packages?.map((p: any) => {
        const daysLabel = p.day === 1 ? "día" : "días";

        const titleEs = p.is_unlimited
          ? `Datos ilimitados - ${p.day} ${daysLabel}`
          : `${p.data} - ${p.day} ${daysLabel}`;

        return {
          id: p.id,
          title: titleEs, // ← título traducido
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

export default router;
