"""Retired dispatcher. No scheduled task may execute queued shell commands."""


class PollRequests:
    def __init__(self):
        raise RuntimeError("RootPoll is retired; queued content will not be executed")


if __name__ == "__main__":
    raise SystemExit("RootPoll is retired; queued content will not be executed")
