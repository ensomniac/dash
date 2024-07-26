function DashGuiConfirm (
    message, bound_continue_cb, bound_cancel_cb=null, color=null,
    header_text="Alert", continue_text="Continue", cancel_text="Cancel",
    width=null, height=null, include_bg=true, bg_opacity=0.1,
    use_esc_and_enter_shortcuts=true, bg_color=null, scale_mod=1
) {
    /**
     * DashGuiConfirm
     * -------------
     *
     * This is a (basic) replacement for `window.confirm`, as an abstraction of DashGuiPrompt.
     * Use DashGuiPrompt for a more comprehensive version of this.
     *
     * (Reference docstring of DashGuiPrompt for further info)
     */

    DashGuiPrompt.call(
        this,
        (selected_index) => {
            if (selected_index === 0 && bound_cancel_cb) {  // Cancel
                bound_cancel_cb();
            }

            else if (selected_index === 1 && bound_continue_cb) {  // Continue
                bound_continue_cb();
            }
        },
        width || (Dash.Size.ColumnWidth * 2),
        height || (Dash.Size.ColumnWidth * 1.5),
        message,
        header_text,
        continue_text,
        cancel_text,
        color,
        include_bg,
        bg_opacity,
        use_esc_and_enter_shortcuts,
        bg_color,
        scale_mod
    );

    // Delete inapplicable public functions from DashGuiPrompt to keep things clear
    delete this.AddButton;
    delete this.RemoveCancelButton;
    delete this.RemoveContinueButton;

    // Simplify usage by showing the prompt immediately on call, just like when calling window.confirm
    requestAnimationFrame(() => {
        this.Show();
    });
}
