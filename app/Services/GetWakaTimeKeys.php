<?php

namespace App\Services;

use App\Models\User;
use App\Models\WakaTime;
use Illuminate\Support\Facades\Http;

use function Illuminate\Log\log;

class GetWakaTimeKeys
{
    public function getWakaTimeKeys()
    {
        try {
            $wakaKeys = Http::withHeaders([
                "x-api-key" => env("CLIENT_SECRET"),
            ])->connectTimeout(5)
                ->timeout(15)
                ->get(rtrim(env("CENTRAL_HOST_URL"), '/') . '/api/academy/wakatime');
            $wakaKeys->throw();
        } catch (\Throwable $th) {
            log($th->getCode() . " : " . $th->getMessage());
            return redirect()->intended();
        }

        foreach ($wakaKeys->json() ?? [] as $key => $wakaKey) {

            $user_id = User::where("central_id", $wakaKey["central_user_id"])->value("id");
            if ($user_id) {
                WakaTime::updateOrCreate(
                    ["user_id" => $user_id],
                    ["wakatime_key" => $wakaKey["wakatime_key"]]
                );
            }
        }
        return;
    }
}
