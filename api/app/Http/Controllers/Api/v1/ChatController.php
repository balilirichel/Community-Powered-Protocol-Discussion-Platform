<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\ChatMessageRequest;
use App\Http\Requests\StoreBookingRequest;
use App\Models\ChatConversation;
use App\Services\ChatService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class ChatController extends Controller
{
    public function __construct(
        private ChatService $chatService
    ) {}

    /**
     * POST /api/v1/chat/session
     */
    public function session(): JsonResponse
    {
        $userId = Auth::id();

        $result = $this->chatService->createSession($userId);

        return response()->json($result);
    }

    /**
     * GET /api/v1/chat/messages/{conversation_id}
     */
    public function messages(string $conversation_id): JsonResponse
    {
        $conversation = ChatConversation::findOrFail($conversation_id);

        $messages = $this->chatService->getMessages($conversation->id);

        return response()->json([
            'messages' => $messages,
        ]);
    }

    /**
     * POST /api/v1/chat/message
     */
    public function message(ChatMessageRequest $request): JsonResponse
    {   
       
        $result = $this->chatService->sendMessage(
            $request->validated('conversation_id'),
            $request->validated('message')
        );

        return response()->json($result);
    }

    /**
     * POST /api/v1/chat/booking
     */
    public function booking(StoreBookingRequest $request): JsonResponse
    {
        $booking = $this->chatService->createBooking($request->validated());

        return response()->json([
            'message' => 'Booking received successfully. We will confirm your appointment shortly.',
            'booking_id' => $booking->id,
        ], 201);
    }
}
