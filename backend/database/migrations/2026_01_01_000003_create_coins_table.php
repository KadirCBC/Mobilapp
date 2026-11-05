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
        Schema::create('coins', function (Blueprint $table) {
            $table->id();

            // İlişkiler (Foreign Keys)
            $table->foreignId('civilization_id')
                ->constrained('civilizations')
                ->cascadeOnDelete()
                ->comment('Ait olduğu ana medeniyet/imparatorluk');

            $table->foreignId('mint_id')
                ->nullable()
                ->constrained('mints')
                ->nullOnDelete()
                ->comment('Darp edildiği antik darphane');

            // Temel Kimlik & Tipoloji
            $table->string('title')->comment('Örn: Kroisos Ağır Altın Stateri, Domitianus Cistophorus');
            $table->string('slug')->unique()->comment('SEO uyumlu URL bağlantısı');
            $table->string('ruler')->nullable()->comment('Hükümdar/İmparator/Sultan adı (Örn: Domitian, Nero, Fatih Sultan Mehmed)');
            $table->string('metal_type', 30)->comment('Metal cinsi: Altın (AU), Gümüş (AR), Bronz (AE), Elektrum (EL), Bakır vb.');
            $table->string('standard_name', 50)->comment('Birim standardı: Stater, Tetradrahmi, Denarius, Antoninianus, Akçe, Sultani');

            // Fiziksel & Metrolojik Nitelikler
            $table->decimal('weight_grams', 8, 2)->nullable()->comment('Ağırlık (Gram cinsinden, örn: 16.92)');
            $table->decimal('diameter_mm', 8, 2)->nullable()->comment('Çap (Milimetre cinsinden, örn: 27.50)');
            $table->string('die_axis', 10)->nullable()->comment('Kalıp darp açısı (Örn: 12h, 6h, 1h)');

            // Kronoloji & Tarihlendirme (MÖ için negatif tamsayı örn: -560)
            $table->integer('year_start')->nullable()->comment('Başlangıç yılı (M.Ö. için negatif tam sayı, örn: -560)');
            $table->integer('year_end')->nullable()->comment('Bitiş yılı (Örn: -546 veya 82)');

            // Nadirlik & Nümizmatik Kondisyon
            $table->string('rarity_code', 20)->default('C')->comment('Nadirlik derecesi: C (Common), S (Scarce), R1, R2, R3, R4, Ünik');
            $table->string('condition_grade', 30)->nullable()->comment('Kondisyon derecesi: FDC (Çil), UNC, EF/XF, VF, Fine, Fair');

            // Müzayede & Pazar Değerleme Aralığı
            $table->decimal('estimated_value_min', 12, 2)->nullable()->comment('Tahmini taban piyasa değeri');
            $table->decimal('estimated_value_max', 12, 2)->nullable()->comment('Tahmini tavan piyasa değeri');
            $table->string('currency', 3)->default('USD')->comment('Para birimi (USD, EUR, TRY, GBP)');

            // Nümizmatik Tasvir & İkonografi
            $table->text('avers_description')->nullable()->comment('Ön yüz (obverse) tasviri, büst portresi ve lejantı');
            $table->text('revers_description')->nullable()->comment('Arka yüz (reverse) tasviri, figür, sembol ve lejantı');
            $table->string('avers_image')->nullable()->comment('Ön yüz yüksek çözünürlüklü görsel URL/dosya yolu');
            $table->string('revers_image')->nullable()->comment('Arka yüz yüksek çözünürlüklü görsel URL/dosya yolu');

            // Standart Literatür & Korpus Referansları (JSON formatında RIC, RPC, BMC, Sear, SNG, Damalı)
            $table->json('reference_codes')->nullable()->comment('Standart nümizmatik referans kodları dizisi (RIC, BMC, Sear vb.)');

            // Vitrin & Yayın Durumları
            $table->boolean('is_featured')->default(false)->comment('Hero / Vitrin / Günün Eseri öne çıkarma bayrağı');
            $table->boolean('is_published')->default(true)->comment('Katalog yayında mı?');

            $table->timestamps();

            // Performans İndeksleri
            $table->index(['civilization_id', 'is_published']);
            $table->index(['is_featured', 'is_published']);
            $table->index(['year_start', 'year_end']);
            $table->index('metal_type');
            $table->index('ruler');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('coins');
    }
};

