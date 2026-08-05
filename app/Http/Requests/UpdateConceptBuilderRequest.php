<?php

namespace App\Http\Requests;

use App\Models\Concept;
use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class UpdateConceptBuilderRequest extends FormRequest
{
    public function authorize(): bool
    {
        $concept = $this->route('concept');
        $user = $this->user();

        if (! $concept instanceof Concept || ! $user) {
            return false;
        }

        $concept->loadMissing('course');

        return $this->userHasAnyRole($user, ['admin', 'coach'])
            && (int) $concept->course?->created_by === (int) $user->id;
    }

    public function rules(): array
    {
        return [
            'topics' => ['nullable', 'array'],
            'topics.*.id' => ['nullable', 'integer'],
            'topics.*.title' => ['required', 'string', 'max:255'],
            'topics.*.description' => ['nullable', 'string'],
            'topics.*.theory' => ['nullable', 'string'],
            'topics.*.videoUrl' => ['nullable', 'string', 'max:2048'],
            'topics.*.duration_minutes' => ['nullable', 'integer', 'min:0'],
            'topics.*.difficulty' => ['nullable', 'string'],
            'topics.*.status' => ['nullable', 'string'],
            'topics.*.order_index' => ['nullable', 'integer'],
            'topics.*.resources' => ['nullable', 'array'],
            'topics.*.resources.*.id' => ['nullable', 'integer'],
            'topics.*.resources.*.type' => ['required', 'string', 'max:255'],
            'topics.*.resources.*.name' => ['required', 'string', 'max:255'],
            'topics.*.resources.*.url' => ['nullable', 'string', 'max:2048'],
            'topics.*.resources.*.meta' => ['nullable', 'string', 'max:255'],
            'topics.*.resources.*.file' => [
                'nullable',
                'file',
                'max:51200',
                'mimes:pdf,jpg,jpeg,png,webp,zip,doc,docx,ppt,pptx,xls,xlsx,txt,csv',
            ],
            'topics.*.resources.*.order_index' => ['nullable', 'integer'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            foreach ($this->input('topics', []) as $topicIndex => $topic) {
                foreach (($topic['resources'] ?? []) as $resourceIndex => $resource) {
                    $url = $resource['url'] ?? null;

                    if ($url === null || $url === '') {
                        continue;
                    }

                    if (! $this->isSafeResourceUrl($url)) {
                        $validator->errors()->add(
                            "topics.$topicIndex.resources.$resourceIndex.url",
                            'The resource URL must use http, https, or a valid app storage resource path.'
                        );
                    }
                }
            }
        });
    }

    private function userHasAnyRole(User $user, array $allowedRoles): bool
    {
        return $user->Roles()->whereIn('role', $allowedRoles)->exists();
    }

    private function isSafeResourceUrl(string $url): bool
    {
        if ($this->isAppStorageResourcePath($url)) {
            return true;
        }

        if (! filter_var($url, FILTER_VALIDATE_URL)) {
            return false;
        }

        $scheme = strtolower((string) parse_url($url, PHP_URL_SCHEME));

        return in_array($scheme, ['http', 'https'], true);
    }

    private function isAppStorageResourcePath(string $url): bool
    {
        if (! str_starts_with($url, '/storage/topic-resources/')) {
            return false;
        }

        return ! str_contains($url, '..') && ! str_contains($url, '\\');
    }
}
