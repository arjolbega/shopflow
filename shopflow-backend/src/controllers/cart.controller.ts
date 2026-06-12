import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../types";
import * as cartService from "../services/cart.service";
import { AddToCartInput, UpdateCartInput } from "../schemas/cart.schema";

export const getCart = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const cart = await cartService.getCart(req.user!.userId);
    res.status(200).json({ data: cart });
  } catch (err) {
    next(err);
  }
};

export const addToCart = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const cart = await cartService.addToCart(req.user!.userId, req.body as AddToCartInput);
    res.status(200).json({ data: cart });
  } catch (err) {
    next(err);
  }
};

export const updateCartItem = async (req: AuthenticatedRequest & { params: { productId: string } }, res: Response, next: NextFunction): Promise<void> => {
  try {
    const cart = await cartService.updateCartItem(req.user!.userId, parseInt(req.params.productId), req.body as UpdateCartInput);
    res.status(200).json({ data: cart });
  } catch (err) {
    next(err);
  }
};

export const removeFromCart = async (req: AuthenticatedRequest & { params: { productId: string } }, res: Response, next: NextFunction): Promise<void> => {
  try {
    const cart = await cartService.removeFromCart(req.user!.userId, parseInt(req.params.productId));
    res.status(200).json({ data: cart });
  } catch (err) {
    next(err);
  }
};

export const clearCart = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    await cartService.clearCart(req.user!.userId);
    res.status(200).json({ data: { message: "Cart cleared" } });
  } catch (err) {
    next(err);
  }
};
