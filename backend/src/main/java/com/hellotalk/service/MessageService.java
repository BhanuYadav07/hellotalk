package com.hellotalk.service;

import com.hellotalk.dto.request.MessageRequest;
import com.hellotalk.dto.response.MessageResponse;

import java.util.List;

public interface MessageService {

    MessageResponse sendMessage(String senderUsername, MessageRequest request);

    List<MessageResponse> getConversation(String currentUsername, Long otherUserId);

    List<MessageResponse> getUnreadMessages(String username);

    int markMessagesAsRead(String currentUsername, Long senderId);

    void deleteMessage(Long messageId, String username);
}
