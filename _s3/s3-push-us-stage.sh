#!/usr/bin/env bash

export USER=$(whoami)
IAM_ROLE_ARN="arn:aws:iam::018233770925:role/allow-auto-deploy-from-other-accounts"
eval "$(aws-auth --role-arn $IAM_ROLE_ARN)"
s3_website push
