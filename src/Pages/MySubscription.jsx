import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DashboardShell from "../Components/DashboardShell/DashboardShell";
import { getMySubscription } from "../Services/payment.js";
import "./MySubscription.css";

const formatDate = (value) => {
  if (!value) return "N/A";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "N/A";
  return parsed.toLocaleString();
};

const formatProviderLabel = (value) => {
  const normalized = String(value || "").trim().toLowerCase();
  if (normalized === "paypal") return "PayPal";
  if (normalized === "stripe") return "Stripe";
  return normalized ? normalized.toUpperCase() : "N/A";
};

const getStatusBadgeClass = (status) => {
  const normalized = String(status || "").trim().toLowerCase();
  if (normalized === "active") return "bg-success-subtle text-success";
  if (normalized === "canceled") return "bg-warning-subtle text-warning-emphasis";
  if (normalized === "expired") return "bg-secondary-subtle text-secondary";
  if (normalized === "past_due") return "bg-danger-subtle text-danger";
  return "bg-light text-dark";
};

function MySubscription() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [subscriptionState, setSubscriptionState] = useState(null);

  const loadSubscription = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await getMySubscription();
      setSubscriptionState(response || null);
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message ||
          requestError?.message ||
          "Failed to load subscription."
      );
      setSubscriptionState(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSubscription();
  }, [loadSubscription]);

  const hasActiveSubscription = Boolean(subscriptionState?.hasActiveSubscription);
  const subscription = subscriptionState?.subscription || null;

  return (
    <DashboardShell>
      <section className="container-fluid py-2">
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
          <div>
            <h3 className="fw-bold mb-1">My Subscription</h3>
            <div className="text-muted small">
              Manage your current plan and billing details.
            </div>
          </div>
          <div className="d-flex gap-2">
            <Link to="/pricing" className="btn btn-primary btn-sm">
              Choose Plan
            </Link>
            <Link to="/my-subscription-orders" className="btn btn-outline-secondary btn-sm">
              View subscription orders
            </Link>
          </div>
        </div>

        {error ? <div className="alert alert-danger py-2">{error}</div> : null}

        <div className="card border-0 shadow-sm">
          <div className="card-body">
            {loading ? (
              <div className="text-center py-4">Loading subscription...</div>
            ) : !subscription ? (
              <div className="my-subscription-empty">
                <h5 className="fw-semibold mb-1">No active subscription</h5>
                <p className="text-muted mb-3">
                  You are currently on free access. Upgrade to unlock premium plan benefits.
                </p>
                <Link to="/pricing" className="btn btn-primary btn-sm">
                  Choose Plan
                </Link>
              </div>
            ) : (
              <div className="row g-3">
                <div className="col-12 col-lg-7">
                  <div className="my-subscription-panel">
                    <div className="d-flex align-items-center justify-content-between gap-2 mb-3">
                      <h5 className="fw-semibold mb-0">{subscription.planName || subscription.planCode || "Plan"}</h5>
                      <span className={`badge ${getStatusBadgeClass(subscriptionState?.status)}`}>
                        {String(subscriptionState?.status || "inactive").toUpperCase()}
                      </span>
                    </div>
                    <div className="row gy-2 small">
                      <div className="col-5 text-muted">Plan code</div>
                      <div className="col-7">{subscription.planCode || "N/A"}</div>
                      <div className="col-5 text-muted">Billing interval</div>
                      <div className="col-7">{String(subscription.billingInterval || "monthly").toUpperCase()}</div>
                      <div className="col-5 text-muted">Payment provider</div>
                      <div className="col-7">{formatProviderLabel(subscription.paymentProvider)}</div>
                      <div className="col-5 text-muted">Started at</div>
                      <div className="col-7">{formatDate(subscription.startedAt)}</div>
                      <div className="col-5 text-muted">Renewal at</div>
                      <div className="col-7">{formatDate(subscription.renewalAt)}</div>
                      <div className="col-5 text-muted">Current order id</div>
                      <div className="col-7 text-break">{subscription.currentOrderId || "N/A"}</div>
                      <div className="col-5 text-muted">Updated at</div>
                      <div className="col-7">{formatDate(subscription.updatedAt)}</div>
                    </div>
                  </div>
                </div>
                <div className="col-12 col-lg-5">
                  <div className="my-subscription-side">
                    <h6 className="fw-semibold mb-2">Subscription status</h6>
                    {hasActiveSubscription ? (
                      <p className="text-success mb-3">
                        Your subscription is active and ready to use.
                      </p>
                    ) : (
                      <p className="text-muted mb-3">
                        This subscription is not active right now.
                      </p>
                    )}
                    <div className="d-grid gap-2">
                      <Link to="/pricing" className="btn btn-primary btn-sm">
                        Change Plan
                      </Link>
                      <Link to="/my-subscription-orders" className="btn btn-outline-secondary btn-sm">
                        Subscription Order History
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </DashboardShell>
  );
}

export default MySubscription;
