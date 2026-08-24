// your_custom_app/public/js/pos_custom_discount.js

$(document).ready(function() {
    localStorage.setItem('user_pin_verified', 0);
    // Delegates click event dynamically for any .add-discount-wrapper on the screen
    $(document).on('click', '.add-discount-wrapper', function (e) {
        const is_verified = localStorage.getItem('user_pin_verified');
        //alert(is_verified);
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

// Keep track of active dialog instance globally/module-level
let pin_dialog = null;

function show_pin_dialog() {
    // 1. Force remove any leftover Frappe modals and black backdrops from DOM
    $('.modal-backdrop').remove();
    $('.modal').modal('hide');

    if (pin_dialog) {
        try { pin_dialog.hide(); } catch(e) {}
        if (pin_dialog.$wrapper) pin_dialog.$wrapper.remove();
        pin_dialog = null;
    }

    pin_dialog = new frappe.ui.Dialog({
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
                    pin: values.pin
                },
                freeze: true,
                freeze_message: __('Verifying PIN...'),
                callback: function (r) {
                    if (r.message === true) {
                        frappe.show_alert({ message: __('PIN Verified'), indicator: 'green' });
                        localStorage.setItem('user_pin_verified', '1');

                        // 2. Hide dialog & cleanup DOM manually
                        pin_dialog.hide();
                        if (pin_dialog.$wrapper) {
                            pin_dialog.$wrapper.remove();
                        }
                        $('.modal-backdrop').remove(); // Clear lingering dark overlay
                        $('body').removeClass('modal-open'); // Restore scrolling

                        // 3. Open discount control directly instead of triggering a click (prevents re-opening PIN dialog)
                        if (typeof show_discount_control === 'function') {
                            show_discount_control();
                        } else if (me && typeof me.show_discount_control === 'function') {
                            me.show_discount_control();
                        } else {
                            // Fallback: Ensure flag is set before clicking wrapper
                            $('.add-discount-wrapper').off('click.pin_check'); 
                            $('.add-discount-wrapper').trigger('click');
                        }
                    } else {
                        frappe.msgprint(__('Invalid PIN. Please try again.'));
                        pin_dialog.set_value('pin', '');
                    }
                }
            });
        }
    });

    pin_dialog.no_cancel();
    pin_dialog.show();
}