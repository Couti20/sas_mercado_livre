package com.mercadolivre.pricemonitor.controller;

import com.mercadolivre.pricemonitor.dto.LoginRequest;
import com.mercadolivre.pricemonitor.dto.RegisterRequest;
import com.mercadolivre.pricemonitor.model.User;
import com.mercadolivre.pricemonitor.security.JwtTokenProvider;
import com.mercadolivre.pricemonitor.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("AuthController Tests")
class AuthControllerTest {

    @Mock
    private UserService userService;

    @Mock
    private JwtTokenProvider jwtTokenProvider;

    @InjectMocks
    private AuthController authController;

    private User sampleUser;

    @BeforeEach
    void setUp() {
        sampleUser = new User();
        sampleUser.setId(1L);
        sampleUser.setEmail("test@example.com");
        sampleUser.setPassword("encodedPassword");
        sampleUser.setFullName("Test User");
        sampleUser.setEmailVerified(false);
    }

    @Test
    @DisplayName("Deve registrar novo usuário com sucesso")
    void deveRegistrarNovoUsuarioComSucesso() {
        // Arrange
        RegisterRequest request = new RegisterRequest();
        request.setEmail("novo@example.com");
        request.setPassword("senha123");
        request.setFullName("Novo Usuario");

        when(userService.registerUser(any(RegisterRequest.class))).thenReturn(sampleUser);
        when(jwtTokenProvider.generateToken(anyLong(), anyString())).thenReturn("jwt-token");

        // Act
        ResponseEntity<?> response = authController.register(request);

        // Assert
        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        verify(userService, times(1)).registerUser(any(RegisterRequest.class));
    }

    @Test
    @DisplayName("Deve rejeitar registro com email já existente")
    void deveRejeitarRegistroComEmailExistente() {
        // Arrange
        RegisterRequest request = new RegisterRequest();
        request.setEmail("existente@example.com");
        request.setPassword("senha123");
        request.setFullName("Usuario");

        when(userService.registerUser(any(RegisterRequest.class)))
            .thenThrow(new IllegalArgumentException("Email já cadastrado"));

        // Act
        ResponseEntity<?> response = authController.register(request);

        // Assert
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }

    @Test
    @DisplayName("Deve fazer login com credenciais válidas")
    void deveFazerLoginComCredenciaisValidas() {
        // Arrange
        LoginRequest request = new LoginRequest();
        request.setEmail("test@example.com");
        request.setPassword("senha123");

        when(userService.findByEmail("test@example.com")).thenReturn(Optional.of(sampleUser));
        when(userService.validatePassword("senha123", "encodedPassword")).thenReturn(true);
        when(jwtTokenProvider.generateToken(sampleUser.getId(), sampleUser.getEmail())).thenReturn("jwt-token");

        // Act
        ResponseEntity<?> response = authController.login(request);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
    }

    @Test
    @DisplayName("Deve rejeitar login com email não encontrado")
    void deveRejeitarLoginComEmailNaoEncontrado() {
        // Arrange
        LoginRequest request = new LoginRequest();
        request.setEmail("naoexiste@example.com");
        request.setPassword("senha123");

        when(userService.findByEmail("naoexiste@example.com")).thenReturn(Optional.empty());

        // Act
        ResponseEntity<?> response = authController.login(request);

        // Assert
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }

    @Test
    @DisplayName("Deve rejeitar login com senha incorreta")
    void deveRejeitarLoginComSenhaIncorreta() {
        // Arrange
        LoginRequest request = new LoginRequest();
        request.setEmail("test@example.com");
        request.setPassword("senhaErrada");

        when(userService.findByEmail("test@example.com")).thenReturn(Optional.of(sampleUser));
        when(userService.validatePassword("senhaErrada", "encodedPassword")).thenReturn(false);

        // Act
        ResponseEntity<?> response = authController.login(request);

        // Assert
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }
}
