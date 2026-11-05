<?php

namespace App\Policies;

use App\Models\Coin;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class CoinPolicy
{
    use HandlesAuthorization;

    /**
     * SuperAdmin her işlemde tam yetkilidir.
     */
    public function before(User $user, string $ability): ?bool
    {
        if ($user->hasRole('SuperAdmin')) {
            return true;
        }

        return null;
    }

    /**
     * Sikke listesini görüntüleme yetkisi.
     */
    public function viewAny(User $user): bool
    {
        return $user->can('coins.view');
    }

    /**
     * Sikke detayını görüntüleme yetkisi.
     */
    public function view(User $user, Coin $coin): bool
    {
        return $user->can('coins.view');
    }

    /**
     * Yeni sikke oluşturma yetkisi (SuperAdmin, ChiefNumismatist, CatalogEditor).
     * Fotoğrafçı doğrudan yeni sikke kaydı açamaz, var olan taslaklara fotoğraf yükler.
     */
    public function create(User $user): bool
    {
        return $user->can('coins.create');
    }

    /**
     * Sikke düzenleme yetkisi.
     */
    public function update(User $user, Coin $coin): bool
    {
        // Eğer onaylanmışsa, yalnızca ChiefNumismatist düzenleyebilir
        if ($coin->approval_status === 'approved') {
            return $user->can('coins.approve');
        }

        return $user->can('coins.edit_basic') || $user->can('coins.upload_photos');
    }

    /**
     * Sikke silme yetkisi (Yalnızca SuperAdmin ve ChiefNumismatist).
     */
    public function delete(User $user, Coin $coin): bool
    {
        return $user->can('coins.delete');
    }

    /**
     * Eseri onaylama ve canlıya alma yetkisi (Yalnızca ChiefNumismatist).
     */
    public function approve(User $user, Coin $coin): bool
    {
        return $user->can('coins.approve');
    }

    /**
     * Müzayede ve pazar değerlemesi belirleme yetkisi (Yalnızca ChiefNumismatist).
     */
    public function appraise(User $user): bool
    {
        return $user->can('coins.appraise');
    }
}

