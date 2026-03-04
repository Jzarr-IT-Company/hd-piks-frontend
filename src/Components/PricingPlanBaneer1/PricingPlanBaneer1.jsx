import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../Context/AuthContext.jsx";
import {
  cancelPayPalSubscriptionOrder,
  capturePayPalSubscriptionOrder,
  createSubscriptionCheckout,
  getMySubscription,
} from "../../Services/payment.js";
import api from "../../Services/api";
import { API_ENDPOINTS } from "../../config/api.config";
import { loadPayPalJs } from "../../utils/paypalClient.js";
import { loadStripeJs } from "../../utils/stripeClient.js";
import "./PricingPlanBanner1.css";

const toErrorMessage = (error, fallback = "Failed to load plans") => {
  const body = error?.response?.data;
  if (body?.message) return String(body.message);
  return fallback;
};

const normalizePlans = (plans = []) =>
  (Array.isArray(plans) ? plans : [])
    .map((plan) => ({
      _id: plan?._id || "",
      planCode: String(plan?.planCode || "").trim(),
      name: String(plan?.name || "").trim(),
      badge: String(plan?.badge || "").trim(),
      audienceTitle: String(plan?.audienceTitle || "").trim(),
      summary: String(plan?.summary || "").trim(),
      priceMonthlyUsd: Number(plan?.priceMonthlyUsd || 0),
      creditsText: String(plan?.creditsText || "").trim(),
      ctaText: String(plan?.ctaText || "Choose Plan").trim(),
      features: Array.isArray(plan?.features) ? plan.features.filter(Boolean) : [],
      sortOrder: Number(plan?.sortOrder || 0),
      isHighlighted: Boolean(plan?.isHighlighted),
    }))
    .filter((plan) => plan.name && Number.isFinite(plan.priceMonthlyUsd))
    .sort((a, b) => {
      if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
      return a.name.localeCompare(b.name);
    });

const normalizeComparisonRows = (rows = []) =>
  (Array.isArray(rows) ? rows : [])
    .map((row) => ({
      feature: String(row?.feature || "").trim(),
      values: Array.isArray(row?.values) ? row.values.map((value) => String(value || "").trim()) : [],
    }))
    .filter((row) => row.feature);

const priceLabel = (amount) => {
  const value = Number(amount);
  if (!Number.isFinite(value)) return "0";
  if (Number.isInteger(value)) return String(value);
  return value.toFixed(2);
};

