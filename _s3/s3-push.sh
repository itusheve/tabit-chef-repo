#!/usr/bin/env bash

export USER=$(whoami)
eval "$(aws-auth --role-arn $IAM_ROLE_ARN)"
s3_website push
