package com.hellotalk.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.hellotalk.entity.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.ALWAYS)
public class UserResponse {

    private Long id;
    private String firstName;
    private String lastName;
    private String username;
    private Long friendshipId;
    private String email;
    private String profilePicture;
    private String status;
    private String role;
    private Boolean isVerified;
    private Boolean isBlocked;
    private LocalDateTime createdAt;

    public static UserResponse from(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .username(user.getUsername())
                .email(user.getEmail())
                .profilePicture(user.getProfilePicture())
                .status(user.getStatus().name())
                .role(user.getRole().name())
                .isVerified(user.getIsVerified())
                .isBlocked(user.getIsBlocked())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
