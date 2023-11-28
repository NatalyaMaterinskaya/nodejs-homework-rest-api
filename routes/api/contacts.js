const express = require("express");

const controllers = require("../../controllers/contacts");

const isValidId = require("../../middlewares/isValidId");
const authenticate = require("../../middlewares/authenticate.js");

const router = express.Router();

const {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
  updateStatusContact,
} = controllers;

router.get("/", authenticate, listContacts);

router.get("/:contactId", authenticate, isValidId, getContactById);

router.post("/", authenticate, addContact);

router.delete("/:contactId", authenticate, isValidId, removeContact);

router.put("/:contactId", authenticate, isValidId, updateContact);

router.patch(
  "/:contactId/favorite",
  authenticate,
  isValidId,
  updateStatusContact
);

module.exports = router;
