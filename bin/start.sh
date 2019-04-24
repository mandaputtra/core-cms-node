#!/bin/bash
set -e

yarn install

exec yarn run start
