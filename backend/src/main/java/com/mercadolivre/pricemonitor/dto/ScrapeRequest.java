package com.mercadolivre.pricemonitor.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for the request sent to the Python scraper API.
 * 
 * Example:
 * {
 *   "url": "https://www.mercadolivre.com.br/..."
 * }
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ScrapeRequest {
    
    @NotBlank(message = "URL is required")
    @JsonProperty("url")
    private String url;

    @Override
    public String toString() {
        return "ScrapeRequest{" +
                "url='" + maskUrl(url) + '\'' +
                '}';
    }

    private static String maskUrl(String url) {
        if (url == null || url.length() < 20) return url;
        return url.substring(0, 20) + "...";
    }
}
