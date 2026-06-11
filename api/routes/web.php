<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

// Serve the single-page application for any non-API route so client-side
// routing (React Router) can handle paths like /protocols/:slug.
// This must come after any explicit web routes to avoid accidental overrides.
Route::get('/{any}', function () {
    return view('welcome');
})->where('any', '.*');
