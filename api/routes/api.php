<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\ProtocolController;
use App\Http\Controllers\Api\ThreadController;
use App\Http\Controllers\Api\CommentController;
use App\Http\Controllers\Api\ReviewController;
use App\Http\Controllers\Api\VoteController;

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

// Public comment routes
Route::get('threads/{thread}/comments',             [CommentController::class, 'index']);
Route::get('threads/{thread}/comments/{comment}',   [CommentController::class, 'show']);

// Public review routes
Route::get('protocols/{protocol}/reviews',          [ReviewController::class, 'index']);
Route::get('protocols/{protocol}/reviews/{review}', [ReviewController::class, 'show']);

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

        // review routes
        Route::post('/{protocol}/reviews',                 [ReviewController::class, 'store']);
        Route::put('/{protocol}/reviews/{review}',         [ReviewController::class, 'update']);
        Route::patch('/{protocol}/reviews/{review}',       [ReviewController::class, 'update']);
        Route::delete('/{protocol}/reviews/{review}',      [ReviewController::class, 'destroy']);
    
    });

     // comment routes
    Route::group(['prefix' => 'threads'], function () {
       
        //comment routes
        Route::post('/{thread}/comments', [CommentController::class, 'store']);
        Route::put('/{thread}/comments/{comment}', [CommentController::class, 'update']);
        Route::patch('/{thread}/comments/{comment}', [CommentController::class, 'update']);
        Route::delete('/{thread}/comments/{comment}', [CommentController::class, 'destroy']);
    });

    //votes routes
     Route::post('threads/{thread}/vote',    [VoteController::class, 'voteThread']);
    Route::delete('threads/{thread}/vote',  [VoteController::class, 'unvoteThread']);

    Route::post('comments/{comment}/vote',  [VoteController::class, 'voteComment']);
    Route::delete('comments/{comment}/vote',[VoteController::class, 'unvoteComment']);
   
});