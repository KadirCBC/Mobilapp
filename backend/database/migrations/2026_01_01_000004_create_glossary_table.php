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
        Schema::create('glossary', function (Blueprint $table) {
            $table->id();
            $table->string('term')->comment('Nümizmatik terim adı (Örn: Avers, Revers, Lejant, Patina, Çil/FDC)');
            $table->string('slug')->unique()->comment('SEO dostu terim slug bağlantısı');
            $table->text('definition')->comment('Terimin detaylı nümizmatik ve akademik açıklaması');
            $table->string('image')->nullable()->comment('Terimi görselleştiren örnek görsel veya çizim');
            $table->timestamps();

            // Hızlı arama için indeks
            $table->index('term');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('glossary');
    }
};

