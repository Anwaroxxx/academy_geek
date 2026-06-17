<?php

use App\Http\Controllers\AuthController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::inertia('/', 'welcome/index')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
});

Route::get('/login', [AuthController::class, 'login'])
    ->name('login');

Route::get('/callback/{code}', [AuthController::class, 'loginCallback']);

Route::middleware('auth')->get('/hi', function () {
    echo 'hi';
});

Route::middleware('auth')->get('/e', function () {
    return redirect('/dashboard');
});

require __DIR__.'/settings.php';
