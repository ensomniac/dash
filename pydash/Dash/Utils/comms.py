#!/usr/bin/python
#
# Altona 2021 Ryan Martin, ryan@ensomniac.com
#             Andrew Stet, stetandrew@gmail.com

import os
import sys


def SendEmail(subject, notify_email_list=[], msg="", error="", sender="ryan@ensomniac.com", sender_name="Dash"):
    from . import OapiRoot

    # This is a temporary stop until we setup Dash to be able to always run this, regardless of server
    if not os.path.exists(OapiRoot):
        raise Exception("The Mail Module can currently only run directly from the server.")

    import Mail

    if not msg:
        msg = subject

    if len(error) and error != "NoneType: None" and error != "None":
        msg += f"<br><br>Exception/Traceback:<br><br>{error}"

    message = Mail.create(sender)
    message.set_sender_name(f"{sender_name} <{sender}>")

    for email_address in notify_email_list:
        message.add_recipient(f"{email_address.split('@')[0].strip().title()} <{email_address}>")

    if sender not in notify_email_list:
        message.add_bcc_recipient(sender_name)

    message.set_subject(subject)
    message.set_body_html(msg)
    message.send()
