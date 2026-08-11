<?php

use App\Http\Controllers\ClassController;
use App\Http\Controllers\ClassroomRecordingController;
use App\Http\Controllers\GetClassesDataController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth',])->group(function () {
    Route::get('/classes', [ClassController::class, "index"]);
    Route::get("/classes/{id}", [ClassController::class, "show"]);
    Route::post('/classes/{class}/recordings/upload', [ClassroomRecordingController::class, 'upload'])
        ->name('classes.recordings.upload');
    Route::get('/recordings/{recording}/stream', [ClassroomRecordingController::class, 'stream'])
        ->name('recordings.stream');
    Route::patch('/recordings/{recording}', [ClassroomRecordingController::class, 'update'])
        ->name('recordings.update');
    Route::delete('/recordings/{recording}', [ClassroomRecordingController::class, 'destroy'])
        ->name('recordings.destroy');
    Route::get('/classroom/sessions/{id}', [ClassController::class, 'classroomSession'])
        ->name('classroom.sessions.show');
    Route::get('/classroom/sessions/{id}/status', [ClassController::class, 'classroomSessionStatus'])
        ->name('classroom.sessions.status');
    Route::post('/classroom/sessions/{id}/start', [ClassController::class, 'startClassroomSession'])
        ->name('classroom.sessions.start');
    Route::post('/classroom/sessions/{id}/stop', [ClassController::class, 'stopClassroomSession'])
        ->name('classroom.sessions.stop');
    Route::post('/classroom/sessions/{id}/participants/join', [ClassController::class, 'joinClassroomParticipant'])
        ->name('classroom.sessions.participants.join');
    Route::post('/classroom/sessions/{id}/participants/leave', [ClassController::class, 'leaveClassroomParticipant'])
        ->name('classroom.sessions.participants.leave');
    Route::post('/classroom/sessions/{id}/heartbeat', [ClassController::class, 'heartbeatClassroomParticipant'])
        ->name('classroom.sessions.heartbeat');
    Route::post('/classroom/sessions/{id}/participants/{participant}/screen-share', [ClassController::class, 'updateClassroomParticipantScreenShare'])
        ->name('classroom.sessions.participants.screen-share');
});
Route::get("/getclass", [GetClassesDataController::class, "getClasses"]);
