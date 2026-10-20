"""The arbitrary privileged command queue is permanently retired."""


def Queue(command):
    # Deliberately reject before inspecting or writing caller-controlled content.
    raise RuntimeError("Arbitrary root queues are retired; use a reviewed fixed-purpose service")


class RunAsRoot:
    def Queue(self, command):
        return Queue(command)
