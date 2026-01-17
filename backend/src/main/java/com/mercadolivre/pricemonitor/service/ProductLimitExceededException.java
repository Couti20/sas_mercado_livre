package com.mercadolivre.pricemonitor.service;

/**
 * Exception thrown when user exceeds product limit without email verification.
 */
public class ProductLimitExceededException extends RuntimeException {
    
    private final int limit;
    
    public ProductLimitExceededException(String message, int limit) {
        super(message);
        this.limit = limit;
    }
    
    public int getLimit() {
        return limit;
    }
}
