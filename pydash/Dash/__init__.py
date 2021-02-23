#!/usr/bin/python
# 2021 Ensomniac, Ryan Martin ryan@ensomniac.com
# SETUP_PYDASH

__version__ = "1.4"
__copyright__ = "Copyright (c) 2021 Ensomniac"

# from . import DashLint as Lint

def Sync():
    from . import DashSync
    DashSync.DashSync()
