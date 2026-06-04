<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\ProtocolController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');



Route::post('/register', [UserController::class, 'register']);
Route::post('/login', [UserController::class, 'login']);


// Public
Route::get('protocols', [ProtocolController::class, 'index']);
Route::get('protocols/{protocol}', [ProtocolController::class, 'show']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [UserController::class, 'logout']);


    // Protocol routes
    Route::group(['prefix' => 'protocols'], function () {
        Route::post('', [ProtocolController::class, 'store']);
        Route::put('{protocol}', [ProtocolController::class, 'update']);
        Route::patch('{protocol}', [ProtocolController::class, 'update']);
        Route::delete('{protocol}', [ProtocolController::class, 'destroy']);
    });
   
});