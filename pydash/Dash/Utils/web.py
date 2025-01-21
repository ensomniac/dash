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
    _wait: callable
    _driver: callable

    def __init__(self, headless=True, wait_timeout_sec=10):
        self.headless = headless
        self.wait_timeout_sec = wait_timeout_sec

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
    def wait(self):
        if not hasattr(self, "_wait"):
            from selenium.webdriver.support.ui import WebDriverWait

            self._wait = WebDriverWait(self.driver, self.wait_timeout_sec)

        return self._wait

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

        delattr(self, "_wait")
        delattr(self, "_driver")

    def LoadPage(self, url):
        self.driver.get(url)

    def GetPageTitle(self):
        return self.driver.title

    def PopulateInput(self, input_el, text=""):
        input_el.send_keys(text)

    def SubmitInput(self, input_el):
        input_el.send_keys(self.keys.RETURN)

    def WaitForElement(self, el_id="", el_name="", el_class="", css_selector="", xpath=""):
        """
        Supply one of the allowed params to wait for, and return, an expected element.

        :param el_id: `id` attribute of the element
        :param el_name: `name` attribute of the element
        :param el_class: `class` attribute of the element
        :param css_selector: Example format: `input[type='password']`
        :param xpath: Example format: `//*[@id="username"]/div[2]/div/div[2]/input`

        :return: Element
        """

        if el_id:
            return self.wait.until(self.ec.presence_of_element_located((self.by.ID, el_id)))

        if el_name:
            return self.wait.until(self.ec.presence_of_element_located((self.by.NAME, el_name)))

        if el_class:
            return self.wait.until(self.ec.presence_of_element_located((self.by.CLASS_NAME, el_class)))

        if css_selector:
            return self.wait.until(self.ec.presence_of_element_located((self.by.CSS_SELECTOR, css_selector)))

        if xpath:
            return self.wait.until(self.ec.presence_of_element_located((self.by.XPATH, xpath)))

        raise ValueError("Must supply one of the following params: el_id, el_name, class_name, css_selector, xpath")
