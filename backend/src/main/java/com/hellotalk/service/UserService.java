package com.hellotalk.service;

import com.hellotalk.dto.request.UpdateProfileRequest;
import com.hellotalk.dto.response.UserResponse;
import com.hellotalk.entity.User;

import java.util.List;

public interface UserService {

    UserResponse getProfile(String username);

    UserResponse updateProfile(String username, UpdateProfileRequest request);

    UserResponse updateStatus(String username, User.OnlineStatus status);

    List<UserResponse> searchUsers(String query, String currentUsername);

    UserResponse getUserById(Long id);
}
