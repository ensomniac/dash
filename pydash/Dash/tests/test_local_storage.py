import os
import sys
import unittest

from time import sleep
from pathlib import Path
from tempfile import TemporaryDirectory
from multiprocessing import get_context as get_multiprocessing_context


PYDASH_ROOT = Path(__file__).resolve().parents[2]

if str(PYDASH_ROOT) not in sys.path:
    sys.path.insert(0, str(PYDASH_ROOT))


def _increment_counter(path, start_event, iterations):
    from Dash.LocalStorage import ReadModifyWrite

    start_event.wait(10)

    for _ in range(iterations):
        def modify(data):
            data = data or {"count": 0}
            count = data.get("count", 0)

            sleep(0.002)

            data["count"] = count + 1

            return data

        ReadModifyWrite(
            path,
            modify,
            default_data={"count": 0},
            conform_permissions=False
        )


class TestLocalStorageReadModifyWrite(unittest.TestCase):
    def setUp(self):
        self._original_lock_root = os.environ.get("DASH_LOCAL_STORAGE_LOCK_ROOT")
        self._lock_root = TemporaryDirectory()

        os.environ["DASH_LOCAL_STORAGE_LOCK_ROOT"] = self._lock_root.name

    def tearDown(self):
        if self._original_lock_root is None:
            os.environ.pop("DASH_LOCAL_STORAGE_LOCK_ROOT", None)
        else:
            os.environ["DASH_LOCAL_STORAGE_LOCK_ROOT"] = self._original_lock_root

        self._lock_root.cleanup()

    def test_method_accepts_in_place_mutation(self):
        from Dash.LocalStorage import DashLocalStorage, Read, Write

        with TemporaryDirectory() as temp_dir:
            path = os.path.join(temp_dir, "data.json")

            Write(path, {"count": 1}, conform_permissions=False)

            def modify(data):
                data["count"] += 1

            DashLocalStorage().ReadModifyWrite(path, modify, conform_permissions=False)

            self.assertEqual(Read(path), {"count": 2})

    def test_lock_file_is_not_created_next_to_json_file(self):
        from Dash.LocalStorage import ReadModifyWrite, _get_json_read_modify_write_lock_path

        with TemporaryDirectory() as temp_dir:
            path = os.path.join(temp_dir, "data.json")
            sibling_lock_path = os.path.join(temp_dir, ".data.json.lock")

            def modify(data):
                data = data or {}
                data["count"] = 1

                return data

            ReadModifyWrite(path, modify, default_data={}, conform_permissions=False)

            self.assertFalse(os.path.exists(sibling_lock_path))
            self.assertNotEqual(os.path.dirname(_get_json_read_modify_write_lock_path(path)), temp_dir)

    def test_method_serializes_threaded_updates(self):
        from threading import Event, Thread
        from Dash.LocalStorage import DashLocalStorage, Read, Write

        thread_count = 8
        iterations = 20

        with TemporaryDirectory() as temp_dir:
            path = os.path.join(temp_dir, "thread-counter.json")

            Write(path, {"count": 0}, conform_permissions=False)

            start_event = Event()
            storage = DashLocalStorage()

            def worker():
                start_event.wait(10)

                for _ in range(iterations):
                    def modify(data):
                        count = data.get("count", 0)

                        sleep(0.002)

                        data["count"] = count + 1

                        return data

                    storage.ReadModifyWrite(path, modify, conform_permissions=False)

            threads = [Thread(target=worker) for _ in range(thread_count)]

            for thread in threads:
                thread.start()

            start_event.set()

            for thread in threads:
                thread.join(20)

            self.assertFalse(any(thread.is_alive() for thread in threads))
            self.assertEqual(Read(path)["count"], thread_count * iterations)

    def test_write_waits_for_active_read_modify_write(self):
        from threading import Event, Thread
        from Dash.LocalStorage import DashLocalStorage, Read, Write

        with TemporaryDirectory() as temp_dir:
            path = os.path.join(temp_dir, "write-lock.json")

            Write(path, {"source": "initial"}, conform_permissions=False)

            callback_started = Event()
            storage = DashLocalStorage()

            def run_transaction():
                def modify(data):
                    callback_started.set()

                    sleep(0.05)

                    data["source"] = "read_modify_write"

                    return data

                storage.ReadModifyWrite(path, modify, conform_permissions=False)

            thread = Thread(target=run_transaction)

            thread.start()
            callback_started.wait(10)

            Write(path, {"source": "write"}, conform_permissions=False)

            thread.join(20)

            self.assertFalse(thread.is_alive())
            self.assertEqual(Read(path), {"source": "write"})

    def test_module_read_modify_write_serializes_concurrent_updates(self):
        from Dash.LocalStorage import Read, Write

        process_count = 8
        iterations = 20

        with TemporaryDirectory() as temp_dir:
            path = os.path.join(temp_dir, "counter.json")

            Write(path, {"count": 0}, conform_permissions=False)

            context = get_multiprocessing_context("spawn")
            start_event = context.Event()

            processes = [
                context.Process(
                    target=_increment_counter,
                    args=(path, start_event, iterations)
                )
                for _ in range(process_count)
            ]

            for process in processes:
                process.start()

            start_event.set()

            for process in processes:
                process.join(20)

            exit_codes = [process.exitcode for process in processes]

            self.assertEqual(exit_codes, [0] * process_count)
            self.assertEqual(Read(path)["count"], process_count * iterations)


if __name__ == "__main__":
    unittest.main()
