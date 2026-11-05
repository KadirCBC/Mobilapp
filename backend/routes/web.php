<?php

use App\Http\Controllers\Admin\AiSettingController;
use App\Http\Controllers\Admin\CoinController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return redirect('/admin/coins');
});

/*
|--------------------------------------------------------------------------
| Admin - Nümizmatik Sikke ve Eser Yönetimi Rotaları
|--------------------------------------------------------------------------
*/
Route::prefix('admin')->name('admin.')->middleware(['web'])->group(function () {
    // 1. Sikkeler CRUD Kaynak Rotaları
    Route::resource('coins', CoinController::class);
    Route::post('coins/{coin}/toggle-publish', [CoinController::class, 'togglePublish'])->name('coins.toggle_publish');
    Route::get('civilizations/{civilization}/mints', [CoinController::class, 'getMintsByCivilization'])->name('civilizations.mints');

    // 2. AI Kontrol Merkezi Rotaları
    Route::prefix('ai')->name('ai.')->group(function () {
        Route::get('/settings', [AiSettingController::class, 'index'])->name('settings');
        Route::post('/settings', [AiSettingController::class, 'update'])->name('settings.update');
        Route::post('/test-connection', [AiSettingController::class, 'testConnection'])->name('test');
    });
});
