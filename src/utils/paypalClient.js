let paypalScriptPromise = null;

export const loadPayPalJs = ({ clientId, currency = 'USD' } = {}) => {
    const normalizedClientId = String(clientId || '').trim();
    if (!normalizedClientId) {
        return Promise.reject(new Error('paypal_client_id_missing'));
    }
    if (typeof window === 'undefined') {
        return Promise.reject(new Error('paypal_not_available_in_ssr'));
    }

    if (window.paypal?.Buttons) {
        return Promise.resolve(window.paypal);
    }

    if (paypalScriptPromise) {
        return paypalScriptPromise;
    }

    paypalScriptPromise = new Promise((resolve, reject) => {
        const existing = document.querySelector('script[data-paypal-js="true"]');
        if (existing) {
            existing.addEventListener('load', () => {
                if (window.paypal?.Buttons) resolve(window.paypal);
                else reject(new Error('paypal_failed_to_initialize'));
            });
            existing.addEventListener('error', () => reject(new Error('paypal_script_load_failed')));
            return;
        }

        const script = document.createElement('script');
        script.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(normalizedClientId)}&currency=${encodeURIComponent(currency)}&intent=capture`;
        script.async = true;
        script.dataset.paypalJs = 'true';
        script.onload = () => {
            if (window.paypal?.Buttons) resolve(window.paypal);
            else reject(new Error('paypal_failed_to_initialize'));
        };
        script.onerror = () => reject(new Error('paypal_script_load_failed'));
        document.head.appendChild(script);
    });

    return paypalScriptPromise;
};

