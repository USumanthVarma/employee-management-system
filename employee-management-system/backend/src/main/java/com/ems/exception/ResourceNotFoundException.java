package com.ems.exception;

/** Thrown when a lookup by id (or unique key) finds nothing. Mapped to HTTP 404. */
public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) {
        super(message);
    }
}
