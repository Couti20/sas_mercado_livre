package com.mercadolivre.pricemonitor.controller;

import com.mercadolivre.pricemonitor.dto.AuthResponse;
import com.mercadolivre.pricemonitor.dto.LoginRequest;
import com.mercadolivre.pricemonitor.dto.RegisterRequest;
import com.mercadolivre.pricemonitor.model.User;
import com.mercadolivre.pricemonitor.security.JwtTokenProvider;
import com.mercadolivre.pricemonitor.service.UserService;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"})
public class AuthController {
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private JwtTokenProvider tokenProvider;
    
    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        try {
            log.info("📝 Recebido request de registro: {}", request.getEmail());
            
            // Registrar usuário
            User user = userService.registerUser(request);
            
            // Gerar token
            String token = tokenProvider.generateToken(user.getId(), user.getEmail());
            
            // Preparar resposta
            AuthResponse response = new AuthResponse();
            response.setToken(token);
            response.setId(user.getId());
            response.setEmail(user.getEmail());
            response.setFullName(user.getFullName());
            response.setEmailVerified(user.getEmailVerified());
            
            log.info("✅ Registro bem-sucedido: {}", user.getEmail());
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
            
        } catch (IllegalArgumentException e) {
            log.warn("⚠️ Erro no registro: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            log.error("❌ Erro ao registrar: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Erro ao registrar usuário"));
        }
    }
    
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        try {
            log.info("🔐 Recebido request de login: {}", request.getEmail());
            
            // Buscar usuário
            User user = userService.findByEmail(request.getEmail())
                    .orElseThrow(() -> new IllegalArgumentException("Email ou senha inválidos"));
            
            // Validar senha
            if (!userService.validatePassword(request.getPassword(), user.getPassword())) {
                log.warn("⚠️ Senha inválida para: {}", request.getEmail());
                throw new IllegalArgumentException("Email ou senha inválidos");
            }
            
            // Gerar token
            String token = tokenProvider.generateToken(user.getId(), user.getEmail());
            
            // Preparar resposta
            AuthResponse response = new AuthResponse();
            response.setToken(token);
            response.setId(user.getId());
            response.setEmail(user.getEmail());
            response.setFullName(user.getFullName());
            response.setEmailVerified(user.getEmailVerified());
            
            log.info("✅ Login bem-sucedido: {}", user.getEmail());
            return ResponseEntity.ok(response);
            
        } catch (IllegalArgumentException e) {
            log.warn("⚠️ Erro no login: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            log.error("❌ Erro ao fazer login: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Erro ao fazer login"));
        }
    }
    
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser() {
        try {
            Object principal = org.springframework.security.core.context.SecurityContextHolder
                    .getContext()
                    .getAuthentication()
                    .getPrincipal();
            
            if (principal == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new ErrorResponse("Usuário não autenticado"));
            }
            
            Long userId = (Long) principal;
            User user = userService.findById(userId)
                    .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado"));
            
            AuthResponse response = new AuthResponse();
            response.setId(user.getId());
            response.setEmail(user.getEmail());
            response.setFullName(user.getFullName());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("❌ Erro ao obter usuário: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ErrorResponse("Erro ao obter dados do usuário"));
        }
    }
    
    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Auth API is running");
    }

    // ==================== PASSWORD RESET ====================

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody ForgotPasswordRequest request) {
        try {
            log.info("🔑 Solicitação de recuperação de senha: {}", request.getEmail());
            
            userService.initiatePasswordReset(request.getEmail());
            
            return ResponseEntity.ok(new SuccessResponse("Código enviado para seu email"));
            
        } catch (IllegalArgumentException e) {
            log.warn("⚠️ Email não encontrado: {}", request.getEmail());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse("Email não encontrado"));
        } catch (Exception e) {
            log.error("❌ Erro ao solicitar recuperação: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Erro ao enviar código"));
        }
    }

    @PostMapping("/verify-reset-code")
    public ResponseEntity<?> verifyResetCode(@RequestBody VerifyCodeRequest request) {
        try {
            log.info("🔑 Verificando código de reset");
            
            userService.validateResetCode(request.getEmail(), request.getCode());
            
            return ResponseEntity.ok(new SuccessResponse("Código válido"));
            
        } catch (IllegalArgumentException e) {
            log.warn("⚠️ Código inválido: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse(e.getMessage()));
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequest request) {
        try {
            log.info("🔑 Resetando senha");
            
            if (request.getPassword() == null || request.getPassword().length() < 6) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new ErrorResponse("Senha deve ter pelo menos 6 caracteres"));
            }
            
            userService.resetPassword(request.getEmail(), request.getCode(), request.getPassword());
            
            return ResponseEntity.ok(new SuccessResponse("Senha alterada com sucesso!"));
            
        } catch (IllegalArgumentException e) {
            log.warn("⚠️ Erro ao resetar senha: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            log.error("❌ Erro ao resetar senha: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Erro ao resetar senha"));
        }
    }
    
    // Classe interna para respostas de erro
    public static class ErrorResponse {
        public String error;
        
        public ErrorResponse(String error) {
            this.error = error;
        }
    }

    // Classe para respostas de sucesso
    public static class SuccessResponse {
        public String message;
        
        public SuccessResponse(String message) {
            this.message = message;
        }
    }

    // DTO para forgot password
    public static class ForgotPasswordRequest {
        private String email;
        
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
    }

    // DTO para verify code
    public static class VerifyCodeRequest {
        private String email;
        private String code;
        
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getCode() { return code; }
        public void setCode(String code) { this.code = code; }
    }

    // DTO para reset password
    public static class ResetPasswordRequest {
        private String email;
        private String code;
        private String password;
        
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getCode() { return code; }
        public void setCode(String code) { this.code = code; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }
}
