<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('ai_settings', function (Blueprint $table) {
            $table->id();
            $table->string('provider', 50)->default('gemini')->comment('AI Sağlayıcısı (örn: gemini, openai)');
            $table->text('api_key')->nullable()->comment('Şifrelenmiş API anahtarı (Laravel encrypted cast)');
            $table->string('model_name', 100)->default('gemini-1.5-flash')->comment('Model adı: gemini-1.5-flash, gemini-1.5-pro');
            $table->decimal('temperature', 3, 2)->default(0.20)->comment('Üretkenlik sıcaklığı (0.00 - 1.00)');
            $table->integer('max_tokens')->default(2048)->comment('Maksimum token yanıt uzunluğu');
            $table->longText('system_prompt')->nullable()->comment('Nümizmatik uzman analizi için temel sistem yönergesi');
            $table->boolean('is_active')->default(true)->comment('Aktif AI yapılandırması mı?');
            $table->timestamps();

            $table->index(['provider', 'is_active']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ai_settings');
    }
};

