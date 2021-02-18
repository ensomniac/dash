#!/usr/bin/python
#
# Authentic 2021 Ryan Martin, ryan@ensomniac.com

from Dash import Context

def Get():
    return Context.Create(
        asset_path="authentic",
        domain="authentic.tools",
        display_name="Authentic Tools Portal"
    )
