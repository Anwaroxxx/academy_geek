<?php

use App\Http\Controllers\CourseController;
use App\Http\Controllers\CourseConceptRoadmapController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified', 'role:admin,coach'])->group(function () {
    Route::get('courses', [CourseController::class, 'index'])->name('courses.index');
    Route::post('courses', [CourseController::class, 'store'])->name('courses.store');
    Route::post('courses/{course}/update', [CourseController::class, 'update'])->name('courses.update.upload');
    Route::put('courses/{course}', [CourseController::class, 'update'])->name('courses.update');
    Route::patch('courses/{course}/status', [CourseController::class, 'updateStatus'])->name('courses.update-status');
    Route::delete('courses/{course}', [CourseController::class, 'destroy'])->name('courses.destroy');

    Route::get('courses/{course}', [CourseConceptRoadmapController::class, 'show'])->name('courses.concepts-roadmap.show');
    Route::post('courses/{course}/concepts-roadmap/concepts', [CourseConceptRoadmapController::class, 'storeConcept'])->name('courses.concepts-roadmap.concepts.store');
    Route::put('courses/{course}/concepts-roadmap/concepts/{concept}', [CourseConceptRoadmapController::class, 'updateConcept'])->name('courses.concepts-roadmap.concepts.update');
    Route::delete('courses/{course}/concepts-roadmap/concepts/{concept}', [CourseConceptRoadmapController::class, 'destroyConcept'])->name('courses.concepts-roadmap.concepts.destroy');
});
