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
        Schema::table('coins', function (Blueprint $table) {
            $table->string('approval_status', 30)
                ->default('draft')
                ->after('is_published')
                ->comment('Onay Durumu: draft, pending_review, approved, rejected');

            $table->foreignId('created_by')
                ->nullable()
                ->after('approval_status')
                ->constrained('users')
                ->nullOnDelete()
                ->comment('Eseri sisteme giren editör/fotoğrafçı');

            $table->foreignId('reviewed_by')
                ->nullable()
                ->after('created_by')
                ->constrained('users')
                ->nullOnDelete()
                ->comment('Onaylayan/Değerleyen Baş Nümizmat');

            $table->timestamp('reviewed_at')
                ->nullable()
                ->after('reviewed_by')
                ->comment('Onay veya ret tarihi');

            $table->text('rejection_reason')
                ->nullable()
                ->after('reviewed_at')
                ->comment('Revizyon gerekçesi veya uzman notu');

            $table->index('approval_status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('coins', function (Blueprint $table) {
            $table->dropForeign(['created_by']);
            $table->dropForeign(['reviewed_by']);
            $table->dropColumn([
                'approval_status',
                'created_by',
                'reviewed_by',
                'reviewed_at',
                'rejection_reason',
            ]);
        });
    }
};

