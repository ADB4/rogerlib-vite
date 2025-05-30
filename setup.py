#!/usr/bin/env python3
import setuptools

def _find_packages():
    packages = setuptools.find_namespace_packages()
    return packages

def _main():
    setuptools.setup(
        packages=_find_packages(),
        include_package_data=True,
        package_dir={
            'rogerlib': 'rogerlib'
        },
    )

if __name__ == '__main__':
    _main()