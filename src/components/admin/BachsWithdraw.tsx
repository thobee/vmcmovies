"use client";

import { useCallback, useEffect, useState } from "react";
import { Banknote, Loader2, RefreshCw, Search } from "lucide-react";
import { cn } from "@/lib/cn";
import { FormField, inputClass, primaryBtnClass } from "@/components/admin/form";
import { useAdminToast } from "@/components/admin/toast";

type BalanceRow = { currency: string; balanceMinor: number; display: string };
type WithdrawalRow = {
  id: string;
  amountDisplay: string;
  currency: string;
  status: string;
  statusLabel: string;
  reference: string;
  reason: string;
  createdAt: string;
};
type BankOption = { name: string; code: string };

const CURRENCY = "NGN" as const;

const STATUS_STYLE: Record<string, string> = {
  success: "text-emerald-300 border-emerald-500/25 bg-emerald-500/10",
  pending: "text-amber-200 border-amber-500/25 bg-amber-500/10",
  failed: "text-red-300 border-red-500/25 bg-red-500/10",
  reversed: "text-white/50 border-white/10 bg-white/[0.04]",
};

function formatWhen(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function BachsWithdraw() {
  const { toast } = useAdminToast();
  const [ngnBalance, setNgnBalance] = useState<BalanceRow | null>(null);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRow[]>([]);
  const [withdrawnNg, setWithdrawnNg] = useState("₦0");
  const [banks, setBanks] = useState<BankOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [banksLoading, setBanksLoading] = useState(true);
  const [banksError, setBanksError] = useState("");
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const [amount, setAmount] = useState("");
  const [pending, setPending] = useState(false);

  const [accountName, setAccountName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [bankCode, setBankCode] = useState("");
  const [fetchingAccount, setFetchingAccount] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/payments/balance");
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not load balance");
        setNgnBalance(null);
        return;
      }
      const balances = (data.balances ?? []) as BalanceRow[];
      setNgnBalance(balances.find((b) => b.currency === "NGN") ?? null);
      setWithdrawals((data.withdrawals ?? []).filter((w: WithdrawalRow) => w.currency === "NGN"));
      setWithdrawnNg(data.withdrawnTotals?.NGN?.display ?? "₦0");
    } catch {
      setError("Network error loading Bachs balance");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadBanks = useCallback(async () => {
    setBanksLoading(true);
    setBanksError("");
    try {
      const res = await fetch(`/api/admin/payments/recipient?currency=${CURRENCY}`);
      const data = await res.json();
      if (!res.ok) {
        setBanks([]);
        setBanksError(data.error ?? "Could not load banks");
        return;
      }
      const unique = new Map<string, BankOption>();
      for (const b of (data.banks ?? []) as BankOption[]) {
        if (b.code && b.name && !unique.has(b.code)) unique.set(b.code, b);
      }
      const list = [...unique.values()].sort((a, b) => a.name.localeCompare(b.name));
      setBanks(list);
      setBankCode((prev) => (list.some((b) => b.code === prev) ? prev : ""));
    } catch {
      setBanks([]);
      setBanksError("Network error loading banks");
    } finally {
      setBanksLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
    void loadBanks();
  }, [load, loadBanks]);

  const fetchAccount = async () => {
    setError("");
    setOk("");
    if (!accountNumber.trim() || !bankCode) {
      setError("Enter account number and select a bank first");
      toast({ title: "Enter bank and account number", tone: "error" });
      return;
    }
    setFetchingAccount(true);
    try {
      const res = await fetch("/api/admin/payments/recipient", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accountNumber: accountNumber.trim(),
          bankCode,
          currency: CURRENCY,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAccountName("");
        setError(data.error ?? "Could not fetch account");
        toast({ title: "Couldn’t fetch account", message: data.error, tone: "error" });
        return;
      }
      setAccountName(data.accountName ?? "");
      if (data.accountNumber) setAccountNumber(data.accountNumber);
      setOk(`Account found: ${data.accountName}`);
      toast({ title: "Account found", message: data.accountName });
    } catch {
      setError("Network error fetching account");
      toast({ title: "Network error", tone: "error" });
    } finally {
      setFetchingAccount(false);
    }
  };

  const submitWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setOk("");
    setPending(true);
    try {
      const bank = banks.find((b) => b.code === bankCode);
      const res = await fetch("/api/admin/payments/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Number(amount),
          currency: CURRENCY,
          accountNumber,
          bankCode,
          bankName: bank?.name,
          accountName: accountName || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Withdrawal failed");
        toast({ title: "Withdrawal failed", message: data.error, tone: "error" });
        return;
      }
      if (data.accountName) setAccountName(data.accountName);
      const amt =
        typeof data.amountMinor === "number"
          ? `${(data.amountMinor / 100).toLocaleString()} ${data.currency ?? CURRENCY}`
          : "";
      setOk(`${data.message ?? "Withdrawal submitted"}${amt ? ` — ${amt}` : ""}`);
      toast({ title: data.message ?? "Withdrawal submitted", message: amt || undefined });
      setAmount("");
      await load();
    } catch {
      setError("Network error");
      toast({ title: "Network error", tone: "error" });
    } finally {
      setPending(false);
    }
  };

  const canWithdraw =
    Boolean(amount) && Boolean(bankCode) && Boolean(accountNumber.trim()) && Boolean(accountName);

  return (
    <section className="mb-6 space-y-5 rounded-2xl panel p-4 sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-300">
            <Banknote className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">Bachs withdrawals</h2>
            <p className="mt-1 max-w-md text-xs leading-relaxed text-white/40">
              Withdraw NGN from your Bachs balance to a Nigerian bank account.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            void load();
            void loadBanks();
          }}
          disabled={loading || banksLoading}
          className="inline-flex min-h-10 items-center justify-center gap-1.5 self-start rounded-lg border border-white/10 px-3 py-2 text-xs font-medium text-white/50 hover:bg-white/[0.04] hover:text-white disabled:opacity-50"
        >
          <RefreshCw className={cn("h-3.5 w-3.5", (loading || banksLoading) && "animate-spin")} />
          Refresh
        </button>
      </div>

      <p className="rounded-xl border border-white/[0.06] bg-[#141414] px-3.5 py-2.5 text-[11px] leading-relaxed text-white/40">
        <span className="font-medium text-white/55">Note:</span> New payout destinations may need
        approval in the{" "}
        <a
          href="https://app.bachs.io"
          target="_blank"
          rel="noreferrer"
          className="text-[var(--amber)] hover:underline"
        >
          Bachs dashboard
        </a>{" "}
        before the first withdrawal succeeds.
      </p>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-white/[0.06] bg-[#141414] px-4 py-3">
          <p className="text-[10px] uppercase tracking-widest text-white/35">Available · NGN</p>
          <p className="mt-1 text-lg font-bold tabular-nums text-white">
            {loading ? "…" : ngnBalance?.display ?? "₦0"}
          </p>
        </div>
        <div className="rounded-xl border border-white/[0.06] bg-[#141414] px-4 py-3">
          <p className="text-[10px] uppercase tracking-widest text-white/35">Withdrawn · NGN</p>
          <p className="mt-1 text-lg font-bold tabular-nums text-white">
            {loading ? "…" : withdrawnNg}
          </p>
        </div>
      </div>

      <form onSubmit={submitWithdraw} className="space-y-4">
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/35">
          Destination account
        </p>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <FormField label="Bank" required>
            <select
              className={inputClass}
              value={bankCode}
              onChange={(e) => {
                setBankCode(e.target.value);
                setAccountName("");
                setOk("");
              }}
              required
              disabled={banksLoading}
            >
              <option value="">
                {banksLoading ? "Loading banks…" : "Select bank"}
              </option>
              {banks.map((b) => (
                <option key={b.code} value={b.code}>
                  {b.name}
                </option>
              ))}
            </select>
            {banksError && (
              <p className="mt-1.5 text-xs text-red-300">{banksError}</p>
            )}
            {!banksLoading && !banksError && banks.length > 0 && (
              <p className="mt-1.5 text-[11px] text-white/35">{banks.length} Nigerian banks loaded</p>
            )}
          </FormField>

          <FormField label="Account number" required>
            <input
              className={inputClass}
              value={accountNumber}
              onChange={(e) => {
                setAccountNumber(e.target.value);
                setAccountName("");
                setOk("");
              }}
              placeholder="10-digit account number"
              inputMode="numeric"
              autoComplete="off"
              required
            />
          </FormField>
        </div>

        <button
          type="button"
          onClick={() => void fetchAccount()}
          disabled={fetchingAccount || !bankCode || !accountNumber.trim()}
          className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 text-sm font-medium text-white/70 hover:bg-white/[0.08] hover:text-white disabled:opacity-40 sm:w-auto"
        >
          {fetchingAccount ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
          Fetch account name
        </button>

        {accountName ? (
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.06] px-4 py-3">
            <p className="text-[10px] uppercase tracking-widest text-emerald-300/70">Account name</p>
            <p className="mt-1 text-sm font-medium text-white">{accountName}</p>
            <button
              type="button"
              onClick={() => setAccountName("")}
              className="mt-2 text-[11px] text-white/40 hover:text-white/70"
            >
              Use a different account
            </button>
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-3 border-t border-white/[0.06] pt-4 sm:grid-cols-[1fr_auto] sm:items-end">
          <FormField label="Amount (NGN)" required>
            <input
              className={inputClass}
              type="number"
              min="1"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g. 5000"
              required
            />
          </FormField>
          <button
            type="submit"
            disabled={pending || !canWithdraw}
            className={cn(primaryBtnClass, "sm:min-w-[9rem]")}
          >
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Withdraw"}
          </button>
        </div>

        {error && (
          <p className="whitespace-pre-wrap text-xs leading-relaxed text-red-300">{error}</p>
        )}
        {ok && !error && <p className="text-xs text-emerald-300">{ok}</p>}
      </form>

      <div>
        <p className="mb-2.5 text-[11px] font-bold uppercase tracking-[0.16em] text-white/30">
          Withdrawal history
        </p>
        {withdrawals.length === 0 ? (
          <p className="rounded-xl border border-dashed border-white/10 px-4 py-6 text-center text-xs text-white/35">
            No NGN withdrawals yet.
          </p>
        ) : (
          <ul className="max-h-48 space-y-2 overflow-y-auto overscroll-contain">
            {withdrawals.map((w) => (
              <li
                key={w.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/[0.06] bg-[#141414] px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold tabular-nums text-white">
                    {w.amountDisplay}
                    <span className="ml-1 text-[10px] font-normal text-white/35">{w.currency}</span>
                  </p>
                  <p className="mt-0.5 max-w-[28rem] truncate text-[11px] text-white/35">
                    {formatWhen(w.createdAt)}
                    {w.reason ? ` · ${w.reason}` : ""}
                  </p>
                </div>
                <span
                  className={cn(
                    "rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                    STATUS_STYLE[w.status] ?? STATUS_STYLE.pending,
                  )}
                >
                  {w.statusLabel}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
