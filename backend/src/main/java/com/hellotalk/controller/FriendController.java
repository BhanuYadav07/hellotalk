package com.hellotalk.controller;

import com.hellotalk.dto.response.ApiResponse;
import com.hellotalk.dto.response.UserResponse;
import com.hellotalk.service.FriendService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/friends")
@RequiredArgsConstructor
public class FriendController {

    private final FriendService friendService;

    /**
     * GET /api/friends
     * Get all accepted friends of the current user.
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<UserResponse>>> getFriends(
            @AuthenticationPrincipal UserDetails userDetails) {
        List<UserResponse> friends = friendService.getFriends(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Friends fetched", friends));
    }

    /**
     * GET /api/friends/pending
     * Get pending friend requests received by the current user.
     */
    @GetMapping("/pending")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getPendingRequests(
            @AuthenticationPrincipal UserDetails userDetails) {
        List<UserResponse> pending = friendService.getPendingRequests(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Pending requests fetched", pending));
    }

    /**
     * POST /api/friends/request/{addresseeId}
     * Send a friend request to another user.
     */
    @PostMapping("/request/{addresseeId}")
    public ResponseEntity<ApiResponse<Void>> sendRequest(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long addresseeId) {
        friendService.sendFriendRequest(userDetails.getUsername(), addresseeId);
        return ResponseEntity.ok(ApiResponse.success("Friend request sent"));
    }

    /**
     * PATCH /api/friends/accept/{friendshipId}
     * Accept a pending friend request.
     */
    @PatchMapping("/accept/{friendshipId}")
    public ResponseEntity<ApiResponse<Void>> acceptRequest(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long friendshipId) {
        friendService.acceptFriendRequest(userDetails.getUsername(), friendshipId);
        return ResponseEntity.ok(ApiResponse.success("Friend request accepted"));
    }

    /**
     * PATCH /api/friends/reject/{friendshipId}
     * Reject a pending friend request.
     */
    @PatchMapping("/reject/{friendshipId}")
    public ResponseEntity<ApiResponse<Void>> rejectRequest(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long friendshipId) {
        friendService.rejectFriendRequest(userDetails.getUsername(), friendshipId);
        return ResponseEntity.ok(ApiResponse.success("Friend request rejected"));
    }

    /**
     * DELETE /api/friends/{friendId}
     * Remove a friend.
     */
    @DeleteMapping("/{friendId}")
    public ResponseEntity<ApiResponse<Void>> removeFriend(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long friendId) {
        friendService.removeFriend(userDetails.getUsername(), friendId);
        return ResponseEntity.ok(ApiResponse.success("Friend removed"));
    }
}
