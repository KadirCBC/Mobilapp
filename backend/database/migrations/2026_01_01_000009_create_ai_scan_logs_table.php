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
        Schema::create('ai_scan_logs', function (Blueprint $table) {
            $table->id();
            $table->string('user_ip', 45)->nullable()->comment('Taramayı yapan istemcinin IP adresi (IPv4/IPv6)');
            $table->string('incoming_avers_path')->nullable()->comment('Mobilden yüklenen geçici ön yüz görsel yolu');
            $table->string('incoming_revers_path')->nullable()->comment('Mobilden yüklenen geçici arka yüz görsel yolu');
            $table->string('detected_title')->nullable()->comment('AI tarafından tespit edilen sikke başlığı');
            $table->decimal('confidence_score', 5, 2)->nullable()->comment('AI eşleşme güven skoru (örn: 95.80)');

            $table->foreignId('matched_coin_id')
                ->nullable()
                ->constrained('coins')
                ->nullOnDelete()
                ->comment('Veritabanında eşleşen kesin sikke ID');

            $table->json('raw_ai_response')->nullable()->comment('AI modelinden dönen ham JSON yanıtı ve token metrikleri');
            $table->timestamps();

            // Raporlama ve filtreleme indeksleri
            $table->index('matched_coin_id');
            $table->index('confidence_score');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ai_scan_logs');
    }
};

