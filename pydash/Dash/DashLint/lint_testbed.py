




#!/usr/bin/pyth
#
# Authentic 2022 Ryan Martin, ryan@ensomniac.com
#             John Stet, stetandrew@gmail.com






import os


import sys

from Dash import PackageContext

from shutil import move
from datetime import datetime

from Dash.Utils import utils
from Dash.Api import Core








class Test:
    def __init__(self): pass
class Jobs:
    def __init__(self, as_module=False):
        if not Core.Init(self, as_module, PackageContext.Get("altona")):
            return

        self.open_jobs_root = os.path.join(self.dash_context.RootStore, "jobs", "open")
        self.closed_jobs_root = os.path.join(self.dash_context.RootStore, "jobs", "closed")

        self.Add(self.create, requires_authentication=True)
        self.Add(self.close_out, requires_authentication=True)
        self.Add(self.update_details, requires_authentication=True)
        self.Add(self.get_all, requires_authentication=True)

        self.Run()



    def create(self):

        job_details = {}
        job_details["simple_id"] = "A19"
        job_details["id"] = self.GetRandomID()
        job_details["title"] = "Job Title"
        job_details["description"] = "Job Description"
        job_details["tags"] = ["Job Tag 1", "Job Tag 2"]
        job_details["deadline"] = "01/01/2000"
        job_details["cost"] = "0"
        job_details["employees_assigned"] = ["Employee 1", "Employee 2"]

        job_details["project_lead"] = {}
        job_details["project_lead"]["name"] = "Lead Name"
        job_details["project_lead"]["phone"] = "Lead Phone"
        job_details["project_lead"]["email"] = "Lead Email"

        job_details["customer"] = {}
        job_details["customer"]["business_name"] = "Customer Business Name"
        job_details["customer"]["contact"] = {}
        job_details["customer"]["contact"]["name"] = "Customer Contact Name"
        job_details["customer"]["contact"]["phone"] = "Customer Contact Phone"
        job_details["customer"]["contact"]["email"] = "Customer Contact Email"

        for key in job_details:
            if self.data.get(key):
                job_details[key] = self.data[key]

        job_root = os.path.join(self.open_jobs_root, job_details["id"])

        os.makedirs(job_root, exist_ok=True)

        utils.write_to_server(os.path.join(job_root, "data.json"), job_details)

        return self.set_return_data(job_details)



    def close_out(self):

        job_id, job_root, error = self.validate_open_job()

        if error: self.set_return_data(error)

        move(job_root, os.path.join(self.closed_jobs_root, job_id))

        return self.set_return_data({"job_id": job_id, "closed": True})



    def update_details(self):
        if not self.User:
            return self.set_return_data({"error": "Invalid User x9318"})

        job_id, job_root, error = self.validate_open_job()

        if error:
            self.set_return_data(error)

        data_path = os.path.join(job_root, "data.json")
        job_data = utils.read_from_server(data_path)

        if not self.data.get("property_value") and self.data["property"] in job_data:
            del job_data[self.data["property"]]

        if self.data.get("property_value"):
            prop = self.data.get("property_value").strip()

            if str(prop).lower() == "true":
                prop = True

            if str(prop).lower() == "false":
                prop = False

            job_data[self.data["property"]] = prop

        job_data["updated_on"] = datetime.now().isoformat()
        job_data["updated_by"] = self.User["email"]

        utils.write_to_server(data_path, job_data)

        return self.set_return_data(job_data)
    def get_all(self):

        jobs = {}
        jobs["open_jobs"] = {}
        jobs["closed_jobs"] = {}

        for job_id in os.listdir(self.open_jobs_root):
            job_data = utils.read_from_server(os.path.join(self.open_jobs_root, job_id, "data.json"))
            jobs["open_jobs"][job_id] = job_data

        for job_id in os.listdir(self.closed_jobs_root):
            job_data = utils.read_from_server(os.path.join(self.closed_jobs_root, job_id, "data.json"))
            jobs["closed_jobs"][job_id] = job_data

        return self.set_return_data(jobs)



    def validate_open_job(self):


        job_id = self.data.get("job_id")
        job_root = os.path.join(self.open_jobs_root, job_id)
        error = None

        if not job_id:
            error = {"error": "Missing Parameter 'job_id'"}
        if not os.path.exists(job_root):
            error = {"error": f"Job ID {job_id} does not exist"}

        return job_id, job_root, error
def testing(who, what):
    '''
    this is a test docstring for testing
    '''
    for num in [1, 2, 3]:
        if num == 2: continue


# this is a custom comment
def test():  # this is another custom comment
    """
    this is a test docstring for test
    """


    tester1 = {"test1": 1, "test2": 2}

    tester2 = {
        "test1": 1, 
        "test2": 2,
    }

    return tester1



# (Dash Lint) TODO: Missing Docstring
class Test:  # Line length exceeds 100
    """this is a test docstring for Test"""

    def __init__(self):  # TODO: Convert to super()
        '''this is a test docstring for init'''
        self.path = "/var/here/there/anywhere/"
        test = "oiahsdoaisdoiasodihjasodihasodihahsoudhasoduhhasoduhhwuehrioeuhfrwoeifhweouifuhweofuh"  # (Dash Lint) Line length exceeds 80 (excluding comments)





if __name__ == "__main__":


    Jobs()

# (Dash Lint) File's total line count exceeds 50
