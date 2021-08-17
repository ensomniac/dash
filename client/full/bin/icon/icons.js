function GuiIcons (icon) {
    this.icon = icon;

    this.weight = {
        "solid":   "s",
        "regular": "r",
        "light":   "l"
    };
    
    this.icon_map = {
        "add":                   new GuiIconDefinition(this.icon, "Add", this.weight["regular"], "plus", 1.3, 0.15, 0.15),
        "add_layer":             new GuiIconDefinition(this.icon, "Add Layer", this.weight["regular"], "layer-plus", 1.3, 0.15, 0.15),
        "add_person":            new GuiIconDefinition(this.icon, "Add Person", this.weight["regular"], "user-plus", 1.3, 0.15, 0.15),
        "add_phone":             new GuiIconDefinition(this.icon, "Add Phone", this.weight["regular"], "phone-plus", 1.3, 0.15, 0.15),
        "admin_tools":           new GuiIconDefinition(this.icon, "Admin Tools", this.weight["regular"], "shield-alt"),
        "alert":                 new GuiIconDefinition(this.icon, "Alert", this.weight["solid"], "exclamation", 0.9),
        "alert_triangle":        new GuiIconDefinition(this.icon, "Alert Triangle", this.weight["solid"], "exclamation-triangle", 0.9),
        "arrow_down":            new GuiIconDefinition(this.icon, "Arrow Down", this.weight["regular"], "angle-down", 1.5),
        "arrow_left":            new GuiIconDefinition(this.icon, "Arrow Left", this.weight["regular"], "angle-left", 1.5),
        "arrow_left_alt":        new GuiIconDefinition(this.icon, "Arrow Left Alt", this.weight["regular"], "arrow-left"),
        "arrow_left_long":       new GuiIconDefinition(this.icon, "Arrow Left Long", this.weight["regular"], "long-arrow-left"),
        "arrow_left_circled":    new GuiIconDefinition(this.icon, "Arrow Left Circled", this.weight["light"], "arrow-circle-left"),
        "arrow_left_from_right": new GuiIconDefinition(this.icon, "Arrow Left From Right", this.weight["regular"], "arrow-from-right"),
        "arrow_right":           new GuiIconDefinition(this.icon, "Arrow Right", this.weight["regular"], "angle-right", 1.5),
        "arrow_to_left":         new GuiIconDefinition(this.icon, "Arrow To Left", this.weight["regular"], "arrow-to-left"),
        "arrow_up":              new GuiIconDefinition(this.icon, "Arrow Up", this.weight["regular"], "angle-up", 1.5),
        "at_sign":               new GuiIconDefinition(this.icon, "At Sign", this.weight["regular"], "at"),
        "award":                 new GuiIconDefinition(this.icon, "Award", this.weight["regular"], "award"),
        "browser_window":        new GuiIconDefinition(this.icon, "Windows Logo", this.weight["solid"], "window"),
        "cancel":                new GuiIconDefinition(this.icon, "Cancel", this.weight["regular"], "ban"),
        "cdn_tool_accordion":    new GuiIconDefinition(this.icon, "Accordion Tool", this.weight["regular"], "angle-double-down"),
        "cdn_tool_block_layout": new GuiIconDefinition(this.icon, "Block Layout Tool", this.weight["regular"], "th-large"),
        "cdn_tool_career_path":  new GuiIconDefinition(this.icon, "Career Path Tool", this.weight["regular"], "shoe-prints"),
        "cdn_tool_embed":        new GuiIconDefinition(this.icon, "Embed Tool", this.weight["regular"], "expand-arrows"),
        "cdn_tool_file":         new GuiIconDefinition(this.icon, "File Tool", this.weight["light"], "file"),
        "cdn_tool_gallery":      new GuiIconDefinition(this.icon, "Gallery Tool", this.weight["regular"], "images"),
        "cdn_tool_header":       new GuiIconDefinition(this.icon, "Header Tool", this.weight["regular"], "heading"),
        "cdn_tool_hrule":        new GuiIconDefinition(this.icon, "Hrule Tool", this.weight["regular"], "ruler-horizontal"),
        "cdn_tool_image":        new GuiIconDefinition(this.icon, "Image Tool", this.weight["regular"], "image", 0.9),
        "cdn_tool_layout":       new GuiIconDefinition(this.icon, "Layout Tool", this.weight["regular"], "columns"),
        "cdn_tool_lightbox":     new GuiIconDefinition(this.icon, "Lightbox Tool", this.weight["regular"], "expand-wide"),
        "cdn_tool_link":         new GuiIconDefinition(this.icon, "Link Tool", this.weight["light"], "external-link"),
        "cdn_tool_link_bank":    new GuiIconDefinition(this.icon, "Link Bank Tool", this.weight["regular"], "link"),
        "cdn_tool_subheader":    new GuiIconDefinition(this.icon, "Sub Header Tool", this.weight["light"], "heading"),
        "cdn_tool_text":         new GuiIconDefinition(this.icon, "Text Tool", this.weight["regular"], "font", 0.9),
        "cdn_tool_video":        new GuiIconDefinition(this.icon, "Text Tool", this.weight["regular"], "video", 0.85),
        "cell":                  new GuiIconDefinition(this.icon, "Cell Phone", this.weight["regular"], "mobile-alt"),
        "checked_box":           new GuiIconDefinition(this.icon, "Checked Box", this.weight["regular"], "check-square"),
        "circle_dot":            new GuiIconDefinition(this.icon, "Circle Dot", this.weight["regular"], "dot-circle"),
        "close":                 new GuiIconDefinition(this.icon, "Close", this.weight["regular"], "times", 1.2, 0.25, 0.25),
        "comment":               new GuiIconDefinition(this.icon, "Conversation Bubble", this.weight["solid"], "comment"),
        "comments":              new GuiIconDefinition(this.icon, "Multiple Conversations Bubble", this.weight["solid"], "comments"),
        "complete":              new GuiIconDefinition(this.icon, "Complete", this.weight["regular"], "check"),
        "copy":                  new GuiIconDefinition(this.icon, "Copy", this.weight["regular"], "copy"),
        "delete":                new GuiIconDefinition(this.icon, "Delete", this.weight["regular"], "times", 1.2, 0.25, 0.25),
        "dot":                   new GuiIconDefinition(this.icon, "Dot", this.weight["light"], "circle", 0.66),
        "dots_horizontal":       new GuiIconDefinition(this.icon, "Horizontal Dots", this.weight["solid"], "ellipsis-h"),
        "dots_vertical":         new GuiIconDefinition(this.icon, "Vertical Dots", this.weight["solid"], "ellipsis-v"),
        "download":              new GuiIconDefinition(this.icon, "Download", this.weight["solid"], "download"),
        "edit":                  new GuiIconDefinition(this.icon, "Edit", this.weight["regular"], "pencil"),
        "email":                 new GuiIconDefinition(this.icon, "Email", this.weight["regular"], "at"),
        "envelope":              new GuiIconDefinition(this.icon, "Email Envelope", this.weight["regular"], "envelope"),
        "exec":                  new GuiIconDefinition(this.icon, "Executive", this.weight["light"], "business-time"),
        "expand":                new GuiIconDefinition(this.icon, "Expand View", this.weight["regular"], "expand-alt"),
        "file":                  new GuiIconDefinition(this.icon, "File", this.weight["light"], "file"),
        "flag":                  new GuiIconDefinition(this.icon, "Flag", this.weight["solid"], "flag-alt"),
        "gear":                  new GuiIconDefinition(this.icon, "Gear", this.weight["regular"], "cog"),
        "goal_reply":            new GuiIconDefinition(this.icon, "Goal Reply", this.weight["solid"], "reply"),
        "group":                 new GuiIconDefinition(this.icon, "Group", this.weight["solid"], "layer-group"),
        "hr":                    new GuiIconDefinition(this.icon, "Human Resources", this.weight["light"], "poll-people"),
        "image":                 new GuiIconDefinition(this.icon, "Image", this.weight["regular"], "image", 0.9),
        "invoice":               new GuiIconDefinition(this.icon, "Invoice", this.weight["regular"], "file-invoice-dollar"),
        "link":                  new GuiIconDefinition(this.icon, "Link", this.weight["regular"], "external-link"),
        "list":                  new GuiIconDefinition(this.icon, "List", this.weight["regular"], "bars"),
        "lock":                  new GuiIconDefinition(this.icon, "Lock", this.weight["regular"], "lock"),
        "log_out":               new GuiIconDefinition(this.icon, "Log Out", this.weight["regular"], "sign-out"),
        "minus_circle":          new GuiIconDefinition(this.icon, "Minus Circle", this.weight["regular"], "minus-circle"),
        "minus_square":          new GuiIconDefinition(this.icon, "Minus Square", this.weight["regular"], "minus-square"),
        "more":                  new GuiIconDefinition(this.icon, "More", this.weight["regular"], "window-restore"),
        "navigation":            new GuiIconDefinition(this.icon, "Navigation - Top Level", this.weight["regular"], "tasks"),
        "newsfeed":              new GuiIconDefinition(this.icon, "Newsfeed", this.weight["regular"], "newspaper"),
        "note":                  new GuiIconDefinition(this.icon, "Note", this.weight["regular"], "sticky-note", 1.05),
        "notify":                new GuiIconDefinition(this.icon, "Notify", this.weight["regular"], "bell"),
        "pen":                   new GuiIconDefinition(this.icon, "Pen", this.weight["regular"], "pen"),
        "phone":                 new GuiIconDefinition(this.icon, "Phone", this.weight["regular"], "phone"),
        "play":                  new GuiIconDefinition(this.icon, "Play", this.weight["solid"], "play"),
        "portal_editor":         new GuiIconDefinition(this.icon, "Content Builder", this.weight["regular"], "toolbox"),
        "read":                  new GuiIconDefinition(this.icon, "Read", this.weight["regular"], "book-reader"),
        "refresh":               new GuiIconDefinition(this.icon, "Refresh", this.weight["regular"], "redo"),
        "remove_person":         new GuiIconDefinition(this.icon, "Remove Person", this.weight["regular"], "user-slash", 1.3, 0.55, 0.15),
        "search":                new GuiIconDefinition(this.icon, "Search", this.weight["regular"],"search"),
        "send":                  new GuiIconDefinition(this.icon, "Send", this.weight["solid"],"paper-plane"),
        "share":                 new GuiIconDefinition(this.icon, "Share", this.weight["regular"],"share"),
        "stop":                  new GuiIconDefinition(this.icon, "Stop", this.weight["solid"], "stop"),
        "toggle_off":            new GuiIconDefinition(this.icon, "Toggle", this.weight["regular"], "toggle-off"),
        "toggle_on":             new GuiIconDefinition(this.icon, "Toggle", this.weight["regular"], "toggle-on"),
        "tools":                 new GuiIconDefinition(this.icon, "Tools", this.weight["light"], "tools"),
        "trash":                 new GuiIconDefinition(this.icon, "Trash", this.weight["regular"], "trash"),
        "trash_solid":           new GuiIconDefinition(this.icon, "Trash", this.weight["solid"], "trash"),
        "trash_alt":             new GuiIconDefinition(this.icon, "Trash Alt", this.weight["regular"], "trash-alt"),
        "unchecked_box":         new GuiIconDefinition(this.icon, "Unchecked Box", this.weight["regular"],"square"),
        "undo":                  new GuiIconDefinition(this.icon, "Undo", this.weight["regular"], "undo"),
        "unknown":               new GuiIconDefinition(this.icon, "Unknown Icon", this.weight["light"], "spider-black-widow"),
        "unlink":                new GuiIconDefinition(this.icon, "Unlink", this.weight["regular"], "unlink"),
        "unlock":                new GuiIconDefinition(this.icon, "Unlocked", this.weight["regular"], "unlock"),
        "unlock_alt":            new GuiIconDefinition(this.icon, "Unlocked", this.weight["regular"], "lock-open"),
        "upload":                new GuiIconDefinition(this.icon, "Upload", this.weight["light"], "upload"),
        "user":                  new GuiIconDefinition(this.icon, "Climber", this.weight["regular"], "user"),
        "video":                 new GuiIconDefinition(this.icon, "Video", this.weight["regular"], "video", 0.85),
        "view":                  new GuiIconDefinition(this.icon, "View", this.weight["regular"], "eye"),
        "web":                   new GuiIconDefinition(this.icon, "Windows Logo", this.weight["solid"], "spider-web"),
    };

    // Return icon map for use in portal editor > font icons
    if (this.icon.name === "icon_map") {
        return this.icon_map;
    }
    
    else if (!this.icon_map[this.icon.name]) {
        console.log("Warning: Unable to locate icon by name '" + this.icon.name + "'");
        
        console.trace();
        
        debugger;
        
        return this.icon_map["unknown"];
    }
    
    else {
        return this.icon_map[this.icon.name];
    }
}
