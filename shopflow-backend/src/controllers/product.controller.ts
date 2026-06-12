import { Request, Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../types";
import * as productService from "../services/product.service";
import { CreateProductInput, UpdateProductInput, ProductQuery } from "../schemas/product.schema";

export const getProducts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const query = (req as any).validatedQuery as ProductQuery;
    const result = await productService.getProducts(query);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export const getProductBySlug = async (req: Request<{ slug: string }>, res: Response, next: NextFunction): Promise<void> => {
  try {
    const product = await productService.getProductBySlug(req.params.slug);
    res.status(200).json({ data: product });
  } catch (err) {
    next(err);
  }
};

export const createProduct = async (req: Request<{}, {}, CreateProductInput>, res: Response, next: NextFunction): Promise<void> => {
  try {
    const product = await productService.createProduct(req.body);
    res.status(201).json({ data: product });
  } catch (err) {
    next(err);
  }
};

export const updateProduct = async (req: Request<{ id: string }, {}, UpdateProductInput>, res: Response, next: NextFunction): Promise<void> => {
  try {
    const product = await productService.updateProduct(parseInt(req.params.id), req.body);
    res.status(200).json({ data: product });
  } catch (err) {
    next(err);
  }
};

export const deleteProduct = async (req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> => {
  try {
    await productService.deleteProduct(parseInt(req.params.id));
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

export const uploadProductImages = async (req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> => {
  try {
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      res.status(400).json({
        error: { status: 400, code: "NO_FILES", message: "No files uploaded" }
      });
      return;
    }

    const images = await productService.uploadProductImages(parseInt(req.params.id), files);
    res.status(201).json({ data: images });
  } catch (err) {
    next(err);
  }
};

export const deleteProductImage = async (req: Request<{ id: string; imageId: string }>, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await productService.deleteProductImage(parseInt(req.params.id), parseInt(req.params.imageId));
    res.status(200).json({ data: result });
  } catch (err) {
    next(err);
  }
};
