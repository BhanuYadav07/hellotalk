package com.hellotalk.service.impl;

import com.hellotalk.dto.request.MessageRequest;
import com.hellotalk.dto.response.MessageResponse;
import com.hellotalk.entity.Message;
import com.hellotalk.entity.User;
import com.hellotalk.exception.AppException;
import com.hellotalk.repository.MessageRepository;
import com.hellotalk.repository.UserRepository;
import com.hellotalk.service.MessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MessageServiceImpl implements MessageService {

    private final MessageRepository messageRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public MessageResponse sendMessage(String senderUsername, MessageRequest request) {
        User sender = findByUsername(senderUsername);
        User receiver = userRepository.findById(request.getReceiverId())
                .orElseThrow(() -> new AppException("Receiver not found", HttpStatus.NOT_FOUND));

        if (Boolean.TRUE.equals(receiver.getIsBlocked())) {
            throw new AppException("Cannot send message to a blocked user");
        }

        Message.MessageType type;
        try {
            type = Message.MessageType.valueOf(request.getMessageType().toUpperCase());
        } catch (Exception e) {
            type = Message.MessageType.TEXT;
        }

        Message message = Message.builder()
                .sender(sender)
                .receiver(receiver)
                .content(request.getContent())
                .messageType(type)
                .build();

        Message saved = messageRepository.save(message);
        return MessageResponse.from(saved);
    }

    @Override
    public List<MessageResponse> getConversation(String currentUsername, Long otherUserId) {
        User current = findByUsername(currentUsername);
        return messageRepository.findConversation(current.getId(), otherUserId)
                .stream()
                .map(MessageResponse::from)
                .collect(Collectors.toList());
    }

    @Override
    public List<MessageResponse> getUnreadMessages(String username) {
        User user = findByUsername(username);
        return messageRepository.findUnreadMessages(user.getId())
                .stream()
                .map(MessageResponse::from)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public int markMessagesAsRead(String currentUsername, Long senderId) {
        User current = findByUsername(currentUsername);
        return messageRepository.markMessagesAsRead(senderId, current.getId());
    }

    @Override
    @Transactional
    public void deleteMessage(Long messageId, String username) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new AppException("Message not found", HttpStatus.NOT_FOUND));

        if (!message.getSender().getUsername().equals(username)) {
            throw new AppException("You can only delete your own messages", HttpStatus.FORBIDDEN);
        }

        messageRepository.delete(message);
    }

    private User findByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException("User not found: " + username, HttpStatus.NOT_FOUND));
    }
}
