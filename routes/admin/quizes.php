<?php

use App\Http\Controllers\QuizController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('quizes', [QuizController::class, 'index'])->name('quizes.index');
    Route::post('quizes/manual', [QuizController::class, 'storeManual'])->name('quizes.manual.store');
    Route::post('quizes/ai', [QuizController::class, 'generateWithAi'])->name('quizes.ai.generate');
    Route::post('quizes/file', [QuizController::class, 'generateFromFile'])->name('quizes.file.generate');
    Route::put('quizes/{quiz}/review', [QuizController::class, 'review'])->name('quizes.review');
    Route::put('quizes/{quiz}', [QuizController::class, 'update'])->name('quizes.update');
    Route::delete('quizes/{quiz}', [QuizController::class, 'destroy'])->name('quizes.destroy');
});
