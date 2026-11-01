<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use RuntimeException;
use Symfony\Component\Console\Formatter\OutputFormatter;
 
/**
 * php artisan universe:tree            -> samo nazivi
 * php artisan universe:tree --routes   -> nazivi + rute
 *
 * Čita resources/js/config/universe.js i ispisuje:
 *   galaksije > zvjezdani sustavi (starSystems) > nodovi (nodes)
 *
 * universe.js je JS, ne JSON - pa ga čitamo malim parserom:
 *   1) skinemo komentare (// i /* *​/) pazeći da ne diramo stringove -
 *      zato zakomentirane galaksije automatski ne ulaze u ispis
 *   2) rekurzivno pročitamo objekt nakon "universeConfig ="
 */


class UniverseTree extends Command
{
    protected $signature = 'universe:tree
                            {--routes : Uz svaki naziv prikaži i rutu}
                            {--file= : Putanja do universe.js (zadano: resources/js/config/universe.js)}';
 
    protected $description = 'Ispisuje navigaciju (galaksije > zvjezdani sustavi > nodovi) iz universe.js kao stablo';
 
    private const LEVELS = [
        ['counter' => 'galaxies', 'children' => 'starSystems', 'style' => 'fg=magenta;options=bold'],
        ['counter' => 'systems',  'children' => 'nodes',       'style' => 'fg=cyan'],
        ['counter' => 'nodes',    'children' => null,          'style' => 'fg=white'],
    ];
 
    private string $src = '';
    private int $pos = 0;
    private int $len = 0;
 
    public function handle(): int
    {
        $path = $this->option('file') ?: resource_path('js/config/universe.js');
 
        if (!is_file($path)) {
            $this->error("Datoteka ne postoji: {$path}");
            return self::FAILURE;
        }
 
        try {
            $config = $this->parseUniverseConfig(file_get_contents($path));
        } catch (RuntimeException $e) {
            $this->error('Ne mogu pročitati universe.js: ' . $e->getMessage());
            return self::FAILURE;
        }
 
        $galaxies = $config['galaxies'] ?? [];
 
        if (!is_array($galaxies) || count($galaxies) === 0) {
            $this->warn('U universeConfig nema nijedne (ne-zakomentirane) galaksije.');
            return self::SUCCESS;
        }
 
        $showRoutes = (bool) $this->option('routes');
        $center = OutputFormatter::escape((string) ($config['center']['label'] ?? 'LIGHTVERSE'));
        $counts = ['galaxies' => 0, 'systems' => 0, 'nodes' => 0];
 
        $this->newLine();
        $this->line("<fg=white;options=bold>{$center}</>");
        $this->renderLevel($galaxies, 0, '', $showRoutes, $counts);
        $this->newLine();
        $this->line(sprintf(
            '<fg=green>Ukupno:</> %d galaksija, %d zvjezdanih sustava, %d nodova',
            $counts['galaxies'],
            $counts['systems'],
            $counts['nodes']
        ));
        $this->newLine();
 
        return self::SUCCESS;
    }
 
    // ─────────────────────────────────────────────────────────
    // ISPIS
    // ─────────────────────────────────────────────────────────
 
    private function renderLevel(array $items, int $depth, string $prefix, bool $showRoutes, array &$counts): void
    {
        $level = self::LEVELS[$depth];
        $items = array_values(array_filter($items, 'is_array'));
        $last = count($items) - 1;
 
        foreach ($items as $i => $item) {
            $counts[$level['counter']]++;
            $isLast = $i === $last;
 
            $label = OutputFormatter::escape((string) ($item['label'] ?? $item['id'] ?? '(bez naziva)'));
            $line = $prefix . ($isLast ? '└─ ' : '├─ ') . "<{$level['style']}>{$label}</>";
 
            if ($showRoutes && !empty($item['route'])) {
                $line .= '  <fg=yellow>' . OutputFormatter::escape((string) $item['route']) . '</>';
            }
 
            $this->line($line);
 
            $childKey = $level['children'];
            if ($childKey !== null && !empty($item[$childKey]) && is_array($item[$childKey])) {
                $this->renderLevel(
                    $item[$childKey],
                    $depth + 1,
                    $prefix . ($isLast ? '    ' : '│   '),
                    $showRoutes,
                    $counts
                );
            }
        }
    }
 
    // ─────────────────────────────────────────────────────────
    // PARSER (podskup JS-a: objekti, nizovi, stringovi, brojevi, true/false/null)
    // ─────────────────────────────────────────────────────────
 
    private function parseUniverseConfig(string $js): array
    {
        $clean = $this->stripComments($js);
 
        if (!preg_match('/universeConfig\s*=\s*/', $clean, $m, PREG_OFFSET_CAPTURE)) {
            throw new RuntimeException('Nije pronađen izraz "universeConfig = ...".');
        }
 
        $this->src = $clean;
        $this->len = strlen($clean);
        $this->pos = $m[0][1] + strlen($m[0][0]);
 
        $value = $this->parseValue();
 
        if (!is_array($value)) {
            throw new RuntimeException('universeConfig nije objekt.');
        }
 
        return $value;
    }
 
