#!/usr/bin/python
#
# Ensomniac 2025 Ryan Martin, ryan@ensomniac.com
#                Andrew Stet, stetandrew@gmail.com

import os
import sys

from time import sleep
from random import uniform, randint


class WebCrawler:
    _by: callable
    _ec: callable
    _keys: callable
    _driver: callable
    _actions: callable
    _auto_gui: callable

    def __init__(self, headless=True, wait_timeout_sec=15, profile_root="", extra_stealth=False, cookies_path=""):
        from Dash.Utils import OapiRoot

        self.headless = headless
        self.wait_timeout_sec = wait_timeout_sec
        self.profile_root = profile_root  # Default to NO profile, otherwise, must explicitly provide one
        self.extra_stealth = extra_stealth  # Defaults to False because it may be over-kill for some sites
        self.cookies_path = cookies_path

        if self.profile_root and not os.path.exists(self.profile_root):
            raise FileNotFoundError(f"Profile root does not exist: {self.profile_root}")

        if self.cookies_path and not self.cookies_path.endswith(".pkl"):
            raise ValueError("Cookies path must end with '.pkl' extension (cookies get pickled)")

        self.waits = {}
        self.repositioned_window = False
        self._on_server = os.path.exists(OapiRoot)

        if self._on_server and not self.headless:
            # When needed, figure out how to do this with a virtual display (ex: Xvfb)
            raise NotImplementedError("Headed mode still needs to be implemented")

    @property
    def driver(self):
        if not hasattr(self, "_driver"):
            from selenium_stealth import stealth
            from undetected_chromedriver import Chrome, ChromeOptions

            options = None
            mac = sys.platform == "darwin"

            if self.profile_root:
                if options is None:
                    options = ChromeOptions()

                split = self.profile_root.strip(os.path.sep).split(os.path.sep)
                profile = split.pop()
                root = os.path.sep + os.path.join(*split)  # noqa

                options.add_argument(f"--user-data-dir={root}")
                options.add_argument(f"--profile-directory={profile}")

            if self.extra_stealth:
                if options is None:
                    options = ChromeOptions()

                if self.headless:
                    options.add_argument("--window-size=1920,1080")

                if mac:
                    options.add_argument("--dns-prefetch-disable")

            if options:
                self._driver = Chrome(
                    headless=self.headless,
                    options=options
                )
            else:  # In this case, we don't want to supply a default `options` object
                self._driver = Chrome(headless=self.headless)

            stealth(
                driver=self._driver,
                languages=["en-US", "en"],
                platform="MacIntel" if mac else "Linux",
                fix_hairline=True
            )

            if self.cookies_path and os.path.exists(self.cookies_path):
                from pickle import load as load_pickle

                with open(self.cookies_path, "rb") as file:
                    for cookie in load_pickle(file):
                        self.driver.add_cookie(cookie)

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

    @property
    def auto_gui(self):
        if not hasattr(self, "_auto_gui"):
            if self.headless:
                self._auto_gui = None  # Doesn't work in headless mode
            else:
                import pyautogui

                self._auto_gui  = pyautogui

        return self._auto_gui

    @property
    def actions(self):
        if not hasattr(self, "_actions"):
            from selenium.webdriver import ActionChains

            self._actions = ActionChains(self.driver)

        return self._actions

    def Quit(self):
        if self.extra_stealth:
            self.RandomScroll().RandomDelay()

        self.driver.quit()

        self.waits = {}
        self.repositioned_window = False

        delattr(self, "_driver")

    def LoadPage(self, url, post_delay=True):
        self.driver.get(url)

        if post_delay:
            self.RandomDelay()

        if not self.repositioned_window and not self.headless:
            self.driver.set_window_position(0, 0)  # For auto_gui

            self.repositioned_window = True

    def GetPageTitle(self):
        return self.driver.title

    def PopulateInput(self, input_el, text, is_file_input=False):
        if self.extra_stealth and not is_file_input:
            for char in text:
                input_el.send_keys(char)

                sleep(uniform(0.1, 0.3))
        else:
            input_el.send_keys(text)

    def ClearInput(self, input_el, custom_element=False):
        if custom_element:
            input_el.send_keys(f"{self.keys.CONTROL if self._on_server else self.keys.COMMAND}a")
            input_el.send_keys(self.keys.BACKSPACE)
        else:
            input_el.clear()

    def SubmitInput(self, input_el):
        input_el.send_keys(self.keys.RETURN)

    def ClickElement(self, element, headless_delay=True, attempt=1):
        if attempt == 1:
            if self.extra_stealth:
                self.MoveMouse(
                    to_element=element,
                    headless_delay=headless_delay
                )

            # This is unaware of success, so manual checks are necessary,
            # such as checking for expected visual changes. If those manual
            # checks fail, the below approaches may help, depending on the scenario.
            element.click()

        elif attempt == 2:
            self.actions.move_to_element(element).click().perform()

        elif attempt == 3:
            self.driver.execute_script("arguments[0].click();", element)

        else:
            raise ValueError("Invalid attempt number")

    def RandomDelay(self):
        sleep(uniform(0.5, 2.0))

        return self

    def RandomScroll(self, post_delay=True):
        scroll_height = self.driver.execute_script("return document.body.scrollHeight")
        current_position = self.driver.execute_script("return window.pageYOffset")
        max_scroll = min(scroll_height - current_position, randint(50, 300))

        if max_scroll > 0:  # Only scroll if there's room
            self.driver.execute_script(f"window.scrollBy(0, {max_scroll});")

            if post_delay:
                self.RandomDelay()

        return self

    def MoveMouse(self, x=-1, y=-1, to_element=None, headless_delay=True):
        if to_element is None and (x == -1 or y == -1):
            raise ValueError("Must supply either an element or x/y coordinates")

        if self.headless:
            if headless_delay:
                self.RandomDelay()

            return self

        if to_element:
            x, y = self.get_element_center_coords(to_element)

        self.auto_gui.moveTo(
            x,
            y,
            duration=uniform(0.5, 1.2)
        )

        return self

    # This should typically be done after logging in and will only save if it doesn't exist (unless forced)
    def SaveCookies(self, force=False):
        if not self.cookies_path:
            raise ValueError("Cookies path not set")

        if os.path.exists(self.cookies_path) and not force:
            return

        from pickle import dump as dump_pickle

        with open(self.cookies_path, "wb") as file:
            dump_pickle(self.driver.get_cookies(), file)

    def WaitForElement(
        self, el_id="", el_name="", el_class="", css_selector="", xpath="",
        wait_timeout_sec_override=0, for_click=False, to_be_removed=False, must_exist=True, _stale_retry=False
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
        :param bool to_be_removed: Wait for the element to disappear or become stale (default=False)
        :param bool must_exist: Raise an exception if the element isn't found (default=True)
        :param bool _stale_retry: For internal use only (default=False)

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

        from selenium.common.exceptions import TimeoutException, StaleElementReferenceException

        wait = self.get_wait(wait_timeout_sec_override)

        try:
            if to_be_removed:
                from selenium.common.exceptions import NoSuchElementException

                try:
                    return wait.until(self.ec.invisibility_of_element_located(locator))

                except NoSuchElementException:
                    return True

                except:
                    try:
                        return wait.until(self.ec.staleness_of(locator))

                    except NoSuchElementException:
                        return True
            else:
                return wait.until(
                    self.ec.element_to_be_clickable(locator) if for_click
                    else self.ec.presence_of_element_located(locator)
                )

        except StaleElementReferenceException as e:
            if _stale_retry:
                raise Exception(
                    f"Failed to find valid '{locator[0]}' element ({locator[1]}), found to be stale twice"
                ) from e

            # Retry one more time
            return self.WaitForElement(
                el_id, el_name, el_class, css_selector, xpath,
                wait_timeout_sec_override, for_click, must_exist, _stale_retry=True
            )

        except TimeoutException as e:
            if to_be_removed:
                return False

            if not must_exist:
                return None

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

    def get_element_center_coords(self, element):
        return (
            element.location["x"] + (element.size["width"] * 0.5),
            element.location["y"] + (element.size["height"] * 0.5)
        )
