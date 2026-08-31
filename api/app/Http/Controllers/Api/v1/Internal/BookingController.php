<?php

namespace App\Http\Controllers\Api\V1\Internal;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use Illuminate\Http\JsonResponse;

class BookingController extends Controller
{
    /**
     * POST /api/v1/internal/bookings/{id}/synced
     * Called by Make.com after syncing to Google Sheets.
     */
    public function synced(string $id): JsonResponse
    {
        $booking = Booking::findOrFail($id);

        $booking->update([
            'synced_to_sheet' => true,
            'status' => 'confirmed',
        ]);

        return response()->json([
            'message' => 'Booking marked as synced.',
        ]);
    }
}
