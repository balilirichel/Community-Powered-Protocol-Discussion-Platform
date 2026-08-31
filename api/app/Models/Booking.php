<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Booking extends Model
{
    use HasFactory, HasUuids;

    public $timestamps = false;

    protected $fillable = [
        'name',
        'email',
        'date',
        'time',
        'topic',
        'status',
        'synced_to_sheet',
    ];

    protected function casts(): array
    {
        return [
            'date' => 'date',
            'synced_to_sheet' => 'boolean',
            'created_at' => 'datetime',
        ];
    }
}
