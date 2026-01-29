package com.mercadolivre.pricemonitor.service;

import com.mercadolivre.pricemonitor.dto.ScrapeResponse;
import com.mercadolivre.pricemonitor.model.PriceHistory;
import com.mercadolivre.pricemonitor.model.Product;
import com.mercadolivre.pricemonitor.repository.PriceHistoryRepository;
import com.mercadolivre.pricemonitor.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

/**
 * Service dedicated to async scraping operations.
 * Separated from ProductService to ensure @Async works correctly
 * (Spring AOP proxy requires calls from outside the bean).
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class AsyncScrapingService {

    private final ProductRepository productRepository;
    private final PriceHistoryRepository priceHistoryRepository;
    private final ScraperService scraperService;

    /**
     * Scrape product data in background thread (non-blocking).
     * This method runs asynchronously because it's called from another bean.
     */
    @Async
    public void scrapeProductInBackground(Long productId, String url) {
        try {
            log.info("🔄 [ASYNC] Starting background scrape for product ID {}: {}", productId, url);
            
            ScrapeResponse scrapeData = scraperService.fetchProductData(url).get();

            // Buscar produto do banco (pode ter sido deletado enquanto aguardava)
            Product product = productRepository.findById(productId).orElse(null);
            if (product == null) {
                log.warn("⚠️ Product {} was deleted while scraping", productId);
                return;
            }

            if (scrapeData == null || !scrapeData.isValid()) {
                log.error("❌ Background scrape failed for product {}: invalid data", productId);
                product.setStatus("ERROR");
                product.setName("Erro ao carregar - " + extractSimpleName(product.getName()));
                productRepository.save(product);
                return;
            }

            // Atualizar com dados do scraper
            product.setName(scrapeData.getTitle());
            product.setImageUrl(scrapeData.getImageUrl());
            product.setCurrentPrice(scrapeData.getPrice());
            product.setOriginalPrice(scrapeData.getOriginalPrice());
            product.setDiscountPercent(scrapeData.getDiscountPercent());
            product.setLastCheckedAt(LocalDateTime.now());
            product.setStatus("ACTIVE");
            productRepository.save(product);

            // Salvar primeiro registro no histórico
            PriceHistory history = new PriceHistory(product, scrapeData.getPrice());
            priceHistoryRepository.save(history);

            // Log com informação de desconto se houver
            if (scrapeData.getDiscountPercent() != null && scrapeData.getDiscountPercent() > 0) {
                log.info("✅ [ASYNC] Background scrape completed for product {}: '{}' at R$ {} (🏷️ {}% OFF, original: R$ {})", 
                    productId, product.getName(), product.getCurrentPrice(), 
                    scrapeData.getDiscountPercent(), scrapeData.getOriginalPrice());
            } else {
                log.info("✅ [ASYNC] Background scrape completed for product {}: '{}' at R$ {}", 
                    productId, product.getName(), product.getCurrentPrice());
            }

        } catch (Exception e) {
            log.error("❌ [ASYNC] Background scrape error for product {}: {}", productId, e.getMessage());
            try {
                Product product = productRepository.findById(productId).orElse(null);
                if (product != null) {
                    product.setStatus("ERROR");
                    productRepository.save(product);
                }
            } catch (Exception ex) {
                log.error("Failed to update product status: {}", ex.getMessage());
            }
        }
    }

    private String extractSimpleName(String name) {
        if (name == null) return "produto";
        // Remove "Carregando produto..." prefix if present
        return name.replace("Carregando produto...", "").trim();
    }
}
