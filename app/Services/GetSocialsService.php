<?php

namespace App\Services;

use App\Models\Social;
use App\Models\User;
use Illuminate\Support\Facades\Http;

use function Illuminate\Log\log;

class GetSocialsService
{
    public function getSocials()
    {
        try {
            $socials = Http::withHeaders([
                "x-api-key" => env("CLIENT_SECRET"),
            ])->get(rtrim(env("CENTRAL_HOST_URL"), '/') . '/api/academy/socials');
            $socials->throw();
        } catch (\Throwable $th) {
            log($th->getCode() . " : " . $th->getMessage());
            return redirect()->intended();
        }

        foreach ($socials->json() ?? [] as $key => $social) {

            $tmpSocial = Social::where("central_social_id", $social["central_social_id"])->first();
            $user_id = User::where("central_id", $social["central_user_id"])->value("id");
            
            // check if the user of the account exist in our database
            if ($user_id) {
                // check if this social account already exist
                if (!$tmpSocial) {
                    Social::create([
                        "user_id" => $user_id,
                        "central_social_id" => $social["central_social_id"],
                        "central_user_id" => $social["central_user_id"],
                        "title" => $social["title"],
                        "url" => $social["url"],
                    ]);
                } else {
                    $tmpSocial->update([
                        "user_id" => $user_id,
                        "central_social_id" => $social["central_social_id"],
                        "central_user_id" => $social["central_user_id"],
                        "title" => $social["title"],
                        "url" => $social["url"],
                    ]);
                }
            }
        }
        return ;
    }
}
