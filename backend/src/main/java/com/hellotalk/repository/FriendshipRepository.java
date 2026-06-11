package com.hellotalk.repository;

import com.hellotalk.entity.Friendship;
import com.hellotalk.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FriendshipRepository extends JpaRepository<Friendship, Long> {

    @Query("SELECT f FROM Friendship f WHERE " +
           "(f.requester.id = :userId OR f.addressee.id = :userId) " +
           "AND f.status = 'ACCEPTED'")
    List<Friendship> findAcceptedFriendships(Long userId);

    @Query("SELECT f FROM Friendship f WHERE f.addressee.id = :userId AND f.status = 'PENDING'")
    List<Friendship> findPendingRequests(Long userId);

    @Query("SELECT f FROM Friendship f WHERE " +
           "(f.requester.id = :userId1 AND f.addressee.id = :userId2) OR " +
           "(f.requester.id = :userId2 AND f.addressee.id = :userId1)")
    Optional<Friendship> findBetweenUsers(Long userId1, Long userId2);

    boolean existsByRequesterAndAddressee(User requester, User addressee);
}
