#!/usr/bin/python
#
# Altona 2022 Ryan Martin, ryan@ensomniac.com
#             Andrew Stet, stetandrew@gmail.com

import os
import sys

from googleapiclient.errors import HttpError


def SendEmail(subject, notify_email_list=[], msg="", error="", sender_email="", sender_name="Dash", strict_notify=False):
    from . import OapiRoot

    # This is a temporary stop until we set up Dash to be able to always run this, regardless of server
    if not os.path.exists(OapiRoot):
        raise Exception("The Mail Module can currently only run directly from the server.")

    if strict_notify and not notify_email_list:
        raise Exception("The 'strict_notify' parameter requires 'notify_email_list' to not be empty.")

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

    if "    " in msg:
        msg = msg.replace("    ", "&nbsp;" * 4)

    message = Mail.create(sender_email)

    # DO NOT ADD <sender_email> to this string! Mail handles that :facepalm:
    message.set_sender_name(sender_name)

    for email_address in notify_email_list:
        message.add_recipient(f"{email_address.split('@')[0].strip().title()} <{email_address}>")

    if not strict_notify:
        for email_address in AdminEmails:
            if email_address not in notify_email_list:
                message.add_bcc_recipient(email_address)

        if sender_email not in notify_email_list:
            message.add_bcc_recipient(sender_email)

    message.set_subject(subject)
    message.set_body_html(msg)
    
    try:
        message.send()
    
    # Attempt to decode Google's "unprintable" error
    except HttpError as http_error:
        try:
            raise Exception(
                f'<HttpError {http_error.resp.status} when requesting {http_error.uri} '
                f'returned "{http_error._get_reason().strip()}". Details: "{http_error.error_details}">'
            )
        except:
            try:
                raise Exception(
                    f'<HttpError {http_error.resp.status} when requesting {http_error.uri}. Details: "{http_error.error_details}">'
                )
            except:
                raise Exception(str(http_error))
        
    except Exception as e:
        raise Exception(e)

    return {
        "recipients": notify_email_list,
        "subject": subject,
        "body": msg
    }
