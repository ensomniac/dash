import errno
import json
import os
import stat
import sys
import unittest

from time import sleep
from pathlib import Path
from tempfile import TemporaryDirectory
from threading import Event, Thread
from multiprocessing import get_context as get_multiprocessing_context
from unittest.mock import patch


PYDASH_ROOT = Path(__file__).resolve().parents[2]

if str(PYDASH_ROOT) not in sys.path:
    sys.path.insert(0, str(PYDASH_ROOT))


_REAL_FDOPEN = os.fdopen
_REAL_FSYNC = os.fsync
_REAL_REPLACE = os.replace


class _StagingFileProxy:
    def __init__(self, descriptor, mode, fail_at):
        self._file = _REAL_FDOPEN(descriptor, mode)
        self._fail_at = fail_at

    def __enter__(self):
        self._file.__enter__()

        return self

    def __exit__(self, *args):
        return self._file.__exit__(*args)

    def write(self, data):
        if self._fail_at == "write":
            raise OSError(errno.EIO, "injected staging write failure")

        return self._file.write(data)

    def flush(self):
        if self._fail_at == "flush":
            raise OSError(errno.EIO, "injected staging flush failure")

        return self._file.flush()

    def fileno(self):
        return self._file.fileno()


def _fail_fsync_on_call(call_number, error_number=errno.EIO):
    calls = {"count": 0}

    def fsync(descriptor):
        calls["count"] += 1

        if calls["count"] == call_number:
            raise OSError(error_number, "injected staging sync failure")

        return _REAL_FSYNC(descriptor)

    return fsync


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


class TestLocalStorageReads(unittest.TestCase):
    def test_supported_json_values_return_after_one_successful_open(self):
        from Dash.LocalStorage import Read

        values = [
            None,
            False,
            0,
            "",
            [],
            {},
            {"object": [1, True, None]}
        ]

        with TemporaryDirectory() as temp_dir:
            for index, value in enumerate(values):
                with self.subTest(value_type=type(value).__name__, index=index):
                    path = os.path.join(temp_dir, f"value-{index}.json")

                    with open(path, "w") as file:
                        json.dump(value, file)

                    real_open = open

                    with patch("builtins.open", wraps=real_open) as open_file:
                        self.assertEqual(Read(path), value)

                    self.assertEqual(open_file.call_count, 1)

    def test_missing_path_returns_none_without_opening(self):
        from Dash.LocalStorage import Read

        with TemporaryDirectory() as temp_dir:
            path = os.path.join(temp_dir, "missing.json")
            real_open = open

            with patch("builtins.open", wraps=real_open) as open_file:
                self.assertIsNone(Read(path))

            open_file.assert_not_called()

    def test_empty_raw_text_returns_after_one_successful_open(self):
        from Dash.LocalStorage import Read

        with TemporaryDirectory() as temp_dir:
            path = os.path.join(temp_dir, "empty.txt")

            Path(path).write_text("", encoding="utf-8")

            real_open = open

            with patch("builtins.open", wraps=real_open) as open_file:
                self.assertEqual(Read(path, is_json=False), "")

            self.assertEqual(open_file.call_count, 1)

    def test_invalid_json_retries_and_raises_the_decode_error(self):
        from Dash.LocalStorage import Read

        invalid_values = {
            "empty": "",
            "malformed": "{"
        }

        with TemporaryDirectory() as temp_dir:
            for label, value in invalid_values.items():
                with self.subTest(label=label):
                    path = os.path.join(temp_dir, f"{label}.json")

                    Path(path).write_text(value, encoding="utf-8")

                    real_open = open

                    with patch("builtins.open", wraps=real_open) as open_file, patch(
                        "time.sleep"
                    ) as retry_sleep, self.assertRaisesRegex(OSError, "Failed to read") as raised:
                        Read(path)

                    self.assertIsInstance(raised.exception.__cause__, json.JSONDecodeError)
                    self.assertEqual(open_file.call_count, 3)
                    self.assertEqual(retry_sleep.call_count, 2)

    def test_permission_failure_retries_and_preserves_the_cause(self):
        from Dash.LocalStorage import Read

        with TemporaryDirectory() as temp_dir:
            path = os.path.join(temp_dir, "unreadable.json")

            Path(path).write_text("{}", encoding="utf-8")

            with patch(
                "builtins.open",
                side_effect=PermissionError("injected read permission failure")
            ) as open_file, patch(
                "time.sleep"
            ) as retry_sleep, self.assertRaisesRegex(OSError, "Failed to read") as raised:
                Read(path)

            self.assertIsInstance(raised.exception.__cause__, PermissionError)
            self.assertEqual(open_file.call_count, 3)
            self.assertEqual(retry_sleep.call_count, 2)


