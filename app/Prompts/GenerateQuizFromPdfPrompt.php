<?php

namespace App\Prompts;

class GenerateQuizFromPdfPrompt
{
    public static function build(string $pdfContent): string
    {
        return <<<PROMPT
You are a JSON API.

Generate 1 quiz based only on the PDF content provided below.

Return ONLY valid raw JSON.

JSON schema:

{
  "title": "",
  "questions": [
    {
      "level": "easy",
      "type": "mcq",
      "question": "",
      "options": ["", "", "", ""],
      "correct_answer": [""]
    }
  ]
}

Generate exactly 21 questions:
- 7 easy
- 7 intermediate
- 7 hard

Question types must include:
- mcq
- true_false
- fill_blank
- multiple_select

Rules:
- Use only information present in the PDF content.
- correct_answer must ALWAYS be an array.
- mcq correct_answer example: ["answer"]
- true_false correct_answer example: [true]
- fill_blank correct_answer example: ["answer"]
- multiple_select correct_answer example: ["answer1", "answer2"]
- options is required only for mcq and multiple_select.
- mcq must have exactly 4 options.
- multiple_select must have exactly 4 options and at least 2 correct answers.
- Use double quotes only.
- Do not write markdown.
- Do not write explanations.
- Response must start with { and end with }.

PDF content:
{$pdfContent}
PROMPT;
    }
}
