<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

class MockQrPaymentController extends Controller
{
    private const SESSION_TTL_MINUTES = 10;

    /**
     * @OA\Post(
     *     path="/orders/{id}/payment/qr-session",
     *     tags={"Mock QR Payments"},
        *     summary="Tạo hoặc lấy phiên QR mock cho đơn hàng",
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
        *         description="ID đơn hàng",
     *         @OA\Schema(type="integer", example=123)
     *     ),
     *     @OA\RequestBody(
     *         required=false,
     *         @OA\JsonContent(
     *             @OA\Property(property="force_new", type="boolean", example=false)
     *         )
     *     ),
        *     @OA\Response(response=200, description="Thành công"),
        *     @OA\Response(response=400, description="Đơn hàng không hợp lệ để thanh toán"),
     *     @OA\Response(response=403, description="Forbidden"),
     *     @OA\Response(response=404, description="Order not found"),
        *     @OA\Response(response=401, description="Chưa xác thực")
     * )
     */
    public function createSession(Request $request, $id)
    {
        $order = Order::find($id);

        if (! $order) {
            return response()->json([
                'status' => 'error',
                'message' => 'Order not found'
            ], 404);
        }

        $user = $request->user();
        if (! $user || ($user->role !== 'admin' && (int) $order->user_id !== (int) $user->id)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Forbidden'
            ], 403);
        }

        if ($order->status === 'paid') {
            return response()->json([
                'status' => 'error',
                'message' => 'Order already paid'
            ], 400);
        }

        if ($order->status === 'cancelled') {
            return response()->json([
                'status' => 'error',
                'message' => 'Cancelled order cannot be paid'
            ], 400);
        }

        $forceNew = $request->boolean('force_new', false);
        $activeSessionId = Cache::get($this->orderActiveKey((int) $order->id));

        if ($activeSessionId) {
            $activeSession = Cache::get($this->sessionCacheKey((string) $activeSessionId));
            if ($activeSession && empty($activeSession['consumed'])) {
                $expiresAt = Carbon::parse($activeSession['expires_at']);

                if (! $forceNew && now()->lt($expiresAt)) {
                    return response()->json([
                        'status' => 'success',
                        'data' => $this->sessionResponse($activeSession)
                    ]);
                }

                $this->consumeSession((string) $activeSessionId, $activeSession, 'cancelled', 5);
            }
        }

        $sessionId = (string) Str::uuid();
        $expiresAt = now()->addMinutes(self::SESSION_TTL_MINUTES);

        $confirmUrl = rtrim((string) $request->getSchemeAndHttpHost(), '/')
            . '/api/mock-payments/qr/confirm/' . $sessionId;

        // Giữ luồng demo đơn giản: quét QR sẽ mở thẳng endpoint xác nhận.
        $qrPayload = $confirmUrl;
        $qrImageUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=' . urlencode($qrPayload);

        $sessionData = [
            'session_id' => $sessionId,
            'order_id' => (int) $order->id,
            'user_id' => (int) $order->user_id,
            'amount' => (float) $order->total_price,
            'currency' => 'VND',
            'status' => 'pending',
            'expires_at' => $expiresAt->toIso8601String(),
            'confirmed_at' => null,
            'consumed' => false,
            'confirm_url' => $confirmUrl,
            'qr_payload' => $qrPayload,
            'qr_image_url' => $qrImageUrl,
            'is_mock' => true,
        ];

        Cache::put($this->sessionCacheKey($sessionId), $sessionData, $expiresAt);
        Cache::put($this->orderActiveKey((int) $order->id), $sessionId, $expiresAt);

        return response()->json([
            'status' => 'success',
            'data' => $this->sessionResponse($sessionData)
        ]);
    }

    /**
     * @OA\Get(
     *     path="/mock-payments/qr/confirm/{sessionId}",
     *     tags={"Mock QR Payments"},
        *     summary="Xác nhận thanh toán mock khi người dùng quét QR",
     *     @OA\Parameter(
     *         name="sessionId",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="string", format="uuid")
     *     ),
        *     @OA\Response(response=200, description="Xác nhận thanh toán thành công"),
        *     @OA\Response(response=400, description="Đơn hàng không hợp lệ"),
        *     @OA\Response(response=404, description="Phiên hoặc đơn hàng không tồn tại"),
        *     @OA\Response(response=409, description="Phiên đã được dùng"),
        *     @OA\Response(response=410, description="Phiên đã hết hạn")
     * )
     */
    public function confirmByLink($sessionId)
    {
        $session = Cache::get($this->sessionCacheKey((string) $sessionId));

        if (! $session) {
            return $this->renderConfirmPage(
                'Không tìm thấy phiên thanh toán',
                'Liên kết đã hết hạn hoặc không hợp lệ.',
                false,
                404
            );
        }

        $expiresAt = Carbon::parse($session['expires_at']);
        if (now()->gte($expiresAt)) {
            $this->consumeSession((string) $sessionId, $session, 'expired', 5);
            $this->clearActiveOrderSessionIfMatch((int) $session['order_id'], (string) $sessionId);

            return $this->renderConfirmPage(
                'Phiên QR đã hết hạn',
                'Vui lòng quay lại trang đơn hàng để tạo mã QR mới.',
                false,
                410
            );
        }

        if (! empty($session['consumed'])) {
            return $this->renderConfirmPage(
                'Liên kết đã được sử dụng',
                'Phiên QR này đã được xác nhận trước đó.',
                false,
                409
            );
        }

        $order = Order::find($session['order_id']);
        if (! $order) {
            return $this->renderConfirmPage(
                'Không tìm thấy đơn hàng',
                'Đơn hàng có thể đã bị xóa.',
                false,
                404
            );
        }

        if ($order->status === 'cancelled') {
            return $this->renderConfirmPage(
                'Đơn hàng đã bị hủy',
                'Không thể xác nhận thanh toán cho đơn đã hủy.',
                false,
                400
            );
        }

        if ($order->status !== 'paid') {
            $order->update(['status' => 'paid']);
        }

        $session['confirmed_at'] = now()->toIso8601String();
        $this->consumeSession((string) $sessionId, $session, 'confirmed', 30);
        $this->clearActiveOrderSessionIfMatch((int) $session['order_id'], (string) $sessionId);

        return $this->renderConfirmPage(
            'Thanh toán thành công',
            'Đơn #' . $order->id . ' đã được cập nhật trạng thái paid. Bạn có thể quay lại trang web để tiếp tục.',
            true,
            200
        );
    }

    private function sessionCacheKey(string $sessionId): string
    {
        return 'mock_qr_session:' . $sessionId;
    }

    private function orderActiveKey(int $orderId): string
    {
        return 'mock_qr_order_active:' . $orderId;
    }

    private function sessionResponse(array $session): array
    {
        $expiresAt = Carbon::parse($session['expires_at']);

        return [
            'session_id' => $session['session_id'],
            'order_id' => $session['order_id'],
            'amount' => $session['amount'],
            'currency' => $session['currency'],
            'status' => $session['status'],
            'expires_at' => $session['expires_at'],
            'expires_in_seconds' => max(0, now()->diffInSeconds($expiresAt, false)),
            'confirmed_at' => $session['confirmed_at'],
            'confirm_url' => $session['confirm_url'],
            'qr_payload' => $session['qr_payload'],
            'qr_image_url' => $session['qr_image_url'],
            'is_mock' => true,
        ];
    }

    private function consumeSession(string $sessionId, array $session, string $status, int $ttlMinutes): void
    {
        $session['status'] = $status;
        $session['consumed'] = true;

        Cache::put($this->sessionCacheKey($sessionId), $session, now()->addMinutes($ttlMinutes));
    }

    private function clearActiveOrderSessionIfMatch(int $orderId, string $sessionId): void
    {
        $activeSessionId = Cache::get($this->orderActiveKey($orderId));
        if ($activeSessionId === $sessionId) {
            Cache::forget($this->orderActiveKey($orderId));
        }
    }

    private function renderConfirmPage(string $title, string $message, bool $isSuccess, int $statusCode)
    {
        $accent = $isSuccess ? '#16a34a' : '#dc2626';
        $html = '<!doctype html>'
            . '<html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">'
            . '<title>' . e($title) . '</title>'
            . '<style>body{font-family:Arial,sans-serif;background:#f8fafc;margin:0;padding:24px;color:#0f172a}.card{max-width:560px;margin:40px auto;background:#fff;border:1px solid #e2e8f0;border-radius:16px;padding:24px;box-shadow:0 10px 30px rgba(15,23,42,.08)}h1{margin:0 0 12px;font-size:24px;color:' . $accent . '}p{line-height:1.6;margin:0 0 16px}.hint{font-size:13px;color:#64748b}</style>'
            . '</head><body><div class="card"><h1>' . e($title) . '</h1><p>' . e($message) . '</p><p class="hint">Bạn có thể đóng trang này và quay lại trang web VeoFood.</p></div></body></html>';

        return response($html, $statusCode)->header('Content-Type', 'text/html; charset=UTF-8');
    }
}