class TestLocalStorageSortOrdering(unittest.TestCase):
    @staticmethod
    def _order(values):
        from Dash.LocalStorage import DashLocalStorage

        data = {
            entry_id: {"id": entry_id, "rank": value}
            for entry_id, value in values
        }
        original = {
            entry_id: entry_data.copy()
            for entry_id, entry_data in data.items()
        }
        order = DashLocalStorage(
            sort_by_key="rank"
        ).get_dict_order_by_sort_key(data)

        if data != original:
            raise AssertionError("ordering must not mutate source data")

        return order

    def test_representative_successful_ordering_remains_unchanged(self):
        cases = [
            (
                "accented text",
                [("z", "Zulu"), ("e", "Éclair"), ("a", "apple")],
                ["a", "e", "z"],
            ),
            (
                "canonical numeric strings",
                [("ten", "10"), ("two", "2"), ("one", "1")],
                ["one", "two", "ten"],
            ),
            (
                "leading-zero lexical fallback",
                [("one", "01"), ("ten", "010"), ("two", "2"), ("name", "name")],
                ["one", "ten", "two", "name"],
            ),
            (
                "integer values",
                [("ten", 10), ("two", 2), ("one", 1)],
                ["one", "two", "ten"],
            ),
            (
                "float values",
                [("ten", 10.5), ("two", 2.5), ("one", 1.5)],
                ["one", "two", "ten"],
            ),
            (
                "duplicate text",
                [("first", "Same"), ("second", "Same"), ("else", "Else")],
                ["else", "first", "second"],
            ),
            (
                "falsy values first",
                [("none", None), ("zero", 0), ("empty", ""), ("a", "A")],
                ["none", "zero", "empty", "a"],
            ),
        ]

        for label, values, expected in cases:
            with self.subTest(label=label):
                self.assertEqual(self._order(values), expected)

    def test_expected_attribute_type_and_value_fallbacks_remain_supported(self):
        class AttributeFallbackKey:
            def __bool__(self):
                return True

            def __hash__(self):
                return 1

            def __len__(self):
                return 2

        self.assertEqual(
            self._order([("attribute", AttributeFallbackKey())]),
            ["attribute"],
        )
        self.assertEqual(
            self._order([("two", 2), ("one", 1)]),
            ["one", "two"],
        )
        self.assertEqual(
            self._order([("beta", "beta"), ("alpha", "alpha")]),
            ["alpha", "beta"],
        )

    def test_ordinary_transliteration_and_conversion_failures_fall_back(self):
        with patch(
            "unidecode.unidecode",
            side_effect=ValueError("injected transliteration failure"),
        ) as transliterate:
            transliteration_order = self._order(
                [("z", "Zulu"), ("a", "apple")]
            )

        self.assertEqual(transliteration_order, ["a", "z"])
        self.assertEqual(transliterate.call_count, 2)

        with patch(
            "builtins.int",
            side_effect=ValueError("injected integer conversion failure"),
        ) as convert:
            conversion_order = self._order([("two", "2"), ("ten", "10")])

        self.assertEqual(conversion_order, ["ten", "two"])
        convert.assert_called_once_with("2")

    def test_process_control_exceptions_are_not_swallowed(self):
        with patch(
            "unidecode.unidecode",
            side_effect=KeyboardInterrupt("injected interrupt"),
        ), self.assertRaises(KeyboardInterrupt):
            self._order([("name", "Name")])

        with patch(
            "builtins.int",
            side_effect=SystemExit("injected exit"),
        ), self.assertRaises(SystemExit):
            self._order([("rank", "1")])


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


