package com.sistema.admin.entity;

import jakarta.persistence.Column;
import jakarta.persistence.MappedSuperclass;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import java.time.Instant;

@MappedSuperclass
public abstract class BaseAuditedTimeEntity extends BaseCreatedEntity {

    @Column(name = "atualizado_em", nullable = false)
    private Instant atualizadoEm;

    @Override
    @PrePersist
    protected void onCreate() {
        super.onCreate();
        if (this.atualizadoEm == null) {
            this.atualizadoEm = getCriadoEm();
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.atualizadoEm = Instant.now();
    }

    public Instant getAtualizadoEm() {
        return atualizadoEm;
    }

    public void setAtualizadoEm(Instant atualizadoEm) {
        this.atualizadoEm = atualizadoEm;
    }
}
