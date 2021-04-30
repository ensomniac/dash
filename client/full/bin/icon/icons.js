function GuiIcons(icon) {

    this.icon = icon;
    this.icon_map = {};

    this.weight = {};
    this.weight.solid = "s";
    this.weight.regular = "r";
    this.weight.light = "l";

    this.icon_map["add"]                   = new GuiIconDefinition(this.icon, "Add", this.weight.light, "plus", 1.3, 0.15, 0.15);
    this.icon_map["admin_tools"]           = new GuiIconDefinition(this.icon, "Admin Tools", this.weight.regular, "shield-alt");
    this.icon_map["alert"]                 = new GuiIconDefinition(this.icon, "Alert", this.weight.solid, "exclamation", 0.9);
    this.icon_map["arrow_down"]            = new GuiIconDefinition(this.icon, "Arrow Down", this.weight.regular, "angle-down", 1.5);
    this.icon_map["arrow_left"]            = new GuiIconDefinition(this.icon, "Arrow Left", this.weight.regular, "angle-left", 1.5);
    this.icon_map["arrow_right"]           = new GuiIconDefinition(this.icon, "Arrow Right", this.weight.regular, "angle-right", 1.5);
    this.icon_map["arrow_up"]              = new GuiIconDefinition(this.icon, "Arrow Up", this.weight.regular, "angle-up", 1.5);
    this.icon_map["award"]                 = new GuiIconDefinition(this.icon, "Award", this.weight.regular, "award");
    this.icon_map["browser_window"]        = new GuiIconDefinition(this.icon, "Windows Logo", this.weight.solid, "window");
    this.icon_map["cdn_tool_accordion"]    = new GuiIconDefinition(this.icon, "Accordion Tool", this.weight.regular, "angle-double-down");
    this.icon_map["cdn_tool_block_layout"] = new GuiIconDefinition(this.icon, "Block Layout Tool", this.weight.regular, "th-large");
    this.icon_map["cdn_tool_career_path"]  = new GuiIconDefinition(this.icon, "Career Path Tool", this.weight.regular, "shoe-prints");
    this.icon_map["cdn_tool_embed"]        = new GuiIconDefinition(this.icon, "Embed Tool", this.weight.regular, "expand-arrows");
    this.icon_map["cdn_tool_file"]         = new GuiIconDefinition(this.icon, "File Tool", this.weight.light, "file");
    this.icon_map["cdn_tool_gallery"]      = new GuiIconDefinition(this.icon, "Gallery Tool", this.weight.regular, "images");
    this.icon_map["cdn_tool_header"]       = new GuiIconDefinition(this.icon, "Header Tool", this.weight.regular, "heading");
    this.icon_map["cdn_tool_hrule"]        = new GuiIconDefinition(this.icon, "Hrule Tool", this.weight.regular, "ruler-horizontal");
    this.icon_map["cdn_tool_image"]        = new GuiIconDefinition(this.icon, "Image Tool", this.weight.regular, "image", 0.9);
    this.icon_map["cdn_tool_layout"]       = new GuiIconDefinition(this.icon, "Layout Tool", this.weight.regular, "columns");
    this.icon_map["cdn_tool_lightbox"]     = new GuiIconDefinition(this.icon, "Lightbox Tool", this.weight.regular, "expand-wide");
    this.icon_map["cdn_tool_link"]         = new GuiIconDefinition(this.icon, "Link Tool", this.weight.light, "external-link");
    this.icon_map["cdn_tool_link_bank"]    = new GuiIconDefinition(this.icon, "Link Bank Tool", this.weight.regular, "link");
    this.icon_map["cdn_tool_subheader"]    = new GuiIconDefinition(this.icon, "Sub Header Tool", this.weight.light, "heading");
    this.icon_map["cdn_tool_text"]         = new GuiIconDefinition(this.icon, "Text Tool", this.weight.regular, "font", 0.9);
    this.icon_map["cdn_tool_video"]        = new GuiIconDefinition(this.icon, "Text Tool", this.weight.regular, "video", 0.85);
    this.icon_map["cell"]                  = new GuiIconDefinition(this.icon, "Cell Phone", this.weight.regular, "mobile-alt");
    this.icon_map["close"]                 = new GuiIconDefinition(this.icon, "Close", this.weight.regular, "times", 1.2, 0.25, 0.25);
    this.icon_map["comment"]               = new GuiIconDefinition(this.icon, "Conversation Bubble", this.weight.solid, "comment");
    this.icon_map["comments"]              = new GuiIconDefinition(this.icon, "Multiple Conversations Bubble", this.weight.solid, "comments");
    this.icon_map["complete"]              = new GuiIconDefinition(this.icon, "Complete", this.weight.regular, "check");
    this.icon_map["copy"]                  = new GuiIconDefinition(this.icon, "Copy", this.weight.regular, "copy");
    this.icon_map["delete"]                = new GuiIconDefinition(this.icon, "Delete", this.weight.regular, "times", 1.2, 0.25, 0.25);
    this.icon_map["dot"]                   = new GuiIconDefinition(this.icon, "Dot", this.weight.light, "circle", 0.66);
    this.icon_map["dots_horizontal"]       = new GuiIconDefinition(this.icon, "Horizontal Dots", this.weight.solid, "ellipsis-h");
    this.icon_map["dots_vertical"]         = new GuiIconDefinition(this.icon, "Vertical Dots", this.weight.solid, "ellipsis-v");
    this.icon_map["download"]              = new GuiIconDefinition(this.icon, "Download", this.weight.solid, "download");
    this.icon_map["edit"]                  = new GuiIconDefinition(this.icon, "Edit", this.weight.regular, "pencil");
    this.icon_map["email"]                 = new GuiIconDefinition(this.icon, "Email", this.weight.regular, "at");
    this.icon_map["envelope"]              = new GuiIconDefinition(this.icon, "Email Envelope", this.weight.regular, "envelope");
    this.icon_map["exec"]                  = new GuiIconDefinition(this.icon, "Executive", this.weight.light, "business-time");
    this.icon_map["expand"]                = new GuiIconDefinition(this.icon, "Expand View", this.weight.regular, "expand-alt");
    this.icon_map["file"]                  = new GuiIconDefinition(this.icon, "File", this.weight.light, "file");
    this.icon_map["gear"]                  = new GuiIconDefinition(this.icon, "Gear", this.weight.regular, "cog");
    this.icon_map["goal_reply"]            = new GuiIconDefinition(this.icon, "Goal Reply", this.weight.solid, "reply");
    this.icon_map["group"]                 = new GuiIconDefinition(this.icon, "Group", this.weight.solid, "layer-group");
    this.icon_map["hr"]                    = new GuiIconDefinition(this.icon, "Human Resources", this.weight.light, "poll-people");
    this.icon_map["image"]                 = new GuiIconDefinition(this.icon, "Image", this.weight.regular, "image", 0.9);
    this.icon_map["invoice"]               = new GuiIconDefinition(this.icon, "Invoice", this.weight.regular, "file-invoice-dollar");
    this.icon_map["link"]                  = new GuiIconDefinition(this.icon, "Link", this.weight.light, "external-link");
    this.icon_map["list"]                  = new GuiIconDefinition(this.icon, "List", this.weight.regular, "bars");
    this.icon_map["lock"]                  = new GuiIconDefinition(this.icon, "Lock", this.weight.regular, "lock");
    this.icon_map["more"]                  = new GuiIconDefinition(this.icon, "More", this.weight.regular, "window-restore");
    this.icon_map["navigation"]            = new GuiIconDefinition(this.icon, "Navigation - Top Level", this.weight.regular, "tasks");
    this.icon_map["newsfeed"]              = new GuiIconDefinition(this.icon, "Newsfeed", this.weight.regular, "newspaper");
    this.icon_map["note"]                  = new GuiIconDefinition(this.icon, "Note", this.weight.regular, "sticky-note", 1.05);
    this.icon_map["notify"]                = new GuiIconDefinition(this.icon, "Notify", this.weight.regular, "bell");
    this.icon_map["phone"]                 = new GuiIconDefinition(this.icon, "Phone", this.weight.regular, "phone");
    this.icon_map["portal_editor"]         = new GuiIconDefinition(this.icon, "Content Builder", this.weight.regular, "toolbox");
    this.icon_map["read"]                  = new GuiIconDefinition(this.icon, "Read", this.weight.regular, "book-reader");
    this.icon_map["refresh"]               = new GuiIconDefinition(this.icon, "Refresh", this.weight.regular, "redo");
    this.icon_map["search"]                = new GuiIconDefinition(this.icon, "Search", this.weight.regular,"search");
    this.icon_map["toggle_off"]            = new GuiIconDefinition(this.icon, "Toggle", this.weight.regular, "toggle-off");
    this.icon_map["toggle_on"]             = new GuiIconDefinition(this.icon, "Toggle", this.weight.regular, "toggle-on");
    this.icon_map["tools"]                 = new GuiIconDefinition(this.icon, "Tools", this.weight.light, "tools");
    this.icon_map["trash"]                 = new GuiIconDefinition(this.icon, "Trash", this.weight.solid, "trash-alt");
    this.icon_map["undo"]                  = new GuiIconDefinition(this.icon, "Undo", this.weight.regular, "undo");
    this.icon_map["unknown"]               = new GuiIconDefinition(this.icon, "Unknown Icon", this.weight.light, "spider-black-widow");
    this.icon_map["unlock"]                = new GuiIconDefinition(this.icon, "Unlocked", this.weight.regular, "unlock");
    this.icon_map["upload"]                = new GuiIconDefinition(this.icon, "Upload", this.weight.light, "upload");
    this.icon_map["user"]                  = new GuiIconDefinition(this.icon, "Climber", this.weight.regular, "user");
    this.icon_map["video"]                 = new GuiIconDefinition(this.icon, "Video", this.weight.regular, "video", 0.85);
    this.icon_map["view"]                  = new GuiIconDefinition(this.icon, "View", this.weight.regular, "eye");
    this.icon_map["web"]                   = new GuiIconDefinition(this.icon, "Windows Logo", this.weight.solid, "spider-web");

    if (this.icon.name == "icon_map"){
        // Return icon map for use in portal editor > font icons
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
    };

};
