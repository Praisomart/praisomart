package com.praisomart.backend.wishlist.service;

import com.praisomart.backend.auth.entity.User;
import com.praisomart.backend.auth.repository.UserRepository;
import com.praisomart.backend.exception.BadRequestException;
import com.praisomart.backend.exception.DuplicateResourceException;
import com.praisomart.backend.exception.ResourceNotFoundException;
import com.praisomart.backend.products.entity.Product;
import com.praisomart.backend.products.repository.ProductRepository;
import com.praisomart.backend.wishlist.dto.WishlistResponseDTO;
import com.praisomart.backend.wishlist.entity.WishlistEntity;
import com.praisomart.backend.wishlist.repository.WishlistRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class WishlistService {

    private final WishlistRepository wishlistRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public WishlistService(WishlistRepository wishlistRepository,
                           ProductRepository productRepository,
                           UserRepository userRepository) {
        this.wishlistRepository = wishlistRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

    // ================= ADD =================
    public WishlistResponseDTO addToWishlist(Long userId, Long productId) {

        User user = getUser(userId);
        Product product = getProduct(productId);

        WishlistEntity entity = wishlistRepository
                .findByUserAndProduct(user, product)
                .orElse(null);

        if (entity != null) {

            if (Boolean.TRUE.equals(entity.getIsActive())) {
                throw new DuplicateResourceException("Product already in wishlist");
            }

            entity.setIsActive(true);
            entity.setAddedAt(LocalDateTime.now());

            wishlistRepository.save(entity);

            return mapToDTO(entity);
        }

        WishlistEntity newEntity = new WishlistEntity();
        newEntity.setUser(user);
        newEntity.setProduct(product);
        newEntity.setIsActive(true);
        newEntity.setAddedAt(LocalDateTime.now());

        wishlistRepository.save(newEntity);

        return mapToDTO(newEntity);
    }

    // ================= REMOVE (SOFT DELETE) =================
    public WishlistResponseDTO removeFromWishlist(Long userId, Long productId) {

        User user = getUser(userId);
        Product product = getProduct(productId);

        WishlistEntity entity = wishlistRepository
                .findByUserAndProduct(user, product)
                .orElseThrow(() -> new ResourceNotFoundException("Wishlist not found"));

        if (Boolean.FALSE.equals(entity.getIsActive())) {
            throw new BadRequestException("Already removed from wishlist");
        }

        entity.setIsActive(false);
        wishlistRepository.save(entity);

        return mapToDTO(entity);
    }

    // ================= GET =================
    public List<WishlistResponseDTO> getWishlist(Long userId) {

        User user = getUser(userId);

        return wishlistRepository.findByUserAndIsActiveTrue(user)
                .stream()
                .map(this::mapToDTO)
                .toList();
    }

    // ================= HELPERS =================
    private User getUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private Product getProduct(Long productId) {
        return productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
    }

    // ================= SAFE IMAGE HANDLING =================
    private String extractImage(Product product) {

        if (product.getImages() == null || product.getImages().isEmpty()) {
            return null;
        }

        return product.getImages().stream()
                .filter(img -> Boolean.TRUE.equals(img.getPrimary()))
                .findFirst()
                .map(img -> img.getImageUrl())
                .orElseGet(() -> product.getImages().iterator().next().getImageUrl());
    }

    // ================= DTO =================
    private WishlistResponseDTO mapToDTO(WishlistEntity item) {

        Product product = item.getProduct();

        Double price = 0.0;

        if (product.getVariants() != null && !product.getVariants().isEmpty()) {
            price = product.getVariants().stream()
                    .map(v -> v.getPrice().doubleValue())
                    .min(Double::compareTo)
                    .orElse(0.0);
        }

        WishlistResponseDTO dto = new WishlistResponseDTO(
                item.getId(),
                product.getId(),
                product.getName(),
                price,
                extractImage(product),
                item.getAddedAt(),
                item.getIsActive()
        );

        if (product.getVariants() != null && !product.getVariants().isEmpty()) {
            dto.setDefaultVariantId(product.getVariants().iterator().next().getId());
        }

        return dto;
    }
}

//package com.praisomart.backend.wishlist.service;
//
//import com.praisomart.backend.auth.entity.User;
//import com.praisomart.backend.auth.repository.UserRepository;
//import com.praisomart.backend.exception.ResourceNotFoundException;
//import com.praisomart.backend.products.entity.Product;
//import com.praisomart.backend.products.repository.ProductRepository;
//import com.praisomart.backend.wishlist.dto.WishlistResponseDTO;
//import com.praisomart.backend.wishlist.entity.WishlistEntity;
//import com.praisomart.backend.wishlist.repository.WishlistRepository;
//import org.springframework.stereotype.Service;
//
//import java.time.LocalDateTime;
//import java.util.List;
//
//@Service
//public class WishlistService {
//
//    private final WishlistRepository wishlistRepository;
//    private final ProductRepository productRepository;
//    private final UserRepository userRepository;
//
//    public WishlistService(WishlistRepository wishlistRepository,
//                           ProductRepository productRepository,
//                           UserRepository userRepository) {
//        this.wishlistRepository = wishlistRepository;
//        this.productRepository = productRepository;
//        this.userRepository = userRepository;
//    }
//
//    // ================= ADD =================
//    public WishlistResponseDTO addToWishlist(Long userId, Long productId) {
//
//        User user = getUser(userId);
//        Product product = getProduct(productId);
//
//        WishlistEntity entity = wishlistRepository
//                .findByUserAndProduct(user, product)
//                .orElse(null);
//
//        // CASE 1: already exists
//        if (entity != null) {
//
//            if (Boolean.TRUE.equals(entity.getIsActive())) {
//                throw new RuntimeException("Product already in wishlist");
//            }
//
//            // reactivate
//            entity.setIsActive(true);
//            entity.setAddedAt(LocalDateTime.now());
//
//            wishlistRepository.save(entity);
//
//            return mapToDTO(entity);
//        }
//
//        // CASE 2: new entry
//        WishlistEntity newEntity = new WishlistEntity();
//        newEntity.setUser(user);
//        newEntity.setProduct(product);
//        newEntity.setIsActive(true);
//        newEntity.setAddedAt(LocalDateTime.now());
//
//        wishlistRepository.save(newEntity);
//
//        return mapToDTO(newEntity);
//    }
//
//    // ================= REMOVE =================
//    public WishlistResponseDTO removeFromWishlist(Long userId, Long productId) {
//
//        User user = getUser(userId);
//        Product product = getProduct(productId);
//
//        WishlistEntity entity = wishlistRepository
//                .findByUserAndProduct(user, product)
//                .orElseThrow(() -> new RuntimeException("Wishlist not found"));
//
//        if (Boolean.FALSE.equals(entity.getIsActive())) {
//            throw new RuntimeException("Already removed from wishlist");
//        }
//
//        entity.setIsActive(false);
//        wishlistRepository.save(entity);
//
//        return mapToDTO(entity);
//    }
//
//    // ================= GET =================
//    public List<WishlistResponseDTO> getWishlist(Long userId) {
//
//        User user = getUser(userId);
//
//        return wishlistRepository.findByUserAndIsActiveTrue(user)
//                .stream()
//                .map(this::mapToDTO)
//                .toList();
//    }
//
//    // ================= HELPERS =================
//    private User getUser(Long userId) {
//        return userRepository.findById(userId)
//                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
//    }
//
//    private Product getProduct(Long productId) {
//        return productRepository.findById(productId)
//                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
//    }
//
//    // ================= SAFE DTO =================
//    private WishlistResponseDTO mapToDTO(WishlistEntity item) {
//
//        Product product = item.getProduct();
//
//        if (product == null) {
//            throw new RuntimeException("Product data corrupted");
//        }
//
//        String imageUrl = null;
//
//        if (product.getImages() != null && !product.getImages().isEmpty()) {
//            imageUrl = product.getImages().stream()
//                    .filter(img -> Boolean.TRUE.equals(img.getPrimary()))
//                    .findFirst()
//                    .map(img -> img.getImageUrl())
//                    .orElse(product.getImages().get(0).getImageUrl());
//        }
//
//        Double price = 0.0;
//
//        if (product.getVariants() != null && !product.getVariants().isEmpty()) {
//            price = product.getVariants().stream()
//                    .map(v -> v.getPrice().doubleValue())
//                    .min(Double::compareTo)
//                    .orElse(0.0);
//        }
//
//        return new WishlistResponseDTO(
//                item.getId(),
//                product.getId(),
//                product.getName(),
//                price,
//                imageUrl,
//                item.getAddedAt(),
//                item.getIsActive()
//        );
//    }
//}

//package com.praisomart.backend.wishlist.service;
//
//import com.praisomart.backend.auth.entity.User;
//import com.praisomart.backend.auth.repository.UserRepository;
//import com.praisomart.backend.products.entity.Product;
//import com.praisomart.backend.products.entity.ProductImage;
//import com.praisomart.backend.products.repository.ProductRepository;
//import com.praisomart.backend.wishlist.dto.WishlistResponseDTO;
//import com.praisomart.backend.wishlist.entity.WishlistEntity;
//import com.praisomart.backend.wishlist.repository.WishlistRepository;
//import com.praisomart.backend.exception.*;
//
//import jakarta.transaction.Transactional;
//import org.springframework.stereotype.Service;
//
//import java.util.List;
//import java.util.Optional;
//
//@Service
//public class WishlistService {
//
//    private final WishlistRepository wishlistRepository;
//    private final ProductRepository productRepository;
//    private final UserRepository userRepository;
//
//    public WishlistService(WishlistRepository wishlistRepository,
//                           ProductRepository productRepository,
//                           UserRepository userRepository) {
//        this.wishlistRepository = wishlistRepository;
//        this.productRepository = productRepository;
//        this.userRepository = userRepository;
//    }
//
//    // ================= TOGGLE (MOST IMPORTANT) =================
//    public String toggleWishlist(Long userId, Long productId) {
//
//        User user = userRepository.findById(userId)
//                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
//
//        Product product = productRepository.findById(productId)
//                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
//
//        Optional<WishlistEntity> existing =
//                wishlistRepository.findByUserAndProduct(user, product);
//
//        if (existing.isPresent()) {
//            wishlistRepository.delete(existing.get());
//            return "Removed from wishlist";
//        } else {
//            WishlistEntity entity = new WishlistEntity();
//            entity.setUser(user);
//            entity.setProduct(product);
//            wishlistRepository.save(entity);
//            return "Added to wishlist";
//        }
//    }
//
//    // ================= GET WISHLIST =================
//    public List<WishlistResponseDTO> getWishlist(Long userId) {
//
//        User user = userRepository.findById(userId)
//                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
//
//        return wishlistRepository.findByUser(user)
//                .stream()
//                .map(this::mapToDTO)
//                .toList();
//    }
//
//    // ================= REMOVE (SAFE) =================
//    public void removeFromWishlist(Long userId, Long productId) {
//
//        User user = userRepository.findById(userId)
//                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
//
//        Product product = productRepository.findById(productId)
//                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
//
//        if (!wishlistRepository.existsByUserAndProduct(user, product)) {
//            throw new BadRequestException("Product not in wishlist");
//        }
//
//        wishlistRepository.deleteByUserAndProduct(user, product);
//    }
//
//    // ================= DTO MAPPER =================
//    private WishlistResponseDTO mapToDTO(WishlistEntity item) {
//
//        Product product = item.getProduct();
//
//        String image = product.getImages().stream()
//                .filter(img -> Boolean.TRUE.equals(img.getPrimary()))
//                .findFirst()
//                .map(ProductImage::getImageUrl)
//                .orElse(null);
//
//        Double price = product.getVariants().stream()
//                .map(v -> v.getPrice().doubleValue())
//                .min(Double::compareTo)
//                .orElse(0.0);
//
//        return new WishlistResponseDTO(
//                item.getId(),
//                product.getId(),
//                product.getName(),
//                price,
//                image,
//                item.getAddedAt()
//        );
//    }
//}
//
//
////package com.praisomart.backend.wishlist.service;
////
////import com.praisomart.backend.auth.entity.User;
////import com.praisomart.backend.auth.repository.UserRepository;
////import com.praisomart.backend.products.entity.Product;
////import com.praisomart.backend.products.entity.ProductImage;
////import com.praisomart.backend.products.entity.ProductVariant;
////import com.praisomart.backend.products.repository.ProductRepository;
////import com.praisomart.backend.wishlist.dto.WishlistResponseDTO;
////import com.praisomart.backend.wishlist.entity.WishlistEntity;
////import com.praisomart.backend.wishlist.repository.WishlistRepository;
////import org.springframework.stereotype.Service;
////
////import java.util.List;
////@Service
////public class WishlistService {
////
////    private final WishlistRepository wishlistRepository;
////    private final ProductRepository productRepository;
////    private final UserRepository userRepository;
////
////    public WishlistService(WishlistRepository wishlistRepository,
////                           ProductRepository productRepository,
////                           UserRepository userRepository) {
////        this.wishlistRepository = wishlistRepository;
////        this.productRepository = productRepository;
////        this.userRepository = userRepository;
////    }
////
////    // ✅ ADD
////    public WishlistResponseDTO addToWishlist(Long userId, Long productId) {
////
////        User user = userRepository.findById(userId)
////                .orElseThrow(() -> new RuntimeException("User not found"));
////
////        Product product = productRepository.findById(productId)
////                .orElseThrow(() -> new RuntimeException("Product not found"));
////
////        if (wishlistRepository.findByUserAndProduct(user, product).isPresent()) {
////            throw new RuntimeException("Already in wishlist");
////        }
////
////        WishlistEntity entity = new WishlistEntity();
////        entity.setUser(user);
////        entity.setProduct(product);
////
////        wishlistRepository.save(entity);
////
////        return mapToDTO(entity);
////    }
////
////    // ✅ REMOVE
////    public void removeFromWishlist(Long userId, Long productId) {
////
////        User user = userRepository.findById(userId).orElseThrow();
////        Product product = productRepository.findById(productId).orElseThrow();
////
////        wishlistRepository.deleteByUserAndProduct(user, product);
////    }
////
////    // ✅ GET
////    public List<WishlistResponseDTO> getWishlist(Long userId) {
////
////        User user = userRepository.findById(userId).orElseThrow();
////
////        return wishlistRepository.findByUser(user)
////                .stream()
////                .map(this::mapToDTO)
////                .toList();
////    }
////
////    // ✅ MAPPING (IMPORTANT)
////    private WishlistResponseDTO mapToDTO(WishlistEntity item) {
////
////        Product product = item.getProduct();
////
////        String image = product.getImages().stream()
////                .filter(img -> Boolean.TRUE.equals(img.getPrimary()))
////                .findFirst()
////                .map(ProductImage::getImageUrl)
////                .orElse(null);
////
////        Double price = product.getVariants().stream()
////                .map(v -> v.getPrice().doubleValue())
////                .min(Double::compareTo)
////                .orElse(0.0);
////
////        return new WishlistResponseDTO(
////                item.getId(),
////                product.getId(),
////                product.getName(),
////                price,
////                image,
////                item.getAddedAt()
////        );
////    }
////}
////
