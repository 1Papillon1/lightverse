<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" @class(['dark' => ($appearance ?? 'system') == 'dark'])>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="robots" content="index,follow">
        <meta name="csrf-token" content="{{ csrf_token() }}">

         {{-- ✅ SEO META TAGS --}}
        <meta name="robots" content="index, follow">
        <meta name="author" content="Tin Papucic, Papucic Tin">
        <meta name="theme-color" content="#00ffff">
        
        {{-- ✅ DEFAULT META (will be overridden by page-specific Head tags) --}}
        <meta name="description" content="Build your cosmic identity in Lightverse. Earn Light through contributions, unlock achievements, and explore a 3D universe where your reputation matters.">
        <meta name="keywords" content="lightverse, web3, blockchain, reputation platform, light economy, achievements, identity, cosmic universe, 3D platform">
        
        {{-- ✅ OPEN GRAPH (FACEBOOK/LINKEDIN) --}}
        <meta property="og:type" content="website">
        <meta property="og:site_name" content="Lightverse">
        <meta property="og:locale" content="en_US">
        <meta property="og:url" content="{{ url()->current() }}">
        <meta property="og:title" content="Lightverse - Build Your Cosmic Identity | Earn Light & Grow">
        <meta property="og:description" content="Forge your reputation-based identity in a 3D cosmic universe. Earn Light through contributions, unlock achievements, and build your legacy.">
        <meta property="og:image" content="{{ url('/og-image.png') }}">
        <meta property="og:image:secure_url" content="{{ url('/og-image.png') }}">
        <meta property="og:image:type" content="image/png">
        <meta property="og:image:width" content="1200">
        <meta property="og:image:height" content="630">
        <meta property="og:image:alt" content="Lightverse - Cosmic 3D Universe Platform">

        {{-- ✅ TWITTER CARD --}}
        <meta name="twitter:card" content="summary_large_image">
        <meta name="twitter:site" content="@lightverse">
        <meta name="twitter:creator" content="@lightverse">
        <meta name="twitter:url" content="{{ url()->current() }}">
        <meta name="twitter:title" content="Lightverse - Build Your Cosmic Identity | Earn Light">
        <meta name="twitter:description" content="Build your cosmic identity. Earn Light through contributions. Explore a 3D Web3 universe.">
        <meta name="twitter:image" content="{{ url('/twitter-card.png') }}">
        <meta name="twitter:image:alt" content="Lightverse - Where Light Becomes Reality">
        
        {{-- ✅ MOBILE/PWA META --}}
        <meta name="mobile-web-app-capable" content="yes">
        <meta name="mobile-web-app-status-bar-style" content="black-translucent">
        <meta name="mobile-web-app-title" content="Lightverse">
        
        {{-- ✅ CANONICAL URL (important for SEO) --}}
        <link rel="canonical" href="{{ url()->current() }}">

        {{-- ✅ LLM CONTEXT (for AI crawlers) --}}
        <link rel="alternate" type="text/plain" href="{{ url('/llms.txt') }}" title="LLM Context" />


        {{-- ✅ STRUCTURED DATA (JSON-LD) for better SEO --}}
        <script type="application/ld+json">
        {
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "Lightverse",
            "url": "{{ url('/') }}",
            "description": "Build your cosmic identity. Earn Light through contributions in a 3D Web3 universe.",
            "publisher": {
                "@type": "Organization",
                "name": "Lightverse",
                "logo": {
                    "@type": "ImageObject",
                    "url": "{{ url('/og-image.png') }}"
                }
            }
        }
        </script>

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

            /* ✅ Noscript fallback styles */
            .noscript-content {
                position: fixed;
                inset: 0;
                background: linear-gradient(135deg, #0a0118 0%, #1a0a2e 100%);
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                padding: 2rem;
                text-align: center;
                color: #fff;
                font-family: 'Orbitron', sans-serif;
            }

            .noscript-content h1 {
                font-size: 3rem;
                color: #00ffff;
                text-shadow: 0 0 30px rgba(0, 255, 255, 0.8);
                margin-bottom: 1rem;
            }

            .noscript-content p {
                font-size: 1.2rem;
                margin-bottom: 2rem;
                max-width: 600px;
            }

            .noscript-content a {
                display: inline-block;
                padding: 1rem 2rem;
                margin: 0.5rem;
                background: linear-gradient(135deg, #00ffff, #0088ff);
                color: #000;
                text-decoration: none;
                border-radius: 50px;
                font-weight: 600;
            }
        </style>

        <title inertia>{{ config('app.name', 'Laravel') }}</title>
        <link rel="icon" href="/logo.ico" type="image/x-icon">

        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600|orbitron:400,500" rel="stylesheet" />

       


        @routes
        @viteReactRefresh
        @vite(['resources/js/app.jsx', 'resources/js/styles/app.scss'])

        @inertiaHead
    </head>
    <body class="font-sans antialiased">
        {{-- ✅ NOSCRIPT FALLBACK (for crawlers without JS) --}}
        <noscript>
            <div class="noscript-content">
                <h1>LIGHTVERSE</h1>
                <p>Where Light Becomes Reality</p>
                <h2 style="color: #ff9900; font-size: 1.8rem; margin: 2rem 0;">Build Your Cosmic Identity</h2>
                <p>Earn Light through contributions, unlock achievements, and explore a 3D universe where your reputation matters. Join the future of Web3.</p>
                <div>
                    <a href="/register">Forge your Identity</a>
                    <a href="/login" style="background: transparent; border: 2px solid #00ffff; color: #00ffff;">Restore your Light</a>
                </div>
                <p style="margin-top: 3rem; font-size: 0.9rem; opacity: 0.7;">JavaScript is required for the full Lightverse experience.</p>
            </div>
        </noscript>

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