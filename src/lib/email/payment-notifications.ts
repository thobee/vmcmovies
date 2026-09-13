import { findUserById } from "@/lib/auth/users";
import { getTelegramBotUrl, getTelegramChannelUrl } from "@/lib/catalog/telegram";
import { formatMoney, type PaymentCurrency } from "@/lib/payments/currency";
import { PLANS, getPlanMonths, isKnownPlanId, isPlanId } from "@/lib/payments/plans";
import { getAppUrl } from "@/lib/payments/app-url";
import {
  findPaymentByReference,
  markAdminNotified,
  markUserReceiptSent,
} from "@/lib/payments/records";
import { getAdminNotifyEmail } from "./config";
import { adminPaymentAlertEmail, userReceiptEmail } from "./templates";
import { sendEmail } from "./resend";

function formatExpiry(date: Date): string {
  return date.toLocaleDateString("en-GB", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatPaidAt(date: Date | null | undefined): string {
  const d = date ?? new Date();
  return d.toLocaleString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Send payment emails once per reference. Safe to call after fulfillment or on
 * verify refresh (backfills payments fulfilled before email was configured).
 */
export async function ensurePaymentNotificationEmails(
  reference: string
): Promise<void> {
  try {
    const payment = await findPaymentByReference(reference);
    if (!payment?.premiumActivated) return;

    const user = await findUserById(payment.userId);
    if (!user?.premiumExpiryDate) return;

    const planName =
      payment.planId === "quarterly"
        ? "3 Months"
        : isPlanId(payment.planId)
          ? PLANS[payment.planId].name
          : isKnownPlanId(payment.planId)
            ? `${getPlanMonths(payment.planId)} Months`
            : String(payment.planId);
    const amount = formatMoney(payment.amountMinor / 100, payment.currency);
    const expiry = formatExpiry(user.premiumExpiryDate);
    const paidAt = formatPaidAt(payment.paidAt);
    const appUrl = getAppUrl();
    const telegramBotUrl = getTelegramBotUrl();
    const telegramChannelUrl = getTelegramChannelUrl();

    // notificationSentAt = user receipt sent. Legacy rows may have it set when only admin succeeded.
    const needsUserReceipt =
      !payment.notificationSentAt ||
      (payment.notificationSentAt && !payment.adminNotifiedAt);
    const needsAdminNotify = !payment.adminNotifiedAt;

    if (!needsUserReceipt && !needsAdminNotify) return;

    if (needsUserReceipt) {
      const userOk = await sendEmail({
        to: user.email,
        subject: `Payment confirmed — VMC Premium (${planName})`,
        html: userReceiptEmail({
          userEmail: user.email,
          planName,
          amount,
          expiry,
          paidAt,
          reference,
          appUrl,
          telegramBotUrl,
          telegramChannelUrl,
        }),
      });

      if (userOk) {
        await markUserReceiptSent(reference);
      } else {
        console.warn(
          `[email] user receipt not sent to ${user.email} — verify your domain in Resend to email subscribers`
        );
      }
    }

    if (needsAdminNotify) {
      const adminTo = getAdminNotifyEmail();
      if (!adminTo) {
        console.warn("[email] ADMIN_NOTIFY_EMAIL / ADMIN_EMAIL not set — admin alert skipped");
        return;
      }

      const adminOk = await sendEmail({
        to: adminTo,
        subject: `[VMC] New payment · ${user.email} · ${amount}`,
        html: adminPaymentAlertEmail({
          userEmail: user.email,
          telegram: user.telegramUsername ?? "—",
          planName,
          amount,
          reference,
          expiry,
          paidAt,
          appUrl,
        }),
      });

      if (adminOk) {
        await markAdminNotified(reference);
      }
    }
  } catch (err) {
    console.error("[email] ensure notifications failed", reference, err);
  }
}
