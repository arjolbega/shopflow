import { Request, Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../types";
import * as orderService from "../services/order.service";
import { CreateOrderInput, OrderQuery } from "../schemas/order.schema";

export const createOrder = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await orderService.createOrder(req.user!.userId, req.body as CreateOrderInput);
    res.status(201).json({ data: result });
  } catch (err) {
    next(err);
  }
};

export const stripeWebhook = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const signature = req.headers["stripe-signature"] as string;
    const result = await orderService.handleStripeWebhook(
      req.body as Buffer, // raw body — set in app.ts before express.json()
      signature
    );
    console.log("---stripe---");
    console.log("signature", signature);
    console.log("result", result);
    console.log("\n");

    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export const getUserOrders = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const query = (req as any).validatedQuery as OrderQuery;
    const result = await orderService.getUserOrders(req.user!.userId, query);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export const getOrderById = async (req: AuthenticatedRequest & { params: { id: string } }, res: Response, next: NextFunction): Promise<void> => {
  try {
    const order = await orderService.getOrderById(
      parseInt(req.params.id),
      req.user!.userId // ← back to req.user, not req.body.user
    );
    res.status(200).json({ data: order });
  } catch (err) {
    next(err);
  }
};

export const cancelOrder = async (req: AuthenticatedRequest & { params: { id: string } }, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await orderService.cancelOrder(
      parseInt(req.params.id),
      req.user!.userId // ← back to req.user
    );
    res.status(200).json({ data: result });
  } catch (err) {
    next(err);
  }
};

export const getPaymentIntent = async (req: AuthenticatedRequest & { params: { id: string } }, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await orderService.getPaymentIntent(parseInt(req.params.id), req.user!.userId);
    res.status(200).json({ data: result });
  } catch (err) {
    next(err);
  }
};
