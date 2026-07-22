<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\ClassroomRecordingController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\WakaTimeController;

Route::inertia('/', 'welcome/index')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
    Route::get('recordings', [ClassroomRecordingController::class, 'index'])->name('recordings.index');
    Route::patch('recordings/{recording}/progress', [ClassroomRecordingController::class, 'saveProgress'])
        ->name('recordings.progress');
});


// Route::middleware('auth')->get('/concept', function () {
//     return Inertia::render('Concept');
// });

Route::get("/wakatime/{user}", [WakaTimeController::class, "show"]);
require __DIR__."/admin/management.php";
require __DIR__."/admin/classes.php";
require __DIR__."/admin/courses.php";
require __DIR__."/auth.php";
require __DIR__.'/settings.php';
require __DIR__.'/concept-builder.php';
