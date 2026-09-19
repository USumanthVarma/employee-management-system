package com.ems.entity;

/**
 * Application roles. Stored on User and embedded as a claim in the JWT so
 * the frontend can decide what to show without another API call.
 */
public enum Role {
    ROLE_ADMIN,
    ROLE_USER
}
