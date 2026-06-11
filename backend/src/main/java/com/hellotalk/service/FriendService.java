package com.hellotalk.service;

import com.hellotalk.dto.response.UserResponse;

import java.util.List;

public interface FriendService {

    void sendFriendRequest(String requesterUsername, Long addresseeId);

    void acceptFriendRequest(String currentUsername, Long friendshipId);

    void rejectFriendRequest(String currentUsername, Long friendshipId);

    void removeFriend(String currentUsername, Long friendId);

    List<UserResponse> getFriends(String username);

    List<UserResponse> getPendingRequests(String username);
}
