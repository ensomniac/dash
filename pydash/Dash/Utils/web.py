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

    def __init__(
        self, headless=True, wait_timeout_sec=15, profile_root="",
        extra_stealth=False, cookies_path="", proxy_url=""
    ):
        self.headless = headless
        self.wait_timeout_sec = wait_timeout_sec
        self.profile_root = profile_root  # Default to NO profile, otherwise, must explicitly provide one
        self.extra_stealth = extra_stealth  # Defaults to False because it may be over-kill for some sites
        self.cookies_path = cookies_path  # Enables cookie management across sessions

        # For when the server's IP is blocked/restricted by certain
        # sites (only use legit providers, such as BrightData)
        self.proxy_url = proxy_url

        # This actually doesn't matter, because it'll just be auto-created in this case
        # if self.profile_root and not os.path.exists(self.profile_root):
        #     raise FileNotFoundError(f"Profile root does not exist: {self.profile_root}")

        if self.cookies_path and not self.cookies_path.endswith(".pkl"):
            raise ValueError("Cookies path must end with '.pkl' extension (cookies get pickled)")

        from Dash.Utils import OapiRoot  # Leave this here, can't be top-level import

        self.waits = {}
        self.virtual_display = False
        self.repositioned_window = False
        self._on_server = os.path.exists(OapiRoot)

        if self._on_server and not self.headless:
            # Ex:
            #     Xvfb (recommended):
            #         - Requires a VNC client on local machine
            #             - TigerVNC works great for this, Apple's built-in Screen Sharing app doesn't
            #         - Make sure no one else is using Xvfb
            #           (use different display numbers if simultaneous work is required)
            #         - [TERMINAL 1]
            #             - Access the server as normal via `ssh user@ipaddress`
            #             - (If no one else is using Xvfb)
            #               Make sure there are no active sessions via `sudo killall Xvfb`
            #               (also run `sudo rm /tmp/.X99-lock` for good measure)
            #             - Start virtual display session via `Xvfb :99 -screen 0 1920x1080x24 &`
            #             - Set DISPLAY via `export DISPLAY=:99`
            #             - Start VNC session via `x11vnc -display :99 -nopw -listen localhost -xkb &`
            #         - [TERMINAL 2]
            #             - Access the server via `ssh -L 5900:localhost:5900 user@ipaddress`
            #             - Set DISPLAY via `export DISPLAY=:99`
            #         - Connect VNC client to `localhost:5900`
            #         - [TERMINAL 2]
            #             - Run the server script that uses this class
            #             - Any graphics will be automatically routed to the VNC client
            #             - If you need to use Chrome, simply run `google-chrome-stable`
            #         - [TERMINAL 1]
            #             - (If no one else is using Xvfb)
            #               Cleanup session via `sudo killall Xvfb`
            #
            #     X11 (not fully worked out):
            #         - Requires XQuartz on local machine
            #         - Access the server via `ssh -Y user@ipaddress`
            #         - DISPLAY will already be populated
            #         - Run the server script that uses this class
            #         - X11 will automatically open a window on local machine to route graphics
            #             - There are unresolved errors with this approach that cause it to not
            #               work reliably with selenium, and I dropped it after two hours wasted.
            #               This is the simplest approach for non-selenium graphics routing, though.
            if not os.environ.get("DISPLAY"):
                raise EnvironmentError("Headed mode requires DISPLAY env var to be set, either via X11 or Xvfb")

            if not os.environ.get("XAUTHORITY"):  # Required for X11
                os.environ["XAUTHORITY"] = os.path.expanduser("~/.Xauthority")

            self.virtual_display = True

    @property
    def driver(self):
        if not hasattr(self, "_driver"):
            from selenium_stealth import stealth

            if self.proxy_url:
                from seleniumwire.undetected_chromedriver import Chrome, ChromeOptions
            else:
                from undetected_chromedriver import Chrome, ChromeOptions

            options = None
            mac = sys.platform == "darwin"

            if self._on_server:
                if options is None:
                    options = ChromeOptions()

                # After upgrading, there were intermittent conflicts and I can't
                # seem to track it down, so explicitly setting this seems to solve it
                options.binary_location = os.path.join("/usr", "bin", "google-chrome-stable")

            if self.profile_root:
                if options is None:
                    options = ChromeOptions()

                split = self.profile_root.strip(os.path.sep).split(os.path.sep)
                profile = split.pop()
                root = os.path.sep + os.path.join(*split)  # noqa

                options.add_argument(f"--user-data-dir={root}")
                options.add_argument(f"--profile-directory={profile}")

                if self.virtual_display:
                    self.clear_profile_lock_files(self.profile_root)

            if self.extra_stealth:
                if options is None:
                    options = ChromeOptions()

                if self.headless:
                    options.add_argument("--window-size=1920,1080")

                if mac:
                    options.add_argument("--dns-prefetch-disable")

            args = {}

            if self.proxy_url:
                args["seleniumwire_options"] = {
                    "proxy": {
                        "http": self.proxy_url,
                        "https": self.proxy_url
                    },
                    "disable_capture": True
                }

            if not self.virtual_display:
                args["headless"] = self.headless

            if options:  # Keep this last
                args["options"] = options

            self._driver = Chrome(**args)

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
            if self.headless or self._on_server:
                self._auto_gui = None  # Doesn't work in headless mode or on the server
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
            try:
                self.RandomScroll().RandomDelay()
            except:
                pass

        self.driver.quit()

        self.waits = {}
        self.repositioned_window = False

        delattr(self, "_driver")

    def LoadPage(self, url, post_delay=True):
        self.driver.get(url)

        self.on_page_load(post_delay)

        return self

    def ReloadPage(self, post_delay=True):
        self.driver.refresh()

        self.on_page_load(post_delay)

        return self

    def GetPageTitle(self):
        return self.driver.title

    def GetPageURL(self):
        return self.driver.current_url

    def EnableTrafficInterception(self):
        self.driver.execute_cdp_cmd("Network.enable", {})

        return self

    def GetRequestResponse(self, request_id):
        return self.driver.execute_cdp_cmd("Network.getResponseBody", {"requestId": request_id})

    def PopulateInput(self, input_el, text, is_file_input=False):
        if self.extra_stealth and not is_file_input:
            for char in text:
                input_el.send_keys(char)

                sleep(uniform(0.1, 0.3))
        else:
            input_el.send_keys(text)

        return self

    def UnFocusInput(self, input_el):
        self.driver.execute_script("arguments[0].blur();", input_el)

        return self

    def ClearInput(self, input_el, custom_element=False):
        if custom_element:
            input_el.send_keys(f"{self.keys.CONTROL if self._on_server else self.keys.COMMAND}a")
            input_el.send_keys(self.keys.BACKSPACE)
        else:
            input_el.clear()

        return self

    def SubmitInput(self, input_el):
        input_el.send_keys(self.keys.RETURN)

        return self

    def HideElement(self, element):
        self.driver.execute_script("arguments[0].style.display = 'none';", element)

        return self

    def RemoveElement(self, element):
        self.driver.execute_script("arguments[0].remove();", element)

        return self

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

        return self

    def MakeDropdownSelection(self, dropdown, value="", label_text=""):
        if value:
            dropdown.select_by_value(value)

        elif label_text:
            dropdown.select_by_visible_text(label_text)

        else:
            raise ValueError("Must provide either value or label_text")

        self.driver.execute_script(
            "arguments[0].dispatchEvent(new Event('change', {bubbles: true}));",
            dropdown._el  # noqa
        )

        sleep(0.5)

        return self

    def GetDropdownOptions(
        self, dropdown, values_only=False, ignore_no_value=False,
        as_elements=False, enforce_uniqueness=False
    ):
        if enforce_uniqueness:
            values = []
            options = []

            for option in dropdown.options:
                value = option.get_attribute("value")

                if (ignore_no_value and not value) or value in values:
                    continue

                values.append(option.get_attribute("value"))

                options.append(option)

            if as_elements:
                return options

            if values_only:
                return values

            return [
                {option.get_attribute("value"): option.text}
                for option in options
            ]

        if as_elements:
            return dropdown.options

        if values_only:
            return [
                option.get_attribute("value")
                for option in dropdown.options
                if (option.get_attribute("value") if ignore_no_value else True)
            ]

        return [
            {option.get_attribute("value"): option.text}
            for option in dropdown.options
            if (option.get_attribute("value") if ignore_no_value else True)
        ]

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

    def ScrollToElement(self, element, post_delay=True):
        self.driver.execute_script("arguments[0].scrollIntoView();", element)

        if post_delay:
            self.RandomDelay()

        return self

    def MoveMouse(self, x=-1, y=-1, to_element=None, headless_delay=True):
        if to_element is None and (x == -1 or y == -1):
            raise ValueError("Must supply either an element or x/y coordinates")

        if not self.auto_gui:
            if self.headless and headless_delay:
                self.RandomDelay()

            return self

        if to_element:
            x, y = self.get_element_center_coords(to_element)

        self.auto_gui.moveTo(
            x,
            y + 120,  # Add padding for Chrome's top gui
            duration=uniform(0.5, 1.2)
        )

        return self

    # This should typically be done after logging in and will only save if it doesn't exist (unless forced)
    def SaveCookies(self, force=False):
        if not self.cookies_path:
            raise ValueError("Cookies path not set")

        if os.path.exists(self.cookies_path) and not force:
            return self

        from pickle import dump as dump_pickle

        with open(self.cookies_path, "wb") as file:
            dump_pickle(self.driver.get_cookies(), file)

        return self

    def WaitForElement(
        self, el_id="", el_name="", el_class="", css_selector="", xpath="",
        wait_timeout_sec_override=0, for_click=False, is_dropdown=False, for_multiple=False,
        to_be_removed=False, must_exist=True, _stale_retry=False
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
        :param bool is_dropdown: Wait for a dropdown element, returning a `Select` (default=False)
        :param bool for_multiple: Wait for multiple elements, returned as a `list` (default=False)
        :param bool to_be_removed: Wait for the element to disappear or become stale (default=False)
        :param bool must_exist: Raise an exception if the element isn't found (default=True)
        :param bool _stale_retry: For internal use only (default=False)

        :return: The expected element. If `is_dropdown` is True, a Select instance
                 is returned. If `for_multiple` is True, a list of elements is returned.
        :rtype: selenium.webdriver.remote.webelement.WebElement
                or selenium.webdriver.support.ui.Select
                or list[selenium.webdriver.remote.webelement.WebElement]
        """

        from selenium.common.exceptions import TimeoutException, StaleElementReferenceException

        wait = self.get_wait(wait_timeout_sec_override)
        locator = self.get_locator(el_id, el_name, el_class, css_selector, xpath)

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
                element = wait.until(
                    self.ec.element_to_be_clickable(locator) if for_click
                    else self.ec.presence_of_all_elements_located(locator) if for_multiple
                    else self.ec.presence_of_element_located(locator)
                )

                if for_multiple:
                    return element

                if is_dropdown:
                    from selenium.webdriver.support.ui import Select

                    return Select(element)

                return element

        except StaleElementReferenceException as e:
            if _stale_retry:
                raise Exception(
                    f"Failed to find valid '{locator[0]}' element ({locator[1]}), found to be stale twice"
                ) from e

            # Retry one more time
            return self.WaitForElement(
                el_id=el_id,
                el_name=el_name,
                el_class=el_class,
                css_selector=css_selector,
                xpath=xpath,
                wait_timeout_sec_override=wait_timeout_sec_override,
                for_click=for_click,
                is_dropdown=is_dropdown,
                must_exist=must_exist,
                _stale_retry=True
            )

        except TimeoutException as e:
            if to_be_removed:
                return False

            if not must_exist:
                return None

            raise TimeoutException(
                f"Failed to find '{locator[0]}' element ({locator[1]}) within timeout "
                f"({wait_timeout_sec_override or self.wait_timeout_sec} secs)"
            ) from e

    # See docstring of WaitForElement, params are shared
    def FindChildElement(
        self, parent_el, el_id="", el_name="", el_class="", css_selector="",
        xpath="", for_multiple=False, must_exist=True, _stale_retry=False
    ):
        from selenium.common.exceptions import NoSuchElementException, StaleElementReferenceException

        locator = self.get_locator(el_id, el_name, el_class, css_selector, xpath)

        try:
            if for_multiple:
                return parent_el.find_elements(*locator)

            return parent_el.find_element(*locator)

        except StaleElementReferenceException as e:
            if _stale_retry:
                raise Exception(
                    f"Failed to find valid '{locator[0]}' element ({locator[1]}), found to be stale twice"
                ) from e

            # Retry one more time
            return self.FindChildElement(
                parent_el=parent_el,
                el_id=el_id,
                el_name=el_name,
                el_class=el_class,
                css_selector=css_selector,
                xpath=xpath,
                for_multiple=for_multiple,
                must_exist=must_exist,
                _stale_retry=True
            )

        except NoSuchElementException as e:
            if not must_exist:
                return None

            raise NoSuchElementException(
                f"Failed to find '{locator[0]}' element ({locator[1]}) in parent element"
            ) from e

    def on_page_load(self, post_delay=True):
        if post_delay:
            self.RandomDelay()

        if not self.repositioned_window and self.auto_gui:
            self.driver.set_window_position(0, 0)  # For auto_gui

            self.repositioned_window = True

    def get_locator(self, el_id="", el_name="", el_class="", css_selector="", xpath=""):
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

        return locator

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

    def clear_profile_lock_files(self, profile_dir):
        from glob import glob

        patterns = [
            os.path.join(profile_dir, "SingletonLock"),
            os.path.join(profile_dir, "SingletonSocket*"),
            os.path.join(profile_dir, "SingletonCookie")
        ]

        for pattern in patterns:
            for lock_file in glob(pattern):
                os.remove(lock_file)

        lock_path = os.path.join(profile_dir, "LOCK")

        if os.path.exists(lock_path):
            os.remove(lock_path)
