package com.mercadolivre.pricemonitor.service;

import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Email service using Brevo API (HTTP-based, works on Railway).
 * Brevo (formerly Sendinblue) is free for up to 300 emails/day.
 * Unlike Resend, Brevo allows sending to any email without domain verification.
 */
@Service
@Slf4j
public class BrevoEmailService {

    private static final String BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

    @Value("${brevo.api.key:}")
    private String apiKey;

    @Value("${brevo.from.email:noreply@monitorapreco.com}")
    private String fromEmail;

    @Value("${brevo.from.name:MonitoraPreco}")
    private String fromName;

    private final RestTemplate restTemplate = new RestTemplate();

    @PostConstruct
    public void init() {
        boolean configured = isConfigured();
        log.info("📧 [BREVO] Inicializando - API Key configurada: {} | From: {} <{}>", 
            configured, fromName, fromEmail);
        if (!configured) {
            log.warn("📧 [BREVO] API Key não configurada");
        }
    }

    /**
     * Check if Brevo is configured
     */
    public boolean isConfigured() {
        return apiKey != null && !apiKey.isBlank() && apiKey.startsWith("xkeysib-");
    }

    /**
     * Send email via Brevo API
     */
    public boolean sendEmail(String to, String toName, String subject, String htmlBody) {
        if (!isConfigured()) {
            log.warn("📧 [BREVO] API key não configurada, email não enviado");
            return false;
        }

        try {
            log.info("📧 [BREVO] Enviando email para: {}", to);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("api-key", apiKey);

            // Brevo API format
            Map<String, Object> body = new HashMap<>();
            
            // Sender
            Map<String, String> sender = new HashMap<>();
            sender.put("name", fromName);
            sender.put("email", fromEmail);
            body.put("sender", sender);
            
            // Recipients
            Map<String, String> recipient = new HashMap<>();
            recipient.put("email", to);
            if (toName != null && !toName.isBlank()) {
                recipient.put("name", toName);
            }
            body.put("to", List.of(recipient));
            
            // Content
            body.put("subject", subject);
            body.put("htmlContent", htmlBody);

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

            ResponseEntity<String> response = restTemplate.exchange(
                BREVO_API_URL,
                HttpMethod.POST,
                request,
                String.class
            );

            if (response.getStatusCode().is2xxSuccessful()) {
                log.info("📧 [BREVO] ✅ Email enviado com SUCESSO para {}", to);
                return true;
            } else {
                log.error("📧 [BREVO] ❌ Erro ao enviar email: {}", response.getBody());
                return false;
            }

        } catch (Exception e) {
            log.error("📧 [BREVO] ❌ Erro ao enviar email para {}: {}", to, e.getMessage(), e);
            return false;
        }
    }

