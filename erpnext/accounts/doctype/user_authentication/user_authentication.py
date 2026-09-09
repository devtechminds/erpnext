# Copyright (c) 2026, Frappe Technologies Pvt. Ltd. and contributors
# For license information, please see license.txt

import frappe
from frappe import _
from frappe.model.document import Document


class UserAuthentication(Document):
	# begin: auto-generated types
	# This code is auto-generated. Do not modify anything in this block.

	from typing import TYPE_CHECKING

	if TYPE_CHECKING:
		from frappe.types import DF

		pin: DF.Int
		user: DF.Link
	# end: auto-generated types

	def validate(self):
		self.validate_user_uniqueness()
		self.validate_pin()

	def validate_user_uniqueness(self):
		"""Ensures a user can only have one User Authentication record."""
		if self.user:
			existing_user = frappe.db.exists(
				"User Authentication",
				{"user": self.user, "name": ["!=", self.name]}
			)
			if existing_user:
				frappe.throw(
					_("User {0} already has a PIN configured in record {1}.").format(
						frappe.bold(self.user), frappe.bold(existing_user)
					)
				)

	def validate_pin(self):
		"""Validates PIN length and uniqueness across all records."""
		if self.pin:
			clean_pin = str(self.pin).replace("-", "").strip()

			# 1. Length Check (Max 4 digits)
			if len(clean_pin) > 4:
				frappe.throw(_("PIN must not exceed 4 digits (max 9999)."))

			# 2. Unique PIN Check
			existing_pin = frappe.db.exists(
				"User Authentication",
				{"pin": clean_pin, "name": ["!=", self.name]}
			)
			if existing_pin:
				frappe.throw(
					_("The PIN '{0}' is already assigned to record {1}.").format(
						clean_pin, existing_pin
					)
				)


@frappe.whitelist()
def validate_pin(pin):
	"""API endpoint to validate PIN and return the User Authentication record ID."""
	if not pin:
		frappe.throw(_("Please provide a PIN to validate."))

	cleaned_pin = str(pin).strip()

	# Fetch the 'name' (ID) of the User Authentication record matching the PIN
	pin_id = frappe.db.get_value("User Authentication", {"pin": cleaned_pin}, "name")

	if not pin_id:
		frappe.throw(_("Invalid PIN provided."))

	return pin_id