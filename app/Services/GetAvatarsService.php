<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;

use function Illuminate\Log\log;

class GetAvatarsService
{
    public function get(?string $url): bool
    {
        $filename = $this->avatarFilename($url);
        if (! $filename) {
            return false;
        }

        $localPath = "img/avatars/{$filename}";
        if (Storage::disk("public")->exists($localPath)) {
            return true;
        }

        try {
            $avatar = Http::withHeaders([
                "x-api-key" => env("CLIENT_SECRET"),
            ])->connectTimeout(5)
                ->timeout(15)
                ->get(rtrim((string) env("CENTRAL_HOST_URL"), "/") . "/api/academy/avatars", [
                    "url" => $filename
                ]);
            $avatar->throw();
        } catch (\Throwable $th) {
            log($th->getCode() . " : " . $th->getMessage());
            return false;
        }

        $contents = base64_decode($avatar->body(), true);
        if ($contents !== false && $contents !== '') {
            Storage::disk("public")->put($localPath, $contents);
            return true;
        }

        return false;
    }

    private function avatarFilename(?string $url): ?string
    {
        $url = trim((string) $url);
        if ($url === '') {
            return null;
        }

        $path = parse_url(str_replace('\\', '/', $url), PHP_URL_PATH) ?: $url;
        $filename = basename($path);

        return $filename !== '' && $filename !== '.' && $filename !== '..'
            ? $filename
            : null;
    }
}
