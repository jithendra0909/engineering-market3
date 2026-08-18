/**
 * EM Gift Studio — Cart Store (Zustand)
 * 
 * Manages the Gift Studio cart state.
 * Persisted to localStorage so cart survives page refreshes.
 * 
 * Each cart item stores structured data for accurate
 * WhatsApp message generation.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

let nextId = Date.now();

export const useGiftCartStore = create(
  persist(
    (set, get) => ({
      items: [],

      /**
       * Add a customized item to the cart.
       * @param {Object} item - structured cart item data
       */
      addItem: (item) => {
        const id = `gift-${nextId++}`;
        const cartItem = {
          ...item,
          id,
          vendorId: 'em-gift-studio',
          category: 'Photo Frames',
          subtotal: item.unitPrice * item.quantity,
        };
        set((state) => ({
          items: [...state.items, cartItem],
        }));
        return id;
      },

      /**
       * Remove an item from the cart by ID.
       */
      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        }));
      },

      /**
       * Update the quantity of a cart item.
       * Minimum quantity is 1.
       */
      updateQuantity: (id, quantity) => {
        if (quantity < 1) return;
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id
              ? { ...item, quantity, subtotal: item.unitPrice * quantity }
              : item
          ),
        }));
      },

      /**
       * Update the customization details of a cart item.
       */
      updateCustomization: (id, customization) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id
              ? { ...item, customization: { ...item.customization, ...customization } }
              : item
          ),
        }));
      },

      /**
       * Clear all items from the cart.
       */
      clearCart: () => {
        set({ items: [] });
      },

      /**
       * Get the total price of all cart items.
       */
      getTotal: () => {
        return get().items.reduce((sum, item) => sum + item.subtotal, 0);
      },

      /**
       * Get the total number of items in the cart.
       */
      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      },
    }),
    {
      name: 'em-gift-cart', // localStorage key
    }
  )
);
