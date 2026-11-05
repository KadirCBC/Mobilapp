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
        Schema::create('coin_provenances', function (Blueprint $table) {
            $table->id();

            $table->foreignId('coin_id')
                ->constrained('coins')
                ->cascadeOnDelete()
                ->comment('İlgili sikke');

            $table->date('event_date')
                ->comment('Olay / İşlem Tarihi (Örn: 1928-05-14)');

            $table->string('event_type', 50)
                ->comment('Olay Türü: auction_sale, collection_transfer, museum_registration, conservation_cleaning, expert_certification');

            $table->string('auction_house', 100)
                ->nullable()
                ->comment('Müzayede Evi / Kurum (Örn: Leu Numismatik, Sotheby\'s, Münzen & Medaillen AG, NGC Ancients)');

            $table->string('lot_number', 50)
                ->nullable()
                ->comment('Müzayede Lot / Envanter No (Örn: Lot 214)');

            $table->decimal('price_realized', 12, 2)
                ->nullable()
                ->comment('Çekiç / Alım Fiyatı (Eğer satış ise)');

            $table->string('currency', 3)
                ->default('USD')
                ->comment('Para Birimi (USD, EUR, CHF, GBP, TRY)');

            $table->text('description')
                ->comment('Detaylı açıklama: Eski koleksiyoner kimliği, restorasyon kimyasalları, ultrasonik/mekanik temizlik notu');

            $table->string('document_url')
                ->nullable()
                ->comment('Tescil belgesi, fatura, müzayede sayfası veya restorasyon raporu PDF/görsel bağlantısı');

            $table->timestamps();

            // Kronolojik sıralama ve hızlı sorgular için kompozit indeks
            $table->index(['coin_id', 'event_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('coin_provenances');
    }
};

