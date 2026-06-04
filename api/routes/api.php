<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\ProtocolController;
use App\Http\Controllers\Api\ThreadController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');



Route::post('/register', [UserController::class, 'register']);
Route::post('/login', [UserController::class, 'login']);


// Public protocol routes
Route::get('protocols', [ProtocolController::class, 'index']);
Route::get('protocols/{protocol}', [ProtocolController::class, 'show']);

// Public thread routes
Route::get('protocols/{protocol}/threads', [ThreadController::class, 'index']);
Route::get('protocols/{protocol}/threads/{thread}', [ThreadController::class, 'show']);


Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [UserController::class, 'logout']);


    // Protocol routes
    Route::group(['prefix' => 'protocols'], function () {
        //Protocol routes
        Route::post('', [ProtocolController::class, 'store']);
        Route::put('{protocol}', [ProtocolController::class, 'update']);
        Route::patch('{protocol}', [ProtocolController::class, 'update']);
        Route::delete('{protocol}', [ProtocolController::class, 'destroy']);


        //thread routes
        Route::post('/{protocol}/threads', [ThreadController::class, 'store']);
        Route::put('/{protocol}/threads/{thread}', [ThreadController::class, 'update']);
        Route::patch('/{protocol}/threads/{thread}', [ThreadController::class, 'update']);
        Route::delete('/{protocol}/threads/{thread}', [ThreadController::class, 'destroy']);

    });
   
});