package com.hellotalk.repository;

import com.hellotalk.entity.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {

    @Query("SELECT m FROM Message m WHERE " +
           "(m.sender.id = :senderId AND m.receiver.id = :receiverId) OR " +
           "(m.sender.id = :receiverId AND m.receiver.id = :senderId) " +
           "ORDER BY m.sentAt ASC")
    List<Message> findConversation(Long senderId, Long receiverId);

    @Query("SELECT m FROM Message m WHERE m.receiver.id = :receiverId AND m.isRead = false")
    List<Message> findUnreadMessages(Long receiverId);

    @Modifying
    @Transactional
    @Query("UPDATE Message m SET m.isRead = true WHERE m.sender.id = :senderId AND m.receiver.id = :receiverId AND m.isRead = false")
    int markMessagesAsRead(Long senderId, Long receiverId);

    @Query("SELECT COUNT(m) FROM Message m WHERE m.receiver.id = :receiverId AND m.isRead = false AND m.sender.id = :senderId")
    long countUnreadFromSender(Long senderId, Long receiverId);

    @Query("SELECT DISTINCT CASE WHEN m.sender.id = :userId THEN m.receiver ELSE m.sender END " +
           "FROM Message m WHERE m.sender.id = :userId OR m.receiver.id = :userId")
    List<Object> findConversationPartners(Long userId);
}
