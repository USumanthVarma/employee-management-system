package com.ems.exception;

/** Thrown when a create/update would violate a uniqueness rule. Mapped to HTTP 409. */
public class DuplicateResourceException extends RuntimeException {
    public DuplicateResourceException(String message) {
        super(message);
    }
}
