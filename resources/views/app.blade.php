<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" @class(['dark' => ($appearance ?? 'system') == 'dark'])>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="robots" content="index,follow">

        {{-- Inline script to detect system dark mode preference and apply it immediately --}}
        <script>
            (function() {
                const appearance = '{{ $appearance ?? "system" }}';
                if (appearance === 'system') {
                    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                    if (prefersDark) {
                        document.documentElement.classList.add('dark');
                    }
                }
            })();
        </script>

        {{-- Inline style to set the HTML background color based on our theme in app.css --}}
        <style>
            html {
                background-color:  oklch(0.145 0 0);
            }

            html.dark {
                background-color: oklch(0.145 0 0);
            }

            /* ✅ Preload screen styles matching LoadingScreen.scss */
            #preload-screen {
                position: fixed;
                inset: 0;
                 background: rgba(9, 4, 26, 0.11);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 1000;
                backdrop-filter: blur(5px);
                font-family: 'Orbitron', monospace;
                font-size: 1.3rem;
                color: #fff;
                animation: preloadPulse 2s infinite ease-in-out;
                text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
                transition: opacity 0.3s ease-in-out;
            }

            #preload-title {
                 font-size: 2.5rem;
                    font-weight: 700;
                    margin-bottom: 1rem;
                    color: #fff;
                    text-shadow: 0px 0px 12px #8f00ff, 4px 4px 18px #9000ffa2;
                    letter-spacing: 2px;
                    animation: pulse 2s infinite;
            }

            @keyframes preloadPulse {
                0% { opacity: 0.5; text-shadow: 0 0 10px #ff00ff; }
                50% { opacity: 1; text-shadow: 0 0 20px #ff00ff, 0 0 30px #cc00ff; }
                100% { opacity: 0.5; text-shadow: 0 0 10px #ff00ff; }
            }
        </style>

        <title inertia>{{ config('app.name', 'Laravel') }}</title>
        <link rel="icon" href="/favicon.ico" type="image/x-icon">

        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600|orbitron:400,500" rel="stylesheet" />

        @routes
        @viteReactRefresh
        @vite(['resources/js/app.jsx', 'resources/js/styles/app.scss'])

        @inertiaHead
    </head>
    <body class="font-sans antialiased">
        {{-- ✅ Preload screen before React app is mounted --}}
        <div id="preload-screen">
            <span id="preload-title">
                Loading...
            </span>
        </div>

        {{-- ✅ React / Inertia app mount point --}}
        @inertia
    </body>
</html>
