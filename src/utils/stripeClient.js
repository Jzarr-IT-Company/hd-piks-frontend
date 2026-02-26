let stripeScriptPromise = null;

export const loadStripeJs = () => {
    if (typeof window === 'undefined') {
        return Promise.reject(new Error('stripe_not_available_in_ssr'));
    }

    if (window.Stripe) {
        return Promise.resolve(window.Stripe);
    }

    if (stripeScriptPromise) {
        return stripeScriptPromise;
    }

    stripeScriptPromise = new Promise((resolve, reject) => {
        const existing = document.querySelector('script[data-stripe-js="true"]');
        if (existing) {
            existing.addEventListener('load', () => {
                if (window.Stripe) resolve(window.Stripe);
                else reject(new Error('stripe_failed_to_initialize'));
            });
            existing.addEventListener('error', () => reject(new Error('stripe_script_load_failed')));
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://js.stripe.com/v3/';
        script.async = true;
        script.dataset.stripeJs = 'true';
        script.onload = () => {
            if (window.Stripe) resolve(window.Stripe);
            else reject(new Error('stripe_failed_to_initialize'));
        };
        script.onerror = () => reject(new Error('stripe_script_load_failed'));
        document.head.appendChild(script);
    });

    return stripeScriptPromise;
};
