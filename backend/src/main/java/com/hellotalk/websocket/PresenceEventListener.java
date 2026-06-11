package com.hellotalk.websocket;

import com.hellotalk.entity.User;
import com.hellotalk.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectedEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.security.Principal;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class PresenceEventListener {

    private static final Logger logger = LoggerFactory.getLogger(PresenceEventListener.class);

    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @EventListener
    public void handleWebSocketConnectListener(SessionConnectedEvent event) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
        Principal principal = accessor.getUser();

        if (principal != null) {
            String username = principal.getName();
            logger.info("WebSocket connected: {}", username);

            userRepository.findByUsername(username).ifPresent(user -> {
                user.setStatus(User.OnlineStatus.ONLINE);
                userRepository.save(user);

                // Broadcast presence to all subscribers
                messagingTemplate.convertAndSend(
                        "/topic/presence",
                        Map.of("username", username, "status", "ONLINE")
                );
            });
        }
    }

    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
        Principal principal = accessor.getUser();

        if (principal != null) {
            String username = principal.getName();
            logger.info("WebSocket disconnected: {}", username);

            userRepository.findByUsername(username).ifPresent(user -> {
                user.setStatus(User.OnlineStatus.OFFLINE);
                userRepository.save(user);

                messagingTemplate.convertAndSend(
                        "/topic/presence",
                        Map.of("username", username, "status", "OFFLINE")
                );
            });
        }
    }
}
