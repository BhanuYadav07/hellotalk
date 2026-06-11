package com.hellotalk.websocket;

import com.hellotalk.dto.request.MessageRequest;
import com.hellotalk.dto.response.MessageResponse;
import com.hellotalk.service.MessageService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.security.Principal;

@Controller
@RequiredArgsConstructor
public class ChatWebSocketController {

    private static final Logger logger = LoggerFactory.getLogger(ChatWebSocketController.class);

    private final SimpMessagingTemplate messagingTemplate;
    private final MessageService messageService;

    /**
     * Client sends to: /app/chat.send
     * Receiver gets notified at: /user/{receiverUsername}/queue/messages
     * Sender gets echo at:       /user/{senderUsername}/queue/messages
     */
    @MessageMapping("/chat.send")
    public void sendMessage(@Payload MessageRequest request, Principal principal) {
        try {
            String senderUsername = principal.getName();
            MessageResponse saved = messageService.sendMessage(senderUsername, request);

            // Push to receiver
            messagingTemplate.convertAndSendToUser(
                    saved.getReceiverUsername(),
                    "/queue/messages",
                    saved
            );

            // Echo back to sender so UI stays in sync
            messagingTemplate.convertAndSendToUser(
                    senderUsername,
                    "/queue/messages",
                    saved
            );

        } catch (Exception e) {
            logger.error("Error processing WebSocket message: {}", e.getMessage(), e);
        }

    }


}
