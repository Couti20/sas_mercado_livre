package com.mercadolivre.pricemonitor.service;

import com.mercadolivre.pricemonitor.model.Notification;
import com.mercadolivre.pricemonitor.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

/**
 * Service for managing user notifications (bell notifications).
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;

    /**
     * Create a new notification
     */
    public Notification createNotification(Notification notification) {
        log.info("🔔 Creating notification for user {}: {}", notification.getUserId(), notification.getType());
        return notificationRepository.save(notification);
    }

    /**
     * Create a price change notification
     */
    public Notification createPriceChangeNotification(Long userId, Long productId, String productName,
                                                       Double oldPrice, Double newPrice) {
        Notification notification = Notification.priceChange(userId, productId, productName, oldPrice, newPrice);
        return createNotification(notification);
    }

    /**
     * Create a product added notification
     */
    public Notification createProductAddedNotification(Long userId, Long productId, String productName, Double price) {
        Notification notification = Notification.productAdded(userId, productId, productName, price);
        return createNotification(notification);
    }

    /**
     * Get all notifications for a user (recent, max 50)
     */
    public List<Notification> getNotificationsByUserId(Long userId) {
        return notificationRepository.findRecentByUserId(userId);
    }

    /**
     * Get unread notifications count
     */
    public long getUnreadCount(Long userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    /**
     * Mark a specific notification as read
     */
    @Transactional
    public boolean markAsRead(Long notificationId, Long userId) {
        Optional<Notification> optNotification = notificationRepository.findById(notificationId);
        if (optNotification.isPresent()) {
            Notification notification = optNotification.get();
            // Security check: ensure notification belongs to the user
            if (!notification.getUserId().equals(userId)) {
                log.warn("⚠️ User {} tried to mark notification {} that doesn't belong to them", 
                        userId, notificationId);
                return false;
            }
            notification.setIsRead(true);
            notificationRepository.save(notification);
            log.info("✅ Notification {} marked as read", notificationId);
            return true;
        }
        return false;
    }

    /**
     * Mark all notifications as read for a user
     */
    @Transactional
    public void markAllAsRead(Long userId) {
        notificationRepository.markAllAsReadByUserId(userId);
        log.info("✅ All notifications marked as read for user {}", userId);
    }

    /**
     * Delete all notifications for a user
     */
    @Transactional
    public void deleteAllByUserId(Long userId) {
        notificationRepository.deleteByUserId(userId);
        log.info("🗑️ All notifications deleted for user {}", userId);
    }

    /**
     * Get notification by ID
     */
    public Optional<Notification> getById(Long id) {
        return notificationRepository.findById(id);
    }
}
