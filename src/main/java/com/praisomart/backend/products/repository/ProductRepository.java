package com.praisomart.backend.products.repository;

import com.praisomart.backend.products.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

//    @Query("""
//SELECT p FROM Product p
//LEFT JOIN p.variants v
//WHERE p.isActive = true
//AND (:categoryId IS NULL OR p.category.id = :categoryId)
//AND (:color IS NULL OR p.color = :color)
//AND (:size IS NULL OR v.attribute = :size)
//GROUP BY p
//ORDER BY
//    CASE WHEN :sort = 'price_low' THEN MIN(v.price) END ASC,
//    CASE WHEN :sort = 'price_high' THEN MAX(v.price) END DESC,
//    p.id DESC
//""")
@Query("""
SELECT p FROM Product p
LEFT JOIN p.variants v
WHERE p.isActive = true
AND v.isActive = true
AND (:categoryId IS NULL OR p.category.id = :categoryId)
AND (:color IS NULL OR p.color = :color)
AND (:size IS NULL OR v.attribute = :size)
GROUP BY p
ORDER BY 
    CASE WHEN :sort = 'price_low' THEN MIN(v.price) END ASC,
    CASE WHEN :sort = 'price_high' THEN MAX(v.price) END DESC,
    p.id DESC
""")
    Page<Product> findProductsWithFilters(
            @Param("categoryId") Long categoryId,
            @Param("color") String color,
            @Param("size") String size,
            @Param("sort") String sort,
            Pageable pageable
    );

    // Size filter (optional use if needed)
    @Query("""
        SELECT DISTINCT p.id FROM Product p
        JOIN p.variants v
        WHERE p.isActive = true
        AND (:size IS NULL OR LOWER(v.attribute) = LOWER(:size))
    """)
    List<Long> findProductIdsBySize(@Param("size") String size);

    // Product detail (optimized fetch)
    @Query("""
        SELECT p FROM Product p
        LEFT JOIN FETCH p.images
        LEFT JOIN FETCH p.variants
        WHERE p.id = :id
    """)
    Optional<Product> findProductDetail(@Param("id") Long id);

    // SORT: LOW PRICE
    @Query("""
        SELECT p FROM Product p
        JOIN p.variants v
        WHERE p.isActive = true
        AND (:categoryId IS NULL OR p.category.id = :categoryId)
        AND (:color IS NULL OR LOWER(p.color) = LOWER(:color))
        GROUP BY p
        ORDER BY MIN(v.price) ASC
    """)
    Page<Product> findProductsSortedByPriceLow(
            @Param("categoryId") Long categoryId,
            @Param("color") String color,
            Pageable pageable
    );

    // SORT: HIGH PRICE
    @Query("""
        SELECT p FROM Product p
        JOIN p.variants v
        WHERE p.isActive = true
        AND (:categoryId IS NULL OR p.category.id = :categoryId)
        AND (:color IS NULL OR LOWER(p.color) = LOWER(:color))
        GROUP BY p
        ORDER BY MAX(v.price) DESC
    """)
    Page<Product> findProductsSortedByPriceHigh(
            @Param("categoryId") Long categoryId,
            @Param("color") String color,
            Pageable pageable
    );

    @Query("""
SELECT DISTINCT p
FROM Product p
LEFT JOIN p.variants v
WHERE p.isActive = true
AND (
      v IS NULL
      OR v.isActive = true
)
AND (
    LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%'))
    OR LOWER(p.color) LIKE LOWER(CONCAT('%', :keyword, '%'))
    OR LOWER(p.category.name) LIKE LOWER(CONCAT('%', :keyword, '%'))
)
ORDER BY p.id DESC
""")
    Page<Product> searchProducts(
            @Param("keyword") String keyword,
            Pageable pageable
    );

    @Query("""
        SELECT p FROM Product p
        WHERE p.isActive = true
        AND p.category.id = :categoryId
        AND p.id != :productId
    """)
    List<Product> findRelatedProducts(
            @Param("categoryId") Long categoryId,
            @Param("productId") Long productId,
            Pageable pageable
    );

//    @Query("""
//SELECT p
//FROM Product p
//JOIN p.variants v
//WHERE p.isActive = true
//AND v.isActive = true
//AND (
//    p.name LIKE CONCAT('%', :keyword, '%')
//    OR p.color LIKE CONCAT('%', :keyword, '%')
//    OR p.category.name LIKE CONCAT('%', :keyword, '%')
//)
//GROUP BY p
//ORDER BY p.id DESC
//""")
//    Page<Product> searchProducts(
//            @Param("keyword") String keyword,
//            Pageable pageable
//    );

}

//@Repository
//public interface ProductRepository extends JpaRepository<Product, Long> {
//
//    @Query("""
//        SELECT DISTINCT p FROM Product p
//        LEFT JOIN FETCH p.images i
//        LEFT JOIN FETCH p.variants v
//        WHERE p.isActive = true
//        AND (:categoryId IS NULL OR p.category.id = :categoryId)
//    """)
//    List<Product> findProducts(Long categoryId);
//
//    @Query("""
//    SELECT p FROM Product p
//    LEFT JOIN FETCH p.images
//    LEFT JOIN FETCH p.variants
//    WHERE p.id = :id
//""")
//    Optional<Product> findProductDetail(Long id);
//}