    /**
     * Send verification email
     */
    @Async
    public void sendVerificationEmail(String userEmail, String fullName, String verificationToken, String frontendUrl) {
        try {
            log.info("📧 [BREVO] Iniciando envio de email de verificação para: {}", userEmail);
            
            String baseUrl = frontendUrl.endsWith("/") ? frontendUrl : frontendUrl + "/";
            String verificationLink = baseUrl + "verify-email?token=" + verificationToken;
            
            log.info("📧 [BREVO] Link de verificação: {}", verificationLink);

            String subject = "✉️ Confirme seu email - MonitoraPreço";

            String htmlBody = """
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: linear-gradient(135deg, #1e293b 0%%, #0f172a 100%%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
                        <h1 style="color: #f59e0b; margin: 0; font-size: 28px;">MonitoraPreço</h1>
                        <p style="color: #94a3b8; margin: 10px 0 0 0;">Inteligência Competitiva</p>
                    </div>
                    <div style="background: #f8f9fa; padding: 30px; border: 1px solid #e9ecef;">
                        <h2 style="color: #333; margin-top: 0;">Olá, %s! 👋</h2>
                        <p style="color: #555; font-size: 16px; line-height: 1.6;">
                            Obrigado por se cadastrar no MonitoraPreço! Para ativar sua conta e começar a monitorar seus concorrentes, confirme seu email clicando no botão abaixo:
                        </p>
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="%s" style="display: inline-block; background: linear-gradient(135deg, #f59e0b 0%%, #d97706 100%%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                                ✉️ Confirmar Email
                            </a>
                        </div>
                        <p style="color: #888; font-size: 14px;">
                            Se o botão não funcionar, copie e cole este link no navegador:<br>
                            <a href="%s" style="color: #f59e0b; word-break: break-all;">%s</a>
                        </p>
                        <p style="color: #888; font-size: 13px; margin-top: 20px;">
                            ⏰ Este link expira em 24 horas.
                        </p>
                    </div>
                    <div style="background: #1e293b; color: #94a3b8; padding: 20px; border-radius: 0 0 10px 10px; font-size: 12px; text-align: center;">
                        <p style="margin: 0;">Se você não criou esta conta, ignore este email.</p>
                        <p style="margin: 10px 0 0 0; color: #64748b;">© 2026 MonitoraPreço - Todos os direitos reservados</p>
                    </div>
                </div>
                """.formatted(fullName, verificationLink, verificationLink, verificationLink);

            boolean sent = sendEmail(userEmail, fullName, subject, htmlBody);
            
            if (sent) {
                log.info("📧 [BREVO] ✅ Email de verificação enviado para: {}", userEmail);
            } else {
                log.error("📧 [BREVO] ❌ Falha ao enviar email de verificação para: {}", userEmail);
            }

        } catch (Exception e) {
            log.error("📧 [BREVO] ❌ Erro ao enviar email de verificação: {}", e.getMessage(), e);
        }
    }

    /**
     * Send password reset email
     */
    @Async
    public void sendPasswordResetEmail(String userEmail, String fullName, String resetToken, String frontendUrl) {
        try {
            log.info("📧 [BREVO] Enviando email de reset de senha para: {}", userEmail);
            
            String baseUrl = frontendUrl.endsWith("/") ? frontendUrl : frontendUrl + "/";
            String resetLink = baseUrl + "reset-password?token=" + resetToken;

            String subject = "🔐 Redefinir senha - MonitoraPreço";

            String htmlBody = """
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: linear-gradient(135deg, #1e293b 0%%, #0f172a 100%%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
                        <h1 style="color: #f59e0b; margin: 0; font-size: 28px;">MonitoraPreço</h1>
                        <p style="color: #94a3b8; margin: 10px 0 0 0;">Redefinição de Senha</p>
                    </div>
                    <div style="background: #f8f9fa; padding: 30px; border: 1px solid #e9ecef;">
                        <h2 style="color: #333; margin-top: 0;">Olá, %s! 👋</h2>
                        <p style="color: #555; font-size: 16px; line-height: 1.6;">
                            Recebemos uma solicitação para redefinir a senha da sua conta. Clique no botão abaixo para criar uma nova senha:
                        </p>
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="%s" style="display: inline-block; background: linear-gradient(135deg, #f59e0b 0%%, #d97706 100%%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                                🔐 Redefinir Senha
                            </a>
                        </div>
                        <p style="color: #888; font-size: 14px;">
                            Se o botão não funcionar, copie e cole este link no navegador:<br>
                            <a href="%s" style="color: #f59e0b; word-break: break-all;">%s</a>
                        </p>
                        <p style="color: #888; font-size: 13px; margin-top: 20px;">
                            ⏰ Este link expira em 1 hora.
                        </p>
                    </div>
                    <div style="background: #1e293b; color: #94a3b8; padding: 20px; border-radius: 0 0 10px 10px; font-size: 12px; text-align: center;">
                        <p style="margin: 0;">Se você não solicitou esta redefinição, ignore este email.</p>
                        <p style="margin: 10px 0 0 0; color: #64748b;">© 2026 MonitoraPreço - Todos os direitos reservados</p>
                    </div>
                </div>
                """.formatted(fullName, resetLink, resetLink, resetLink);

            sendEmail(userEmail, fullName, subject, htmlBody);

        } catch (Exception e) {
            log.error("📧 [BREVO] ❌ Erro ao enviar email de reset: {}", e.getMessage(), e);
        }
    }
}
