import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import '@fortawesome/fontawesome-free/css/all.min.css';

import React from 'react';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) =>
        resolvePageComponent(`./pages/${name}.jsx`, import.meta.glob('./pages/**/*.jsx')),

    setup({ el, App, props }) {
        // ✅ Hide preload screen before mounting
        const preload = document.getElementById('preload-screen');
        if (preload) {
            preload.style.display = 'none';
        }

        const root = createRoot(el);
        const page = <App {...props} />;
        const Layout = App.layout || ((page) => page);
        root.render(Layout(page));
    },

    progress: {
        color: '#4B5563',
    },
});

// Optional: theme setup
// initializeTheme();
