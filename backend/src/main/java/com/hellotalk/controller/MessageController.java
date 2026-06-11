package com.hellotalk.controller;

import com.hellotalk.dto.request.MessageRequest;
import com.hellotalk.dto.response.ApiResponse;
import com.hellotalk.dto.response.MessageResponse;
import com.hellotalk.service.MessageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
public class MessageController {

    private final MessageService messageService;

    /**
     * POST /api/messages
     * Send a new message (REST fallback — real-time goes via WebSocket).
     */
    @PostMapping
    public ResponseEntity<ApiResponse<MessageResponse>> sendMessage(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody MessageRequest request) {
        MessageResponse response = messageService.sendMessage(userDetails.getUsername(), request);
        return ResponseEntity.ok(ApiResponse.success("Message sent", response));
    }

    /**
     * GET /api/messages/conversation/{userId}
     * Get full conversation history with a specific user.
     */
    @GetMapping("/conversation/{userId}")
    public ResponseEntity<ApiResponse<List<MessageResponse>>> getConversation(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long userId) {
        List<MessageResponse> messages = messageService.getConversation(
                userDetails.getUsername(), userId);
        return ResponseEntity.ok(ApiResponse.success("Conversation fetched", messages));
    }

    /**
     * GET /api/messages/unread
     * Get all unread messages for the current user.
     */
    @GetMapping("/unread")
    public ResponseEntity<ApiResponse<List<MessageResponse>>> getUnread(
            @AuthenticationPrincipal UserDetails userDetails) {
        List<MessageResponse> messages = messageService.getUnreadMessages(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Unread messages fetched", messages));
    }

    /**
     * PATCH /api/messages/read/{senderId}
     * Mark all messages from a sender as read.
     */
    @PatchMapping("/read/{senderId}")
    public ResponseEntity<ApiResponse<Integer>> markAsRead(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long senderId) {
        int count = messageService.markMessagesAsRead(userDetails.getUsername(), senderId);
        return ResponseEntity.ok(ApiResponse.success(count + " messages marked as read", count));
    }

    /**
     * DELETE /api/messages/{messageId}
     * Delete your own message.
     */
    @DeleteMapping("/{messageId}")
    public ResponseEntity<ApiResponse<Void>> deleteMessage(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long messageId) {
        messageService.deleteMessage(messageId, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Message deleted"));
    }
}
