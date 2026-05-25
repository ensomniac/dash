#!/usr/bin/python
#
# Ensomniac 2026 Ryan Martin, ryan@ensomniac.com
#                Andrew Stet, stetandrew@gmail.com

# SETUP_PYDASH

__version__ = "1.4"
__copyright__ = "Copyright (c) 2025 Ensomniac"

AdminEmails = [
    "ryan@ensomniac.com",
    "stetandrew@gmail.com"
]

# For the context filters below, it would be ideal to just use IDs, but that's not readily available in
# each unique instance of code where we check for personal packages. For example, in GitHub.py, we have
# ready access to the repo name, and in Core.py we have access to the asset path (without needing to
# instantiate self.DashContext).

# When an email is sent (error, etc), the owner of these contexts will be made the sole recipient.
PersonalContexts = {
    "ryan@ensomniac.com": {
        "asset_paths": [
            "smartsioux",
            "rycam",
            "ensomniac_io",
            "ensomniac_ai",
            "freshpath",
            "fantom"
        ],
        "repo_names": [
            "smartsioux",
            "rycam",
            "ensomniac_io",
            "ensomniac_ai",
            "freshpath",
            "fantom"
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

# When an email is sent (error, etc) from these contexts, the
# specified admin will be removed from the recipient list.
# There is no need to include contexts from PersonalContexts here.
ExcludedContexts = {
    "ryan@ensomniac.com": {
        "asset_paths": [],
        "repo_names": []
    },
    "stetandrew@gmail.com": {
        "asset_paths": [
            "candy",
            "fantom"
        ],
        "repo_names": [
            "realtimecandy",
            "fantom"
        ]
    }
}


def Sync():
    try:
        from DashSync import DashSync

    except ImportError:
        from .DashSync import DashSync

    DashSync()
