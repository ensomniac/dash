#!/usr/bin/python
#
# Ensomniac 2023 Ryan Martin, ryan@ensomniac.com
#                Andrew Stet, stetandrew@gmail.com
#
# This is meant to be ran INTERACTIVELY
# It will artificially increase disk space on the server, enabling us
# to test what happens as the server fills
#
# Run like this:
# sudo /usr/bin/python /var/www/vhosts/oapi.co/dash/github/dash/pydash/Dash/Server/ServerStressTest.py

import os
import sys
import json
import datetime
import threading
import time
import shutil

from subprocess import check_output
from Dash.Utils import OapiRoot, GetRandomID
from Dash.LocalStorage import Read, Write

class ServerStressTest:
    def __init__(self):

        self.current_gb_index = 0
        self.writing_file = False

        # This script will not run if disk space is above this percenage
        # This script will fill the disk to this percentage before clearing out used files
        self.max_disk_per = 70

        self.preflight()
        self.update()

    @property
    def disk_space_test_root(self):
        # This is the location of a directory that will contain all test data
        return os.path.join(OapiRoot, "dash", "local", "server_stress_test")

    @property
    def artificial_data_root(self):
        # This is the location of a directory that will be filled with fake data
        return os.path.join(self.disk_space_test_root, "artificial_data")

    @property
    def artificial_source_path(self):
        # This is the location of a file that consumes 1GB
        return os.path.join(self.disk_space_test_root, "artificial_source_1gb")

    def conform_path(self, full_path):
        cmd = "sudo chmod 755 " + full_path
        cmd += "; sudo chown ensomniac " + full_path
        cmd += "; sudo chgrp psacln " + full_path
        check_output(cmd, shell=True)

    def get_available_disk_space(self):
        result = check_output("df -h", shell=True).decode()
        result = result.split("% /")[0].strip()
        percent_used = result.split()[-1].strip()

        try:
            percent_used = int(percent_used)
        except:
            raise Exception("Failed to parse output of df -h!")

        return percent_used

    def preflight(self):
        # Clear out anything from prior runs

        if os.path.exists(self.disk_space_test_root):
            os.system("rm -rf " + str(self.disk_space_test_root))
            time.sleep(0.1)

        os.makedirs(self.disk_space_test_root)
        os.makedirs(self.artificial_data_root)

        # Create the fake file that will be used to clone more files...
        with open(self.artificial_source_path, "wb") as out:
            out.seek((1024 * 1024 * 1024) - 1)
            out.write("\0".encode())

        # Turn this into a real file
        shutil.copyfile(self.artificial_source_path, self.artificial_source_path.replace("_1gb", "_1gb_"))
        os.remove(self.artificial_source_path)
        shutil.copyfile(self.artificial_source_path.replace("_1gb", "_1gb_"), self.artificial_source_path)
        os.remove(self.artificial_source_path.replace("_1gb", "_1gb_"))

        # self.artificial_source_path

        self.conform_path(self.disk_space_test_root)
        self.conform_path(self.artificial_data_root)
        self.conform_path(self.artificial_source_path)

        print("READY", self.disk_space_test_root, "...\n")

    def cleanup_all(self):

        # Wait for the last file to write
        while self.writing_file:
            pass

        print("\nCleaning up...")

        if os.path.exists(self.disk_space_test_root):
            os.system("rm -rf " + str(self.disk_space_test_root))
            time.sleep(0.1)

        available_disk_space = self.get_available_disk_space()
        print("Complete. Final disk usage: " + str(available_disk_space) + "%\n")


    def update(self):

        available_disk_space = self.get_available_disk_space()

        if available_disk_space == -1:

            # # Wait for the last file to write
            # while self.writing_file:
            #     pass

            self.cleanup_all()
            return

        if available_disk_space >= self.max_disk_per:
            print("\n\n== Disk space is at target " + str(self.max_disk_per) + "% - stopping tests and cleaning up ==")

            # # Wait for the last file to write
            # while self.writing_file:
            #     pass

            self.cleanup_all()
            return

        threading.Timer(0.1, self.update).start()

        if self.writing_file:
            # Wait for the last file to complete writing
            return

        self.writing_file = True
        artificial_clone_path = os.path.join(self.artificial_data_root, "artificial_source_1gb_" + str(self.current_gb_index))

        msg = "SPACE USED: " + str(available_disk_space) + "%"
        msg += ", writing " + artificial_clone_path.split("/")[-1]
        print(msg)

        # shutil.copyfile(self.artificial_source_path, artificial_clone_path)
        os.system("cp " + self.artificial_source_path + " " + artificial_clone_path)

        print("\tWrote " + artificial_clone_path.split("/")[-1])
        self.writing_file = False

        self.current_gb_index += 1




if __name__ == "__main__":
    ServerStressTest()