function PricingPlanBanner1() {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [plans, setPlans] = useState([]);
  const [comparisonRows, setComparisonRows] = useState([]);

  const [checkoutLoadingPlanCode, setCheckoutLoadingPlanCode] = useState("");
  const [checkoutError, setCheckoutError] = useState("");
  const [checkoutSuccessMessage, setCheckoutSuccessMessage] = useState("");
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showCheckoutProviderModal, setShowCheckoutProviderModal] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [paymentIntentMeta, setPaymentIntentMeta] = useState(null);
  const [showPayPalCheckoutModal, setShowPayPalCheckoutModal] = useState(false);
  const [payPalOrderMeta, setPayPalOrderMeta] = useState(null);
  const [payPalCheckoutError, setPayPalCheckoutError] = useState("");
  const [checkoutSubmitting, setCheckoutSubmitting] = useState(false);

  const stripeCardMountRef = useRef(null);
  const stripeInstanceRef = useRef(null);
  const stripeElementsRef = useRef(null);
  const stripeCardElementRef = useRef(null);
  const payPalButtonsHostRef = useRef(null);
  const payPalButtonsRef = useRef(null);

  const stripePublishableKey = useMemo(
    () => String(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "").trim(),
    []
  );
  const payPalClientId = useMemo(
    () => String(import.meta.env.VITE_PAYPAL_CLIENT_ID || "").trim(),
    []
  );
  const hasStripeCheckout = Boolean(stripePublishableKey);
  const hasPayPalCheckout = Boolean(payPalClientId);

  useEffect(() => {
    let mounted = true;
    const loadPlans = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await api.get(API_ENDPOINTS.PUBLIC_SUBSCRIPTION_PLANS);
        if (!mounted) return;
        const payload = response?.data?.data || {};
        setPlans(normalizePlans(payload.plans));
        setComparisonRows(normalizeComparisonRows(payload.comparisonRows));
      } catch (requestError) {
        if (!mounted) return;
        setError(toErrorMessage(requestError));
        setPlans([]);
        setComparisonRows([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    loadPlans();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const setupCardElement = async () => {
      if (!showCheckoutModal || !paymentIntentMeta?.clientSecret || !stripeCardMountRef.current) return;
      if (!stripePublishableKey) {
        setCheckoutError("Stripe is not configured. Missing VITE_STRIPE_PUBLISHABLE_KEY.");
        return;
      }

      try {
        setCheckoutError("");
        const StripeFactory = await loadStripeJs();
        if (cancelled) return;

        stripeInstanceRef.current = StripeFactory(stripePublishableKey);
        stripeElementsRef.current = stripeInstanceRef.current.elements({
          clientSecret: paymentIntentMeta.clientSecret,
        });
        stripeCardElementRef.current = stripeElementsRef.current.create("card", {
          hidePostalCode: true,
        });
        stripeCardElementRef.current.mount(stripeCardMountRef.current);
      } catch (setupError) {
        if (!cancelled) {
          setCheckoutError(setupError?.message || "Failed to initialize payment form.");
        }
      }
    };

    setupCardElement();

    return () => {
      cancelled = true;
      if (stripeCardElementRef.current) {
        stripeCardElementRef.current.destroy();
        stripeCardElementRef.current = null;
      }
      stripeElementsRef.current = null;
      stripeInstanceRef.current = null;
    };
  }, [showCheckoutModal, paymentIntentMeta?.clientSecret, stripePublishableKey]);

  const hasComparison = useMemo(
    () =>
      plans.length > 0 &&
      comparisonRows.length > 0 &&
      comparisonRows.some((row) => Array.isArray(row.values) && row.values.length),
    [plans, comparisonRows]
  );

  const refreshSubscriptionStatus = useCallback(async ({ expectedPlanCode, withRetry = false } = {}) => {
    const fetchOnce = async () => {
      const status = await getMySubscription();
      const activePlanCode = String(status?.subscription?.planCode || "").trim().toLowerCase();
      return {
        raw: status,
        activated: Boolean(status?.hasActiveSubscription) && (!expectedPlanCode || activePlanCode === expectedPlanCode),
      };
    };

    if (!withRetry) return fetchOnce();

    let latest = null;
    for (let attempt = 0; attempt < 5; attempt += 1) {
      latest = await fetchOnce();
      if (latest?.activated) break;
      await new Promise((resolve) => setTimeout(resolve, 1300));
    }
    return latest;
  }, []);

  const closeCheckoutProviderModal = useCallback(() => {
    setShowCheckoutProviderModal(false);
  }, []);

  const closeCheckoutModal = useCallback(() => {
    setShowCheckoutModal(false);
    setPaymentIntentMeta(null);
    setCheckoutSubmitting(false);
  }, []);

  const closePayPalCheckoutModal = useCallback(() => {
    setShowPayPalCheckoutModal(false);
    setPayPalOrderMeta(null);
    setPayPalCheckoutError("");
    setCheckoutSubmitting(false);
  }, []);

  const startStripeCheckout = useCallback(async (plan) => {
    if (!plan?.planCode) return;
    if (!hasStripeCheckout) {
      alert("Stripe is not configured. Configure VITE_STRIPE_PUBLISHABLE_KEY.");
      return;
    }
    setCheckoutLoadingPlanCode(plan.planCode);
    setCheckoutError("");
    setPayPalCheckoutError("");
    setCheckoutSuccessMessage("");
    setSelectedPlan(plan);
    try {
      const payment = await createSubscriptionCheckout(plan.planCode, "stripe");
      if (!payment?.clientSecret) {
        throw new Error("Missing Stripe client secret in subscription checkout response.");
      }
      setPaymentIntentMeta(payment);
      setShowCheckoutModal(true);
    } catch (checkoutStartError) {
      const message =
        checkoutStartError?.response?.data?.message ||
        checkoutStartError?.message ||
        "Failed to start Stripe checkout.";
      setCheckoutError(message);
      alert(message);
    } finally {
      setCheckoutLoadingPlanCode("");
    }
  }, [hasStripeCheckout]);

  const startPayPalCheckout = useCallback(async (plan) => {
    if (!plan?.planCode) return;
    if (!hasPayPalCheckout) {
      alert("PayPal is not configured. Configure VITE_PAYPAL_CLIENT_ID.");
      return;
    }
    setCheckoutLoadingPlanCode(plan.planCode);
    setCheckoutError("");
    setPayPalCheckoutError("");
    setCheckoutSuccessMessage("");
    setSelectedPlan(plan);
    try {
      const payment = await createSubscriptionCheckout(plan.planCode, "paypal");
      if (!payment?.paypalOrderId) {
        throw new Error("Missing PayPal order id in subscription checkout response.");
      }
      setPayPalOrderMeta(payment);
      setShowPayPalCheckoutModal(true);
    } catch (checkoutStartError) {
      const message =
        checkoutStartError?.response?.data?.message ||
        checkoutStartError?.message ||
        "Failed to start PayPal checkout.";
      setPayPalCheckoutError(message);
      alert(message);
    } finally {
      setCheckoutLoadingPlanCode("");
    }
  }, [hasPayPalCheckout]);

  const handleSelectCheckoutProvider = useCallback(async (provider) => {
    setShowCheckoutProviderModal(false);
    if (!selectedPlan) return;
    if (provider === "paypal") {
      await startPayPalCheckout(selectedPlan);
      return;
    }
    await startStripeCheckout(selectedPlan);
  }, [selectedPlan, startPayPalCheckout, startStripeCheckout]);

  const handleChoosePlan = useCallback(async (plan) => {
    if (!plan?.planCode) return;
    if (!isLoggedIn) {
      navigate("/login", { state: { from: window.location.pathname } });
      return;
    }
    if (!hasStripeCheckout && !hasPayPalCheckout) {
      alert("No payment provider is configured. Set Stripe and/or PayPal keys.");
      return;
    }

    setSelectedPlan(plan);
    setCheckoutError("");
    setPayPalCheckoutError("");
    setCheckoutSuccessMessage("");

    if (hasStripeCheckout && hasPayPalCheckout) {
      setShowCheckoutProviderModal(true);
      return;
    }
    if (hasStripeCheckout) {
      await startStripeCheckout(plan);
      return;
    }
    await startPayPalCheckout(plan);
  }, [isLoggedIn, navigate, hasStripeCheckout, hasPayPalCheckout, startStripeCheckout, startPayPalCheckout]);

  const handleSubmitCheckoutPayment = useCallback(async () => {
    if (!stripeInstanceRef.current || !stripeCardElementRef.current || !paymentIntentMeta?.clientSecret) {
      setCheckoutError("Payment form is not ready yet. Please wait a moment.");
      return;
    }

    setCheckoutSubmitting(true);
    setCheckoutError("");
    try {
      const result = await stripeInstanceRef.current.confirmCardPayment(
        paymentIntentMeta.clientSecret,
        {
          payment_method: {
            card: stripeCardElementRef.current,
          },
        }
      );

      if (result?.error) {
        setCheckoutError(result.error.message || "Payment failed.");
        return;
      }

      const status = String(result?.paymentIntent?.status || "").toLowerCase();
      if (status === "succeeded" || status === "processing" || status === "requires_capture") {
        const expectedPlanCode = String(selectedPlan?.planCode || paymentIntentMeta?.planCode || "").trim().toLowerCase();
        const subscriptionState = await refreshSubscriptionStatus({ expectedPlanCode, withRetry: true });
        closeCheckoutModal();

        if (subscriptionState?.activated) {
          setCheckoutSuccessMessage("Payment successful. Subscription is now active.");
        } else {
          setCheckoutSuccessMessage("Payment submitted. Subscription activation may take a moment.");
        }
        return;
      }

      setCheckoutError(`Payment status: ${status || "unknown"}`);
    } catch (submitError) {
      setCheckoutError(submitError?.message || "Checkout failed.");
    } finally {
      setCheckoutSubmitting(false);
    }
  }, [paymentIntentMeta?.clientSecret, paymentIntentMeta?.planCode, selectedPlan?.planCode, closeCheckoutModal, refreshSubscriptionStatus]);

  const finalizePendingPayPalSubscriptionOrder = useCallback(
    async ({ status = "canceled", note = "" } = {}) => {
      const paypalOrderId = payPalOrderMeta?.paypalOrderId || null;
      const orderId = payPalOrderMeta?.subscriptionOrderId || payPalOrderMeta?.orderId || null;
      if (!paypalOrderId && !orderId) return null;
      try {
        return await cancelPayPalSubscriptionOrder({
          paypalOrderId,
          orderId,
          status,
          note,
        });
      } catch {
        return null;
      }
    },
    [payPalOrderMeta?.paypalOrderId, payPalOrderMeta?.subscriptionOrderId, payPalOrderMeta?.orderId]
  );

  const handleCancelPayPalCheckout = useCallback(async () => {
    setCheckoutSubmitting(true);
    await finalizePendingPayPalSubscriptionOrder({
      status: "canceled",
      note: "paypal.subscription_checkout_closed_by_buyer",
    });
    closePayPalCheckoutModal();
    setCheckoutSubmitting(false);
    setCheckoutError("PayPal checkout cancelled.");
  }, [closePayPalCheckoutModal, finalizePendingPayPalSubscriptionOrder]);

  useEffect(() => {
    let cancelled = false;

    const renderPayPalButtons = async () => {
      if (!showPayPalCheckoutModal || !payPalOrderMeta?.paypalOrderId) return;
      if (!payPalClientId) {
        setPayPalCheckoutError("PayPal is not configured. Missing VITE_PAYPAL_CLIENT_ID.");
        return;
      }
      if (!payPalButtonsHostRef.current) return;

      try {
        setPayPalCheckoutError("");
        const paypal = await loadPayPalJs({
          clientId: payPalClientId,
          currency: String(payPalOrderMeta?.currency || "USD").toUpperCase(),
        });
        if (cancelled) return;

        if (payPalButtonsRef.current?.close) {
          payPalButtonsRef.current.close();
          payPalButtonsRef.current = null;
        }
        payPalButtonsHostRef.current.innerHTML = "";

        const buttons = paypal.Buttons({
          style: {
            layout: "vertical",
            shape: "rect",
            label: "paypal",
          },
          createOrder: async () => payPalOrderMeta.paypalOrderId,
          onApprove: async (data) => {
            setCheckoutSubmitting(true);
            setPayPalCheckoutError("");
            try {
              await capturePayPalSubscriptionOrder({
                paypalOrderId: data?.orderID || payPalOrderMeta.paypalOrderId,
                orderId: payPalOrderMeta.subscriptionOrderId || payPalOrderMeta.orderId || null,
              });
              const expectedPlanCode = String(selectedPlan?.planCode || payPalOrderMeta?.planCode || "").trim().toLowerCase();
              const subscriptionState = await refreshSubscriptionStatus({ expectedPlanCode, withRetry: true });
              closePayPalCheckoutModal();

              if (subscriptionState?.activated) {
                setCheckoutSuccessMessage("Payment successful. Subscription is now active.");
              } else {
                setCheckoutSuccessMessage("Payment captured. Subscription activation may take a moment.");
              }
            } catch (approveError) {
              const message =
                approveError?.response?.data?.message ||
                approveError?.message ||
                "Failed to capture PayPal payment.";
              setPayPalCheckoutError(message);
            } finally {
              setCheckoutSubmitting(false);
            }
          },
          onCancel: () => {
            (async () => {
              setCheckoutSubmitting(true);
              await finalizePendingPayPalSubscriptionOrder({
                status: "canceled",
                note: "paypal.subscription_checkout_canceled_by_buyer",
              });
              closePayPalCheckoutModal();
              setCheckoutSubmitting(false);
              setCheckoutError("PayPal checkout cancelled.");
            })();
          },
          onError: (sdkError) => {
            (async () => {
              const reason = sdkError?.message || "paypal.subscription_checkout_failed_in_popup";
              setPayPalCheckoutError(sdkError?.message || "PayPal checkout failed.");
              setCheckoutSubmitting(true);
              await finalizePendingPayPalSubscriptionOrder({
                status: "failed",
                note: reason,
              });
              closePayPalCheckoutModal();
              setCheckoutSubmitting(false);
              setCheckoutError("PayPal checkout failed. Please try again.");
            })();
          },
        });

        payPalButtonsRef.current = buttons;
        await buttons.render(payPalButtonsHostRef.current);
      } catch (renderError) {
        if (!cancelled) {
          setPayPalCheckoutError(renderError?.message || "Failed to initialize PayPal checkout.");
        }
      }
    };

    renderPayPalButtons();

    return () => {
      cancelled = true;
      if (payPalButtonsRef.current?.close) {
        payPalButtonsRef.current.close();
        payPalButtonsRef.current = null;
      }
      if (payPalButtonsHostRef.current) {
        payPalButtonsHostRef.current.innerHTML = "";
      }
    };
  }, [
    showPayPalCheckoutModal,
    payPalOrderMeta?.paypalOrderId,
    payPalOrderMeta?.subscriptionOrderId,
    payPalOrderMeta?.orderId,
    payPalOrderMeta?.currency,
    payPalOrderMeta?.planCode,
    payPalClientId,
    closePayPalCheckoutModal,
    finalizePendingPayPalSubscriptionOrder,
    selectedPlan?.planCode,
    refreshSubscriptionStatus,
  ]);

  return (
    <section className="pricing-page-shell">
      <div className="pricing-header-block">
        <p className="pricing-overline">HDPIKS PRICING</p>
        <h1>Choose a plan for individuals</h1>
      </div>

      {checkoutSuccessMessage ? (
        <div className="pricing-status pricing-status-success">{checkoutSuccessMessage}</div>
      ) : null}
      {checkoutError ? (
        <div className="pricing-status pricing-status-error">{checkoutError}</div>
      ) : null}

      {loading ? (
        <div className="pricing-comparison-block">
          <h3>Loading plans...</h3>
        </div>
      ) : null}

      {!loading && error ? (
        <div className="pricing-comparison-block">
          <h3>Unable to load plans</h3>
          <p className="pricing-footnote">{error}</p>
        </div>
      ) : null}

      {!loading && !error && plans.length === 0 ? (
        <div className="pricing-comparison-block">
          <h3>No active plans available</h3>
          <p className="pricing-footnote">Please check back shortly.</p>
        </div>
      ) : null}

      {!loading && !error && plans.length > 0 ? (
        <>
          <div className="pricing-plan-grid">
            {plans.map((plan) => (
              <article
                key={plan._id || plan.planCode}
                className={`pricing-card ${plan.isHighlighted ? "pricing-card-highlighted" : ""}`}
              >
                <div className="pricing-card-top">
                  <span className="pricing-plan-badge">{plan.badge || plan.planCode || "Plan"}</span>
                  <h2>{plan.name}</h2>
                  {plan.audienceTitle ? <p className="pricing-audience">{plan.audienceTitle}</p> : null}
                  {plan.summary ? <p className="pricing-summary">{plan.summary}</p> : null}
                  <div className="pricing-amount">
                    <span className="currency">USD</span>
                    <strong>${priceLabel(plan.priceMonthlyUsd)}</strong>
                    <span className="duration">/ month</span>
                  </div>
                  {plan.creditsText ? <p className="pricing-credit">{plan.creditsText}</p> : null}
                  <button
                    className="pricing-cta-btn"
                    type="button"
                    onClick={() => handleChoosePlan(plan)}
                    disabled={checkoutLoadingPlanCode === plan.planCode}
                  >
                    {checkoutLoadingPlanCode === plan.planCode ? "Opening checkout..." : plan.ctaText}
                  </button>
                </div>
                <ul className="pricing-feature-list">
                  {(plan.features || []).map((item, featureIndex) => (
                    <li key={`${plan.planCode || plan._id}-${featureIndex}`}>{item}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>

          {hasComparison ? (
            <div className="pricing-comparison-block">
              <h3>Detailed feature comparison</h3>
              <div className="pricing-table-wrap">
                <table className="pricing-table">
                  <thead>
                    <tr>
                      <th>Feature</th>
                      {plans.map((plan, planIndex) => (
                        <th key={`head-${plan.planCode || plan._id || planIndex}`}>{plan.name}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonRows.map((row) => (
                      <tr key={row.feature}>
                        <td>{row.feature}</td>
                        {plans.map((plan, index) => (
                          <td key={`${row.feature}-${plan.planCode || plan._id || index}`}>{row.values[index] || "-"}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}
        </>
      ) : null}

      {showCheckoutProviderModal && (
        <div className="pricing-payment-backdrop" onClick={closeCheckoutProviderModal}>
          <div className="pricing-payment-modal" onClick={(event) => event.stopPropagation()}>
            <h5 className="mb-2">Choose payment method</h5>
            <div className="small text-muted mb-3">
              {selectedPlan?.name || "Plan"}
            </div>
            <div className="d-flex flex-column gap-2">
              <button
                type="button"
                className="btn btn-outline-primary"
                onClick={() => handleSelectCheckoutProvider("stripe")}
                disabled={checkoutLoadingPlanCode || !hasStripeCheckout}
              >
                Pay with Card (Stripe)
              </button>
              <button
                type="button"
                className="btn btn-outline-primary"
                onClick={() => handleSelectCheckoutProvider("paypal")}
                disabled={checkoutLoadingPlanCode || !hasPayPalCheckout}
              >
                Pay with PayPal
              </button>
            </div>
            <button
              type="button"
              className="btn btn-outline-secondary w-100 mt-3"
              onClick={closeCheckoutProviderModal}
              disabled={Boolean(checkoutLoadingPlanCode)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {showPayPalCheckoutModal && payPalOrderMeta && (
        <div className="pricing-payment-backdrop" onClick={handleCancelPayPalCheckout}>
          <div className="pricing-payment-modal" onClick={(event) => event.stopPropagation()}>
            <h5 className="mb-2">Complete subscription checkout</h5>
            <div className="small text-muted mb-3">
              {selectedPlan?.name || payPalOrderMeta?.planName || "Plan"} via PayPal
            </div>
            <div className="pricing-payment-modal__amount">
              {(payPalOrderMeta?.currency || "USD").toUpperCase()} {(Number(payPalOrderMeta?.amountCents || 0) / 100).toFixed(2)}
            </div>
            <div ref={payPalButtonsHostRef} className="pricing-payment-modal__paypal-buttons" />
            {payPalCheckoutError ? (
              <div className="alert alert-danger py-2 px-2 mt-3 mb-0">{payPalCheckoutError}</div>
            ) : null}
            <button
              type="button"
              className="btn btn-outline-secondary w-100 mt-3"
              onClick={handleCancelPayPalCheckout}
              disabled={checkoutSubmitting}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {showCheckoutModal && paymentIntentMeta && (
        <div className="pricing-payment-backdrop" onClick={closeCheckoutModal}>
          <div className="pricing-payment-modal" onClick={(event) => event.stopPropagation()}>
            <h5 className="mb-2">Complete subscription checkout</h5>
            <div className="small text-muted mb-3">
              {selectedPlan?.name || paymentIntentMeta?.planName || "Plan"}
            </div>
            <div className="pricing-payment-modal__amount">
              {(paymentIntentMeta?.currency || "USD").toUpperCase()} {(Number(paymentIntentMeta?.amountCents || 0) / 100).toFixed(2)}
            </div>
            <div ref={stripeCardMountRef} className="pricing-payment-modal__card-element" />
            {checkoutError ? (
              <div className="alert alert-danger py-2 px-2 mt-3 mb-0">{checkoutError}</div>
            ) : null}
            <div className="d-flex gap-2 mt-3">
              <button
                type="button"
                className="btn btn-outline-secondary w-100"
                onClick={closeCheckoutModal}
                disabled={checkoutSubmitting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary w-100"
                onClick={handleSubmitCheckoutPayment}
                disabled={checkoutSubmitting}
              >
                {checkoutSubmitting ? "Processing..." : "Pay now"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default PricingPlanBanner1;
