#!/usr/bin/python
#
# Candy 2022, Ryan Martin rmartin@candy.com, ryan@ensomniac.com
#             Andrew Stet astet@candy.com, stetandrew@gmail.com

import os
import sys

from .utils import Utils
from .interface import Interface
from .properties import Properties


class Context2D(Utils, Interface, Properties):
    def __init__(self, user_data, context2d_root, obj_id=""):
        """
        :param dict user_data: Request user's data
        :param str context2d_root: Root folder where context IDs are stored
        :param str obj_id: Can be empty, but only if you're creating a new context (default="")
        """

        Utils.__init__(self)
        Interface.__init__(self)
        Properties.__init__(self, user_data, context2d_root, obj_id)

    def ToDict(self, update_mod_fields=False):
        """
        :param bool update_mod_fields: When True, the 'modified_by' and 'modified_on' keys are updated (default=False)

        :return: Sanitized context2D data
        :rtype: dict
        """

        if not self.Data:
            return self.Data

        data = {
            "created_by":   self.CreatedBy,
            "created_on":   self.CreatedOn,
            "display_name": self.DisplayName,
            "id":           self.ID,
            "modified_by":  self.User["email"] if update_mod_fields else self.ModifiedBy,
            "modified_on":  self.now.isoformat() if update_mod_fields else self.ModifiedOn
        }

        return data
