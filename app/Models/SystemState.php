<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SystemState extends Model
{
     protected $table = 'system_states';

    protected $fillable = [
        'core_light',
        'stable_light',
        'active_light',
        'total_light',
        'stabilizing',
    ];

    protected $casts = [
        'stabilizing' => 'boolean',
    ];

    /**
     * Singleton accessor.
     * There should only ever be ONE row.
     */
    public static function universe(): self
    {
        return self::firstOrFail();
    }

    /**
     * Recalculate total light.
     */
    public function recalculateTotal(): void
    {
        $this->total_light =
            $this->core_light +
            $this->stable_light +
            $this->active_light;

        $this->save();
    }

    /**
     * Check if system is in stabilization phase.
     */
    public function inStabilization(): bool
    {
        return (bool) $this->stabilizing;
    }
}
