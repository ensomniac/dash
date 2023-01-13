function DashGuiIcons (icon) {
    this.icon = icon;

    this.weight = {
        "solid":   "s",
        "regular": "r",
        "light":   "l",
        "brand":   "b"
    };
    
    this.icon_map = {
        "abacus":                new DashGuiIconDefinition(this.icon, "Abacus", this.weight["regular"], "abacus"),
        "accessible":            new DashGuiIconDefinition(this.icon, "Accessible", this.weight["regular"], "universal-access"),
        "add":                   new DashGuiIconDefinition(this.icon, "Add", this.weight["regular"], "plus"),
        "add_circle":            new DashGuiIconDefinition(this.icon, "Add (Circle)", this.weight["regular"], "plus-circle"),
        "add_layer":             new DashGuiIconDefinition(this.icon, "Add Layer", this.weight["regular"], "layer-plus"),
        "add_light":             new DashGuiIconDefinition(this.icon, "Add (Light)", this.weight["light"], "plus"),
        "add_person":            new DashGuiIconDefinition(this.icon, "Add Person", this.weight["regular"], "user-plus"),
        "add_phone":             new DashGuiIconDefinition(this.icon, "Add Phone", this.weight["regular"], "phone-plus"),
        "add_square":            new DashGuiIconDefinition(this.icon, "Add (Square)", this.weight["regular"], "plus-square"),
        "admin_tools":           new DashGuiIconDefinition(this.icon, "Admin Tools", this.weight["regular"], "shield-alt"),
        "alert":                 new DashGuiIconDefinition(this.icon, "Alert", this.weight["solid"], "exclamation"),
        "alert_triangle":        new DashGuiIconDefinition(this.icon, "Alert Triangle", this.weight["solid"], "exclamation-triangle"),
        "analytics":             new DashGuiIconDefinition(this.icon, "Analytics", this.weight["regular"], "analytics"),
        "apple_logo":            new DashGuiIconDefinition(this.icon, "Apple Logo", this.weight["brand"], "apple"),
        "archive":               new DashGuiIconDefinition(this.icon, "Archive", this.weight["regular"], "archive"),
        "archive_light":         new DashGuiIconDefinition(this.icon, "Archive (Light)", this.weight["light"], "archive"),
        "arrow_down":            new DashGuiIconDefinition(this.icon, "Arrow Down", this.weight["regular"], "angle-down"),
        "arrow_left":            new DashGuiIconDefinition(this.icon, "Arrow Left", this.weight["regular"], "angle-left"),
        "arrow_left_alt":        new DashGuiIconDefinition(this.icon, "Arrow Left Alt", this.weight["regular"], "arrow-left"),
        "arrow_left_long":       new DashGuiIconDefinition(this.icon, "Arrow Left Long", this.weight["regular"], "long-arrow-left"),
        "arrow_left_circled":    new DashGuiIconDefinition(this.icon, "Arrow Left Circled", this.weight["light"], "arrow-circle-left"),
        "arrow_left_from_right": new DashGuiIconDefinition(this.icon, "Arrow Left From Right", this.weight["regular"], "arrow-from-right"),
        "arrow_right":           new DashGuiIconDefinition(this.icon, "Arrow Right", this.weight["regular"], "angle-right"),
        "arrow_right_to_right":  new DashGuiIconDefinition(this.icon, "Arrow Left From Right", this.weight["regular"], "arrow-to-right"),
        "arrow_to_left":         new DashGuiIconDefinition(this.icon, "Arrow To Left", this.weight["regular"], "arrow-to-left"),
        "arrow_up":              new DashGuiIconDefinition(this.icon, "Arrow Up", this.weight["regular"], "angle-up"),
        "asterisk":              new DashGuiIconDefinition(this.icon, "Asterisk", this.weight["solid"], "asterisk"),
        "at_sign":               new DashGuiIconDefinition(this.icon, "At Sign", this.weight["regular"], "at"),
        "award":                 new DashGuiIconDefinition(this.icon, "Award", this.weight["regular"], "award"),
        "aws_logo":              new DashGuiIconDefinition(this.icon, "AWS Logo", this.weight["brand"], "aws"),
        "barcode":               new DashGuiIconDefinition(this.icon, "Barcode", this.weight["light"], "barcode-alt"),
        "baseball":              new DashGuiIconDefinition(this.icon, "Baseball", this.weight["regular"], "baseball-ball"),
        "baseball_bat":          new DashGuiIconDefinition(this.icon, "Baseball Bat", this.weight["regular"], "baseball"),
        "basketball":            new DashGuiIconDefinition(this.icon, "Basketball", this.weight["regular"], "basketball-ball"),
        "battle_axe":            new DashGuiIconDefinition(this.icon, "Battle Axe", this.weight["regular"], "axe-battle"),
        "binoculars":            new DashGuiIconDefinition(this.icon, "Binoculars", this.weight["regular"], "binoculars"),
        "book_open":             new DashGuiIconDefinition(this.icon, "Book (Open)", this.weight["regular"], "book-open"),
        "box":                   new DashGuiIconDefinition(this.icon, "Box", this.weight["regular"], "box"),
        "box_open":              new DashGuiIconDefinition(this.icon, "Box (Open)", this.weight["regular"], "box-open"),
        "browser_window":        new DashGuiIconDefinition(this.icon, "Browser Window", this.weight["solid"], "window"),
        "building":              new DashGuiIconDefinition(this.icon, "Building", this.weight["regular"], "building"),
        "business_time":         new DashGuiIconDefinition(this.icon, "Business Time", this.weight["regular"], "business-time"),
        "calendar":              new DashGuiIconDefinition(this.icon, "Calendar", this.weight["regular"], "calendar-alt"),
        "camera":                new DashGuiIconDefinition(this.icon, "Camera", this.weight["regular"], "camera"),
        "cancel":                new DashGuiIconDefinition(this.icon, "Cancel", this.weight["regular"], "ban"),
        "cancel_thick":          new DashGuiIconDefinition(this.icon, "Cancel (Thick)", this.weight["solid"], "ban"),
        "car":                   new DashGuiIconDefinition(this.icon, "Car", this.weight["regular"], "car"),
        "caret_down":            new DashGuiIconDefinition(this.icon, "Caret Down", this.weight["solid"], "caret-down"),
        "caret_up":              new DashGuiIconDefinition(this.icon, "Caret Up", this.weight["solid"], "caret-up"),
        "cdn_tool_accordion":    new DashGuiIconDefinition(this.icon, "Accordion Tool", this.weight["regular"], "angle-double-down"),
        "cdn_tool_block_layout": new DashGuiIconDefinition(this.icon, "Block Layout Tool", this.weight["regular"], "th-large"),
        "cdn_tool_career_path":  new DashGuiIconDefinition(this.icon, "Career Path Tool", this.weight["regular"], "shoe-prints"),
        "cdn_tool_embed":        new DashGuiIconDefinition(this.icon, "Embed Tool", this.weight["regular"], "expand-arrows"),
        "cdn_tool_file":         new DashGuiIconDefinition(this.icon, "File Tool", this.weight["light"], "file"),
        "cdn_tool_gallery":      new DashGuiIconDefinition(this.icon, "Gallery Tool", this.weight["regular"], "images"),
        "cdn_tool_header":       new DashGuiIconDefinition(this.icon, "Header Tool", this.weight["regular"], "heading"),
        "cdn_tool_hrule":        new DashGuiIconDefinition(this.icon, "Hrule Tool", this.weight["regular"], "ruler-horizontal"),
        "cdn_tool_image":        new DashGuiIconDefinition(this.icon, "Image Tool", this.weight["regular"], "image"),
        "cdn_tool_layout":       new DashGuiIconDefinition(this.icon, "Layout Tool", this.weight["regular"], "columns"),
        "cdn_tool_lightbox":     new DashGuiIconDefinition(this.icon, "Lightbox Tool", this.weight["regular"], "expand-wide"),
        "cdn_tool_link":         new DashGuiIconDefinition(this.icon, "Link Tool", this.weight["light"], "external-link"),
        "cdn_tool_link_bank":    new DashGuiIconDefinition(this.icon, "Link Bank Tool", this.weight["regular"], "link"),
        "cdn_tool_subheader":    new DashGuiIconDefinition(this.icon, "Sub Header Tool", this.weight["light"], "heading"),
        "cdn_tool_text":         new DashGuiIconDefinition(this.icon, "Text Tool", this.weight["regular"], "font"),
        "cdn_tool_video":        new DashGuiIconDefinition(this.icon, "Text Tool", this.weight["regular"], "video"),
        "cell":                  new DashGuiIconDefinition(this.icon, "Cell Phone", this.weight["regular"], "mobile-alt"),
        "checked_box":           new DashGuiIconDefinition(this.icon, "Checked Box", this.weight["regular"], "check-square"),
        "circle_dot":            new DashGuiIconDefinition(this.icon, "Circle Dot", this.weight["regular"], "dot-circle"),
        "circle_arrow_right":    new DashGuiIconDefinition(this.icon, "Circle Arrow (Right)", this.weight["solid"], "chevron-circle-right"),
        "clipboard":             new DashGuiIconDefinition(this.icon, "Clipboard", this.weight["regular"], "clipboard-list"),
        "cloud_logs":            new DashGuiIconDefinition(this.icon, "Cloud Logs", this.weight["regular"], "fog"),
        "clone":                 new DashGuiIconDefinition(this.icon, "Clone", this.weight["regular"], "clone"),
        "close":                 new DashGuiIconDefinition(this.icon, "Close", this.weight["regular"], "times"),
        "close_circle":          new DashGuiIconDefinition(this.icon, "Close (Circle)", this.weight["regular"], "times-circle"),
        "close_square":          new DashGuiIconDefinition(this.icon, "Close (Square)", this.weight["regular"], "times-square"),
        "close_thin":            new DashGuiIconDefinition(this.icon, "Close (Thin)", this.weight["light"], "times"),
        "cloud":                 new DashGuiIconDefinition(this.icon, "Cloud", this.weight["regular"], "cloud"),
        "color_palette":         new DashGuiIconDefinition(this.icon, "Color Palette", this.weight["regular"], "palette"),
        "comment":               new DashGuiIconDefinition(this.icon, "Conversation Bubble", this.weight["solid"], "comment"),
        "comment_square":        new DashGuiIconDefinition(this.icon, "Conversation Box", this.weight["regular"], "comment-alt-lines"),
        "comments":              new DashGuiIconDefinition(this.icon, "Multiple Conversations Bubble", this.weight["solid"], "comments"),
        "comments_square":       new DashGuiIconDefinition(this.icon, "Multiple Conversations Boxes", this.weight["regular"], "comments-alt"),
        "complete":              new DashGuiIconDefinition(this.icon, "Complete", this.weight["regular"], "check"),
        "copy":                  new DashGuiIconDefinition(this.icon, "Copy", this.weight["regular"], "copy"),
        "cube":                  new DashGuiIconDefinition(this.icon, "Cube", this.weight["regular"], "cube"),
        "cubes":                 new DashGuiIconDefinition(this.icon, "Cubes", this.weight["regular"], "cubes"),
        "database":              new DashGuiIconDefinition(this.icon, "Database", this.weight["regular"], "database"),
        "delete":                new DashGuiIconDefinition(this.icon, "Delete", this.weight["regular"], "times"),
        "delete_thin":           new DashGuiIconDefinition(this.icon, "Delete (thin_", this.weight["light"], "times"),
        "dot":                   new DashGuiIconDefinition(this.icon, "Dot", this.weight["light"], "circle"),
        "dots_horizontal":       new DashGuiIconDefinition(this.icon, "Horizontal Dots", this.weight["solid"], "ellipsis-h"),
        "dots_vertical":         new DashGuiIconDefinition(this.icon, "Vertical Dots", this.weight["solid"], "ellipsis-v"),
        "download":              new DashGuiIconDefinition(this.icon, "Download", this.weight["regular"], "download"),
        "download_solid":        new DashGuiIconDefinition(this.icon, "Download", this.weight["solid"], "download"),
        "download_file":         new DashGuiIconDefinition(this.icon, "Download File", this.weight["regular"], "file-download"),
        "dropbox_logo":          new DashGuiIconDefinition(this.icon, "Dropbox Logo", this.weight["brand"], "dropbox"),
        "edit":                  new DashGuiIconDefinition(this.icon, "Edit", this.weight["regular"], "pencil"),
        "edit_square":           new DashGuiIconDefinition(this.icon, "Edit (Square)", this.weight["regular"], "edit"),
        "email":                 new DashGuiIconDefinition(this.icon, "Email", this.weight["regular"], "at"),
        "empty":                 new DashGuiIconDefinition(this.icon, "Empty", this.weight["regular"], "empty-set"),
        "empty_folder":          new DashGuiIconDefinition(this.icon, "Empty Folder", this.weight["regular"], "folder-times"),
        "envelope":              new DashGuiIconDefinition(this.icon, "Email Envelope", this.weight["regular"], "envelope"),
        "exec":                  new DashGuiIconDefinition(this.icon, "Executive", this.weight["light"], "business-time"),
        "expand":                new DashGuiIconDefinition(this.icon, "Expand View", this.weight["regular"], "expand-alt"),
        "expand_square":         new DashGuiIconDefinition(this.icon, "Expand View", this.weight["regular"], "expand"),
        "expand_square_arrows":  new DashGuiIconDefinition(this.icon, "Expand View", this.weight["regular"], "expand-arrows-alt"),
        "file":                  new DashGuiIconDefinition(this.icon, "File", this.weight["regular"], "file"),
        "file_lined":            new DashGuiIconDefinition(this.icon, "File Lined", this.weight["regular"], "file-alt"),
        "file_image":            new DashGuiIconDefinition(this.icon, "Image File", this.weight["regular"], "file-image"),
        "file_pdf":              new DashGuiIconDefinition(this.icon, "PDF File", this.weight["regular"], "file-pdf"),
        "file_csv":              new DashGuiIconDefinition(this.icon, "CSV File", this.weight["regular"], "file-csv"),
        "file_video":            new DashGuiIconDefinition(this.icon, "Video File", this.weight["regular"], "file-video"),
        "file_word":             new DashGuiIconDefinition(this.icon, "Word File", this.weight["regular"], "file-word"),
        "filter":                new DashGuiIconDefinition(this.icon, "Filter", this.weight["regular"], "filter"),
        "filter_solid":          new DashGuiIconDefinition(this.icon, "Filter", this.weight["solid"], "filter"),
        "flag":                  new DashGuiIconDefinition(this.icon, "Flag", this.weight["solid"], "flag-alt"),
        "flag_checkered":        new DashGuiIconDefinition(this.icon, "Flag", this.weight["solid"], "flag-checkered"),
        "film":                  new DashGuiIconDefinition(this.icon, "Film", this.weight["regular"], "film"),
        "folder":                new DashGuiIconDefinition(this.icon, "Folder", this.weight["regular"], "folder"),
        "folder_solid":          new DashGuiIconDefinition(this.icon, "Folder (Solid)", this.weight["solid"], "folder"),
        "folder_tree":           new DashGuiIconDefinition(this.icon, "Folder Tree", this.weight["regular"], "folder-tree"),
        "font":                  new DashGuiIconDefinition(this.icon, "Font", this.weight["regular"], "font"),
        "football":              new DashGuiIconDefinition(this.icon, "Football", this.weight["regular"], "football-ball"),
        "gear":                  new DashGuiIconDefinition(this.icon, "Gear", this.weight["regular"], "cog"),
        "gears":                 new DashGuiIconDefinition(this.icon, "Gears", this.weight["regular"], "cogs"),
        "gem":                   new DashGuiIconDefinition(this.icon, "Gem", this.weight["solid"], "gem"),
        "git":                   new DashGuiIconDefinition(this.icon, "Git", this.weight["brand"], "git-square"),
        "github":                new DashGuiIconDefinition(this.icon, "Github", this.weight["brand"], "github"),
        "goal_reply":            new DashGuiIconDefinition(this.icon, "Goal Reply", this.weight["solid"], "reply"),
        "golf_ball":             new DashGuiIconDefinition(this.icon, "Golf Ball", this.weight["regular"], "golf-ball"),
        "google_drive":          new DashGuiIconDefinition(this.icon, "Google Drive", this.weight["brand"], "google-drive"),
        "group":                 new DashGuiIconDefinition(this.icon, "Group", this.weight["solid"], "layer-group"),
        "handshake":             new DashGuiIconDefinition(this.icon, "Handshake", this.weight["regular"], "handshake"),
        "headphones":            new DashGuiIconDefinition(this.icon, "Audio", this.weight["regular"], "headphones"),
        "history":               new DashGuiIconDefinition(this.icon, "History", this.weight["regular"], "history"),
        "hockey_puck":           new DashGuiIconDefinition(this.icon, "Hockey Puck", this.weight["regular"], "hockey-puck"),
        "hr":                    new DashGuiIconDefinition(this.icon, "Human Resources", this.weight["light"], "poll-people"),
        "id_card":               new DashGuiIconDefinition(this.icon, "ID Card", this.weight["regular"], "address-card"),
        "image":                 new DashGuiIconDefinition(this.icon, "Image", this.weight["regular"], "image"),
        "images":                new DashGuiIconDefinition(this.icon, "Images", this.weight["regular"], "images"),
        "import_file":           new DashGuiIconDefinition(this.icon, "Import File", this.weight["regular"], "file-import"),
        "infinity":              new DashGuiIconDefinition(this.icon, "Infinity", this.weight["regular"], "infinity"),
        "info":                  new DashGuiIconDefinition(this.icon, "Info Circle", this.weight["regular"], "info-circle"),
        "invoice":               new DashGuiIconDefinition(this.icon, "Invoice", this.weight["regular"], "file-invoice-dollar"),
        "invoice_alt":           new DashGuiIconDefinition(this.icon, "Invoice Alt", this.weight["regular"], "file-invoice"),
        "javascript_logo":       new DashGuiIconDefinition(this.icon, "JavaScript", this.weight["brand"], "js-square"),
        "layers":                new DashGuiIconDefinition(this.icon, "Layers", this.weight["regular"], "layer-group"),
        "level_up":              new DashGuiIconDefinition(this.icon, "Level Up", this.weight["regular"], "level-up"),
        "level_down":            new DashGuiIconDefinition(this.icon, "Level Down", this.weight["regular"], "level-down"),
        "link":                  new DashGuiIconDefinition(this.icon, "Link", this.weight["regular"], "external-link"),
        "linked":                new DashGuiIconDefinition(this.icon, "Linked", this.weight["regular"], "link"),
        "list":                  new DashGuiIconDefinition(this.icon, "List", this.weight["regular"], "bars"),
        "list_boxed":            new DashGuiIconDefinition(this.icon, "List Boxed", this.weight["regular"], "list-alt"),
        "list_bulleted":         new DashGuiIconDefinition(this.icon, "Bulleted List", this.weight["regular"], "list"),
        "list_offset":           new DashGuiIconDefinition(this.icon, "List Offset", this.weight["regular"], "stream"),
        "lock":                  new DashGuiIconDefinition(this.icon, "Lock", this.weight["regular"], "lock"),
        "log_out":               new DashGuiIconDefinition(this.icon, "Log Out", this.weight["regular"], "sign-out"),
        "magic_wand":            new DashGuiIconDefinition(this.icon, "Magic Wand", this.weight["solid"], "magic"),
        "map_marker":            new DashGuiIconDefinition(this.icon, "Map Marker", this.weight["regular"], "map-marker-alt"),
        "minimize":              new DashGuiIconDefinition(this.icon, "Minimize", this.weight["regular"], "compress-alt"),
        "minus_circle":          new DashGuiIconDefinition(this.icon, "Minus Circle", this.weight["regular"], "minus-circle"),
        "minus_sign":            new DashGuiIconDefinition(this.icon, "Minus Sign", this.weight["regular"], "minus"),
        "minus_square":          new DashGuiIconDefinition(this.icon, "Minus Square", this.weight["regular"], "minus-square"),
        "moon":                  new DashGuiIconDefinition(this.icon, "Moon", this.weight["regular"], "moon"),
        "more":                  new DashGuiIconDefinition(this.icon, "More", this.weight["regular"], "window-restore"),
        "move":                  new DashGuiIconDefinition(this.icon, "Move", this.weight["regular"], "arrows-alt"),
        "navigation":            new DashGuiIconDefinition(this.icon, "Navigation - Top Level", this.weight["regular"], "tasks"),
        "newsfeed":              new DashGuiIconDefinition(this.icon, "Newsfeed", this.weight["regular"], "newspaper"),
        "note":                  new DashGuiIconDefinition(this.icon, "Note", this.weight["regular"], "sticky-note"),
        "notify":                new DashGuiIconDefinition(this.icon, "Notify", this.weight["regular"], "bell"),
        "open_folder":           new DashGuiIconDefinition(this.icon, "Open Folder", this.weight["regular"], "folder-open"),
        "paperclip":             new DashGuiIconDefinition(this.icon, "Paperclip", this.weight["regular"], "paperclip"),
        "pen":                   new DashGuiIconDefinition(this.icon, "Pen", this.weight["regular"], "pen"),
        "pencil_paintbrush":     new DashGuiIconDefinition(this.icon, "Pencil and Paintbrush", this.weight["regular"], "pencil-paintbrush"),
        "pencil_ruler":          new DashGuiIconDefinition(this.icon, "Pencil and Ruler", this.weight["regular"], "pencil-ruler"),
        "phone":                 new DashGuiIconDefinition(this.icon, "Phone", this.weight["regular"], "phone"),
        "play":                  new DashGuiIconDefinition(this.icon, "Play", this.weight["solid"], "play"),
        "portal_editor":         new DashGuiIconDefinition(this.icon, "Content Builder", this.weight["regular"], "toolbox"),
        "print":                 new DashGuiIconDefinition(this.icon, "Print", this.weight["regular"], "print"),
        "print_alt":             new DashGuiIconDefinition(this.icon, "Print (Alt)", this.weight["solid"], "print"),
        "python_logo":           new DashGuiIconDefinition(this.icon, "Python Logo", this.weight["brand"], "python"),
        "read":                  new DashGuiIconDefinition(this.icon, "Read", this.weight["regular"], "book-reader"),
        "refresh":               new DashGuiIconDefinition(this.icon, "Refresh", this.weight["regular"], "redo"),
        "remove_person":         new DashGuiIconDefinition(this.icon, "Remove Person", this.weight["regular"], "user-slash"),
        "remove_notification":   new DashGuiIconDefinition(this.icon, "Remove Notification", this.weight["regular"], "bell-slash"),
        "robot":                 new DashGuiIconDefinition(this.icon, "Robot", this.weight["regular"], "robot"),
        "rocket":                new DashGuiIconDefinition(this.icon, "Rocket", this.weight["regular"], "rocket"),
        "save":                  new DashGuiIconDefinition(this.icon, "Save", this.weight["regular"],"save"),
        "search":                new DashGuiIconDefinition(this.icon, "Search", this.weight["regular"],"search"),
        "send":                  new DashGuiIconDefinition(this.icon, "Send", this.weight["solid"],"paper-plane"),
        "server":                new DashGuiIconDefinition(this.icon, "Server", this.weight["regular"], "server"),
        "share":                 new DashGuiIconDefinition(this.icon, "Share", this.weight["regular"],"share"),
        "shield":                new DashGuiIconDefinition(this.icon, "Shield", this.weight["regular"],"shield-alt"),
        "signal_full":           new DashGuiIconDefinition(this.icon, "Full Signal", this.weight["regular"],"signal-alt"),
        "signal_none":           new DashGuiIconDefinition(this.icon, "No Signal", this.weight["regular"],"signal-alt-slash"),
        "signal_some":           new DashGuiIconDefinition(this.icon, "Some Signal", this.weight["regular"],"signal-alt-2"),
        "signature":             new DashGuiIconDefinition(this.icon, "Signature", this.weight["regular"],"signature"),
        "slash":                 new DashGuiIconDefinition(this.icon, "Slash", this.weight["regular"],"slash"),
        "sliders_horizontal":    new DashGuiIconDefinition(this.icon, "Sliders (Horizontal)", this.weight["regular"],"sliders-h"),
        "soccer_ball":           new DashGuiIconDefinition(this.icon, "Soccer Ball", this.weight["regular"], "futbol"),
        "sort_numeric_down":     new DashGuiIconDefinition(this.icon, "Sort (Numeric - Down)", this.weight["regular"], "sort-numeric-down"),
        "spinner":               new DashGuiIconDefinition(this.icon, "Spinner", this.weight["regular"],"spinner"),
        "stars":                 new DashGuiIconDefinition(this.icon, "Stars", this.weight["regular"], "stars"),
        "stop":                  new DashGuiIconDefinition(this.icon, "Stop", this.weight["solid"], "stop"),
        "stopwatch":             new DashGuiIconDefinition(this.icon, "Stopwatch", this.weight["regular"], "stopwatch"),
        "stroopwafel":           new DashGuiIconDefinition(this.icon, "Stroopwafel", this.weight["regular"], "stroopwafel"),
        "sun":                   new DashGuiIconDefinition(this.icon, "Sun", this.weight["regular"], "sun"),
        "sword":                 new DashGuiIconDefinition(this.icon, "Sword", this.weight["regular"],"sword"),
        "swords":                new DashGuiIconDefinition(this.icon, "Swords", this.weight["regular"],"swords"),
        "sync":                  new DashGuiIconDefinition(this.icon, "Sync", this.weight["regular"], "sync"),
        "tablet":                new DashGuiIconDefinition(this.icon, "Tablet", this.weight["regular"], "tablet-alt"),
        "tablet_alt":            new DashGuiIconDefinition(this.icon, "Tablet (Alt)", this.weight["regular"], "tablet-android-alt"),
        "tag":                   new DashGuiIconDefinition(this.icon, "Tag", this.weight["regular"], "tag"),
        "tally":                 new DashGuiIconDefinition(this.icon, "Tally", this.weight["regular"], "tally"),
        "tasks":                 new DashGuiIconDefinition(this.icon, "Tasks", this.weight["regular"], "tasks"),
        "tasks_alt":             new DashGuiIconDefinition(this.icon, "Tasks", this.weight["regular"], "tasks-alt"),
        "tennis_ball":           new DashGuiIconDefinition(this.icon, "Tennis Ball", this.weight["regular"], "tennis-ball"),
        "terminal":              new DashGuiIconDefinition(this.icon, "Terminal", this.weight["regular"], "terminal"),
        "ticket":                new DashGuiIconDefinition(this.icon, "Ticket", this.weight["regular"], "ticket-alt"),
        "toggle_off":            new DashGuiIconDefinition(this.icon, "Toggle Off", this.weight["regular"], "toggle-off"),
        "toggle_off_light":      new DashGuiIconDefinition(this.icon, "Toggle Off (Light)", this.weight["light"], "toggle-off"),
        "toggle_off_solid":      new DashGuiIconDefinition(this.icon, "Toggle Off (Solid)", this.weight["solid"], "toggle-off"),
        "toggle_on":             new DashGuiIconDefinition(this.icon, "Toggle On", this.weight["regular"], "toggle-on"),
        "toggle_on_light":       new DashGuiIconDefinition(this.icon, "Toggle On (Light)", this.weight["light"], "toggle-on"),
        "toggle_on_solid":       new DashGuiIconDefinition(this.icon, "Toggle On (Solid)", this.weight["solid"], "toggle-on"),
        "tools":                 new DashGuiIconDefinition(this.icon, "Tools", this.weight["regular"], "tools"),
        "transferring":          new DashGuiIconDefinition(this.icon, "Transferring", this.weight["regular"], "exchange"),
        "trash":                 new DashGuiIconDefinition(this.icon, "Trash", this.weight["regular"], "trash"),
        "trash_alt":             new DashGuiIconDefinition(this.icon, "Trash Alt", this.weight["regular"], "trash-alt"),
        "trash_restore":         new DashGuiIconDefinition(this.icon, "Trash Undo", this.weight["regular"], "trash-restore"),
        "trash_solid":           new DashGuiIconDefinition(this.icon, "Trash", this.weight["solid"], "trash"),
        "triangle":              new DashGuiIconDefinition(this.icon, "Triangle", this.weight["regular"], "triangle"),
        "truck":                 new DashGuiIconDefinition(this.icon, "Truck", this.weight["regular"], "truck"),
        "unchecked_box":         new DashGuiIconDefinition(this.icon, "Unchecked Box", this.weight["regular"],"square"),
        "undo":                  new DashGuiIconDefinition(this.icon, "Undo", this.weight["regular"], "undo"),
        "unknown":               new DashGuiIconDefinition(this.icon, "Unknown Icon", this.weight["light"], "spider-black-widow"),
        "unlink":                new DashGuiIconDefinition(this.icon, "Unlink", this.weight["regular"], "unlink"),
        "unlock":                new DashGuiIconDefinition(this.icon, "Unlocked", this.weight["regular"], "unlock"),
        "unlock_alt":            new DashGuiIconDefinition(this.icon, "Unlocked", this.weight["regular"], "lock-open"),
        "upload":                new DashGuiIconDefinition(this.icon, "Upload", this.weight["regular"], "upload"),
        "upload_file":           new DashGuiIconDefinition(this.icon, "Upload File", this.weight["regular"], "file-upload"),
        "user":                  new DashGuiIconDefinition(this.icon, "User", this.weight["regular"], "user"),
        "users":                 new DashGuiIconDefinition(this.icon, "Users", this.weight["regular"], "users"),
        "user_settings":         new DashGuiIconDefinition(this.icon, "User Settings", this.weight["regular"], "user-cog"),
        "video":                 new DashGuiIconDefinition(this.icon, "Video", this.weight["regular"], "video"),
        "view":                  new DashGuiIconDefinition(this.icon, "View", this.weight["regular"], "eye"),
        "web":                   new DashGuiIconDefinition(this.icon, "Web", this.weight["solid"], "spider-web"),
        "windows_logo":          new DashGuiIconDefinition(this.icon, "Windows Logo", this.weight["brand"], "windows"),
        "worker":                new DashGuiIconDefinition(this.icon, "Worker", this.weight["regular"], "user-hard-hat"),
        "wrench":                new DashGuiIconDefinition(this.icon, "Wrench", this.weight["regular"], "wrench"),
        "wrestling_mask":        new DashGuiIconDefinition(this.icon, "Wrestling Mask", this.weight["regular"], "luchador"),
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
