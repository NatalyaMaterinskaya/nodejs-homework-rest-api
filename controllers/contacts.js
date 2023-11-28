const { Contact } = require("../models/contacts");

const { schemas } = require("../models/contacts");

const httpError = require("../helpers/httpError");

const listContacts = async (req, res, next) => {
  try {
    const { _id: owner } = req.user;
    const result = await Contact.find({ owner });
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const getContactById = async (req, res, next) => {
  try {
    const { _id: owner } = req.user;
    const { contactId } = req.params;
    const result = await Contact.findById(contactId);
    if (!result) {
      throw httpError(404, "Not found!");
    }
    if (result.owner.toString() !== owner.toString()) {
      throw httpError(404, "Not found!!!");
    }
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const addContact = async (req, res, next) => {
  try {
    const { _id: owner } = req.user;
    const verifiedResult = schemas.addSchema.validate(req.body);
    if (verifiedResult.error !== undefined) {
      throw httpError(400, "missing required name field");
    }
    const reqBody = verifiedResult.value;
    const result = await Contact.create({ ...reqBody, owner });
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

const removeContact = async (req, res, next) => {
  try {
    const { _id: owner } = req.user;
    const { contactId } = req.params;
    const contact = await Contact.findById(contactId);
    if (!contact || contact.owner.toString() !== owner.toString()) {
      throw httpError(404, "Not found!!!");
    }
    await Contact.findByIdAndDelete(contactId);
    res.json({ message: "contact deleted" });
  } catch (error) {
    next(error);
  }
};

const updateContact = async (req, res, next) => {
  try {
    const { _id: owner } = req.user;
    const { contactId } = req.params;
    const contact = await Contact.findById(contactId);
    if (!contact || contact.owner.toString() !== owner.toString()) {
      throw httpError(404, "Not found!!!");
    }
    const verifiedResult = schemas.addSchema.validate(req.body);
    if (verifiedResult.error !== undefined) {
      throw httpError(400, "missing fields");
    }
    const reqBody = verifiedResult.value;
    const result = await Contact.findByIdAndUpdate(contactId, reqBody, {
      new: true,
    });
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const updateStatusContact = async (req, res, next) => {
  try {
    const { _id: owner } = req.user;
    const { contactId } = req.params;
    const contact = await Contact.findById(contactId);
    if (!contact || contact.owner.toString() !== owner.toString()) {
      throw httpError(404, "Not found!!!");
    }
    const verifiedResult = schemas.updateFavoriteSchema.validate(req.body);
    if (verifiedResult.error !== undefined) {
      throw httpError(400, "missing field favorite");
    }
    const reqBody = verifiedResult.value;
    const result = await Contact.findByIdAndUpdate(contactId, reqBody, {
      new: true,
    });
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
