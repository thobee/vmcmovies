"use client";

import { useEffect, useState } from "react";
import { Loader2, Save } from "lucide-react";
import {
  CheckRow,
  FormActions,
  FormError,
  FormField,
  FormSection,
  inputClass,
  primaryBtnClass,
} from "@/components/admin/form";
import { useAdminToast } from "@/components/admin/toast";
import type { BillingConfig } from "@/lib/payments/billing/types";

type PriceRow = { NGN: number; GHS: number };

function NgnPriceInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: PriceRow;
  onChange: (v: PriceRow) => void;
}) {
  return (
    <FormField label={`${label} (₦)`}>
      <input
        className={inputClass}
        type="number"
        min={0}
        value={value.NGN}
        onChange={(e) => onChange({ NGN: Number(e.target.value), GHS: 0 })}
      />
    </FormField>
  );
}

export default function BillingEditor() {
  const { toast } = useAdminToast();
  const [config, setConfig] = useState<BillingConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch("/api/admin/billing");
        const data = await res.json();
        if (res.ok) setConfig(data.config);
        else setError(data.error ?? "Could not load billing");
      } catch {
        setError("Network error");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const save = async () => {
    if (!config) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin/billing", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Save failed");
        toast({ title: "Save failed", message: data.error, tone: "error" });
        return;
      }
      setConfig(data.config);
      toast({ title: "Billing saved", message: "Prices and promos are live immediately." });
    } catch {
      setError("Network error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-12 text-sm text-white/45">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading billing…
      </div>
    );
  }

  if (!config) {
    return <p className="text-sm text-red-300">{error || "Billing config unavailable"}</p>;
  }

  return (
    <div className="space-y-6">
      <FormSection title="Standard prices" hint="Used after launch offer ends. Changes apply instantly at checkout.">
        <NgnPriceInput
          label="Monthly"
          value={config.plans.monthly}
          onChange={(v) => setConfig({ ...config, plans: { ...config.plans, monthly: v } })}
        />
        <NgnPriceInput
          label="3 months"
          value={config.plans.quarterly}
          onChange={(v) => setConfig({ ...config, plans: { ...config.plans, quarterly: v } })}
        />
        <NgnPriceInput
          label="6 months"
          value={config.plans.biannual}
          onChange={(v) => setConfig({ ...config, plans: { ...config.plans, biannual: v } })}
        />
      </FormSection>

      <FormSection
        title="Launch offer"
        hint="First paid plan only · monthly · one per account. Turn off or set an end date when the launch ends."
      >
        <CheckRow
          checked={config.launchOffer.enabled}
          onChange={(checked) =>
            setConfig({ ...config, launchOffer: { ...config.launchOffer, enabled: checked } })
          }
        >
          Launch offer enabled
        </CheckRow>
        <FormField label="Offer ends (optional)">
          <input
            className={inputClass}
            type="datetime-local"
            value={config.launchOffer.endsAt?.slice(0, 16) ?? ""}
            onChange={(e) =>
              setConfig({
                ...config,
                launchOffer: {
                  ...config.launchOffer,
                  endsAt: e.target.value ? new Date(e.target.value).toISOString() : null,
                },
              })
            }
          />
        </FormField>
        <FormField label="Banner title">
          <input
            className={inputClass}
            value={config.launchOffer.bannerTitle}
            onChange={(e) =>
              setConfig({
                ...config,
                launchOffer: { ...config.launchOffer, bannerTitle: e.target.value },
              })
            }
          />
        </FormField>
        <FormField label="Banner body">
          <input
            className={inputClass}
            value={config.launchOffer.bannerBody}
            onChange={(e) =>
              setConfig({
                ...config,
                launchOffer: { ...config.launchOffer, bannerBody: e.target.value },
              })
            }
          />
        </FormField>
        <NgnPriceInput
          label="Launch monthly price"
          value={config.launchOffer.monthlyPrice}
          onChange={(v) =>
            setConfig({ ...config, launchOffer: { ...config.launchOffer, monthlyPrice: v } })
          }
        />
        <FormField label="Disclosure — use “continues at”, not “renews at”">
          <textarea
            className={inputClass}
            rows={2}
            value={config.launchOffer.disclosure.NGN}
            onChange={(e) =>
              setConfig({
                ...config,
                launchOffer: {
                  ...config.launchOffer,
                  disclosure: { ...config.launchOffer.disclosure, NGN: e.target.value, GHS: "" },
                },
              })
            }
          />
        </FormField>
      </FormSection>

      <FormSection title="Plan promos" hint="Optional time-boxed discounts on any plan (overrides standard price).">
        {(["monthly", "quarterly", "biannual"] as const).map((planId) => (
          <div key={planId} className="rounded-xl border border-white/10 p-4 space-y-3">
            <p className="text-xs font-bold uppercase tracking-wide text-white/45">{planId}</p>
            <CheckRow
              checked={config.planPromos[planId].enabled}
              onChange={(checked) =>
                setConfig({
                  ...config,
                  planPromos: {
                    ...config.planPromos,
                    [planId]: { ...config.planPromos[planId], enabled: checked },
                  },
                })
              }
            >
              Promo enabled
            </CheckRow>
            <FormField label="Promo ends">
              <input
                className={inputClass}
                type="datetime-local"
                value={config.planPromos[planId].endsAt?.slice(0, 16) ?? ""}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    planPromos: {
                      ...config.planPromos,
                      [planId]: {
                        ...config.planPromos[planId],
                        endsAt: e.target.value ? new Date(e.target.value).toISOString() : null,
                      },
                    },
                  })
                }
              />
            </FormField>
            <NgnPriceInput
              label="Promo price"
              value={config.planPromos[planId].prices}
              onChange={(v) =>
                setConfig({
                  ...config,
                  planPromos: {
                    ...config.planPromos,
                    [planId]: { ...config.planPromos[planId], prices: v },
                  },
                })
              }
            />
            <FormField label="Badge label">
              <input
                className={inputClass}
                value={config.planPromos[planId].label}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    planPromos: {
                      ...config.planPromos,
                      [planId]: { ...config.planPromos[planId], label: e.target.value },
                    },
                  })
                }
              />
            </FormField>
          </div>
        ))}
      </FormSection>

      <FormSection title="6-month upsell (launch users)">
        <CheckRow
          checked={config.launchYearlyUpsell.enabled}
          onChange={(checked) =>
            setConfig({
              ...config,
              launchYearlyUpsell: { ...config.launchYearlyUpsell, enabled: checked },
            })
          }
        >
          Show 6-month upsell to users who paid launch price
        </CheckRow>
        <FormField label="Upsell message">
          <input
            className={inputClass}
            value={config.launchYearlyUpsell.message.NGN}
            onChange={(e) =>
              setConfig({
                ...config,
                launchYearlyUpsell: {
                  ...config.launchYearlyUpsell,
                  message: { ...config.launchYearlyUpsell.message, NGN: e.target.value, GHS: "" },
                },
              })
            }
          />
        </FormField>
      </FormSection>

      <FormSection title="Welcome message" hint="Shown on account after first premium purchase.">
        <CheckRow
          checked={config.welcome.enabled}
          onChange={(checked) =>
            setConfig({ ...config, welcome: { ...config.welcome, enabled: checked } })
          }
        >
          Welcome card enabled
        </CheckRow>
        <FormField label="Title">
          <input
            className={inputClass}
            value={config.welcome.title}
            onChange={(e) =>
              setConfig({ ...config, welcome: { ...config.welcome, title: e.target.value } })
            }
          />
        </FormField>
        <FormField label="Intro">
          <textarea
            className={inputClass}
            rows={2}
            value={config.welcome.intro}
            onChange={(e) =>
              setConfig({ ...config, welcome: { ...config.welcome, intro: e.target.value } })
            }
          />
        </FormField>
        <FormField label="How downloads work">
          <textarea
            className={inputClass}
            rows={3}
            value={config.welcome.downloadSteps}
            onChange={(e) =>
              setConfig({
                ...config,
                welcome: { ...config.welcome, downloadSteps: e.target.value },
              })
            }
          />
        </FormField>
        <div className="grid sm:grid-cols-2 gap-2">
          <FormField label="Watch-first button label">
            <input
              className={inputClass}
              value={config.welcome.watchFirstLabel}
              onChange={(e) =>
                setConfig({
                  ...config,
                  welcome: { ...config.welcome, watchFirstLabel: e.target.value },
                })
              }
            />
          </FormField>
          <FormField label="Watch-first link">
            <input
              className={inputClass}
              value={config.welcome.watchFirstHref}
              onChange={(e) =>
                setConfig({
                  ...config,
                  welcome: { ...config.welcome, watchFirstHref: e.target.value },
                })
              }
            />
          </FormField>
        </div>
      </FormSection>

      {error && <FormError>{error}</FormError>}

      <FormActions>
        <button type="button" onClick={() => void save()} disabled={saving} className={primaryBtnClass}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save billing
        </button>
      </FormActions>
    </div>
  );
}
