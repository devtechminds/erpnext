import frappe
from frappe.custom.doctype.custom_field.custom_field import create_custom_fields

def execute():
    """Adds users_pin_id field to both POS Invoice and Sales Invoice."""
    custom_fields = {
        "POS Invoice": [
            {
                "fieldname": "users_pin_id",
                "label": "Users PIN ID",
                "fieldtype": "Link",
                "options": "User Authentication",
                "insert_after": "pos_profile",
                "read_only": 0,
                "hidden": 0
            }
        ],
        "Sales Invoice": [
            {
                "fieldname": "users_pin_id",
                "label": "Users PIN ID",
                "fieldtype": "Link",
                "options": "User Authentication",
                "insert_after": "pos_profile",
                "read_only": 0,
                "hidden": 0
            }
        ]
    }
    create_custom_fields(custom_fields, ignore_validate=True)
    frappe.db.commit()