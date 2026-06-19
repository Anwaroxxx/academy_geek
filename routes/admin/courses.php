<?php

use App\Http\Controllers\CourseController;
use Illuminate\Support\Facades\Route;

Route::get('courses', [CourseController::class, 'index'])->name('courses.index');
Route::post('courses', [CourseController::class, 'store'])->name('courses.store');
Route::post('courses/{course}/update', [CourseController::class, 'update'])->name('courses.update.upload');
Route::put('courses/{course}', [CourseController::class, 'update'])->name('courses.update');
Route::delete('courses/{course}', [CourseController::class, 'destroy'])->name('courses.destroy');
