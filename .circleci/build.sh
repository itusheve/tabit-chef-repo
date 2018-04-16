#!/bin/bash
# This script is meant to be run from a Circle CI job to automatically deploy to the specified environment.

set -e
eval $(aws ecr get-login --region "eu-west-1" --no-include-email --registry-ids "075139435924")
build-docker-image --docker-image-name "$DOCKER_IMAGE" --docker-image-tag "$(echo $CIRCLE_SHA1 | cut -c -7)-$CIRCLE_BRANCH"
