#!/usr/bin/python
#
# Altona 2022 Ryan Martin, ryan@ensomniac.com
#             Andrew Stet, stetandrew@gmail.com

import os
import sys


def SendEmail(subject, notify_email_list=[], msg="", error="", sender_email="", sender_name="Dash"):
    from . import OapiRoot

    # This is a temporary stop until we set up Dash to be able to always run this, regardless of server
    if not os.path.exists(OapiRoot):
        raise Exception("The Mail Module can currently only run directly from the server.")

    import Mail
    from Dash import AdminEmails

    if not sender_email:
        sender_email = AdminEmails[0]

    if not msg:
        msg = subject

    if len(error) and error != "NoneType: None" and error != "None":
        msg += f"<br><br>Exception/Traceback:<br><br>{error}"

    if "\n" in msg:
        msg.strip("\n")

        msg = msg.replace("\n", "<br>")

    if "\t" in msg:
        msg = msg.replace("\t", "&nbsp;" * 4)

    message = Mail.create(sender_email)
    message.set_sender_name(f"{sender_name} <{sender_email}>")

    for email_address in notify_email_list:
        message.add_recipient(f"{email_address.split('@')[0].strip().title()} <{email_address}>")

    for email_address in AdminEmails:
        if email_address not in notify_email_list:
            message.add_bcc_recipient(email_address)

    if sender_email not in notify_email_list:
        message.add_bcc_recipient(sender_email)

    message.set_subject(subject)
    message.set_body_html(msg)
    message.send()

    return {
        "recipients": notify_email_list,
        "subject": subject,
        "body": msg
    }
