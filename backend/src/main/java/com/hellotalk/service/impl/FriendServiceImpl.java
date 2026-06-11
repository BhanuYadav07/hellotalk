

package com.hellotalk.service.impl;

import com.hellotalk.dto.response.UserResponse;
import com.hellotalk.entity.Friendship;
import com.hellotalk.entity.User;
import com.hellotalk.exception.AppException;
import com.hellotalk.repository.FriendshipRepository;
import com.hellotalk.repository.UserRepository;
import com.hellotalk.service.FriendService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FriendServiceImpl implements FriendService {

    private final FriendshipRepository friendshipRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Override
    @Transactional
    public void sendFriendRequest(String requesterUsername, Long addresseeId) {
        User requester = findByUsername(requesterUsername);
        User addressee = userRepository.findById(addresseeId)
                .orElseThrow(() -> new AppException("User not found", HttpStatus.NOT_FOUND));

        if (Boolean.TRUE.equals(requester.getIsBlocked())) {
            throw new AppException("Account blocked");
        }
        if (requester.getId().equals(addresseeId)) {
            throw new AppException("Cannot send friend request to yourself");
        }

        Optional<Friendship> existing = friendshipRepository.findBetweenUsers(
                requester.getId(), addresseeId);

        if (existing.isPresent()) {
            Friendship.FriendshipStatus status = existing.get().getStatus();
            if (status == Friendship.FriendshipStatus.ACCEPTED) {
                throw new AppException("Already friends");
            }
            if (status == Friendship.FriendshipStatus.PENDING) {
                throw new AppException("Friend request already sent");
            }
            // If REJECTED before, delete old record and allow re-request
            if (status == Friendship.FriendshipStatus.REJECTED) {
                friendshipRepository.delete(existing.get());
            }
        }

        Friendship friendship = Friendship.builder()
                .requester(requester)
                .addressee(addressee)
                .status(Friendship.FriendshipStatus.PENDING)
                .build();

        Friendship saved = friendshipRepository.save(friendship);

        // Push real-time notification to the addressee via WebSocket
        messagingTemplate.convertAndSendToUser(
                addressee.getUsername(),
                "/queue/friend-requests",
                Map.of(
                        "friendshipId", saved.getId(),
                        "fromId",       requester.getId(),
                        "from",         requester.getUsername(),
                        "fromName",     requester.getFirstName() + " " + (requester.getLastName() != null ? requester.getLastName() : ""),
                        "type",         "FRIEND_REQUEST"
                )
        );
    }

    @Override
    @Transactional
    public void acceptFriendRequest(String currentUsername, Long friendshipId) {
        User current = findByUsername(currentUsername);
        Friendship friendship = getFriendship(friendshipId);

        if (!friendship.getAddressee().getId().equals(current.getId())) {
            throw new AppException("Not authorized to accept this request", HttpStatus.FORBIDDEN);
        }

        friendship.setStatus(Friendship.FriendshipStatus.ACCEPTED);
        friendshipRepository.save(friendship);

        // Notify the requester that their request was accepted
        messagingTemplate.convertAndSendToUser(
                friendship.getRequester().getUsername(),
                "/queue/friend-requests",
                Map.of(
                        "type",     "REQUEST_ACCEPTED",
                        "fromName", current.getFirstName() + " " + (current.getLastName() != null ? current.getLastName() : ""),
                        "from",     current.getUsername()
                )
        );
    }

    @Override
    @Transactional
    public void rejectFriendRequest(String currentUsername, Long friendshipId) {
        User current = findByUsername(currentUsername);
        Friendship friendship = getFriendship(friendshipId);

        if (!friendship.getAddressee().getId().equals(current.getId())) {
            throw new AppException("Not authorized to reject this request", HttpStatus.FORBIDDEN);
        }

        friendship.setStatus(Friendship.FriendshipStatus.REJECTED);
        friendshipRepository.save(friendship);
    }

    @Override
    @Transactional
    public void removeFriend(String currentUsername, Long friendId) {
        User current = findByUsername(currentUsername);
        Friendship friendship = friendshipRepository
                .findBetweenUsers(current.getId(), friendId)
                .orElseThrow(() -> new AppException("Friendship not found", HttpStatus.NOT_FOUND));
        friendshipRepository.delete(friendship);
    }

    @Override
    public List<UserResponse> getFriends(String username) {
        User user = findByUsername(username);
        return friendshipRepository.findAcceptedFriendships(user.getId())
                .stream()
                .map(f -> f.getRequester().getId().equals(user.getId())
                        ? f.getAddressee() : f.getRequester())
                .map(UserResponse::from)
                .collect(Collectors.toList());
    }

    @Override
    public List<UserResponse> getPendingRequests(String username) {
        User user = findByUsername(username);
        return friendshipRepository.findPendingRequests(user.getId())
                .stream()
                .map(f -> {
                    UserResponse ur = UserResponse.from(f.getRequester());
                    ur.setFriendshipId(f.getId()); // ← needed so frontend can call accept/reject
                    return ur;
                })
                .collect(Collectors.toList());
    }

    private User findByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException("User not found: " + username, HttpStatus.NOT_FOUND));
    }

    private Friendship getFriendship(Long id) {
        return friendshipRepository.findById(id)
                .orElseThrow(() -> new AppException("Friendship request not found", HttpStatus.NOT_FOUND));
    }
}
