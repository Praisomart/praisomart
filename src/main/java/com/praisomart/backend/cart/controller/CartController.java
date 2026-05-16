package com.praisomart.backend.cart.controller;

import com.praisomart.backend.auth.security.CustomerUserDetails;
import com.praisomart.backend.cart.dto.*;
import com.praisomart.backend.cart.service.CartService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    @GetMapping("/my")
    public ResponseEntity<CartResponseDTO> getCart(
            @AuthenticationPrincipal CustomerUserDetails userDetails) {

        Long userId = userDetails.getUserId();

        CartResponseDTO response = cartService.getCart(userId);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/addTOCart")
    public ResponseEntity<AddCartItemResponseDTO> addItem(
            @AuthenticationPrincipal CustomerUserDetails userDetails,
            @Valid @RequestBody AddCartItemRequestDTO addCartItemDTO){
        AddCartItemResponseDTO response= cartService.addItem(userDetails.getUserId(),addCartItemDTO);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/items/{cartItemId}")
    public ResponseEntity<UpdateCartItemResponseDTO> updateItem(
            @AuthenticationPrincipal CustomerUserDetails userDetails,
            @PathVariable Long cartItemId,
            @Valid @RequestBody UpdateCartItemRequestDTO dto) {

        UpdateCartItemResponseDTO response =
                cartService.updateItem(
                        userDetails.getUserId(),
                        cartItemId,
                        dto.getQuantity()
                );

        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/items/{cartItemId}")
    public ResponseEntity<RemoveCartItemResponseDTO> removeItem(
            @AuthenticationPrincipal CustomerUserDetails userDetails,
            @PathVariable Long cartItemId) {

        RemoveCartItemResponseDTO response =
                cartService.removeItem(userDetails.getUserId(), cartItemId);

        return ResponseEntity.ok(response);
    }

}