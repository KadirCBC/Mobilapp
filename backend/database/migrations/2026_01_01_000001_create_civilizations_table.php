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
        Schema::create('civilizations', function (Blueprint $table) {
            $table->id();
            $table->string('name')->comment('Medeniyet Adı (Örn: Antik Yunan, Roma İmparatorluğu, Bizans, Osmanlı)');
            $table->string('slug')->unique()->index();
            $table->string('era_period')->comment('Tarihsel Çağ/Dönem aralığı (Örn: M.Ö. 1200 - M.S. 476)');
            $table->text('description')->nullable()->comment('Medeniyet ve nümizmatik ekol açıklaması');
            $table->string('cover_image')->nullable()->comment('Vitrin/kapak görsel URL veya dosya yolu');
            $table->boolean('is_active')->default(true)->index()->comment('Aktiflik durumu');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('civilizations');
    }
};

