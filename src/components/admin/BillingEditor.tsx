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
  const [currentTime, setCurrentTime] = useState(0);

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
        setCurrentTime(Date.now());
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
      setCurrentTime(Date.now());
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

  const trialStart = config.welcomeTrial.startsAt
    ? new Date(config.welcomeTrial.startsAt).getTime()
    : Number.NaN;
  const trialEnd = config.welcomeTrial.endsAt
    ? new Date(config.welcomeTrial.endsAt).getTime()
    : Number.NaN;
  const now = currentTime;
  const trialState = !config.welcomeTrial.enabled
    ? { label: "Campaign off", detail: "Turn on the switch below and save to publish it.", live: false }
    : Number.isNaN(trialStart) || Number.isNaN(trialEnd)
      ? { label: "Dates required", detail: "Add a valid start and end date.", live: false }
      : now < trialStart
        ? { label: "Scheduled", detail: "The campaign will appear when the start time arrives.", live: false }
        : now >= trialEnd
          ? { label: "Campaign ended", detail: "Choose a future end date to reopen it.", live: false }
          : { label: "Live now", detail: "Eligible new members can see and activate the offer.", live: true };

  return (
    <div className="space-y-6">
      <FormSection title="Premium prices" hint="One-time plans with no automatic renewal. Changes apply instantly at checkout.">
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
        <NgnPriceInput
          label="12 months"
          value={config.plans.yearly}
          onChange={(v) => setConfig({ ...config, plans: { ...config.plans, yearly: v } })}
        />
      </FormSection>

      <FormSection
        title="New-member launch trial"
        hint="Only accounts created inside this date window can activate the trial. Their access continues for the full duration even after the campaign closes."
      >
        <div
          className={
            trialState.live
              ? "flex items-center justify-between gap-4 rounded-xl bg-emerald-400/[0.09] px-4 py-3 ring-1 ring-inset ring-emerald-300/20"
              : "flex items-center justify-between gap-4 rounded-xl bg-amber-400/[0.07] px-4 py-3 ring-1 ring-inset ring-amber-300/15"
          }
        >
          <div>
            <p className={trialState.live ? "text-sm font-bold text-emerald-200" : "text-sm font-bold text-amber-200"}>
              {trialState.label}
            </p>
            <p className="mt-0.5 text-xs leading-5 text-white/50">{trialState.detail}</p>
          </div>
          <span
            className={
              trialState.live
                ? "h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-300 shadow-[0_0_16px_rgba(110,231,183,0.7)]"
                : "h-2.5 w-2.5 shrink-0 rounded-full bg-amber-300"
            }
            aria-hidden
          />
        </div>
        <div className="rounded-xl bg-emerald-400/[0.07] px-4 py-3 text-sm leading-6 text-emerald-100 ring-1 ring-inset ring-emerald-300/15">
          <span className="font-bold">Recommended launch setup:</span> offer 7 free days and keep the campaign open for 4–6 weeks. The trial begins when an eligible member opens their first Premium download.
        </div>
        <CheckRow
          checked={config.welcomeTrial.enabled}
          onChange={(checked) =>
            setConfig({ ...config, welcomeTrial: { ...config.welcomeTrial, enabled: checked } })
          }
        >
          Welcome trial enabled
        </CheckRow>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Campaign starts" required>
            <input
              className={inputClass}
              type="datetime-local"
              value={config.welcomeTrial.startsAt?.slice(0, 16) ?? ""}
              onChange={(e) =>
                setConfig({
                  ...config,
                  welcomeTrial: {
                    ...config.welcomeTrial,
                    startsAt: e.target.value ? new Date(e.target.value).toISOString() : null,
                  },
                })
              }
            />
          </FormField>
          <FormField label="Campaign ends" required>
            <input
              className={inputClass}
              type="datetime-local"
              value={config.welcomeTrial.endsAt?.slice(0, 16) ?? ""}
              onChange={(e) =>
                setConfig({
                  ...config,
                  welcomeTrial: {
                    ...config.welcomeTrial,
                    endsAt: e.target.value ? new Date(e.target.value).toISOString() : null,
                  },
                })
              }
            />
          </FormField>
        </div>
        <FormField label="Free Premium duration (days)" hint="Seven days is recommended for launch.">
          <input
            className={inputClass}
            type="number"
            min={1}
            max={30}
            value={config.welcomeTrial.durationDays}
            onChange={(e) =>
              setConfig({
                ...config,
                welcomeTrial: {
                  ...config.welcomeTrial,
                  durationDays: Number(e.target.value),
                },
              })
            }
          />
        </FormField>
        <FormField label="Banner title">
          <input
            className={inputClass}
            value={config.welcomeTrial.bannerTitle}
            onChange={(e) =>
              setConfig({
                ...config,
                welcomeTrial: { ...config.welcomeTrial, bannerTitle: e.target.value },
              })
            }
          />
        </FormField>
        <FormField label="Banner body">
          <textarea
            className={inputClass}
            rows={2}
            value={config.welcomeTrial.bannerBody}
            onChange={(e) =>
              setConfig({
                ...config,
                welcomeTrial: { ...config.welcomeTrial, bannerBody: e.target.value },
              })
            }
          />
        </FormField>
        <button
          type="button"
          onClick={() => void save()}
          disabled={saving}
          className={primaryBtnClass}
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save launch trial
        </button>
      </FormSection>

      <FormSection title="Plan promos" hint="Optional time-boxed discounts on any plan (overrides standard price).">
        {(["monthly", "quarterly", "biannual", "yearly"] as const).map((planId) => (
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