class TestLocalStorageCrashCleanWrites(unittest.TestCase):
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

    def _write_initial_target(self, path, mode=0o640):
        with open(path, "w") as file:
            json.dump({"state": "old"}, file)

        os.chmod(path, mode)

    def _read_json(self, path):
        with open(path) as file:
            return json.load(file)

    def _staging_names(self, directory):
        return [name for name in os.listdir(directory) if name.startswith("_tmp_dash_json_")]

    def test_round_trips_supported_json_schemas_with_private_new_file_mode(self):
        from Dash.LocalStorage import Read, Write

        values = [
            {"object": [1, True, None]},
            {},
            ["array", 2],
            [],
            "string",
            "",
            7,
            0,
            3.25,
            True,
            False,
            None
        ]

        with TemporaryDirectory() as temp_dir:
            for index, value in enumerate(values):
                with self.subTest(value_type=type(value).__name__, index=index):
                    path = os.path.join(temp_dir, f"schema-{index}.json")

                    self.assertIs(Write(path, value, conform_permissions=False), value)
                    self.assertEqual(self._read_json(path), value)

                    self.assertEqual(Read(path), value)

                    self.assertEqual(stat.S_IMODE(os.stat(path).st_mode), 0o600)

            self.assertEqual(self._staging_names(temp_dir), [])

    def test_existing_mode_is_preserved_without_conformance(self):
        from Dash.LocalStorage import Write

        with TemporaryDirectory() as temp_dir:
            path = os.path.join(temp_dir, "mode.json")

            self._write_initial_target(path, mode=0o640)
            Write(path, {"state": "new"}, conform_permissions=False)

            self.assertEqual(self._read_json(path), {"state": "new"})
            self.assertEqual(stat.S_IMODE(os.stat(path).st_mode), 0o640)
            self.assertEqual(self._staging_names(temp_dir), [])

    def test_conformance_receives_a_private_complete_staging_file(self):
        from Dash.LocalStorage import DashLocalStorage

        with TemporaryDirectory() as temp_dir:
            path = os.path.join(temp_dir, "conformed.json")
            storage = DashLocalStorage()
            observed = {}

            self._write_initial_target(path)

            def conform(staging_path):
                observed["basename"] = os.path.basename(staging_path)
                observed["mode"] = stat.S_IMODE(os.stat(staging_path).st_mode)
                observed["data"] = self._read_json(staging_path)

                os.chmod(staging_path, 0o755)

                return True

            with patch.object(storage, "ConformPermissions", side_effect=conform):
                storage.Write(path, {"state": "new"})

            self.assertTrue(observed["basename"].startswith("_tmp_dash_json_"))
            self.assertEqual(observed["mode"], 0o600)
            self.assertEqual(observed["data"], {"state": "new"})
            self.assertEqual(self._read_json(path), {"state": "new"})
            self.assertEqual(stat.S_IMODE(os.stat(path).st_mode), 0o755)
            self.assertEqual(self._staging_names(temp_dir), [])

    def test_serialization_and_staging_create_failures_leave_no_artifact(self):
        from Dash.LocalStorage import Write

        failures = [
            ("serialization", patch("json.dumps", side_effect=TypeError("injected serialization failure"))),
            ("create", patch("tempfile.mkstemp", side_effect=PermissionError("injected create failure")))
        ]

        for label, failure_patch in failures:
            with self.subTest(failure=label), TemporaryDirectory() as temp_dir:
                path = os.path.join(temp_dir, "data.json")

                self._write_initial_target(path)

                with failure_patch, self.assertRaises(IOError):
                    Write(path, {"state": "new"}, conform_permissions=False)

                self.assertEqual(self._read_json(path), {"state": "old"})
                self.assertEqual(self._staging_names(temp_dir), [])

    def test_write_and_flush_failures_cleanup_exact_staging_file(self):
        from Dash.LocalStorage import Write

        for failure in ["write", "flush"]:
            with self.subTest(failure=failure), TemporaryDirectory() as temp_dir:
                path = os.path.join(temp_dir, "data.json")

                self._write_initial_target(path)

                def fdopen(descriptor, mode):
                    return _StagingFileProxy(descriptor, mode, failure)

                with patch("Dash.LocalStorage.os.fdopen", side_effect=fdopen), self.assertRaises(IOError):
                    Write(path, {"state": "new"}, conform_permissions=False)

                self.assertEqual(self._read_json(path), {"state": "old"})
                self.assertEqual(self._staging_names(temp_dir), [])

    def test_sync_permission_and_replace_failures_preserve_old_target(self):
        from Dash.LocalStorage import DashLocalStorage

        cases = ["content_sync", "metadata_sync", "permission", "replace"]

        for failure in cases:
            with self.subTest(failure=failure), TemporaryDirectory() as temp_dir:
                path = os.path.join(temp_dir, "data.json")
                storage = DashLocalStorage()

                self._write_initial_target(path)

                if failure == "content_sync":
                    failure_patch = patch(
                        "Dash.LocalStorage.os.fsync",
                        side_effect=_fail_fsync_on_call(1)
                    )
                    conform_permissions = False
                elif failure == "metadata_sync":
                    failure_patch = patch(
                        "Dash.LocalStorage.os.fsync",
                        side_effect=_fail_fsync_on_call(2)
                    )
                    conform_permissions = False
                elif failure == "permission":
                    failure_patch = patch.object(
                        storage,
                        "ConformPermissions",
                        side_effect=PermissionError("injected permission failure")
                    )
                    conform_permissions = True
                else:
                    failure_patch = patch(
                        "Dash.LocalStorage.os.replace",
                        side_effect=OSError(errno.EIO, "injected replacement failure")
                    )
                    conform_permissions = False

                with failure_patch, self.assertRaises(IOError):
                    storage.Write(
                        path,
                        {"state": "new"},
                        conform_permissions=conform_permissions
                    )

                self.assertEqual(self._read_json(path), {"state": "old"})
                self.assertEqual(stat.S_IMODE(os.stat(path).st_mode), 0o640)
                self.assertEqual(self._staging_names(temp_dir), [])

    def test_directory_sync_failure_occurs_after_complete_replacement(self):
        from Dash.LocalStorage import Write

        with TemporaryDirectory() as temp_dir:
            path = os.path.join(temp_dir, "data.json")

            self._write_initial_target(path)

            with patch(
                "Dash.LocalStorage.os.fsync",
                side_effect=_fail_fsync_on_call(3)
            ), self.assertRaises(IOError):
                Write(path, {"state": "new"}, conform_permissions=False)

            self.assertEqual(self._read_json(path), {"state": "new"})
            self.assertEqual(stat.S_IMODE(os.stat(path).st_mode), 0o640)
            self.assertEqual(self._staging_names(temp_dir), [])

    def test_unsupported_directory_sync_is_allowed(self):
        from Dash.LocalStorage import Write

        with TemporaryDirectory() as temp_dir:
            path = os.path.join(temp_dir, "data.json")

            self._write_initial_target(path)

            with patch(
                "Dash.LocalStorage.os.fsync",
                side_effect=_fail_fsync_on_call(3, errno.EINVAL)
            ):
                Write(path, {"state": "new"}, conform_permissions=False)

            self.assertEqual(self._read_json(path), {"state": "new"})
            self.assertEqual(self._staging_names(temp_dir), [])

    def test_cleanup_failure_is_explicit_and_never_widens_target(self):
        from Dash.LocalStorage import Write

        with TemporaryDirectory() as temp_dir:
            path = os.path.join(temp_dir, "data.json")

            self._write_initial_target(path)

            with patch(
                "Dash.LocalStorage.os.replace",
                side_effect=OSError(errno.EIO, "injected replacement failure")
            ), patch(
                "Dash.LocalStorage.os.unlink",
                side_effect=PermissionError("injected exact cleanup failure")
            ), self.assertRaisesRegex(IOError, "exact staging cleanup also failed"):
                Write(path, {"state": "new"}, conform_permissions=False)

            staging_names = self._staging_names(temp_dir)

            self.assertEqual(self._read_json(path), {"state": "old"})
            self.assertEqual(len(staging_names), 1)

            os.unlink(os.path.join(temp_dir, staging_names[0]))

    def test_inventory_is_bounded_private_exact_and_lock_aware(self):
        from Dash.LocalStorage import GetJSONWriteStagingInventory, Write

        with TemporaryDirectory() as temp_dir:
            path = os.path.join(temp_dir, "data.json")
            legacy_path = os.path.join(temp_dir, "_tmp_123456_legacy.json")
            misleading_paths = [
                os.path.join(temp_dir, "_tmp_not_a_writer.json"),
                os.path.join(temp_dir, "_tmp_12345_short.json"),
                os.path.join(temp_dir, "_tmp_1234567_long.json")
            ]
            replace_started = Event()
            release_replace = Event()
            writer_errors = []

            for artifact_path in [legacy_path, *misleading_paths]:
                with open(artifact_path, "w") as file:
                    file.write("{}")

            os.symlink(legacy_path, os.path.join(temp_dir, "_tmp_654321_symlink.json"))

            def blocked_replace(source, destination):
                replace_started.set()

                if not release_replace.wait(10):
                    raise TimeoutError("test did not release staged replacement")

                return _REAL_REPLACE(source, destination)

            def writer():
                try:
                    Write(path, {"state": "new"}, conform_permissions=False)
                except Exception as error:
                    writer_errors.append(error)

            with patch("Dash.LocalStorage.os.replace", side_effect=blocked_replace):
                thread = Thread(target=writer)
                thread.start()

                self.assertTrue(replace_started.wait(10))

                inventory = GetJSONWriteStagingInventory(temp_dir, max_entries=100)

                self.assertEqual(inventory["matched_staging_files"], 2)
                self.assertEqual(inventory["in_flight"]["count"], 1)
                self.assertEqual(inventory["orphaned"]["count"], 1)
                self.assertEqual(inventory["unclassified"]["count"], 0)
                self.assertFalse(inventory["truncated"])
                self.assertNotIn(temp_dir, repr(inventory))
                self.assertNotIn("data.json", repr(inventory))

                release_replace.set()
                thread.join(20)

            self.assertFalse(thread.is_alive())
            self.assertEqual(writer_errors, [])

            inventory = GetJSONWriteStagingInventory(temp_dir, max_entries=100)

            self.assertEqual(inventory["matched_staging_files"], 1)
            self.assertEqual(inventory["in_flight"]["count"], 0)
            self.assertEqual(inventory["orphaned"]["count"], 1)

            bounded_inventory = GetJSONWriteStagingInventory(temp_dir, max_entries=1)

            self.assertTrue(bounded_inventory["truncated"])

            for invalid_limit in [0, 1000001, True]:
                with self.subTest(invalid_limit=invalid_limit), self.assertRaises(ValueError):
                    GetJSONWriteStagingInventory(temp_dir, max_entries=invalid_limit)


if __name__ == "__main__":
    unittest.main()
