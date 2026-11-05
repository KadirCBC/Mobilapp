<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Glossary extends Model
{
    use HasFactory;

    /**
     * Tablo adı (varsayılan 'glossaries' yerine 'glossary').
     *
     * @var string
     */
    protected $table = 'glossary';

    /**
     * Toplu atanabilir öznitelikler.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'term',
        'slug',
        'definition',
        'image',
    ];
}

