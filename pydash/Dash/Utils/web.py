#!/usr/bin/python
#
# Ensomniac 2025 Ryan Martin, ryan@ensomniac.com
#                Andrew Stet, stetandrew@gmail.com

import os
import sys


class WebCrawler:
    _by: callable
    _ec: callable
    _keys: callable
    _driver: callable

    def __init__(self, headless=True, wait_timeout_sec=15):
        from Dash.Utils import OapiRoot

        self.headless = headless
        self.wait_timeout_sec = wait_timeout_sec

        self.waits = {}
        self._on_server = os.path.exists(OapiRoot)

        if not self.headless and self._on_server:
            # TODO: Figure out how to do this with a virtual display (ex: using Xvfb)
            raise NotImplementedError("Headed mode still needs to be implemented")

    @property
    def driver(self):
        if not hasattr(self, "_driver"):
            from selenium_stealth import stealth
            from undetected_chromedriver import Chrome

            self._driver = Chrome(headless=self.headless)

            stealth(
                driver=self._driver,
                languages=["en-US", "en"],
                platform="Linux",
                fix_hairline=True
            )

        return self._driver

    @property
    def by(self):
        if not hasattr(self, "_by"):
            from selenium.webdriver.common.by import By

            self._by = By

        return self._by

    @property
    def ec(self):
        if not hasattr(self, "_ec"):
            from selenium.webdriver.support import expected_conditions

            self._ec = expected_conditions

        return self._ec

    @property
    def keys(self):
        if not hasattr(self, "_keys"):
            from selenium.webdriver.common.keys import Keys

            self._keys = Keys

        return self._keys

    def Quit(self):
        self.driver.quit()

        self.waits = {}

        delattr(self, "_driver")

    def LoadPage(self, url):
        self.driver.get(url)

    def GetPageTitle(self):
        return self.driver.title

    def PopulateInput(self, input_el, text=""):
        input_el.send_keys(text)

    def ClearInput(self, input_el, custom_element=False):
        if custom_element:
            input_el.send_keys(f"{self.keys.CONTROL if self._on_server else self.keys.COMMAND}a")
            input_el.send_keys(self.keys.BACKSPACE)
        else:
            input_el.clear()

    def SubmitInput(self, input_el):
        input_el.send_keys(self.keys.RETURN)

    def WaitForElement(
        self, el_id="", el_name="", el_class="", css_selector="", xpath="",
        wait_timeout_sec_override=0, for_click=False
    ):
        """
        Supply one of the allowed params to wait for, and return, an expected element.

        :param str el_id: `id` attribute of the element (default="")
        :param str el_name: `name` attribute of the element (default="")
        :param str el_class: `class` attribute of the element (default="")
        :param str css_selector: Example format: `input[type='password']` (default="")
        :param str xpath: Example format: `//*[@id="username"]/div[2]/div/div[2]/input` (default="")
        :param int wait_timeout_sec_override: Override the class' default wait timeout (default=0)
        :param bool for_click: Wait for the element (usually a button) to be clickable (default=False)

        :return: Element
        :rtype: selenium.webdriver.remote.webelement.WebElement
        """

        if el_id:
            locator = (self.by.ID, el_id)

        elif el_name:
            locator = (self.by.NAME, el_name)

        elif el_class:
            locator = (self.by.CLASS_NAME, el_class)

        elif css_selector:
            locator = (self.by.CSS_SELECTOR, css_selector)

        elif xpath:
            locator = (self.by.XPATH, xpath)

        else:
            raise ValueError(
                "Must supply one of the following params: el_id, el_name, class_name, css_selector, xpath"
            )

        from selenium.common.exceptions import TimeoutException

        try:
            return self.get_wait(wait_timeout_sec_override).until(
                self.ec.element_to_be_clickable(locator) if for_click
                else self.ec.presence_of_element_located(locator)
            )

        except TimeoutException as e:
            raise Exception(
                f"Failed to find '{locator[0]}' element ({locator[1]}) within timeout "
                f"({wait_timeout_sec_override or self.wait_timeout_sec} secs)"
            ) from e

    def get_wait(self, timeout_sec=0):
        if not timeout_sec:
            timeout_sec = self.wait_timeout_sec

        if timeout_sec not in self.waits:
            from selenium.webdriver.support.ui import WebDriverWait

            self.waits[timeout_sec] = WebDriverWait(self.driver, timeout_sec)

        return self.waits[timeout_sec]
