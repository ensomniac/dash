#!/usr/bin/python
#
# Ensomniac 2026 Ryan Martin, ryan@ensomniac.com
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
    _dash_context: dict
    _fake_display: callable

    def __init__(
        self, headless=True, wait_timeout_sec=15, profile_root="",
        extra_stealth=False, proxy_url="", file_storage_root="", use_fake_display=False
    ):
        self.headless = headless
        self.wait_timeout_sec = wait_timeout_sec
        self.profile_root = profile_root  # Default to NO profile, otherwise, must explicitly provide one
        self.extra_stealth = extra_stealth  # Defaults to False because it's overkill for most cases

        # This essentially mimics the Xvfb flow outlined below, but is NOT for actually viewing the graphics
        # via routing/tunneling to a VNC. This should only be used to replace an automated HEADLESS flow when
        # absolutely necessary. For example, if there is a captcha challenge that is only being presented in
        # a headless flow and cannot be resolved (ex: DistroKid), this can make the headless mode work more
        # like headed mode and potentially get around those types of issues.
        self.use_fake_display = use_fake_display

        # For when the server's IP is blocked/restricted by certain
        # sites (only use legit providers, such as BrightData)
        self.proxy_url = proxy_url

        self.file_storage_root = file_storage_root

        from Dash.Utils import OapiRoot  # Leave this here, can't be a top-level import

        self.logs = []
        self.waits = {}
        self.screenshots = []
        self.repositioned_window = False
        self.using_virtual_display = False
        self.virtual_display_size_w = 1920
        self.virtual_display_size_h = 1080
        self._on_server = os.path.exists(OapiRoot)

        if self.use_fake_display:
            if self.headless:  # Make sure this is deliberate, intentional, and informed
                raise ValueError("Headless must be False when using a fake display")

            if not self._on_server:
                raise EnvironmentError(
                    "Running a fake display is intended for the server only. Headed mode on your "
                    "local machine can be run normally through your browser, without a fake display."
                )

        if not self.headless:
            if self.use_fake_display:
                self.using_virtual_display = True

            elif self._on_server:
                # Ex:
                #     Xvfb (recommended):
                #         - Requires a VNC client on local machine
                #             - TigerVNC works great for this, Apple's built-in Screen Sharing app doesn't
                #         - Make sure no one else is using Xvfb
                #           (use different display numbers if simultaneous work is required)
                #         - [TERMINAL 1]
                #             - Access the server as normal via `ssh user@ipaddress`
                #             - (If no one else is using Xvfb)
                #               Make sure there are no active sessions via `killall Xvfb`
                #               (also run `rm /tmp/.X99-lock` for good measure)
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
                #             - If you need to use Chrome, simply run:
                #               `google-chrome-stable --no-sandbox --window-size=1920,1080`
                #         - [TERMINAL 1]
                #             - (If no one else is using Xvfb)
                #               Cleanup session via `killall Xvfb`
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

                self.using_virtual_display = True

    @property
    def driver(self):
        if not hasattr(self, "_driver"):
            from selenium_stealth import stealth

            if self.use_fake_display:
                self.fake_display.start()

                sleep(3)  # Arbitrary buffer, might be unnecessary

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
                options.binary_location = os.path.join("/opt", "google", "chrome", "google-chrome")

            if self.profile_root:
                if options is None:
                    options = ChromeOptions()

                split = self.profile_root.strip(os.path.sep).split(os.path.sep)
                profile = split.pop()
                root = os.path.sep + os.path.join(*split)  # noqa

                options.add_argument(f"--user-data-dir={root}")
                options.add_argument(f"--profile-directory={profile}")

                if self.using_virtual_display:
                    self.clear_profile_lock_files(self.profile_root)

            if self.extra_stealth:
                if options is None:
                    options = ChromeOptions()

                if self.headless:
                    options.add_argument(f"--window-size={self.virtual_display_size_w},{self.virtual_display_size_h}")

                if mac:
                    options.add_argument("--dns-prefetch-disable")

            args = {
                # There is a rare, temporary scenario where undetected_chromedriver auto-updates and
                # expects a specific Chromium version, but `dnf upgrade google-chrome-stable` results
                # in no changes because that version is not yet available in DNF's stable stream.
                # In that case, we can explicitly specify the latest available Chromium version
                # (`google-chrome-stable --version`) for undetected_chromedriver as a temporary solution
                # while periodically checking the stable stream for the new version via the upgrade call
                # above. Once successfully upgraded, comment-out the explicit version.
                # "version_main": 136
            }

            if self.proxy_url:
                args["seleniumwire_options"] = {
                    "proxy": {
                        "http": self.proxy_url,
                        "https": self.proxy_url
                    },
                    "disable_capture": True
                }

            if not self.using_virtual_display:
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

        return self._driver

    @property
    def fake_display(self):
        if not hasattr(self, "_fake_display"):
            from pyvirtualdisplay import Display

            self._fake_display = Display(size=(self.virtual_display_size_w, self.virtual_display_size_h))

        return self._fake_display

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

    @property
    def dash_context(self):
        if not hasattr(self, "_dash_context"):
            if self._on_server:
                from Dash.Utils import Memory

                self._dash_context = Memory.DashContext
            else:
                self._dash_context = None

        return self._dash_context

    # Don't ever call this in this class, it's too presumptive and will inevitably cause external logic
    # to break. It should only ever be called deliberately when an external script is finished running.
    def Quit(self):
        if hasattr(self, "_driver"):
            if self.extra_stealth:
                try:
                    self.RandomScroll().RandomDelay()
                except:
                    pass

            self.driver.quit()

            delattr(self, "_driver")

        if hasattr(self, "_fake_display"):
            self.fake_display.stop()

            delattr(self, "_fake_display")

        self.waits = {}
        self.repositioned_window = False

    def LoadPage(self, url, post_delay=True):
        if url == self.GetPageURL():
            return self.ReloadPage()

        from selenium.common.exceptions import WebDriverException, SessionNotCreatedException

        retry_limit = 3

        for n in range(retry_limit):
            self.log(f"Loading {url} (attempt {n + 1}/{retry_limit})")

            try:
                self.driver.get(url)

                self.on_page_load(post_delay)

                return self

            except SessionNotCreatedException:
                raise

            except WebDriverException as e:
                self.log(f"\tFailed, error: {e}")

                if (n + 1) <= retry_limit:
                    sleep(3 ** (n + 1))  # Exponential backoff

                    continue

                return self.raise_exc(
                    message=f"Failed to load {url} after {retry_limit} attempts",
                    from_exc=e
                )

    def ReloadPage(self, post_delay=True):
        from selenium.common.exceptions import WebDriverException, SessionNotCreatedException

        retry_limit = 3

        for n in range(retry_limit):
            url = self.GetPageURL()

            self.log(f"Reloading page ({url}) (attempt {n + 1}/{retry_limit})")

            try:
                self.driver.refresh()

                self.on_page_load(post_delay)

                return self

            except SessionNotCreatedException:
                raise

            except WebDriverException as e:
                self.log(f"\tFailed, error: {e}")

                if (n + 1) <= retry_limit:
                    sleep(3 ** (n + 1))  # Exponential backoff

                    continue

                return self.raise_exc(
                    message=f"Failed to reload page ({url}) after {retry_limit} attempts",
                    from_exc=e
                )

    def SaveScreenshot(self, path="", viewport_only=False, _on_error=False):
        if _on_error:
            viewport_only = False

        if not path:
            if not self.file_storage_root:
                if _on_error:
                    return ""

                return self.raise_exc(
                    exc_type=FileNotFoundError,
                    message="'path' must be provided when file_storage_root is not set"
                )

            from Dash.Utils import GetRandomID

            path = os.path.join(self.file_storage_root, f"{GetRandomID()}.png")

        original_width = 0
        original_height = 0

        if not viewport_only:
            # Try to capture the entire page content (including content that must be scrolled to)
            original_width, original_height = self.MaximizeViewport(raise_on_fail=False)

            if original_width and original_height:
                self.log("Adjusted window size to capture entire page content")

        self.log(f"Taking screenshot of: {self.GetPageURL()}")

        self.driver.save_screenshot(path)

        if original_width and original_height:
            self.driver.set_window_size(original_width, original_height)

            self.log("Adjusted window size back to original")

        self.screenshots.append(path)

        return path

    def MaximizeViewport(self, raise_on_fail=True):
        try:
            original_width = self.driver.execute_script("return window.innerWidth")
            original_height = self.driver.execute_script("return window.innerHeight")
            scroll_width = self.driver.execute_script("return document.body.scrollWidth")
            scroll_height = self.driver.execute_script("return document.body.scrollHeight")

            if original_height < scroll_height or original_width < scroll_width:
                self.driver.set_window_size(
                    max(scroll_width, original_width),
                    max(scroll_height, original_height)
                )

                self.log(f"Adjusted window size to {scroll_width}x{scroll_height}")

                return original_width, original_height
        except:
            if raise_on_fail:
                raise

        return 0, 0

    def GetPageTitle(self):
        return self.driver.title

    def GetPageHTML(self):
        return self.driver.page_source

    def GetPageURL(self):
        return self.driver.current_url

    def EnableTrafficInterception(self):
        self.driver.execute_cdp_cmd("Network.enable", {})

        return self

    def GetRequestResponse(self, request_id):
        return self.driver.execute_cdp_cmd("Network.getResponseBody", {"requestId": request_id})

    def PopulateInput(self, input_el, text, is_file_input=False):
        return self._execute_action_on_element(
            func=self._populate_input,
            kwargs={
                "input_el": input_el,
                "text": text,
                "is_file_input": is_file_input
            }
        )

    def UnFocusInput(self, input_el):
        return self._execute_action_on_element(
            func=self._unfocus_element,
            kwargs={"input_el": input_el}
        )

    def ClearInput(self, input_el, custom_element=False):
        return self._execute_action_on_element(
            func=self._clear_input,
            kwargs={
                "input_el": input_el,
                "custom_element": custom_element
            }
        )

    def SubmitInput(self, input_el):
        return self._execute_action_on_element(
            func=self._submit_input,
            kwargs={"input_el": input_el}
        )

    def HideElement(self, element):
        return self._execute_action_on_element(
            func=self._hide_element,
            kwargs={"element": element}
        )

    def RemoveElement(self, element):
        return self._execute_action_on_element(
            func=self._remove_element,
            kwargs={"element": element}
        )

    def ClickElement(self, element, headless_delay=True, attempt=1):
        if not 1 <= attempt <= 3:
            return self.raise_exc(
                exc_type=ValueError,
                message="Attempt number must be between 1 and 3"
            )

        try:
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

        except Exception as e:
            return self.RaiseContextualException(
                message=f"Failed to click element after {attempt} attempt(s)",
                from_exc=e
            )

        return self

    def MakeDropdownSelection(self, dropdown, value="", label_text=""):
        if not value and not label_text:
            return self.raise_exc(
                exc_type=ValueError,
                message="Must provide either value or label_text"
            )

        retry_limit = 3

        for n in range(retry_limit):
            try:
                self.log(f"Making dropdown ({value or label_text}) selection (attempt {n + 1}/{retry_limit})")

                if value:
                    dropdown.select_by_value(value)

                elif label_text:
                    dropdown.select_by_visible_text(label_text)

                self.driver.execute_script(
                    "arguments[0].dispatchEvent(new Event('change', {bubbles: true}));",
                    dropdown._el  # noqa
                )

                sleep(0.5)

                return self

            except Exception as e:
                self.log(f"\tFailed, error: {e}")

                if (n + 1) <= retry_limit:
                    sleep(2)

                    continue

                return self.RaiseContextualException(
                    message=(
                        f"Failed to select {'value' if value else 'label'} "
                        f"'{value or label_text}' from dropdown"
                    ),
                    from_exc=e
                )

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
        return self._execute_action_on_element(
            func=self._scroll_to_element,
            kwargs={
                "element": element,
                "post_delay": post_delay
            }
        )

    def MoveMouse(self, x=-1, y=-1, to_element=None, headless_delay=True):
        if to_element is None and (x == -1 or y == -1):
            return self.raise_exc(
                exc_type=ValueError,
                message="Must supply either an element or x/y coordinates"
            )

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

    # This should typically be done after logging in and will only save if it doesn't exist (unless forced).
    # When managing cookies this way, note that cookies are typically different for each URL.
    def SaveCookies(self, path, force=False):
        if not path.endswith(".pkl"):
            return self.raise_exc(
                exc_type=ValueError,
                message="Cookies path must end with '.pkl' extension (cookies get pickled)"
            )

        if os.path.exists(path) and not force:
            return self

        from pickle import dump as dump_pickle

        with open(path, "wb") as file:
            dump_pickle(self.driver.get_cookies(), file)

        return self

    # This should typically be done once the expected URL is loaded (the one the cookies were saved for).
    # When managing cookies this way, note that cookies are typically different for each URL.
    def LoadCookies(self, path, must_exist=True):
        if not path.endswith(".pkl"):
            return self.raise_exc(
                exc_type=ValueError,
                message="Cookies path must end with '.pkl' extension (cookies are pickled)"
            )

        if not os.path.exists(path):
            if not must_exist:
                return self

            return FileNotFoundError("Cookies path does not exist")

        from pickle import load as load_pickle
        from selenium.common.exceptions import SessionNotCreatedException

        retry_limit = 3

        for n in range(retry_limit):
            self.log(f"Loading cookies from {path} (attempt {n + 1}/{retry_limit})")

            try:
                with open(path, "rb") as file:
                    for cookie in load_pickle(file):
                        self.driver.add_cookie(cookie)

                return self

            except SessionNotCreatedException:
                raise

            except Exception as e:
                self.log(f"\tFailed, error: {e}")

                if (n + 1) <= retry_limit:
                    sleep(2)

                    continue

                return self.raise_exc(
                    message=f"Failed to load cookies from {path} after {retry_limit} attempts",
                    from_exc=e
                )

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

        from selenium.common.exceptions import TimeoutException, StaleElementReferenceException, NoSuchElementException

        if for_click and for_multiple:
            raise ValueError("Can't use `for_click` and `for_multiple` together")

        wait = self.get_wait(wait_timeout_sec_override)
        locator = self.get_locator(el_id, el_name, el_class, css_selector, xpath)

        try:
            if to_be_removed:
                try:
                    element = self.driver.find_element(*locator)

                except NoSuchElementException:
                    return True

                if not element:
                    return True

                try:
                    wait.until(self.ec.invisibility_of_element_located(locator))

                    return True

                except NoSuchElementException:
                    return True

                except:
                    try:
                        wait.until(self.ec.staleness_of(element))

                        return True

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
                return self.RaiseContextualException(
                    message=(
                        f"Failed to find valid '{locator[0]}' element ({locator[1]}), found to be stale twice"
                    ),
                    from_exc=e
                )

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
                try:
                    element = self.driver.find_element(*locator)

                except NoSuchElementException:
                    return True

                except:
                    return False

                return not element

            if not must_exist:
                return None

            return self.RaiseContextualException(
                message=(
                    f"Failed to find '{locator[0]}' element ({locator[1]}) within timeout "
                    f"({wait_timeout_sec_override or self.wait_timeout_sec} secs)"
                ),
                from_exc=e
            )

        except Exception as e:
            return self.RaiseContextualException(
                message=(
                    f"Failed to find '{locator[0]}' element ({locator[1]}) within timeout "
                    f"({wait_timeout_sec_override or self.wait_timeout_sec} secs)"
                ),
                from_exc=e
            )

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
                return self.RaiseContextualException(
                    message=f"Failed to find valid '{locator[0]}' element ({locator[1]}), found to be stale twice",
                    from_exc=e
                )

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

            return self.RaiseContextualException(
                message=f"Failed to find '{locator[0]}' element ({locator[1]}) in parent element",
                from_exc=e
            )

        except Exception as e:
            return self.RaiseContextualException(
                message=f"Failed to find '{locator[0]}' element ({locator[1]}) in parent element",
                from_exc=e
            )

    def RaiseContextualException(self, message="", from_exc=None, exc_type=None):
        return self.raise_exc(
            exc_type=exc_type,
            message=f"{message}\n{self.GetExceptionContext()}",
            from_exc=from_exc
        )

    def GetExceptionContext(self):
        screenshot_path = self.SaveScreenshot(_on_error=True)

        if screenshot_path:
            from Dash.Utils import GetFileURLFromPath

            error_id = screenshot_path.split("/")[-1].split(".")[0]

            if self.dash_context:
                screenshot_url = GetFileURLFromPath(
                    dash_context=self.dash_context,
                    server_file_path=screenshot_path
                )

                screenshot_tag = f"- Screenshot of last state: {screenshot_url}"
            else:
                screenshot_tag = (
                    f"- Screenshot of last state: {screenshot_path} (no Dash Context for URL conversion)"
                )

            if len(self.screenshots) > 1:
                screenshot_tag += "\n\nOther screenshots:"

                for other_screenshot_path in self.screenshots:
                    if other_screenshot_path == screenshot_path:
                        continue

                    other_screenshot_url = GetFileURLFromPath(
                        dash_context=self.dash_context,
                        server_file_path=other_screenshot_path
                    ) if self.dash_context else ""

                    screenshot_tag += f"\n\t- {other_screenshot_url or other_screenshot_path}"
        else:
            error_id = ""
            screenshot_tag = "- No final screenshot saved, must provide `file_storage_root` on init"

        if self.file_storage_root:
            from Dash.LocalStorage import Write

            if not error_id:
                from Dash.Utils import GetRandomID

                error_id = GetRandomID()

            # Use .txt so the browser doesn't try to render it when clicking on the URL
            html_path = os.path.join(self.file_storage_root, f"{error_id}.txt")

            Write(
                full_path=html_path,
                data=self.GetPageHTML(),
                conform_permissions=self._on_server
            )

            if self.dash_context:
                from Dash.Utils import GetFileURLFromPath

                html_url = GetFileURLFromPath(
                    dash_context=self.dash_context,
                    server_file_path=html_path
                )

                html_tag = f"\n- HTML of last state: {html_url}"
            else:
                html_tag = f"\n- HTML of last state: {html_path} (no Dash Context for URL conversion)"
        else:
            html_tag = "- No HTML saved, must provide `file_storage_root` on init"

        return f"{screenshot_tag}\n{html_tag}"

    def raise_exc(self, exc_type=None, message="", from_exc=None):
        if message:
            self.log(message)

            if self.logs:
                message += "\n\n"

        if self.logs:
            message += "===== Logs =====\n- "
            message += "\n- ".join(self.logs)

        if from_exc:
            raise (exc_type or type(from_exc))(message) from from_exc

        raise (exc_type or Exception)(message)

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
            return self.raise_exc(
                exc_type=ValueError,
                message="Must supply one of: el_id, el_name, class_name, css_selector, xpath"
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
            os.path.join(profile_dir, "SingletonCookie"),
            os.path.join(profile_dir, ".com.google.Chrome.*"),
            os.path.join(profile_dir, ".org.chromium.Chromium.*")
        ]

        for pattern in patterns:
            for lock_file in glob(pattern):
                os.remove(lock_file)

        lock_path = os.path.join(profile_dir, "LOCK")

        if os.path.exists(lock_path):
            os.remove(lock_path)

    def log(self, text):
        # if self._on_server:  # Use this instead when debugging on the server, but can't use this for requests
        if self.using_virtual_display and not self.use_fake_display:
            print(text)

        self.logs.append(text)

    def _populate_input(self, input_el, text, is_file_input=False):
        if self.extra_stealth and not is_file_input:
            for char in text:
                input_el.send_keys(char)

                sleep(uniform(0.1, 0.3))
        else:
            input_el.send_keys(text)

        return self

    def _execute_action_on_element(self, func, kwargs, _stale_retry=False):
        from selenium.common.exceptions import StaleElementReferenceException

        try:
            return func(**kwargs)

        except StaleElementReferenceException as e:
            if _stale_retry:
                return self.RaiseContextualException(
                    message=f"Failed to execute action on element, found to be stale twice",
                    from_exc=e
                )

            # Retry one more time
            return self._execute_action_on_element(
                func=func,
                kwargs=kwargs,
                _stale_retry=True
            )

        except Exception as e:
            return self.RaiseContextualException(
                message="Failed to execute action on element, found to be stale twice",
                from_exc=e
            )

    def _unfocus_element(self, input_el):
        self.driver.execute_script("arguments[0].blur();", input_el)

        return self

    def _clear_input(self, input_el, custom_element=False):
        if custom_element:
            input_el.send_keys(f"{self.keys.CONTROL if self._on_server else self.keys.COMMAND}a")
            input_el.send_keys(self.keys.BACKSPACE)
        else:
            input_el.clear()

        return self

    def _submit_input(self, input_el):
        input_el.send_keys(self.keys.RETURN)

        return self

    def _hide_element(self, element):
        self.driver.execute_script("arguments[0].style.display = 'none';", element)

        return self

    def _remove_element(self, element):
        self.driver.execute_script("arguments[0].remove();", element)

        return self

    def _scroll_to_element(self, element, post_delay=True):
        self.driver.execute_script("arguments[0].scrollIntoView();", element)

        if post_delay:
            self.RandomDelay()

        return self
