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
            Schema::create('quizzes', function (Blueprint $table) {
                $table->id();
                $table->foreignId('topic_id')
                    ->nullable()
                    ->constrained()
                    ->nullOnDelete();

                $table->foreignId('concept_id')
                    ->nullable()
                    ->constrained()
                    ->nullOnDelete();
                $table->string('title');
                $table->enum('source', [
                    'manual',
                    'ai',
                    'pdf',
                ])->default('manual');

                $table->enum('status', [
                    'draft',
                    'pending_review',
                    'approved',
                ])->default('draft');
                $table->text('description')->nullable();
                $table->unsignedTinyInteger('passing_score');
                $table->unsignedInteger('xp_reward')->default(0);
                $table->unsignedInteger('order_index');
                $table->timestamps();
            });
        }

        /**
         * Reverse the migrations.
         */
        public function down(): void
        {
            Schema::dropIfExists('quizzes');
        }
    };
