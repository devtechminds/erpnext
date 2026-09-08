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
def validate_pin(pin):
    """API endpoint to check if a PIN exists in the User Authentication table."""
    if not pin:
        frappe.throw(_("Please provide a PIN to validate."))
        
    cleaned_pin = str(pin).strip()
    
    # Check if any record matches the given PIN
    pin_exists = frappe.db.exists("User Authentication", {"pin": cleaned_pin})
    
    return bool(pin_exists)