import ShippingMethod from "../models/ShippingMethod.model.js";
import { createShippingMethodSchema, updateShippingMethodSchema } from "../validations/shippingMethod.validation.js";
import successHandler from "../middlewares/successHandler.js";
import createdHandler from "../middlewares/createdHandler.js";
import { SHIPPING_METHOD_MESSAGES } from "../constants/message.js";

export const getShippingMethods = async (req, res, next) => {
  try {
    const shippingMethods = await ShippingMethod.find({
      status: "active",
      deleted: false,
    });
    console.log(shippingMethods);
    return res.json(successHandler(shippingMethods, SHIPPING_METHOD_MESSAGES.GET_LIST_SUCCESS));
  } catch (error) {
    next(error);
  }
};

export const getShippingMethodById = async (req, res, next) => {
  try {
    const shippingMethod = await ShippingMethod.findOne({
      _id: req.params.id,
      status: "active",
      deleted: false,
    });

    if (!shippingMethod) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        message: SHIPPING_METHOD_MESSAGES.NOT_FOUND,
      });
    }

    return res.json(successHandler(shippingMethod, SHIPPING_METHOD_MESSAGES.GET_BY_ID_SUCCESS));
  } catch (error) {
    next(error);
  }
};

export const createShippingMethod = async (req, res, next) => {
  try {
    const validatedData = createShippingMethodSchema.parse(req.body);
    const shippingMethod = await ShippingMethod.create(validatedData);
    return res.status(201).json(createdHandler(shippingMethod, SHIPPING_METHOD_MESSAGES.CREATE_SUCCESS));
  } catch (error) {
    if (error.name === "ZodError") {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: error.errors[0].message,
      });
    }
    next(error);
  }
};

export const updateShippingMethod = async (req, res, next) => {
  try {
    const validatedData = updateShippingMethodSchema.parse(req.body);
    const shippingMethod = await ShippingMethod.findOneAndUpdate(
      { _id: req.params.id, deleted: false },
      validatedData,
      { new: true }
    );

    if (!shippingMethod) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        message: SHIPPING_METHOD_MESSAGES.NOT_FOUND,
      });
    }

    return res.json(successHandler(shippingMethod, SHIPPING_METHOD_MESSAGES.UPDATE_SUCCESS));
  } catch (error) {
    if (error.name === "ZodError") {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: error.errors[0].message,
      });
    }
    next(error);
  }
};

export const deleteShippingMethod = async (req, res, next) => {
  try {
    const shippingMethod = await ShippingMethod.findOneAndUpdate(
      { _id: req.params.id, deleted: false },
      { status: "inactive", deleted: true },
      { new: true }
    );

    if (!shippingMethod) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        message: SHIPPING_METHOD_MESSAGES.NOT_FOUND,
      });
    }

    return res.json(successHandler(null, SHIPPING_METHOD_MESSAGES.DELETE_SUCCESS));
  } catch (error) {
    next(error);
  }
}; 