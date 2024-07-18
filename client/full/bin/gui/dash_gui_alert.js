function DashGuiAlert (
    message, color=null, header_text="Alert", button_text="Dismiss",
    bound_cb=null, width=null, height=null, include_bg=true, bg_opacity=0.1,
    use_esc_and_enter_shortcuts=true, bg_color=null, scale_mod=1
) {
    /**
     * DashGuiAlert
     * -------------
     *
     * This a replacement for `window.alert`, as an abstraction of DashGuiAlert.
     *
     * (Reference docstring of DashGuiPrompt for further info)
     */

    DashGuiPrompt.call(
        this,
        bound_cb ? function () {
            bound_cb();  // Bypass params
        } : null,
        width || (Dash.Size.ColumnWidth * 2),
        height || (Dash.Size.ColumnWidth * 1.5),
        message,
        header_text,
        button_text,
        "",
        color,
        include_bg,
        bg_opacity,
        use_esc_and_enter_shortcuts,
        bg_color,
        scale_mod
    );

    this.RemoveCancelButton();

    // Delete inapplicable public functions from DashGuiPrompt to keep things clear
    delete this.AddButton;
    delete this.RemoveCancelButton;
    delete this.RemoveContinueButton;

}
