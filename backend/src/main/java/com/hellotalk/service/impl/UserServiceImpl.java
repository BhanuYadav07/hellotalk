package com.hellotalk.service.impl;

import com.hellotalk.dto.request.UpdateProfileRequest;
import com.hellotalk.dto.response.UserResponse;
import com.hellotalk.entity.User;
import com.hellotalk.exception.AppException;
import com.hellotalk.repository.UserRepository;
import com.hellotalk.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    @Override
    public UserResponse getProfile(String username) {
        User user = findUserByUsername(username);
        return UserResponse.from(user);
    }

    @Override
    @Transactional
    public UserResponse updateProfile(String username, UpdateProfileRequest request) {
        User user = findUserByUsername(username);

        if (request.getFirstName() != null && !request.getFirstName().isBlank()) {
            user.setFirstName(request.getFirstName());
        }
        if (request.getLastName() != null) {
            user.setLastName(request.getLastName());
        }
        if (request.getProfilePicture() != null) {
            user.setProfilePicture(request.getProfilePicture());
        }

        userRepository.save(user);
        return UserResponse.from(user);
    }

    @Override
    @Transactional
    public UserResponse updateStatus(String username, User.OnlineStatus status) {
        User user = findUserByUsername(username);
        user.setStatus(status);
        userRepository.save(user);
        return UserResponse.from(user);
    }

    @Override
    public List<UserResponse> searchUsers(String query, String currentUsername) {
        User current = findUserByUsername(currentUsername);
        return userRepository.findAllActiveUsersExcept(current.getId())
                .stream()
                .filter(u -> u.getUsername().toLowerCase().contains(query.toLowerCase())
                        || u.getFirstName().toLowerCase().contains(query.toLowerCase())
                        || (u.getLastName() != null
                        && u.getLastName().toLowerCase().contains(query.toLowerCase())))
                .map(UserResponse::from)
                .collect(Collectors.toList());
    }

    @Override
    public UserResponse getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new AppException("User not found", HttpStatus.NOT_FOUND));
        return UserResponse.from(user);
    }

    private User findUserByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException("User not found: " + username, HttpStatus.NOT_FOUND));
    }
}
