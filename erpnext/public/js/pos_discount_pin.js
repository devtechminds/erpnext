// your_custom_app/public/js/pos_custom_discount.js

$(document).ready(function() {
    localStorage.setItem('user_pin_verified', 0);
    // Delegates click event dynamically for any .add-discount-wrapper on the screen
    $(document).on('click', '.add-discount-wrapper', function (e) {
        const is_verified = localStorage.getItem('user_pin_verified');
        if (is_verified === '0' || is_verified === null) {
            // Stop default action and open PIN dialog
            e.preventDefault();
            e.stopPropagation();
            
            show_pin_dialog();
        } else {
            // PIN is already verified (1), allow normal discount action
            console.log("Discount opened, user verified.");
        }   
    });
    
});
function check_and_prompt_pin() {
    // 1. Get flag state from localStorage
    const is_verified = localStorage.getItem('user_pin_verified');

    // 2. Open dialog if unverified (0 or null)
    if (is_verified === '0' || is_verified === null) {
        show_pin_dialog();
    }
}

function show_pin_dialog() {
    const dialog = new frappe.ui.Dialog({
        title: __('Enter Security PIN'),
        fields: [
            {
                label: __('PIN'),
                fieldname: 'pin',
                fieldtype: 'Password',
                reqd: 1,
                description: __('Please enter your 4-digit PIN to continue')
            }
        ],
        primary_action_label: __('Verify'),
        primary_action(values) {
            frappe.call({
                method: "erpnext.accounts.doctype.user_authentication.user_authentication.validate_pin",
                args: {
                    user: frappe.session.user,
                    pin: values.pin // pass entered pin from dialog field
                },
                freeze: true,
                freeze_message: __('Verifying PIN...'),
                callback: function (r) {
                    if (r.message === true) {
                        frappe.show_alert({ message: __('PIN Verified'), indicator: 'green' });
                        localStorage.setItem('user_pin_verified', '1');
                        dialog.hide();

                        // Re-trigger click so the discount control opens automatically
                        $('.add-discount-wrapper').trigger('click');
                    } else {
                        frappe.msgprint(__('Invalid PIN. Please try again.'));
                    }
                }
            });
        }
    });

    // Make dialog un-closable until valid PIN is entered (optional)
    dialog.no_cancel();
    dialog.show();
}

