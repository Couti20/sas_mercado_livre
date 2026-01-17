package com.mercadolivre.pricemonitor.controller;

import com.mercadolivre.pricemonitor.model.Notification;
import com.mercadolivre.pricemonitor.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * REST Controller for managing user notifications (bell icon notifications).
 */
@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@Slf4j
public class NotificationController {

    private final NotificationService notificationService;

    /**
     * Get all notifications for the authenticated user
     */
    @GetMapping
    public ResponseEntity<List<Notification>> getNotifications() {
        Long userId = getCurrentUserId();
        log.info("🔔 Fetching notifications for user {}", userId);
        List<Notification> notifications = notificationService.getNotificationsByUserId(userId);
        return ResponseEntity.ok(notifications);
    }

    /**
     * Get unread notifications count
     */
    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount() {
        Long userId = getCurrentUserId();
        long count = notificationService.getUnreadCount(userId);
        return ResponseEntity.ok(Map.of("count", count));
    }

    /**
     * Mark a specific notification as read
     */
    @PostMapping("/{id}/read")
    public ResponseEntity<Map<String, Object>> markAsRead(@PathVariable Long id) {
        Long userId = getCurrentUserId();
        boolean success = notificationService.markAsRead(id, userId);
        
        if (success) {
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Notificação marcada como lida"
            ));
        } else {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "Notificação não encontrada ou não pertence a você"
            ));
        }
    }

    /**
     * Mark all notifications as read
     */
    @PostMapping("/read-all")
    public ResponseEntity<Map<String, Object>> markAllAsRead() {
        Long userId = getCurrentUserId();
        notificationService.markAllAsRead(userId);
        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "Todas as notificações foram marcadas como lidas"
        ));
    }

    /**
     * Delete all notifications
     */
    @DeleteMapping
    public ResponseEntity<Map<String, Object>> deleteAll() {
        Long userId = getCurrentUserId();
        notificationService.deleteAllByUserId(userId);
        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "Todas as notificações foram removidas"
        ));
    }

    /**
     * Helper to get current authenticated user ID
     */
    private Long getCurrentUserId() {
        return (Long) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }
}
