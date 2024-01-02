#!/usr/bin/python
#
# Ensomniac 2024 Ryan Martin, ryan@ensomniac.com
#                Andrew Stet, stetandrew@gmail.com

# SETUP_PYDASH

__version__ = "1.4"
__copyright__ = "Copyright (c) 2024 Ensomniac"

AdminEmails = [
    "ryan@ensomniac.com",
    "stetandrew@gmail.com"
]

# It would be idea to just use IDs, but that's not readily available in each unique instance of code
# where we check for personal packages. For example, in GitHub.py, we have ready access to the repo name,
# and in Core.py we have access to the asset path (without needing to instantiate self.DashContext).
PersonalContexts = {
    "ryan@ensomniac.com": {
        "asset_paths": [
            "smartsioux",
            "rycam",
            "ensomniac_io",
            "ensomniac_ai",
            "freshpath"
        ],
        "repo_names": [
            "smartsioux",
            "rycam",
            "ensomniac_io",
            "ensomniac_ai",
            "freshpath"
        ]
    },
    "stetandrew@gmail.com": {
        "asset_paths": [
            "simple_paycheck_budget"
        ],
        "repo_names": [
            "simplepaycheckbudget"
        ]
    }
}


def Sync():
    try:
        from DashSync import DashSync
    except:
        from.DashSync import DashSync

    DashSync()
