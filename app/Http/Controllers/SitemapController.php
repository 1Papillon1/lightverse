<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class SitemapController extends Controller
{
     public function index()
    {
        $urls = [
            url('/'),
            url('/login'),
            url('/register'),
            // Add any other PUBLIC pages here
        ];

        return response()->view('sitemap', compact('urls'))
            ->header('Content-Type', 'text/xml');
    }
}
