package com.mercadolivre.pricemonitor.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

/**
 * Service for sending email notifications using Gmail SMTP.
 */
@Service
@Slf4j
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Value("${mail.from.name:MonitoraPreço}")
    private String fromName;

    @Value("${mail.from.email}")
    private String fromEmail;

    /**
     * Send a price drop notification email to a specific user.
     */
    public void sendPriceDropNotification(String userEmail, String productName, String productUrl, 
                                          Double oldPrice, Double newPrice) {
        if (userEmail == null || userEmail.isBlank()) {
            log.debug("No user email configured");
            return;
        }

        double savings = oldPrice - newPrice;
        double percentDrop = (savings / oldPrice) * 100;

        String subject = String.format("🔻 Preço caiu! %s", truncate(productName, 40));
        
        String htmlBody = String.format("""
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%); padding: 20px; border-radius: 10px 10px 0 0;">
                    <h1 style="color: white; margin: 0; font-size: 24px;">🔻 Alerta de Preço!</h1>
                </div>
                
                <div style="background: #f8f9fa; padding: 20px; border: 1px solid #e9ecef;">
                    <h2 style="color: #333; margin-top: 0;">%s</h2>
                    
                    <div style="background: white; padding: 15px; border-radius: 8px; margin: 15px 0;">
                        <p style="margin: 5px 0; color: #666;">
                            <strong>Preço anterior:</strong> 
                            <span style="text-decoration: line-through; color: #999;">R$ %.2f</span>
                        </p>
                        <p style="margin: 5px 0;">
                            <strong>Novo preço:</strong> 
                            <span style="color: #28a745; font-size: 24px; font-weight: bold;">R$ %.2f</span>
                        </p>
                        <p style="margin: 5px 0; color: #28a745;">
                            <strong>Você economiza:</strong> R$ %.2f (%.1f%% off)
                        </p>
                    </div>
                    
                    <a href="%s" style="display: inline-block; background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                        Ver no Mercado Livre →
                    </a>
                </div>
                
                <div style="background: #333; color: #999; padding: 15px; border-radius: 0 0 10px 10px; font-size: 12px; text-align: center;">
                    MonitoraPreço - Inteligência Competitiva
                </div>
            </div>
            """,
            productName,
            oldPrice,
            newPrice,
            savings,
            percentDrop,
            productUrl
        );

        sendEmail(userEmail, subject, htmlBody);
    }

    /**
     * Send a price increase notification email to a specific user.
     */
    public void sendPriceIncreaseNotification(String userEmail, String productName, String productUrl,
                                              Double oldPrice, Double newPrice) {
        if (userEmail == null || userEmail.isBlank()) {
            log.debug("No user email configured");
            return;
        }

        double increase = newPrice - oldPrice;
        double percentIncrease = (increase / oldPrice) * 100;

        String subject = String.format("📈 Preço subiu! %s", truncate(productName, 40));
        
        String htmlBody = String.format("""
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #ffc107 0%%, #ff9800 100%%); padding: 20px; border-radius: 10px 10px 0 0;">
                    <h1 style="color: white; margin: 0; font-size: 24px;">📈 Preço Subiu!</h1>
                </div>
                
                <div style="background: #f8f9fa; padding: 20px; border: 1px solid #e9ecef;">
                    <h2 style="color: #333; margin-top: 0;">%s</h2>
                    
                    <div style="background: white; padding: 15px; border-radius: 8px; margin: 15px 0;">
                        <p style="margin: 5px 0; color: #666;">
                            <strong>Preço anterior:</strong> 
                            <span style="color: #28a745;">R$ %.2f</span>
                        </p>
                        <p style="margin: 5px 0;">
                            <strong>Novo preço:</strong> 
                            <span style="color: #dc3545; font-size: 24px; font-weight: bold;">R$ %.2f</span>
                        </p>
                        <p style="margin: 5px 0; color: #dc3545;">
                            <strong>Aumento:</strong> R$ %.2f (+%.1f%%)
                        </p>
                    </div>
                    
                    <a href="%s" style="display: inline-block; background: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                        Ver no Mercado Livre →
                    </a>
                </div>
                
                <div style="background: #333; color: #999; padding: 15px; border-radius: 0 0 10px 10px; font-size: 12px; text-align: center;">
                    MonitoraPreço - Mercado Livre
                </div>
            </div>
            """,
            productName,
            oldPrice,
            newPrice,
            increase,
            percentIncrease,
            productUrl
        );

        sendEmail(userEmail, subject, htmlBody);
    }

    /**
     * Send an email using Gmail SMTP.
     */
    private void sendEmail(String to, String subject, String htmlBody) {
        try {
            log.info("📧 Enviando email para: {} via Gmail SMTP...", to);
            
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(fromEmail, fromName);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true); // true = HTML
            
            mailSender.send(message);
            log.info("📧 ✅ Email enviado com SUCESSO para {}", to);

        } catch (MessagingException e) {
            log.error("📧 ❌ Erro ao enviar email: {}", e.getMessage());
        } catch (Exception e) {
            log.error("📧 ❌ Erro inesperado ao enviar email: {} - {}", e.getClass().getSimpleName(), e.getMessage());
        }
    }

    /**
     * Truncate string for email subject.
     */
    private String truncate(String text, int maxLength) {
        if (text == null || text.length() <= maxLength) {
            return text;
        }
        return text.substring(0, maxLength - 3) + "...";
    }

    /**
     * Check if email service is enabled (always true with Gmail SMTP).
     */
    public boolean isEnabled() {
        return true;
    }

    /**
     * Send email verification link.
     */
    public void sendVerificationEmail(String userEmail, String fullName, String verificationToken, String frontendUrl) {
        // Garantir que a URL base termina com /
        String baseUrl = frontendUrl.endsWith("/") ? frontendUrl : frontendUrl + "/";
        String verificationLink = baseUrl + "verify-email?token=" + verificationToken;
        
        // Sempre loga o link para debug
        log.info("📧 [DEBUG] Link de verificação: {}", verificationLink);

        String subject = "✉️ Confirme seu email - MonitoraPreço";
        
        String htmlBody = String.format("""
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
                    <p style="margin: 10px 0 0 0; color: #64748b;">© 2024 MonitoraPreço - Todos os direitos reservados</p>
                </div>
            </div>
            """,
            fullName.split(" ")[0],
            verificationLink,
            verificationLink,
            verificationLink
        );

        sendEmail(userEmail, subject, htmlBody);
        log.info("📧 Verification email sent to {}", userEmail);
    }

    /**
     * Send password reset email.
     */
    public void sendPasswordResetEmail(String userEmail, String fullName, String resetToken, String frontendUrl) {
        String resetLink = frontendUrl + "reset-password?token=" + resetToken;
        
        // Sempre loga o link para debug
        log.info("🔑 [DEBUG] Link de reset de senha: {}", resetLink);

        String subject = "🔑 Recuperação de Senha - MonitoraPreço";
        
        String htmlBody = String.format("""
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #1e293b 0%%, #0f172a 100%%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
                    <h1 style="color: #f59e0b; margin: 0; font-size: 28px;">MonitoraPreço</h1>
                    <p style="color: #94a3b8; margin: 10px 0 0 0;">Recuperação de Senha</p>
                </div>
                
                <div style="background: #f8f9fa; padding: 30px; border: 1px solid #e9ecef;">
                    <h2 style="color: #333; margin-top: 0;">Olá, %s! 👋</h2>
                    
                    <p style="color: #555; font-size: 16px; line-height: 1.6;">
                        Recebemos uma solicitação para redefinir a senha da sua conta. 
                        Se foi você quem solicitou, clique no botão abaixo para criar uma nova senha:
                    </p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="%s" style="display: inline-block; background: linear-gradient(135deg, #f59e0b 0%%, #d97706 100%%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                            🔑 Redefinir Senha
                        </a>
                    </div>
                    
                    <p style="color: #888; font-size: 14px;">
                        Se o botão não funcionar, copie e cole este link no navegador:<br>
                        <a href="%s" style="color: #f59e0b; word-break: break-all;">%s</a>
                    </p>
                    
                    <div style="background: #fff3cd; border: 1px solid #ffc107; border-radius: 8px; padding: 15px; margin-top: 20px;">
                        <p style="color: #856404; font-size: 14px; margin: 0;">
                            ⚠️ <strong>Importante:</strong> Este link expira em <strong>1 hora</strong>.
                            Se você não solicitou esta recuperação, ignore este email - sua conta está segura.
                        </p>
                    </div>
                </div>
                
                <div style="background: #1e293b; color: #94a3b8; padding: 20px; border-radius: 0 0 10px 10px; font-size: 12px; text-align: center;">
                    <p style="margin: 0;">Por segurança, nunca compartilhe este link com ninguém.</p>
                    <p style="margin: 10px 0 0 0; color: #64748b;">© 2024 MonitoraPreço - Todos os direitos reservados</p>
                </div>
            </div>
            """,
            fullName.split(" ")[0],
            resetLink,
            resetLink,
            resetLink
        );

        sendEmail(userEmail, subject, htmlBody);
        log.info("🔑 Password reset email sent to {}", userEmail);
    }

    /**
     * Send password reset code (6 digits).
     */
    public void sendPasswordResetCode(String userEmail, String fullName, String code) {
        log.info("🔑 [DEBUG] Código de recuperação: {}", code);

        String subject = "🔑 Código de Recuperação - MonitoraPreço";
        
        String htmlBody = String.format("""
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #1e293b 0%%, #0f172a 100%%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
                    <h1 style="color: #f59e0b; margin: 0; font-size: 28px;">MonitoraPreço</h1>
                    <p style="color: #94a3b8; margin: 10px 0 0 0;">Recuperação de Senha</p>
                </div>
                
                <div style="background: #f8f9fa; padding: 30px; border: 1px solid #e9ecef;">
                    <h2 style="color: #333; margin-top: 0;">Olá, %s! 👋</h2>
                    
                    <p style="color: #555; font-size: 16px; line-height: 1.6;">
                        Recebemos uma solicitação para redefinir sua senha. 
                        Use o código abaixo para continuar:
                    </p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <div style="display: inline-block; background: #1e293b; padding: 20px 40px; border-radius: 10px;">
                            <span style="font-family: 'Courier New', monospace; font-size: 36px; font-weight: bold; color: #f59e0b; letter-spacing: 8px;">%s</span>
                        </div>
                    </div>
                    
                    <div style="background: #fff3cd; border: 1px solid #ffc107; border-radius: 8px; padding: 15px; margin-top: 20px;">
                        <p style="color: #856404; font-size: 14px; margin: 0;">
                            ⏰ Este código expira em <strong>15 minutos</strong>.<br>
                            Se você não solicitou, ignore este email.
                        </p>
                    </div>
                </div>
                
                <div style="background: #1e293b; color: #94a3b8; padding: 20px; border-radius: 0 0 10px 10px; font-size: 12px; text-align: center;">
                    <p style="margin: 0;">Por segurança, nunca compartilhe este código.</p>
                    <p style="margin: 10px 0 0 0; color: #64748b;">© 2024 MonitoraPreço</p>
                </div>
            </div>
            """,
            fullName.split(" ")[0],
            code
        );

        sendEmail(userEmail, subject, htmlBody);
        log.info("🔑 Password reset code sent to {}", userEmail);
    }
}
