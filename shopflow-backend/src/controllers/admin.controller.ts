import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../types";
import * as adminService from "../services/admin.service";
import { AdminOrderQuery, AdminUserQuery, AdminProductQuery, UpdateOrderStatusInput, UpdateUserRoleInput } from "../schemas/admin.schema";

export const getAnalytics = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const analytics = await adminService.getAnalytics();
    res.status(200).json({ data: analytics });
  } catch (err) {
    next(err);
  }
};

// ─── Orders ───────────────────────────────────────────

export const getAdminOrders = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const query = (req as any).validatedQuery as AdminOrderQuery;
    const result = await adminService.getAdminOrders(query);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export const getAdminOrderById = async (req: AuthenticatedRequest & { params: { id: string } }, res: Response, next: NextFunction): Promise<void> => {
  try {
    const order = await adminService.getAdminOrderById(parseInt(req.params.id));
    res.status(200).json({ data: order });
  } catch (err) {
    next(err);
  }
};

export const updateOrderStatus = async (req: AuthenticatedRequest & { params: { id: string } }, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await adminService.updateOrderStatus(parseInt(req.params.id), req.body as UpdateOrderStatusInput);
    res.status(200).json({ data: result });
  } catch (err) {
    next(err);
  }
};

// ─── Users ────────────────────────────────────────────

export const getAdminUsers = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const query = (req as any).validatedQuery as AdminUserQuery;
    const result = await adminService.getAdminUsers(query);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export const getAdminUserById = async (req: AuthenticatedRequest & { params: { id: string } }, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await adminService.getAdminUserById(parseInt(req.params.id));
    res.status(200).json({ data: user });
  } catch (err) {
    next(err);
  }
};

export const updateUserRole = async (req: AuthenticatedRequest & { params: { id: string } }, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await adminService.updateUserRole(parseInt(req.params.id), req.body as UpdateUserRoleInput, req.user!.userId);
    res.status(200).json({ data: result });
  } catch (err) {
    next(err);
  }
};

// ─── Products ─────────────────────────────────────────

export const getAdminProducts = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const query = (req as any).validatedQuery as AdminProductQuery;
    const result = await adminService.getAdminProducts(query);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export const toggleProductActive = async (req: AuthenticatedRequest & { params: { id: string } }, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await adminService.toggleProductActive(parseInt(req.params.id));
    res.status(200).json({ data: result });
  } catch (err) {
    next(err);
  }
};
