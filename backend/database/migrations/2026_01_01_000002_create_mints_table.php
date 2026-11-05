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
        Schema::create('mints', function (Blueprint $table) {
            $table->id();
            $table->foreignId('civilization_id')
                ->constrained('civilizations')
                ->onDelete('cascade')
                ->comment('Bağlı olduğu medeniyet');
            $table->string('name')->comment('Modern/Yaygın Darphane Şehir Adı (Örn: Sardis, Efes, Roma, Konstantinopolis)');
            $table->string('ancient_name')->nullable()->comment('Antik Dönem Adı (Örn: Sardes, Ephesos, Roma, Byzantion)');
            $table->decimal('latitude', 10, 7)->nullable()->comment('Coğrafi enlem koordinatı');
            $table->decimal('longitude', 10, 7)->nullable()->comment('Coğrafi boylam koordinatı');
            $table->text('description')->nullable()->comment('Darphane tarihi ve faal olduğu yüzyıllar');
            $table->timestamps();

            // Sık sorgulanan kombinasyon indeksi
            $table->index(['civilization_id', 'name']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('mints');
    }
};

