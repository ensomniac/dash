function DashGuiTextArea (color=null, placeholder_text="", binder=null, on_change_cb=null, delay_change_cb=false) {
    // For now, this file is no more than a wrapper when desiring a textarea element outside of mobile.
    // We can add to or modify this is as needed, or eventually just write this out as its own class.

    // This actually isn't exclusive to mobile for any reason. It's just the only textarea
    // element that exists in Dash and was created with the 'Mobile' name because I thought
    // it was going to be specific to mobile, but that ended up not being the case.
    DashMobileTextBox.call(this, color, placeholder_text, binder, on_change_cb, delay_change_cb);

    this.textarea.css({
        "line-height": Dash.Size.RowHeight + "px"
    });
}