    /**
     * Skida // i /* *​/ komentare, ali ne dira sadržaj stringova.
     * Blok komentar zamjenjujemo istim brojem novih redova da brojevi
     * linija u porukama o greškama ostanu točni.
     */
    private function stripComments(string $js): string
    {
        $out = '';
        $len = strlen($js);
        $i = 0;
        $quote = null;
 
        while ($i < $len) {
            $c = $js[$i];
            $next = $js[$i + 1] ?? '';
 
            if ($quote !== null) {
                $out .= $c;
                if ($c === '\\' && $i + 1 < $len) {
                    $out .= $js[$i + 1];
                    $i += 2;
                    continue;
                }
                if ($c === $quote) {
                    $quote = null;
                }
                $i++;
                continue;
            }
 
            if ($c === '"' || $c === "'" || $c === '`') {
                $quote = $c;
                $out .= $c;
                $i++;
                continue;
            }
 
            if ($c === '/' && $next === '/') {
                while ($i < $len && $js[$i] !== "\n") {
                    $i++;
                }
                continue;
            }
 
            if ($c === '/' && $next === '*') {
                $end = strpos($js, '*/', $i + 2);
                $stop = $end === false ? $len : $end + 2;
                $out .= ' ' . str_repeat("\n", substr_count(substr($js, $i, $stop - $i), "\n"));
                $i = $stop;
                continue;
            }
 
            $out .= $c;
            $i++;
        }
 
        return $out;
    }
 
    private function skipWs(): void
    {
        while ($this->pos < $this->len && ctype_space($this->src[$this->pos])) {
            $this->pos++;
        }
    }
 
    private function parseValue()
    {
        $this->skipWs();
 
        if ($this->pos >= $this->len) {
            throw $this->syntaxError('Neočekivani kraj datoteke');
        }
 
        $c = $this->src[$this->pos];
 
        return match (true) {
            $c === '{' => $this->parseObject(),
            $c === '[' => $this->parseArray(),
            $c === '"' || $c === "'" || $c === '`' => $this->parseString(),
            default => $this->parseLiteral(),
        };
    }
 
    private function parseObject(): array
    {
        $this->pos++; // {
        $result = [];
 
        while (true) {
            $this->skipWs();
 
            if ($this->pos >= $this->len) {
                throw $this->syntaxError('Objekt nije zatvoren');
            }
 
            $c = $this->src[$this->pos];
 
            if ($c === '}') {
                $this->pos++;
                return $result;
            }
 
            if ($c === ',') {
                $this->pos++;
                continue;
            }
 
            $key = ($c === '"' || $c === "'") ? $this->parseString() : $this->parseIdentifier();
 
            $this->skipWs();
            if (($this->src[$this->pos] ?? '') !== ':') {
                throw $this->syntaxError("Očekivano ':' nakon ključa \"{$key}\"");
            }
            $this->pos++;
 
            $result[$key] = $this->parseValue();
        }
    }
 
    private function parseArray(): array
    {
        $this->pos++; // [
        $result = [];
 
        while (true) {
            $this->skipWs();
 
            if ($this->pos >= $this->len) {
                throw $this->syntaxError('Niz nije zatvoren');
            }
 
            $c = $this->src[$this->pos];
 
            if ($c === ']') {
                $this->pos++;
                return $result;
            }
 
            if ($c === ',') {
                $this->pos++;
                continue;
            }
 
            $result[] = $this->parseValue();
        }
    }
 
    private function parseString(): string
    {
        $quote = $this->src[$this->pos];
        $this->pos++;
        $buf = '';
 
        while ($this->pos < $this->len) {
            $c = $this->src[$this->pos];
 
            if ($c === '\\') {
                $n = $this->src[$this->pos + 1] ?? '';
 
                if ($n === 'u' && preg_match('/^[0-9a-fA-F]{4}$/', substr($this->src, $this->pos + 2, 4))) {
                    $buf .= mb_chr(hexdec(substr($this->src, $this->pos + 2, 4)), 'UTF-8');
                    $this->pos += 6;
                    continue;
                }
 
                $buf .= match ($n) {
                    'n' => "\n",
                    't' => "\t",
                    'r' => "\r",
                    default => $n,
                };
                $this->pos += 2;
                continue;
            }
 
            if ($c === $quote) {
                $this->pos++;
                return $buf;
            }
 
            $buf .= $c;
            $this->pos++;
        }
 
        throw $this->syntaxError('String nije zatvoren');
    }
 
    private function parseIdentifier(): string
    {
        $start = $this->pos;
 
        while ($this->pos < $this->len && preg_match('/[A-Za-z0-9_$]/', $this->src[$this->pos])) {
            $this->pos++;
        }
 
        if ($this->pos === $start) {
            throw $this->syntaxError('Očekivan naziv ključa');
        }
 
        return substr($this->src, $start, $this->pos - $start);
    }
 
    private function parseLiteral()
    {
        $start = $this->pos;
        $depth = 0;
 
        while ($this->pos < $this->len) {
            $c = $this->src[$this->pos];
 
            if ($c === '(') {
                $depth++;
            } elseif ($c === ')') {
                $depth--;
            } elseif ($depth === 0 && ($c === ',' || $c === '}' || $c === ']')) {
                break;
            }
 
            $this->pos++;
        }
 
        $raw = trim(substr($this->src, $start, $this->pos - $start));
 
        if ($raw === '') {
            throw $this->syntaxError('Prazna vrijednost');
        }
 
        return match ($raw) {
            'true' => true,
            'false' => false,
            'null' => null,
            default => is_numeric($raw) ? $raw + 0 : $raw,
        };
    }
 
    private function syntaxError(string $message): RuntimeException
    {
        $line = substr_count(substr($this->src, 0, $this->pos), "\n") + 1;
 
        return new RuntimeException("{$message} (oko linije {$line})");
    }
}