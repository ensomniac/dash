#!/usr/bin/python
#
# Ensomniac 2024 Ryan Martin, ryan@ensomniac.com
#                Andrew Stet, stetandrew@gmail.com

"""
| The point of these errors, at time of writing, is to have few custom error names to be
  able to call from anywhere, which can then be handled in unique ways from ApiCore
  (see ApiCore's implementation/handling of ClientAlert for an example).
|
| They can be imported as:
|     from Dash.Utils import ClientAlert
|
| It may make more sense to instead import them from something like
  Dash.Errors, but since this file is so small, and it's not going to
  ever be much of a module, I figured this was a more appropriate place.
"""

import os
import sys

# TODO: Propagate these throughout the code, replacing applicable uses of 'raise Exception'


class _DashError(Exception):
    """
    Base class for other errors to inherit from, in case we want to add shared functionality.
    Since this inherits from Exception, exceptions will still be raised as normal, in addition
    to any extra wrapper class functionality.
    """

    pass


class ClientAlert(_DashError):
    """
    | **This should not be used for errors that we need to know about or get alerts/emails for.**
    |
    | This exception tells ApiCore to forgo sending a traceback to the client, and only
      sends the actual raised Exception message from the code.
    |
    | This is most useful when we don't necessarily want to raise a ValueError, but we still need
      to let the client user know that something they did was invalid, without showing a traceback.
    """

    pass


class DevError(_DashError):
    """
    This exists purely as a wrapper to signify developer errors vs other errors, such as system or user errors.
    """

    pass
