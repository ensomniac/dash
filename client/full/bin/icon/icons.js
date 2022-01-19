function GuiIcons (icon) {
    this.icon = icon;

    this.weight = {
        "solid":   "s",
        "regular": "r",
        "light":   "l",
        "brand":   "b"
    };
    
    this.icon_map = {
        "add":                   new GuiIconDefinition(this.icon, "Add", this.weight["regular"], "plus", 1.3, 0.15, 0.15),
        "add_layer":             new GuiIconDefinition(this.icon, "Add Layer", this.weight["regular"], "layer-plus", 1.3, 0.15, 0.15),
        "add_person":            new GuiIconDefinition(this.icon, "Add Person", this.weight["regular"], "user-plus", 1.3, 0.15, 0.15),
        "add_phone":             new GuiIconDefinition(this.icon, "Add Phone", this.weight["regular"], "phone-plus", 1.3, 0.15, 0.15),
        "admin_tools":           new GuiIconDefinition(this.icon, "Admin Tools", this.weight["regular"], "shield-alt"),
        "alert":                 new GuiIconDefinition(this.icon, "Alert", this.weight["solid"], "exclamation", 0.9),
        "alert_triangle":        new GuiIconDefinition(this.icon, "Alert Triangle", this.weight["solid"], "exclamation-triangle", 0.9),
        "apple_logo":            new GuiIconDefinition(this.icon, "Apple Logo", this.weight["brand"], "apple"),
        "arrow_down":            new GuiIconDefinition(this.icon, "Arrow Down", this.weight["regular"], "angle-down", 1.5),
        "arrow_left":            new GuiIconDefinition(this.icon, "Arrow Left", this.weight["regular"], "angle-left", 1.5),
        "arrow_left_alt":        new GuiIconDefinition(this.icon, "Arrow Left Alt", this.weight["regular"], "arrow-left"),
        "arrow_left_long":       new GuiIconDefinition(this.icon, "Arrow Left Long", this.weight["regular"], "long-arrow-left"),
        "arrow_left_circled":    new GuiIconDefinition(this.icon, "Arrow Left Circled", this.weight["light"], "arrow-circle-left"),
        "arrow_left_from_right": new GuiIconDefinition(this.icon, "Arrow Left From Right", this.weight["regular"], "arrow-from-right"),
        "arrow_right":           new GuiIconDefinition(this.icon, "Arrow Right", this.weight["regular"], "angle-right", 1.5),
        "arrow_right_to_right":  new GuiIconDefinition(this.icon, "Arrow Left From Right", this.weight["regular"], "arrow-to-right"),
        "arrow_to_left":         new GuiIconDefinition(this.icon, "Arrow To Left", this.weight["regular"], "arrow-to-left"),
        "arrow_up":              new GuiIconDefinition(this.icon, "Arrow Up", this.weight["regular"], "angle-up", 1.5),
        "at_sign":               new GuiIconDefinition(this.icon, "At Sign", this.weight["regular"], "at"),
        "award":                 new GuiIconDefinition(this.icon, "Award", this.weight["regular"], "award"),
        "browser_window":        new GuiIconDefinition(this.icon, "Windows Logo", this.weight["solid"], "window"),
        "building":              new GuiIconDefinition(this.icon, "Building", this.weight["regular"], "building"),
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
        "clipboard":             new GuiIconDefinition(this.icon, "Clipboard", this.weight["regular"], "clipboard-list"),
        "clone":                 new GuiIconDefinition(this.icon, "Clone", this.weight["regular"], "clone"),
        "close":                 new GuiIconDefinition(this.icon, "Close", this.weight["regular"], "times", 1.2, 0.25, 0.25),
        "close_thin":            new GuiIconDefinition(this.icon, "Close", this.weight["light"], "times", 1.2, 0.25, 0.25),
        "close_square":          new GuiIconDefinition(this.icon, "Close", this.weight["regular"], "times-square", 1.2, 0.25, 0.25),
        "comment":               new GuiIconDefinition(this.icon, "Conversation Bubble", this.weight["solid"], "comment"),
        "comments":              new GuiIconDefinition(this.icon, "Multiple Conversations Bubble", this.weight["solid"], "comments"),
        "comments_square":       new GuiIconDefinition(this.icon, "Multiple Conversations Boxes", this.weight["regular"], "comments-alt"),
        "complete":              new GuiIconDefinition(this.icon, "Complete", this.weight["regular"], "check"),
        "copy":                  new GuiIconDefinition(this.icon, "Copy", this.weight["regular"], "copy"),
        "cube":                  new GuiIconDefinition(this.icon, "Cube", this.weight["regular"], "cube"),
        "database":              new GuiIconDefinition(this.icon, "Database", this.weight["regular"], "database"),
        "delete":                new GuiIconDefinition(this.icon, "Delete", this.weight["regular"], "times", 1.2, 0.25, 0.25),
        "dot":                   new GuiIconDefinition(this.icon, "Dot", this.weight["light"], "circle", 0.66),
        "dots_horizontal":       new GuiIconDefinition(this.icon, "Horizontal Dots", this.weight["solid"], "ellipsis-h"),
        "dots_vertical":         new GuiIconDefinition(this.icon, "Vertical Dots", this.weight["solid"], "ellipsis-v"),
        "download":              new GuiIconDefinition(this.icon, "Download", this.weight["solid"], "download"),
        "download_file":         new GuiIconDefinition(this.icon, "Download File", this.weight["regular"], "file-download"),
        "edit":                  new GuiIconDefinition(this.icon, "Edit", this.weight["regular"], "pencil"),
        "edit_square":           new GuiIconDefinition(this.icon, "Edit (Square)", this.weight["regular"], "edit"),
        "email":                 new GuiIconDefinition(this.icon, "Email", this.weight["regular"], "at"),
        "empty_folder":          new GuiIconDefinition(this.icon, "Empty Folder", this.weight["regular"], "folder-times"),
        "envelope":              new GuiIconDefinition(this.icon, "Email Envelope", this.weight["regular"], "envelope"),
        "exec":                  new GuiIconDefinition(this.icon, "Executive", this.weight["light"], "business-time"),
        "expand":                new GuiIconDefinition(this.icon, "Expand View", this.weight["regular"], "expand-alt"),
        "expand-square":         new GuiIconDefinition(this.icon, "Expand View", this.weight["regular"], "expand"),
        "expand-square-arrows":  new GuiIconDefinition(this.icon, "Expand View", this.weight["regular"], "expand-arrows-alt"),
        "file":                  new GuiIconDefinition(this.icon, "File", this.weight["regular"], "file"),
        "file_lined":            new GuiIconDefinition(this.icon, "File Lined", this.weight["regular"], "file-alt"),
        "file_image":            new GuiIconDefinition(this.icon, "Image File", this.weight["regular"], "file-image"),
        "file_pdf":              new GuiIconDefinition(this.icon, "PDF File", this.weight["regular"], "file-pdf"),
        "file_csv":              new GuiIconDefinition(this.icon, "CSV File", this.weight["regular"], "file-csv"),
        "file_video":            new GuiIconDefinition(this.icon, "Video File", this.weight["regular"], "file-video"),
        "file_word":             new GuiIconDefinition(this.icon, "Word File", this.weight["regular"], "file-word"),
        "filter":                new GuiIconDefinition(this.icon, "Filter", this.weight["regular"], "filter"),
        "folder_tree":           new GuiIconDefinition(this.icon, "Folder Tree", this.weight["regular"], "folder-tree"),
        "flag":                  new GuiIconDefinition(this.icon, "Flag", this.weight["solid"], "flag-alt"),
        "google_drive":          new GuiIconDefinition(this.icon, "Google Drive", this.weight["brand"], "google-drive"),
        "info":                  new GuiIconDefinition(this.icon, "Info Circle", this.weight["regular"], "info-circle"),
        "gear":                  new GuiIconDefinition(this.icon, "Gear", this.weight["regular"], "cog"),
        "goal_reply":            new GuiIconDefinition(this.icon, "Goal Reply", this.weight["solid"], "reply"),
        "group":                 new GuiIconDefinition(this.icon, "Group", this.weight["solid"], "layer-group"),
        "hr":                    new GuiIconDefinition(this.icon, "Human Resources", this.weight["light"], "poll-people"),
        "image":                 new GuiIconDefinition(this.icon, "Image", this.weight["regular"], "image"),
        "import_file":           new GuiIconDefinition(this.icon, "Import File", this.weight["regular"], "file-import"),
        "invoice":               new GuiIconDefinition(this.icon, "Invoice", this.weight["regular"], "file-invoice-dollar"),
        "invoice_alt":           new GuiIconDefinition(this.icon, "Invoice Alt", this.weight["regular"], "file-invoice"),
        "link":                  new GuiIconDefinition(this.icon, "Link", this.weight["regular"], "external-link"),
        "linked":                new GuiIconDefinition(this.icon, "Linked", this.weight["regular"], "link"),
        "list":                  new GuiIconDefinition(this.icon, "List", this.weight["regular"], "bars"),
        "list_offset":           new GuiIconDefinition(this.icon, "List Offset", this.weight["regular"], "stream"),
        "lock":                  new GuiIconDefinition(this.icon, "Lock", this.weight["regular"], "lock"),
        "log_out":               new GuiIconDefinition(this.icon, "Log Out", this.weight["regular"], "sign-out"),
        "minimize":              new GuiIconDefinition(this.icon, "Minimize", this.weight["regular"], "compress-alt"),
        "minus_circle":          new GuiIconDefinition(this.icon, "Minus Circle", this.weight["regular"], "minus-circle"),
        "minus_square":          new GuiIconDefinition(this.icon, "Minus Square", this.weight["regular"], "minus-square"),
        "more":                  new GuiIconDefinition(this.icon, "More", this.weight["regular"], "window-restore"),
        "navigation":            new GuiIconDefinition(this.icon, "Navigation - Top Level", this.weight["regular"], "tasks"),
        "newsfeed":              new GuiIconDefinition(this.icon, "Newsfeed", this.weight["regular"], "newspaper"),
        "note":                  new GuiIconDefinition(this.icon, "Note", this.weight["regular"], "sticky-note", 1.05),
        "notify":                new GuiIconDefinition(this.icon, "Notify", this.weight["regular"], "bell"),
        "open_folder":           new GuiIconDefinition(this.icon, "Open Folder", this.weight["regular"], "folder-open"),
        "paperclip":             new GuiIconDefinition(this.icon, "Paperclip", this.weight["regular"], "paperclip"),
        "pen":                   new GuiIconDefinition(this.icon, "Pen", this.weight["regular"], "pen"),
        "pencil_ruler":          new GuiIconDefinition(this.icon, "Pencil and Ruler", this.weight["regular"], "pencil-ruler"),
        "phone":                 new GuiIconDefinition(this.icon, "Phone", this.weight["regular"], "phone"),
        "play":                  new GuiIconDefinition(this.icon, "Play", this.weight["solid"], "play"),
        "portal_editor":         new GuiIconDefinition(this.icon, "Content Builder", this.weight["regular"], "toolbox"),
        "read":                  new GuiIconDefinition(this.icon, "Read", this.weight["regular"], "book-reader"),
        "refresh":               new GuiIconDefinition(this.icon, "Refresh", this.weight["regular"], "redo"),
        "remove_person":         new GuiIconDefinition(this.icon, "Remove Person", this.weight["regular"], "user-slash", 1.2, 0.55, 0.15),
        "remove_notification":   new GuiIconDefinition(this.icon, "Remove Notification", this.weight["regular"], "bell-slash", 0.9, 0.55, 0.15),
        "search":                new GuiIconDefinition(this.icon, "Search", this.weight["regular"],"search"),
        "send":                  new GuiIconDefinition(this.icon, "Send", this.weight["solid"],"paper-plane"),
        "server":                new GuiIconDefinition(this.icon, "Server", this.weight["regular"], "server"),
        "share":                 new GuiIconDefinition(this.icon, "Share", this.weight["regular"],"share"),
        "signal_full":           new GuiIconDefinition(this.icon, "Full Signal", this.weight["regular"],"signal-alt"),
        "signal_none":           new GuiIconDefinition(this.icon, "No Signal", this.weight["regular"],"signal-alt-slash"),
        "signal_some":           new GuiIconDefinition(this.icon, "Some Signal", this.weight["regular"],"signal-alt-2"),
        "spinner":               new GuiIconDefinition(this.icon, "Spinner", this.weight["regular"],"spinner"),
        "stop":                  new GuiIconDefinition(this.icon, "Stop", this.weight["solid"], "stop"),
        "sync":                  new GuiIconDefinition(this.icon, "Sync", this.weight["regular"], "sync"),
        "tasks":                 new GuiIconDefinition(this.icon, "Tasks", this.weight["regular"], "tasks"),
        "tasks_alt":             new GuiIconDefinition(this.icon, "Tasks", this.weight["regular"], "tasks-alt"),
        "text":                  new GuiIconDefinition(this.icon, "Text", this.weight["regular"], "text"),
        "toggle_off":            new GuiIconDefinition(this.icon, "Toggle", this.weight["regular"], "toggle-off"),
        "toggle_on":             new GuiIconDefinition(this.icon, "Toggle", this.weight["regular"], "toggle-on"),
        "tools":                 new GuiIconDefinition(this.icon, "Tools", this.weight["regular"], "tools"),
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
        "upload_file":           new GuiIconDefinition(this.icon, "Upload File", this.weight["regular"], "file-upload"),
        "user":                  new GuiIconDefinition(this.icon, "User", this.weight["regular"], "user"),
        "video":                 new GuiIconDefinition(this.icon, "Video", this.weight["regular"], "video", 0.85),
        "view":                  new GuiIconDefinition(this.icon, "View", this.weight["regular"], "eye"),
        "web":                   new GuiIconDefinition(this.icon, "Windows Logo", this.weight["solid"], "spider-web"),
        "windows_logo":          new GuiIconDefinition(this.icon, "Windows Logo", this.weight["brand"], "windows"),
        "worker":                new GuiIconDefinition(this.icon, "Worker", this.weight["regular"], "user-hard-hat"),
    };

    // Return icon map for use in portal editor > font icons
    if (this.icon.name === "icon_map") {
        return this.icon_map;
    }
    
    else if (!this.icon_map[this.icon.name]) {
        console.warn("Warning: Unable to locate icon by name '" + this.icon.name + "'");
        
        console.trace();
        
        debugger;
        
        return this.icon_map["unknown"];
    }
    
    else {
        return this.icon_map[this.icon.name];
    }
}
