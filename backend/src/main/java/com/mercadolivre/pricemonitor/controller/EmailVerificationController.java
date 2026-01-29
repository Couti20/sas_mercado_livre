package com.mercadolivre.pricemonitor.controller;

import com.mercadolivre.pricemonitor.model.User;
import com.mercadolivre.pricemonitor.repository.UserRepository;
import com.mercadolivre.pricemonitor.service.BrevoEmailService;
import com.mercadolivre.pricemonitor.service.EmailService;
import com.mercadolivre.pricemonitor.service.ResendEmailService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/email")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"})
public class EmailVerificationController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private ResendEmailService resendEmailService;

    @Autowired
    private BrevoEmailService brevoEmailService;

    @Value("${frontend.url:http://localhost:5173/}")
    private String frontendUrl;

    /**
     * Verify email with token
     */
    @GetMapping("/verify")
    public ResponseEntity<?> verifyEmail(@RequestParam String token) {
        try {
            log.info("📧 Verificando token de email: {}", token.substring(0, 8) + "...");

            var userOpt = userRepository.findByVerificationToken(token);
            
            if (userOpt.isEmpty()) {
                // Token not found - might be already verified or invalid
                log.info("📧 Token não encontrado - pode já ter sido usado");
                
                Map<String, Object> response = new HashMap<>();
                response.put("message", "Email já verificado anteriormente!");
                response.put("alreadyVerified", true);
                return ResponseEntity.ok(response);
            }
            
            User user = userOpt.get();

            // Check if token expired
            if (user.getVerificationTokenExpires() != null && 
                user.getVerificationTokenExpires().isBefore(LocalDateTime.now())) {
                log.warn("⚠️ Token expirado para usuário: {}", user.getEmail());
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(errorResponse("Token expirado. Solicite um novo email de verificação."));
            }

            // Verify email
            user.setEmailVerified(true);
            user.setVerificationToken(null);
            user.setVerificationTokenExpires(null);
            userRepository.save(user);

            log.info("✅ Email verificado com sucesso: {}", user.getEmail());

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Email verificado com sucesso!");
            response.put("email", user.getEmail());

            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            log.warn("⚠️ Erro na verificação: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(errorResponse(e.getMessage()));
        } catch (Exception e) {
            log.error("❌ Erro ao verificar email: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorResponse("Erro ao verificar email"));
        }
    }

    /**
     * Resend verification email
     */
    @PostMapping("/resend-verification")
    public ResponseEntity<?> resendVerification() {
        try {
            Long userId = getCurrentUserId();
            log.info("📧 Reenviando email de verificação para usuário: {}", userId);

            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado"));

            if (user.getEmailVerified()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(errorResponse("Email já está verificado"));
            }

            // Generate new token
            String token = UUID.randomUUID().toString();
            user.setVerificationToken(token);
            user.setVerificationTokenExpires(LocalDateTime.now().plusHours(24));
            userRepository.save(user);

            // Send email - Prioridade: 1) Brevo 2) Resend 3) Gmail SMTP
            boolean brevoConfigured = brevoEmailService.isConfigured();
            boolean resendConfigured = resendEmailService.isConfigured();
            log.info("📧 [DEBUG] Brevo: {} | Resend: {} | Enviando para: {}", brevoConfigured, resendConfigured, user.getEmail());
            
            if (brevoConfigured) {
                log.info("📧 ✅ Usando Brevo API para enviar email");
                brevoEmailService.sendVerificationEmail(
                    user.getEmail(),
                    user.getFullName(),
                    token,
                    frontendUrl
                );
            } else if (resendConfigured) {
                log.info("📧 ✅ Usando Resend API para enviar email");
                resendEmailService.sendVerificationEmail(
                    user.getEmail(),
                    user.getFullName(),
                    token,
                    frontendUrl
                );
            } else {
                log.warn("📧 ⚠️ Nenhum serviço HTTP configurado! Usando Gmail SMTP (vai falhar no Railway)");
                emailService.sendVerificationEmail(
                    user.getEmail(),
                    user.getFullName(),
                    token,
                    frontendUrl
                );
            }

            log.info("✅ Email de verificação reenviado para: {}", user.getEmail());

            Map<String, String> response = new HashMap<>();
            response.put("message", "Email de verificação enviado com sucesso!");

            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            log.warn("⚠️ Erro ao reenviar: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(errorResponse(e.getMessage()));
        } catch (Exception e) {
            log.error("❌ Erro ao reenviar verificação: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorResponse("Erro ao reenviar email"));
        }
    }

    /**
     * Get email verification status
     */
    @GetMapping("/status")
    public ResponseEntity<?> getVerificationStatus() {
        try {
            Long userId = getCurrentUserId();

            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado"));

            Map<String, Object> response = new HashMap<>();
            response.put("emailVerified", user.getEmailVerified());
            response.put("email", user.getEmail());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("❌ Erro ao obter status: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorResponse("Erro ao obter status"));
        }
    }

    private Long getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getPrincipal() == null) {
            throw new IllegalArgumentException("Usuário não autenticado");
        }
        return (Long) auth.getPrincipal(); 
    }

    private Map<String, String> errorResponse(String message) {
        
        Map<String, String> error = new HashMap<>();
        error.put("error", message);
        return error;
    }

    /**
     * Test endpoint to send a price notification email
     * GET /api/email/test-price-notification
     */
    @GetMapping("/test-price-notification")
    public ResponseEntity<?> testPriceNotification() {
        try {
            Long userId = getCurrentUserId();
            var userOpt = userRepository.findById(userId);
            
            if (userOpt.isEmpty()) {
                return ResponseEntity.badRequest().body(errorResponse("Usuário não encontrado"));
            }
            
            User user = userOpt.get();
            String email = user.getEmail();
            
            log.info("📧 [TEST] Enviando email de teste de notificação de preço para: {}", email);
            log.info("📧 [TEST] Brevo configurado: {}", brevoEmailService.isConfigured());
            
            // Simular uma queda de preço
            String productName = "Produto Teste - Monitor de Preços";
            String productUrl = "https://www.mercadolivre.com.br";
            Double oldPrice = 199.90;
            Double newPrice = 149.90;
            
            brevoEmailService.sendPriceDropNotification(email, productName, productUrl, oldPrice, newPrice);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Email de teste enviado para: " + email);
            response.put("brevoConfigured", brevoEmailService.isConfigured());
            response.put("testData", Map.of(
                "productName", productName,
                "oldPrice", oldPrice,
                "newPrice", newPrice,
                "savings", oldPrice - newPrice
            ));
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("❌ Erro ao enviar email de teste: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorResponse("Erro ao enviar email: " + e.getMessage()));
        }
    }
}
