// your_app/public/js/pos_discount_modal.js

frappe.provide('erpnext.POS');

erpnext.POS.DiscountModal = class DiscountModal {
    constructor(cartInstance) {
        console.log('[DiscountModal] Module initialized with Cart Instance:', cartInstance);
        this.cart = cartInstance;
    }

    /**
     * Opens the Discount Dialog
     */
    open() {
        console.log('[DiscountModal] open() method triggered.');

        // Step 1: Verify Cart and Form Availability
        const frm = this.cart.events ? this.cart.events.get_frm() : null;

        if (!frm || !frm.doc) {
            console.error('[DiscountModal] Active form/doc not found!');
            frappe.msgprint(__('POS Invoice form is not active.'));
            return;
        }

        const currentDiscount = frm.doc.additional_discount_percentage || 0;
        console.log('[DiscountModal] Current Discount Percentage:', currentDiscount);

        // Step 2: Create Dialog
        const dialog = new frappe.ui.Dialog({
            title: __('Apply Discount Percentage'),
            fields: [
                {
                    label: __('Discount (%)'),
                    fieldname: 'discount_percentage',
                    fieldtype: 'Percent',
                    default: currentDiscount,
                    reqd: 1,
                    description: __('Enter a value between 0 and 100')
                }
            ],
            primary_action_label: __('Apply Discount'),
            primary_action: (values) => {
                console.log('[DiscountModal] Primary action clicked with values:', values);
                this.applyDiscount(values.discount_percentage, dialog, frm);
            }
        });

        // Step 3: Show Dialog
        dialog.show();
        console.log('[DiscountModal] Modal dialog shown successfully.');
    }

    /**
     * Applies the discount to the POS Invoice Doc
     */
    applyDiscount(discountValue, dialog, frm) {
        const discount = parseFloat(discountValue);

        console.log('[DiscountModal] Validating discount value:', discount);

        // Validation Check
        if (isNaN(discount) || discount < 0 || discount > 100) {
            console.warn('[DiscountModal] Invalid discount entered:', discount);
            frappe.msgprint(__('Please enter a valid percentage between 0 and 100.'));
            return;
        }

        console.log(`[DiscountModal] Updating additional_discount_percentage to ${discount}% on Doc: ${frm.doc.name}`);

        // Update Doc Value
        frappe.model.set_value(frm.doc.doctype, frm.doc.name, 'additional_discount_percentage', discount)
            .then(() => {
                console.log('[DiscountModal] Set value completed. Refreshing totals UI...');

                // Recalculate and update cart totals
                if (typeof this.cart.update_totals_section === 'function') {
                    this.cart.update_totals_section(frm.doc);
                    console.log('[DiscountModal] Cart totals refreshed.');
                }

                dialog.hide();

                // Alert notification
                frappe.show_alert({
                    message: __('Discount of {0}% applied successfully!', [discount]),
                    indicator: 'green'
                }, 5);
            })
            .catch((err) => {
                console.error('[DiscountModal] Error applying discount:', err);
                frappe.msgprint(__('Failed to apply discount. Check console logs for details.'));
            });
    }
};