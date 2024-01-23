#!/usr/bin/python
#
# Ensomniac 2024 Ryan Martin, ryan@ensomniac.com
#
# This is meant to be run manually and ran as root

import os
import sys
import json
import time
import shutil

from datetime import datetime
# from subprocess import check_output
# from Dash.Utils import OapiRoot, GetRandomID
# from Dash.LocalStorage import Read, Write


class ServerConfigBackup:
    def __init__(self):

        # self.backup_system()
        self.find_broken_domain_configs()

    @property
    def server_backup_root(self):
        today = datetime.now()
        folder_name = [str(today.year), str(today.month), str(today.day)]
        folder_name = "_".join(folder_name)
        full_path = "/root/server_backup/" + folder_name + "/"

        if not hasattr(self, "_initial_sb_folder_check"):
            # Create 'todays' backup
            self._initial_sb_folder_check = True

            if os.path.exists(full_path):
                shutil.rmtree(full_path)
                time.sleep(0.1)

            os.makedirs(full_path)

        return full_path

    @property
    def vhosts_root(self):
        return "/var/www/vhosts/"

    @property
    def backup_root(self):
        return self.vhosts_root + "system/"

    def backup_system(self):
        backup_filename = "v_www_vhosts_system.zip"
        dest_zip_tmp = os.path.join(self.server_backup_root, backup_filename)

        cmd = "cd " + self.vhosts_root + ";"
        cmd += "zip " + dest_zip_tmp + " system/ -r -q"

        if os.path.exists(dest_zip_tmp):
            os.remove(dest_zip_tmp)
            time.sleep(0.1)

        print("Backing up " + self.backup_root + "...")
        os.system(cmd)

        if not os.path.exists(dest_zip_tmp):
            self.fatal_error("Failed to back up " + dest_zip_tmp)
            sys.exit()

        print("\tSuccess!")
        print("\nUnzipping for ease...")

        # Now unzip it
        cmd = "cd " + self.server_backup_root + ";"
        cmd += "unzip -q " + backup_filename

        print(cmd)
        os.system(cmd)

        expected_system_dir = os.path.join(self.server_backup_root, "system/")
        if not os.path.exists(expected_system_dir):
            self.fatal_error("Failed to unzip " + expected_system_dir)
            sys.exit()

        all_domains = os.listdir(expected_system_dir)
        if len(all_domains) < 5:
            self.fatal_error("Failed to unzip *all* " + expected_system_dir)
            sys.exit()

        print("\tSuccess!")
        print("\nRemoving temporary zip...")
        os.remove(dest_zip_tmp)

    def fatal_error(self, msg):
        print("TODO: Email on error!")
        print("FATAL ERROR", msg)

    def find_broken_domain_configs(self):
        print("find_broken_domain_configs")
        self.gather_all()

    def gather_all(self):

        for domain in os.listdir(self.backup_root):
            # if "altona" not in domain: continue
            self.process_domain(domain)

    def process_domain(self, domain):
        domain_root = os.path.join(self.backup_root, domain)
        config_root = os.path.join(domain_root, "conf/")

        http_conf = os.path.join(config_root, "httpd.conf")
        nginx_conf = os.path.join(config_root, "nginx.conf")
        # vhost_conf = os.path.join(config_root, "vhost.conf")

        has_http_conf = os.path.exists(http_conf)
        has_nginx_conf = os.path.exists(nginx_conf)
        # has_vhost_conf = os.path.exists(vhost_conf)

        has_all = True

        if not has_http_conf:
            has_all = False
        if not has_nginx_conf:
            has_all = False
        # if not has_vhost_conf: has_all = False

        if has_all:
            return

        print("WARN", domain)
        print("\t", "has_http_conf", has_http_conf)
        print("\t", "has_nginx_conf", has_nginx_conf)
        # print("\t", "has_vhost_conf", has_vhost_conf)
        print()

        return

        # cmd = "/usr/local/psa/admin/bin/httpdmng –reconfigure-domain kaiju.network"
        cmd = "/usr/local/psa/admin/bin/httpdmng --reconfigure-domain kaiju.network"

        # ; echo “$domain – success”; done

        # print(config_root, os.path.exists(config_root))

        # print(domain, ">>")
        # for item in os.listdir(domain_root):
        #     print("\t", item)


if __name__ == "__main__":
    ServerConfigBackup()
