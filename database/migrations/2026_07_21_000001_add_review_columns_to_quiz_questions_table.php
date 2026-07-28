<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('quiz_questions', function (Blueprint $table) {
            if (! Schema::hasColumn('quiz_questions', 'status')) {
                $table->enum('status', ['approved', 'rejected'])->default('approved');
            }
            if (! Schema::hasColumn('quiz_questions', 'reviewed_by')) {
                $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            }
            if (! Schema::hasColumn('quiz_questions', 'reviewed_at')) {
                $table->timestamp('reviewed_at')->nullable();
            }
        });

        $quizzes = DB::table('quizzes')->select('id', 'description')->get();

        foreach ($quizzes as $quiz) {
            $reviewData = json_decode($quiz->description ?? '', true);
            $questionReviews = is_array($reviewData) && array_key_exists('question_reviews', $reviewData)
                ? ($reviewData['question_reviews'] ?? [])
                : [];

            if (! is_array($questionReviews) || $questionReviews === []) {
                continue;
            }

            $questions = DB::table('quiz_questions')->where('quiz_id', $quiz->id)->get(['id']);

            foreach ($questions as $question) {
                $review = $questionReviews[(string) $question->id] ?? $questionReviews[$question->id] ?? null;

                if (! is_array($review)) {
                    continue;
                }

                $updates = [];

                if (array_key_exists('status', $review)) {
                    $updates['status'] = in_array($review['status'], ['approved', 'rejected'], true)
                        ? $review['status']
                        : 'approved';
                }

                if (array_key_exists('reviewed_by', $review) && $review['reviewed_by'] !== null) {
                    $updates['reviewed_by'] = (int) $review['reviewed_by'];
                }

                if (array_key_exists('reviewed_at', $review) && $review['reviewed_at'] !== null) {
                    $updates['reviewed_at'] = $review['reviewed_at'];
                }

                if ($updates !== []) {
                    DB::table('quiz_questions')->where('id', $question->id)->update($updates);
                }
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('quiz_questions', function (Blueprint $table) {
            if (Schema::hasColumn('quiz_questions', 'reviewed_by')) {
                $table->dropForeign(['reviewed_by']);
            }
            if (Schema::hasColumn('quiz_questions', 'status')) {
                $table->dropColumn('status');
            }
            if (Schema::hasColumn('quiz_questions', 'reviewed_by')) {
                $table->dropColumn('reviewed_by');
            }
            if (Schema::hasColumn('quiz_questions', 'reviewed_at')) {
                $table->dropColumn('reviewed_at');
            }
        });
    }
};
