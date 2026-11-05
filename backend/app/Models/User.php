<?php

namespace App\Models;

use Filament\Models\Contracts\FilamentUser;
use Filament\Panel;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable implements FilamentUser
{
    use HasFactory, Notifiable, HasRoles;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * Filament Admin paneline giriş yetkisi denetimi.
     */
    public function canAccessPanel(Panel $panel): bool
    {
        // 4 nümizmatik rolden birine sahip olanlar panele erişebilir
        return $this->hasAnyRole([
            'SuperAdmin',
            'ChiefNumismatist',
            'CatalogEditor',
            'Photographer',
        ]);
    }

    public function isSuperAdmin(): bool
    {
        return $this->hasRole('SuperAdmin');
    }

    public function isChiefNumismatist(): bool
    {
        return $this->hasRole('ChiefNumismatist') || $this->isSuperAdmin();
    }

    public function isCatalogEditor(): bool
    {
        return $this->hasRole('CatalogEditor');
    }

    public function isPhotographer(): bool
    {
        return $this->hasRole('Photographer');
    }

    public function createdCoins(): HasMany
    {
        return $this->hasMany(Coin::class, 'created_by');
    }

    public function reviewedCoins(): HasMany
    {
        return $this->hasMany(Coin::class, 'reviewed_by');
    }
}

