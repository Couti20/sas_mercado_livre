package com.mercadolivre.pricemonitor.service;

import com.mercadolivre.pricemonitor.dto.ScrapeRequest;
import com.mercadolivre.pricemonitor.dto.ScrapeResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;

/**
 * Service responsible for communicating with the Python scraper API.
 * 
 * Handles:
 * - HTTP POST requests to the scraper
 * - Timeout handling (60 seconds)
 * - Error logging (does not throw exceptions)
 */
@Service
@Slf4j
public class ScraperService {

    private final RestTemplate restTemplate;
    private final String scraperApiUrl;

    public ScraperService(
            @Value("${scraper.api.url}") String scraperApiUrl,
            RestTemplateBuilder restTemplateBuilder) {
        this.scraperApiUrl = scraperApiUrl;
        // Configure RestTemplate with timeouts
        this.restTemplate = restTemplateBuilder
                .setConnectTimeout(Duration.ofSeconds(10))
                .setReadTimeout(Duration.ofSeconds(60))
                .build();
        log.info("ScraperService initialized with URL: {}", scraperApiUrl);
    }

    /**
     * Fetch product data from the Python scraper API.
     * 
     * @param productUrl The Mercado Livre product URL to scrape
     * @return ScrapeResponse with title and price, or null if scraping fails
     */
    public ScrapeResponse fetchProductData(String productUrl) {
        String endpoint = scraperApiUrl + "/scrape";
        
        log.debug("Calling scraper API: {} | Product URL: {}", endpoint, productUrl);
        
        try {
            // Prepare request headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            // Prepare request body
            ScrapeRequest request = new ScrapeRequest(productUrl);
            HttpEntity<ScrapeRequest> entity = new HttpEntity<>(request, headers);
            
            // Make POST request
            long startTime = System.currentTimeMillis();
            ResponseEntity<ScrapeResponse> response = restTemplate.exchange(
                endpoint,
                HttpMethod.POST,
                entity,
                ScrapeResponse.class
            );
            long duration = System.currentTimeMillis() - startTime;
            
            // Check if response is successful
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                ScrapeResponse result = response.getBody();
                log.info("✅ Scraper success: title='{}' | price=R${} | duration={}ms", 
                        result.getTitle(), result.getPrice(), duration);
                return result;
            } else {
                log.warn("❌ Scraper returned non-success status: {}", response.getStatusCode());
                return null;
            }
            
        } catch (org.springframework.web.client.ResourceAccessException e) {
            log.error("❌ SCRAPER CONNECTION ERROR - Is Python scraper running on {}? Error: {}", 
                    scraperApiUrl, e.getMessage());
            return null;
        } catch (RestClientException e) {
            log.error("❌ Scraper API error for URL '{}': {}", productUrl, e.getMessage());
            return null;
        } catch (Exception e) {
            log.error("❌ Unexpected error while calling scraper API", e);
            return null;
        }
    }

    /**
     * Check if the scraper API is available.
     * 
     * @return true if the API responds, false otherwise
     */
    public boolean isScraperAvailable() {
        try {
            ResponseEntity<String> response = restTemplate.getForEntity(scraperApiUrl, String.class);
            boolean available = response.getStatusCode().is2xxSuccessful();
            if (available) {
                log.info("✅ Scraper API is available");
            } else {
                log.warn("⚠️ Scraper API returned status: {}", response.getStatusCode());
            }
            return available;
        } catch (Exception e) {
            log.error("❌ Scraper API is NOT available at {}: {}", scraperApiUrl, e.getMessage());
            return false;
        }
    }
}
