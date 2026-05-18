package com.praisomart.backend.marketing.repository;

import com.praisomart.backend.marketing.entity.PopOffer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PopOfferRepository extends JpaRepository<PopOffer, Long> {
    // Use explicit JPQL query to avoid JPA getter-naming confusion (isActive field vs getActive() getter)
    @Query("SELECT o FROM PopOffer o WHERE o.isActive = true")
    List<PopOffer> findByIsActiveTrue();
}
