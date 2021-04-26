function GuiIcons(icon_name) {

    this.icon_map = {};

    this.weight = {};
    this.weight.solid = "s";
    this.weight.regular = "r";
    this.weight.light = "l";

    this.icon_map["unknown"] = new GuiIconDefinition("Unknown Icon", this.weight.light, "spider-black-widow");
    this.icon_map["add"] = new GuiIconDefinition("Add", this.weight.light, "plus", 1.3, 0.15, 0.15);
    this.icon_map["arrow_down"] = new GuiIconDefinition("Arrow Down", this.weight.regular, "angle-down", 1.5);
    this.icon_map["arrow_up"] = new GuiIconDefinition("Arrow Up", this.weight.regular, "angle-up", 1.5);
    this.icon_map["arrow_left"] = new GuiIconDefinition("Arrow Left", this.weight.regular, "angle-left", 1.5);
    this.icon_map["arrow_right"] = new GuiIconDefinition("Arrow Right", this.weight.regular, "angle-right", 1.5);
    this.icon_map["close"] = new GuiIconDefinition("Close", this.weight.regular, "times", 1.2, 0.25, 0.25);
    this.icon_map["delete"] = new GuiIconDefinition("Delete", this.weight.regular, "times", 1.2, 0.25, 0.25);
    this.icon_map["user"] = new GuiIconDefinition("Climber", this.weight.regular, "user");
    this.icon_map["search"] = new GuiIconDefinition("Search", this.weight.regular,"search");
    this.icon_map["notify"] = new GuiIconDefinition("Notify", this.weight.regular, "bell");
    this.icon_map["refresh"] = new GuiIconDefinition("Refresh", this.weight.regular, "redo");
    this.icon_map["undo"] = new GuiIconDefinition("Undo", this.weight.regular, "undo");
    this.icon_map["gear"] = new GuiIconDefinition("Gear", this.weight.regular, "cog");
    this.icon_map["lock"] = new GuiIconDefinition("Lock", this.weight.regular, "lock");
    this.icon_map["unlock"] = new GuiIconDefinition("Unlocked", this.weight.regular, "unlock");
    this.icon_map["edit"] = new GuiIconDefinition("Edit", this.weight.regular, "pencil");
    this.icon_map["complete"] = new GuiIconDefinition("Complete", this.weight.regular, "check");
    this.icon_map["note"] = new GuiIconDefinition("Note", this.weight.regular, "sticky-note", 1.05);
    this.icon_map["email"] = new GuiIconDefinition("Email", this.weight.regular, "at");
    this.icon_map["video"] = new GuiIconDefinition("Video", this.weight.regular, "video", 0.85);
    this.icon_map["image"] = new GuiIconDefinition("Image", this.weight.regular, "image", 0.9);
    this.icon_map["newsfeed"] = new GuiIconDefinition("Newsfeed", this.weight.regular, "newspaper");
    this.icon_map["read"] = new GuiIconDefinition("Read", this.weight.regular, "book-reader");
    this.icon_map["award"] = new GuiIconDefinition("Award", this.weight.regular, "award");
    this.icon_map["portal_editor"] = new GuiIconDefinition("Content Builder", this.weight.regular, "toolbox");
    this.icon_map["admin_tools"] = new GuiIconDefinition("Admin Tools", this.weight.regular, "shield-alt");
    this.icon_map["expand"] = new GuiIconDefinition("Expand View", this.weight.regular, "expand-alt");
    this.icon_map["navigation"] = new GuiIconDefinition("Navigation - Top Level", this.weight.regular, "tasks");
    this.icon_map["toggle_on"] = new GuiIconDefinition("Toggle", this.weight.regular, "toggle-on");
    this.icon_map["toggle_off"] = new GuiIconDefinition("Toggle", this.weight.regular, "toggle-off");
    this.icon_map["group"] = new GuiIconDefinition("Group", this.weight.solid, "layer-group");
    this.icon_map["dot"] = new GuiIconDefinition("Dot", this.weight.light, "circle", 0.66);
    this.icon_map["file"] = new GuiIconDefinition("File", this.weight.light, "file");
    this.icon_map["link"] = new GuiIconDefinition("Link", this.weight.light, "external-link");
    this.icon_map["list"] = new GuiIconDefinition("List", this.weight.regular, "bars");
    this.icon_map["upload"] = new GuiIconDefinition("Upload", this.weight.light, "upload");
    this.icon_map["tools"] = new GuiIconDefinition("Tools", this.weight.light, "tools");
    this.icon_map["exec"] = new GuiIconDefinition("Executive", this.weight.light, "business-time");
    this.icon_map["hr"] = new GuiIconDefinition("Human Resources", this.weight.light, "poll-people");
    this.icon_map["cell"] = new GuiIconDefinition("Cell Phone", this.weight.regular, "mobile-alt");
    this.icon_map["phone"] = new GuiIconDefinition("Phone", this.weight.regular, "phone");
    this.icon_map["envelope"] = new GuiIconDefinition("Email Envelope", this.weight.regular, "envelope");
    this.icon_map["more"] = new GuiIconDefinition("More", this.weight.regular, "window-restore");
    this.icon_map["view"] = new GuiIconDefinition("View", this.weight.regular, "eye");
    this.icon_map["copy"] = new GuiIconDefinition("Copy", this.weight.regular, "copy");
    this.icon_map["alert"] = new GuiIconDefinition("Alert", this.weight.solid, "exclamation", 0.9);
    this.icon_map["cdn_tool_header"] = new GuiIconDefinition("Header Tool", this.weight.regular, "heading");
    this.icon_map["cdn_tool_subheader"] = new GuiIconDefinition("Sub Header Tool", this.weight.light, "heading");
    this.icon_map["cdn_tool_image"] = new GuiIconDefinition("Image Tool", this.weight.regular, "image", 0.9);
    this.icon_map["cdn_tool_text"] = new GuiIconDefinition("Text Tool", this.weight.regular, "font", 0.9);
    this.icon_map["cdn_tool_video"] = new GuiIconDefinition("Text Tool", this.weight.regular, "video", 0.85);
    this.icon_map["cdn_tool_hrule"] = new GuiIconDefinition("Hrule Tool", this.weight.regular, "ruler-horizontal");
    this.icon_map["cdn_tool_link"] = new GuiIconDefinition("Link Tool", this.weight.light, "external-link");
    this.icon_map["cdn_tool_link_bank"] = new GuiIconDefinition("Link Bank Tool", this.weight.regular, "link");
    this.icon_map["cdn_tool_file"] = new GuiIconDefinition("File Tool", this.weight.light, "file");
    this.icon_map["cdn_tool_embed"] = new GuiIconDefinition("Embed Tool", this.weight.regular, "expand-arrows");
    this.icon_map["cdn_tool_block_layout"] = new GuiIconDefinition("Block Layout Tool", this.weight.regular, "th-large");
    this.icon_map["cdn_tool_lightbox"] = new GuiIconDefinition("Lightbox Tool", this.weight.regular, "expand-wide");
    this.icon_map["cdn_tool_layout"] = new GuiIconDefinition("Layout Tool", this.weight.regular, "columns");
    this.icon_map["cdn_tool_career_path"] = new GuiIconDefinition("Career Path Tool", this.weight.regular, "shoe-prints");
    this.icon_map["cdn_tool_gallery"] = new GuiIconDefinition("Gallery Tool", this.weight.regular, "images");
    this.icon_map["cdn_tool_accordion"] = new GuiIconDefinition("Accordion Tool", this.weight.regular, "angle-double-down");
    this.icon_map["invoice"] = new GuiIconDefinition("Invoice", this.weight.regular, "file-invoice-dollar");
    this.icon_map["goal_reply"] = new GuiIconDefinition("Goal Reply", this.weight.solid, "reply");
    this.icon_map["dots_vertical"] = new GuiIconDefinition("Vertical Dots", this.weight.solid, "ellipsis-v");
    this.icon_map["dots_horizontal"] = new GuiIconDefinition("Horizontal Dots", this.weight.solid, "ellipsis-h");
    this.icon_map["comment"] = new GuiIconDefinition("Conversation Bubble", this.weight.solid, "comment");
    this.icon_map["comments"] = new GuiIconDefinition("Multiple Conversations Bubble", this.weight.solid, "comments");

    if (icon_name == "icon_map"){
        // Return icon map for use in portal editor > font icons
        return this.icon_map;
    }
    else if (!this.icon_map[icon_name]) {
        console.log("Warning: Unable to locate icon by name '" + icon_name + "'");
        console.trace();
        debugger;
        return this.icon_map["unknown"];
    }
    else {
        return this.icon_map[icon_name];
    };



};