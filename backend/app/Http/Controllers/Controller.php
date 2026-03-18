<?php

namespace App\Http\Controllers;

use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Foundation\Bus\DispatchesJobs;
use Illuminate\Foundation\Validation\ValidatesRequests;
use Illuminate\Routing\Controller as BaseController;
/**
 * @OA\Info(
 * version="1.0.0",
 * title="Tài liệu API VèoFood",
 * description="Tài liệu API cho Đồ án VèoFood - Nhóm 15.",
 * )
 * @OA\Server(
 * url=L5_SWAGGER_CONST_HOST,
 * description="VèoFood API Server"
 * )
 */
class Controller extends BaseController
{
    use AuthorizesRequests, DispatchesJobs, ValidatesRequests;
}
