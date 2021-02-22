import setuptools
from distutils.core import setup

try:
    from distutils.command.build_py import build_py_2to3 as build_py
except ImportError:
    # 2.x
    from distutils.command.build_py import build_py

setup(
    name="PyDash",
    version="1.01",
    author="Ryan Martin",
    url="https://ensomniac.io",
    packages=setuptools.find_packages(),
)
