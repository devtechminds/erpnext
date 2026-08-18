# Copyright (c) 2026, Frappe Technologies Pvt. Ltd. and contributors
# For license information, please see license.txt

import frappe
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

	pass

@frappe.whitelist()
def validate_pin(user, pin):
    """API endpoint to check if PIN is valid."""
    stored_pin = frappe.db.get_value("User Authentication", {"user": user}, "pin")
    if not stored_pin:
        frappe.throw(_("No User Authentication record found for this user."))
    return str(stored_pin).strip() == str(pin).strip()