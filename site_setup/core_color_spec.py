#!/usr/bin/python
#
# Ensomniac 2023 Ryan Martin, ryan@ensomniac.com
#                Andrew Stet, stetandrew@gmail.com

"""
| Defins the local / expected structure of a dash package
"""

import os
import sys
import datetime

lazy_lines = '''function DashColorSpec () {

    this.set_dash_colors = function () {

        window.PrimaryColor = "#fe4c42";

        window.ColorAccentPrimary   = PrimaryColor;
        window.ColorAccentSecondary = "#e6652e"; // Redish orange
        window.ColorDarkBG          = "#111111"; // Slate / bluish gray
        window.ColorLightBG         = "#f3f3f3"; // Light / bluish white
        window.ColorDarkAccentBG    = "#282828"; // Slightly lighter than ColorDarkBG

        window.ColorLightText       = "#f6f6f6"; // Blackish text color
        window.ColorDarkText        = "#222222"; // Lightish text color
        window.ColorButton          = PrimaryColor;
        window.ColorButtonSelected  = "#725ea6"; // Purple

        this.setup_dash_color_light();
        this.setup_dash_color_dark();

        Dash.Color.SwapIfDarkModeActive();
    };

    this.setup_dash_color_light = function () {

        Dash.Color.Light.Background = ColorLightBG;
        Dash.Color.Light.Text       = ColorDarkText;
        Dash.Color.Light.TextHeader = ColorDarkText;
        Dash.Color.Light.AccentGood = ColorAccentPrimary;
        Dash.Color.Light.AccentBad  = ColorAccentSecondary;

        Dash.Color.Light.Button = new DashColorButtonSet(
            "none",                 // Light.Button.AreaBackground (If applicable)
            new DashColorStateSet(
                ColorDarkBG,        // Light.Button.Background.Base
                ColorAccentPrimary, // Light.Button.Background.Selected
                ColorAccentPrimary, // Light.Button.Background.BaseHover
                ColorAccentPrimary, // Light.Button.Background.SelectedHover
            ),
            new DashColorStateSet(
                ColorLightText,     // Light.Button.Text.Base
                ColorLightText,     // Light.Button.Text.Selected
                ColorLightText,     // Light.Button.Text.BaseHover
                ColorLightText,     // Light.Button.Text.SelectedHover
            ),
        );

        Dash.Color.Light.Tab = new DashColorButtonSet(
            Dash.Color.Darken(ColorLightBG, 25),     // Light.Tab.AreaBackground (If applicable)
            new DashColorStateSet(
                Dash.Color.Darken(ColorLightBG, 25), // Light.Tab.Background.Base
                ColorLightBG,                        // Light.Tab.Background.Selected
                Dash.Color.Darken(ColorLightBG, 25), // Light.Tab.Background.BaseHover
                ColorAccentPrimary,                  // Light.Tab.Background.SelectedHover
            ),
            new DashColorStateSet(
                ColorDarkText,       // Light.Tab.Text.Base
                ColorDarkText,       // Light.Tab.Text.Selected
                ColorAccentPrimary,  // Light.Tab.Text.BaseHover
                Dash.Color.Darken(ColorDarkText, 25),  // Light.Tab.Text.SelectedHover
            ),
        );

        Dash.Color.Light.Input = new DashColorButtonSet(
            "none",            // Light.Input.AreaBackground (If applicable)
            new DashColorStateSet(
                Dash.Color.Lighten(ColorLightBG, 5),   // Light.Input.Background.Base
                "none",   // Light.Input.Background.Selected
                "none",   // Light.Input.Background.BaseHover
                "none",   // Light.Input.Background.SelectedHover
            ),
            new DashColorStateSet(
                ColorLightText,  // Light.Input.Text.Base
                ColorLightText,  // Light.Input.Text.Selected
                ColorLightText,  // Light.Input.Text.BaseHover
                ColorLightText,  // Light.Input.Text.SelectedHover
            ),
        );
    };

    this.setup_dash_color_dark = function () {
        Dash.Color.Dark.Background = ColorDarkBG;
        Dash.Color.Dark.Text       = ColorLightText;
        Dash.Color.Dark.TextHeader = ColorLightText;
        Dash.Color.Dark.AccentGood = ColorAccentPrimary;
        Dash.Color.Dark.AccentBad  = ColorAccentSecondary;

        Dash.Color.Dark.Button = new DashColorButtonSet(
            "none",            // Dark.Button.AreaBackground (If applicable)
            new DashColorStateSet(
                ColorButton,   // Dark.Button.Background.Base
                ColorButtonSelected,   // Dark.Button.Background.Selected
                Dash.Color.Lighten(ColorButton, 20),   // Dark.Button.Background.BaseHover
                Dash.Color.Lighten(ColorButtonSelected, 20),   // Dark.Button.Background.SelectedHover
            ),
            new DashColorStateSet(
                ColorLightText,  // Dark.Button.Text.Base
                ColorLightText,  // Dark.Button.Text.Selected
                ColorLightText,  // Dark.Button.Text.BaseHover
                ColorLightText,  // Dark.Button.Text.SelectedHover
            ),
        );

        Dash.Color.Dark.Tab = new DashColorButtonSet(
            ColorDarkBG,             // Dark.Tab.AreaBackground (If applicable)
            new DashColorStateSet(
                ColorDarkBG,         // Dark.Tab.Background.Base
                ColorLightBG,        // Dark.Tab.Background.Selected
                ColorAccentPrimary,  // Dark.Tab.Background.BaseHover
                Dash.Color.Lighten(ColorLightBG, 15), // Dark.Tab.Background.SelectedHover
            ),
            new DashColorStateSet(
                ColorLightText,  // Dark.Tab.Text.Base
                ColorDarkText,   // Dark.Tab.Text.Selected
                ColorLightText,  // Dark.Tab.Text.BaseHover
                ColorDarkText,   // Dark.Tab.Text.SelectedHover
            ),
        );

        Dash.Color.Dark.Input = new DashColorButtonSet(
            "none",            // Dark.Input.AreaBackground (If applicable)
            new DashColorStateSet(
                Dash.Color.Lighten(ColorLightBG, 5), // Dark.Input.Background.Base
                "none",                              // Dark.Input.Background.Selected
                "none",                              // Dark.Input.Background.BaseHover
                "none",                              // Dark.Input.Background.SelectedHover
            ),
            new DashColorStateSet(
                ColorLightText,  // Dark.Input.Text.Base
                ColorLightText,  // Dark.Input.Text.Selected
                ColorLightText,  // Dark.Input.Text.BaseHover
                ColorLightText,  // Dark.Input.Text.SelectedHover
            ),
        );
    };

    this.set_dash_colors();
}
'''

class CoreColorSpecTemplate:
    def __init__(self, package_data):
        self._package_data = package_data

    @property
    def data(self):
        return self._package_data

    @property
    def all_lines(self):
        return lazy_lines.split("\n")

    def Create(self):

        lines = []
        lines.extend(self.all_lines)

        return lines





if __name__ == "__main__":

    print("\n** LOCAL TESTING **\n")

    client_module_path = __file__.split("/site_setup/")[0] + "/"
    cmd = "cd " + client_module_path + ";python site_setup"
    os.system(cmd)
