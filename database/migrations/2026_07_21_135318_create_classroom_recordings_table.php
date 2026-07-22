<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('classroom_recordings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('class_id')->nullable()->constrained('classes')->nullOnDelete();
            $table->foreignId('classroom_session_id')->nullable()->constrained('classroom_sessions')->nullOnDelete();
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('status')->default('draft')->index();
            $table->string('provider')->nullable()->index();
            $table->string('external_reference')->nullable();
            $table->string('storage_disk')->nullable();
            $table->string('storage_path')->nullable();
            $table->string('thumbnail_path')->nullable();
            $table->text('secure_url')->nullable();
            $table->unsignedInteger('duration_seconds')->nullable();
            $table->timestamp('recorded_at')->nullable()->index();
            $table->timestamp('available_at')->nullable()->index();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('visibility')->default('class_students')->index();
            $table->json('metadata')->nullable();
            $table->softDeletes();
            $table->timestamps();

            $table->index(['class_id', 'status']);
            $table->index(['class_id', 'visibility']);
            $table->index(['classroom_session_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('classroom_recordings');
    }
};
