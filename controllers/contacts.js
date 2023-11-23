const { Contact } = require("../models/contacts");

const { schemas } = require("../models/contacts");

const httpError = require("../helpers/httpError");

const listContacts = async (req, res, next) => {
  try {
    const result = await Contact.find();
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const getContactById = async (req, res, next) => {
  try {
    const { contactId } = req.params;
    const result = await Contact.findById(contactId);
    if (!result) {
      throw httpError(404, "Not found!");
    }
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const addContact = async (req, res, next) => {
  try {
    const verifiedResult = schemas.addSchema.validate(req.body);
    if (verifiedResult.error !== undefined) {
      throw httpError(400, "missing required name field");
    }
    const reqBody = verifiedResult.value;
    const result = await Contact.create(reqBody);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

const removeContact = async (req, res, next) => {
  try {
    const { contactId } = req.params;
    const result = await Contact.findByIdAndRemove(contactId);
    if (!result) {
      throw httpError(404, "Not found!");
    }
    res.json({ message: "contact deleted" });
  } catch (error) {
    next(error);
  }
};

const updateContact = async (req, res, next) => {
  try {
    const { contactId } = req.params;
    const verifiedResult = schemas.addSchema.validate(req.body);
    if (verifiedResult.error !== undefined) {
      throw httpError(400, "missing fields");
    }
    const reqBody = verifiedResult.value;
    const result = await Contact.findByIdAndUpdate(contactId, reqBody, {new:true});
    if (!result) {
      throw httpError(404, "Not found!");
    }
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const updateStatusContact = async (req, res, next) => {
  try {
    const { contactId } = req.params;
    const verifiedResult = schemas.updateFavoriteSchema.validate(req.body);
    if (verifiedResult.error !== undefined) {
      throw httpError(400, "missing field favorite");
    }
    const reqBody = verifiedResult.value;
    const result = await Contact.findByIdAndUpdate(contactId, reqBody, {
      new: true,
    });
    if (!result) {
      throw httpError(404, "Not found!");
    }
    res.json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
  updateStatusContact,
};
