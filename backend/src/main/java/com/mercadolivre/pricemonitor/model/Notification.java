package com.mercadolivre.pricemonitor.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Entity representing a notification for the user.
 * Used to show the notification bell with price changes and alerts.
 */
@Entity
@Table(name = "notifications")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "product_id")
    private Long productId;

    @Column(name = "product_name")
    private String productName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NotificationType type;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;

    @Column(name = "old_price")
    private Double oldPrice;

    @Column(name = "new_price")
    private Double newPrice;

    @Column(name = "is_read")
    private Boolean isRead = false;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    public enum NotificationType {
        PRICE_DROP,
        PRICE_INCREASE,
        PRODUCT_ADDED,
        SYSTEM
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.isRead == null) {
            this.isRead = false;
        }
    }

    /**
     * Builder-style constructor for price change notifications
     */
    public static Notification priceChange(Long userId, Long productId, String productName, 
                                           Double oldPrice, Double newPrice) {
        Notification notification = new Notification();
        notification.setUserId(userId);
        notification.setProductId(productId);
        notification.setProductName(productName);
        notification.setOldPrice(oldPrice);
        notification.setNewPrice(newPrice);
        
        if (newPrice < oldPrice) {
            notification.setType(NotificationType.PRICE_DROP);
            double drop = ((oldPrice - newPrice) / oldPrice) * 100;
            notification.setMessage(String.format(
                "🔻 O preço de \"%s\" caiu %.1f%% - de R$ %.2f para R$ %.2f",
                productName, drop, oldPrice, newPrice
            ));
        } else {
            notification.setType(NotificationType.PRICE_INCREASE);
            double increase = ((newPrice - oldPrice) / oldPrice) * 100;
            notification.setMessage(String.format(
                "📈 O preço de \"%s\" subiu %.1f%% - de R$ %.2f para R$ %.2f",
                productName, increase, oldPrice, newPrice
            ));
        }
        
        return notification;
    }

    /**
     * Builder for product added notification
     */
    public static Notification productAdded(Long userId, Long productId, String productName, Double price) {
        Notification notification = new Notification();
        notification.setUserId(userId);
        notification.setProductId(productId);
        notification.setProductName(productName);
        notification.setType(NotificationType.PRODUCT_ADDED);
        notification.setNewPrice(price);
        notification.setMessage(String.format(
            "✅ Produto \"%s\" adicionado ao monitoramento - R$ %.2f",
            productName, price
        ));
        return notification;
    }
}
