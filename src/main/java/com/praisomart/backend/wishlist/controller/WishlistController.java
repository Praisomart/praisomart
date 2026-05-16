package com.praisomart.backend.wishlist.controller;

import com.praisomart.backend.auth.security.CustomerUserDetails;
import com.praisomart.backend.wishlist.dto.WishlistResponseDTO;
import com.praisomart.backend.wishlist.service.WishlistService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/wishlist")
public class WishlistController {

    private final WishlistService wishlistService;

    public WishlistController(WishlistService wishlistService) {
        this.wishlistService = wishlistService;
    }

    @PostMapping("/add")
    public ResponseEntity<WishlistResponseDTO> add(
            @AuthenticationPrincipal CustomerUserDetails user,
            @RequestParam Long productId) {

        return ResponseEntity.ok(
                wishlistService.addToWishlist(user.getUserId(), productId)
        );
    }

    @DeleteMapping("/remove")
    public ResponseEntity<WishlistResponseDTO> remove(
            @AuthenticationPrincipal CustomerUserDetails user,
            @RequestParam Long productId) {

        return ResponseEntity.ok(
                wishlistService.removeFromWishlist(user.getUserId(), productId)
        );
    }

    @GetMapping("/my")
    public ResponseEntity<List<WishlistResponseDTO>> myWishlist(
            @AuthenticationPrincipal CustomerUserDetails user) {

        return ResponseEntity.ok(
                wishlistService.getWishlist(user.getUserId())
        );
    }
}


//package com.praisomart.backend.wishlist.controller;
//
//import com.praisomart.backend.auth.security.CustomerUserDetails;
//import com.praisomart.backend.wishlist.dto.WishlistResponseDTO;
//import com.praisomart.backend.wishlist.service.WishlistService;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.http.ResponseEntity;
//import org.springframework.security.core.annotation.AuthenticationPrincipal;
//import org.springframework.web.bind.annotation.*;
//
//import java.util.List;
//
//@RestController
//@RequestMapping("/api/wishlist")
//public class WishlistController {
//
//    private final WishlistService wishlistService;
//
//    public WishlistController(WishlistService wishlistService) {
//        this.wishlistService = wishlistService;
//    }
//
//    // ✅ ADD TO WISHLIST
//    @PostMapping("/add")
//    public ResponseEntity<WishlistResponseDTO> addToWishlist(
//            @AuthenticationPrincipal CustomerUserDetails userDetails,
//            @RequestParam Long productId) {
//
//        return ResponseEntity.ok(
//                wishlistService.addToWishlist(userDetails.getUserId(), productId)
//        );
//    }
//
//    // ✅ REMOVE
//    @DeleteMapping("/remove")
//    public ResponseEntity<String> removeFromWishlist(
//            @AuthenticationPrincipal CustomerUserDetails userDetails,
//            @RequestParam Long productId) {
//
//        wishlistService.removeFromWishlist(userDetails.getUserId(), productId);
//        return ResponseEntity.ok("Removed successfully");
//    }
//
//    // ✅ GET
//    @GetMapping("/my")
//    public ResponseEntity<List<WishlistResponseDTO>> getWishlist(
//            @AuthenticationPrincipal CustomerUserDetails userDetails) {
//
//        return ResponseEntity.ok(
//                wishlistService.getWishlist(userDetails.getUserId())
//        );
//    }
//}