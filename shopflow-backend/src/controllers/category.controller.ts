import { Request, Response, NextFunction } from "express";
import * as categoryService from "../services/category.service";
import { CreateCategoryInput, UpdateCategoryInput } from "../schemas/category.schema";

export const getCategories = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const categories = await categoryService.getCategories();
    res.status(200).json({ data: categories });
  } catch (err) {
    next(err);
  }
};

export const getCategoryBySlug = async (req: Request<{ slug: string }>, res: Response, next: NextFunction): Promise<void> => {
  try {
    const category = await categoryService.getCategoryBySlug(req.params.slug);
    res.status(200).json({ data: category });
  } catch (err) {
    next(err);
  }
};

export const createCategory = async (req: Request<{}, {}, CreateCategoryInput>, res: Response, next: NextFunction): Promise<void> => {
  try {
    const imageFile = req.file as Express.Multer.File | undefined;
    const category = await categoryService.createCategory(req.body, imageFile);
    res.status(201).json({ data: category });
  } catch (err) {
    next(err);
  }
};

export const updateCategory = async (req: Request<{ id: string }, {}, UpdateCategoryInput>, res: Response, next: NextFunction): Promise<void> => {
  try {
    const imageFile = req.file as Express.Multer.File | undefined;
    const category = await categoryService.updateCategory(parseInt(req.params.id), req.body, imageFile);
    res.status(200).json({ data: category });
  } catch (err) {
    next(err);
  }
};

export const deleteCategory = async (req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> => {
  try {
    await categoryService.deleteCategory(parseInt(req.params.id));
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
