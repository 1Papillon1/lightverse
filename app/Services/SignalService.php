<?php

namespace App\Services;

use Illuminate\Support\Collection;

class SignalService
{
    private string $path;

    public function __construct()
    {
        $verified = storage_path('app/verified_signals.json');
        $raw      = storage_path('app/signals.json');

        $this->path = file_exists($verified) ? $verified : $raw;
    }

    public function all(): Collection
    {
        if (!file_exists($this->path)) {
            return collect([]);
        }

        $raw = json_decode(file_get_contents($this->path), true) ?? [];
        return collect($raw);
    }

    public function forGalaxy(string $galaxyHint): Collection
    {
        return $this->all()->filter(function ($signal) use ($galaxyHint) {
            return in_array($galaxyHint, $signal['galaxy_hints'] ?? []);
        })->values();
    }

    public function bySource(string $sourceType): Collection
    {
        return $this->all()
            ->where('source_type', $sourceType)
            ->values();
    }

    public function recent(int $limit = 20): Collection
    {
        return $this->all()
            ->sortByDesc('published_at')
            ->take($limit)
            ->values();
    }

    public function forGalaxyRecent(string $galaxyHint, int $limit = 10): Collection
    {
        return $this->forGalaxy($galaxyHint)
            ->sortByDesc('published_at')
            ->take($limit)
            ->values();
    }

    public function search(string $query): Collection
{
    $query = strtolower($query);
    return $this->all()
        ->filter(function ($s) use ($query) {
            return str_contains(strtolower($s['title'] ?? ''), $query)
                || str_contains(strtolower($s['body'] ?? ''), $query);
        })
        ->sortByDesc('published_at')
        ->values();
}

public function bySourceName(string $sourceName): Collection
{
    return $this->all()
        ->filter(fn ($s) => str_starts_with($s['source_name'], $sourceName))
        ->sortByDesc('published_at')
        ->values();
}

public function lastUpdated(): ?string
{
    if (!file_exists($this->path)) return null;
    return date('Y-m-d H:i:s', filemtime($this->path));
}

public function count(): int
{
    return $this->all()->count();
}

public function sourceBreakdown(): array
{
    return $this->all()
        ->groupBy('source_type')
        ->map(fn ($group) => $group->count())
        ->toArray();
}

public const GALAXY_MAP = [
    'economics'  => ['forge', 'signal'],
    'crypto'     => ['forge', 'signal'],
    'science'    => ['lumina-archives', 'signal'],
    'technology' => ['lumina-archives', 'signal'],
    'politics'   => ['signal'],
    'health'     => ['signal'],
    'conflict'   => ['signal'],
];
}