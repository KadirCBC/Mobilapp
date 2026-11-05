<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class NumismaticRolesAndPermissionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Spatie izin önbelleğini sıfırla
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        // 1. İzinleri Tanımla (Permissions)
        $permissions = [
            // Sikke temel operasyonları
            'coins.view',
            'coins.create',
            'coins.edit_basic',        // Başlık, medeniyet, hükümdar, darphane
            'coins.edit_physical',     // Maden, gramaj, çap, kondisyon
            'coins.edit_descriptions', // Ön/arka yüz lejant ve tasvir metinleri
            'coins.edit_references',   // RIC, BMC, RPC korpus kodları
            'coins.upload_photos',     // Makro avers/revers fotoğraf yükleme
            'coins.submit_for_review', // Onaya gönderme yetkisi

            // Üst düzey yetkiler (Sadece Chief & SuperAdmin)
            'coins.appraise',          // Min/Max müzayede değeri ve kur belirleme
            'coins.approve',           // Eseri onaylama ve revizyon talep etme
            'coins.publish',           // Mobil katalogta canlıya alma ve vitrine çıkarma
            'coins.delete',            // Eser kaydını silme

            // Medeniyet ve Darphane yönetimi
            'civilizations.manage',
            'mints.manage',

            // Sistem ve Kullanıcı yönetimi
            'users.manage',
            'settings.manage',
        ];

        foreach ($permissions as $perm) {
            Permission::firstOrCreate(['name' => $perm, 'guard_name' => 'web']);
        }

        // 2. Rolleri Tanımla (Roles)

        // ROL 1: SuperAdmin (Tam yetki, cPanel/API ayarları, kullanıcı yönetimi)
        $superAdmin = Role::firstOrCreate(['name' => 'SuperAdmin', 'guard_name' => 'web']);
        $superAdmin->syncPermissions(Permission::all());

        // ROL 2: ChiefNumismatist (Eser onaylama, yayınlama, değerleme belirleme)
        $chiefNumismatist = Role::firstOrCreate(['name' => 'ChiefNumismatist', 'guard_name' => 'web']);
        $chiefNumismatist->syncPermissions([
            'coins.view',
            'coins.create',
            'coins.edit_basic',
            'coins.edit_physical',
            'coins.edit_descriptions',
            'coins.edit_references',
            'coins.upload_photos',
            'coins.submit_for_review',
            'coins.appraise',
            'coins.approve',
            'coins.publish',
            'coins.delete',
            'civilizations.manage',
            'mints.manage',
        ]);

        // ROL 3: CatalogEditor (Yeni sikke girişi, lejant ve kaynakça yazımı)
        $catalogEditor = Role::firstOrCreate(['name' => 'CatalogEditor', 'guard_name' => 'web']);
        $catalogEditor->syncPermissions([
            'coins.view',
            'coins.create',
            'coins.edit_basic',
            'coins.edit_physical',
            'coins.edit_descriptions',
            'coins.edit_references',
            'coins.upload_photos',
            'coins.submit_for_review',
        ]);

        // ROL 4: Photographer (Yalnızca makro avers/revers fotoğraf yükleme)
        $photographer = Role::firstOrCreate(['name' => 'Photographer', 'guard_name' => 'web']);
        $photographer->syncPermissions([
            'coins.view',
            'coins.upload_photos',
            'coins.submit_for_review',
        ]);

        // 3. Örnek Kullanıcıları Oluştur
        $this->createDemoUser('superadmin@sikkelobedi.com', 'Super Admin', $superAdmin);
        $this->createDemoUser('chief@sikkelobedi.com', 'Prof. Dr. Nümizmat Ali Bey', $chiefNumismatist);
        $this->createDemoUser('editor@sikkelobedi.com', 'Katalog Editörü Canan Hanım', $catalogEditor);
        $this->createDemoUser('photo@sikkelobedi.com', 'Makro Fotoğrafçı Murat Bey', $photographer);
    }

    protected function createDemoUser(string $email, string $name, Role $role): void
    {
        $user = User::firstOrCreate(
            ['email' => $email],
            [
                'name'     => $name,
                'password' => Hash::make('Numizmatik2026!'),
            ]
        );

        $user->syncRoles([$role]);
    }
}

