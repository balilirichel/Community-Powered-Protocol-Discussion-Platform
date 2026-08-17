<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use App\Models\Protocol;
use App\Http\Controllers\Api\v1\ProtocolController;

Route::get('/', function () {
    return view('welcome');
});

// Serve the single-page application for any non-API route so client-side
// routing (React Router) can handle paths like /protocols/:slug.
// This must come after any explicit web routes to avoid accidental overrides.
Route::get('/{any}', function () {
    return view('welcome');
})->where('any', '.*');


Route::bind('protocol', function ($value) {
    if (is_numeric($value)) {
        return Protocol::findOrFail($value);
    }

    $protocol = Protocol::query()
        ->select('id', 'title')
        ->get()
        ->first(fn (Protocol $protocol) => Str::slug($protocol->title) === Str::slug($value));

    if (! $protocol) {
        abort(404);
    }

    return Protocol::findOrFail($protocol->id);
});
