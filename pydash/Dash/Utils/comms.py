#!/usr/bin/python
#
# Altona 2022 Ryan Martin, ryan@ensomniac.com
#             Andrew Stet, stetandrew@gmail.com

import os
import sys


def SendEmail(
        subject, notify_email_list=[], msg="", error="", sender_email="", sender_name="Dash", strict_notify=False,
        reply_to_email="", reply_to_name="", bcc_email_list=[], attachment_file_paths=[], ensure_sender_gets_copied=True
):
    from . import OapiRoot

    # TODO: Remove this once the Mail module is migrated to Dash
    if not os.path.exists(OapiRoot):
        raise Exception("The Mail Module can currently only run directly from the server.")

    if strict_notify and not notify_email_list:
        raise Exception("The 'strict_notify' parameter requires 'notify_email_list' to not be empty.")

    from Mail import create  # noqa
    from Dash import AdminEmails
    from googleapiclient.errors import HttpError

    # If sender email is not in AdminEmails, it will typically be an alternate email that we Dash admins control,
    # we don't want to get the emails sent to both addresses. Sending it to our primary addresses is sufficient. It
    # should be fine to make this change here at this global level, but we can update if it ends up affecting future things.
    if sender_email not in AdminEmails:
        ensure_sender_gets_copied = False

    error = str(error)

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

    message = create(sender_email)

    # DO NOT ADD <sender_email> to this string! Mail handles that :facepalm:
    message.set_sender_name(sender_name)

    for email_address in notify_email_list:
        message.add_recipient(f"{email_address.split('@')[0].strip().title()} <{email_address}>")

    if not strict_notify:
        for email_address in AdminEmails:
            if email_address not in notify_email_list and email_address not in bcc_email_list:
                message.add_bcc_recipient(email_address)

        if ensure_sender_gets_copied and sender_email not in notify_email_list and sender_email not in bcc_email_list:
            message.add_bcc_recipient(sender_email)

    if bcc_email_list:
        for email in bcc_email_list:
            message.add_bcc_recipient(email)

    if reply_to_email:
        message.set_reply_to(reply_to_email, reply_to_name)

    if attachment_file_paths:
        for file_path in attachment_file_paths:
            message.add_attachment(file_path)

    message.set_subject(subject)
    message.set_body_html(msg)
    
    try:
        message.send()
    
    # Attempt to decode Google's "unprintable" error
    except HttpError as http_error:
        try:
            raise Exception(
                f'<HttpError {http_error.resp.status} when requesting {http_error.uri} '
                f'returned "{http_error._get_reason().strip()}". Details: "{http_error.error_details}">'  # noqa
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
        "recipients": message.recipients,
        "subject": subject,
        "body": msg,
        "attachments": message.attachment_file_paths,
        "sender": sender_email,
        "reply_to": reply_to_email,
        "bcc_recipients": message.bcc_recipients
    }
